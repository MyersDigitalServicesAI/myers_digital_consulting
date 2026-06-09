import { Router } from "express";
import { nanoid } from "nanoid";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase-admin.ts";
import {
  portalAuth,
  adminAuth,
  type PortalRequest,
} from "../middleware/portal-auth.ts";
import { createDirectorAgent } from "../agents/director.ts";
import { createBillingRouter } from "./billing.ts";
import type {
  OnboardingFormData,
  AdminProvisionRequest,
} from "../../shared/portal.types.ts";

export function createPortalRouter(): Router {
  const router = Router();

  // Billing — checkout, customer portal, subscription status
  router.use("/billing", createBillingRouter());

  // ─── Public endpoints ────────────────────────────────────────────────────────

  router.get("/validate-token", async (req, res) => {
    if (!isSupabaseConfigured()) {
      res.status(503).json({ error: "Portal not configured" });
      return;
    }
    const token = String(req.query.token ?? "");
    if (!token) {
      res.status(400).json({ error: "token required" });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("onboarding_links")
      .select("tenant_id, expires_at, used, tenants(company_name, contact_email)")
      .eq("token", token)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Invalid invite link" });
      return;
    }
    if (data.used) {
      res.status(410).json({ error: "This invite link has already been used" });
      return;
    }
    if (data.expires_at && new Date(data.expires_at as string) < new Date()) {
      res.status(410).json({ error: "This invite link has expired" });
      return;
    }

    const tenant = (data.tenants as unknown as { company_name: string; contact_email: string }) ?? {};
    res.json({
      valid: true,
      tenantId: data.tenant_id,
      companyName: tenant.company_name ?? "Your Company",
      contactEmail: tenant.contact_email ?? "",
    });
  });

  // ─── Auth — link account to tenant after magic-link sign-in ─────────────────

  router.post("/link-account", portalAuth as never, async (req, res) => {
    const pr = req as PortalRequest;
    const { joinToken } = req.body as { joinToken?: string };

    if (!joinToken) {
      res.status(400).json({ error: "joinToken required" });
      return;
    }

    const { data: link, error: linkErr } = await supabaseAdmin
      .from("onboarding_links")
      .select("tenant_id, expires_at, used")
      .eq("token", joinToken)
      .single();

    if (linkErr || !link) {
      res.status(404).json({ error: "Invalid join token" });
      return;
    }
    if (link.used) {
      // already linked — just return success
      res.json({ linked: true });
      return;
    }
    if (link.expires_at && new Date(link.expires_at as string) < new Date()) {
      res.status(410).json({ error: "Invite link expired" });
      return;
    }

    await supabaseAdmin.from("tenant_members").upsert({
      tenant_id: link.tenant_id,
      user_id: pr.portalUserId,
      role: "client",
    });

    await supabaseAdmin
      .from("onboarding_links")
      .update({ used: true })
      .eq("token", joinToken);

    await supabaseAdmin.from("workspace_status").upsert({
      tenant_id: link.tenant_id,
      updated_at: new Date().toISOString(),
    });

    res.json({ linked: true, tenantId: link.tenant_id });
  });

  // ─── Protected endpoints (require valid JWT + tenant_member row) ─────────────

  router.get("/me", portalAuth as never, async (req, res) => {
    const pr = req as PortalRequest;

    const [tenantRes, wsRes, profileRes, intakeRes] = await Promise.all([
      supabaseAdmin
        .from("tenants")
        .select("*")
        .eq("id", pr.portalTenantId)
        .single(),
      supabaseAdmin
        .from("workspace_status")
        .select("*")
        .eq("tenant_id", pr.portalTenantId)
        .single(),
      supabaseAdmin
        .from("company_profiles")
        .select("*")
        .eq("tenant_id", pr.portalTenantId)
        .single(),
      supabaseAdmin
        .from("intake_responses")
        .select("id")
        .eq("tenant_id", pr.portalTenantId)
        .limit(1),
    ]);

    res.json({
      tenant: tenantRes.data,
      member: { tenant_id: pr.portalTenantId, user_id: pr.portalUserId, role: pr.portalRole },
      workspaceStatus: wsRes.data ?? null,
      companyProfile: profileRes.data ?? null,
      intakeSubmitted: (intakeRes.data?.length ?? 0) > 0,
    });
  });

  router.post("/onboarding/submit", portalAuth as never, async (req, res) => {
    const pr = req as PortalRequest;
    const intake = req.body as OnboardingFormData;

    // Save intake response
    const { error: insertErr } = await supabaseAdmin.from("intake_responses").insert({
      tenant_id: pr.portalTenantId,
      answers: intake,
      departments: intake.departments ?? [],
      submitted_at: new Date().toISOString(),
    });

    if (insertErr) {
      res.status(500).json({ error: "Failed to save intake response" });
      return;
    }

    // Update workspace status
    await supabaseAdmin.from("workspace_status").upsert({
      tenant_id: pr.portalTenantId,
      intake_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Update tenant status to active
    await supabaseAdmin
      .from("tenants")
      .update({ status: "active" })
      .eq("id", pr.portalTenantId)
      .eq("status", "onboarding");

    res.json({ success: true });

    // Fire SOP generation + company profile in background
    setImmediate(() => {
      generateForClient(pr.portalTenantId, intake).catch((err) =>
        console.error("[portal] SOP generation failed:", err)
      );
    });
  });

  router.get("/sops", portalAuth as never, async (req, res) => {
    const pr = req as PortalRequest;
    const { data, error } = await supabaseAdmin
      .from("sops")
      .select("id, department, title, status, generated_at")
      .eq("tenant_id", pr.portalTenantId)
      .order("generated_at", { ascending: false });

    if (error) {
      res.status(500).json({ error: "Failed to fetch SOPs" });
      return;
    }
    res.json({ sops: data ?? [] });
  });

  router.get("/sops/:id", portalAuth as never, async (req, res) => {
    const pr = req as unknown as PortalRequest;
    const { data, error } = await supabaseAdmin
      .from("sops")
      .select("*")
      .eq("id", req.params.id)
      .eq("tenant_id", pr.portalTenantId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "SOP not found" });
      return;
    }
    res.json({ sop: data });
  });

  router.get("/workspace-status", portalAuth as never, async (req, res) => {
    const pr = req as PortalRequest;
    const { data, error } = await supabaseAdmin
      .from("workspace_status")
      .select("*")
      .eq("tenant_id", pr.portalTenantId)
      .single();

    if (error) {
      res.json({ workspaceStatus: null });
      return;
    }
    res.json({ workspaceStatus: data });
  });

  // ─── Admin endpoints ─────────────────────────────────────────────────────────

  router.post("/admin/provision", adminAuth, async (req, res) => {
    if (!isSupabaseConfigured()) {
      res.status(503).json({ error: "Portal not configured" });
      return;
    }

    const { companyName, contactEmail, contactName, plan } =
      req.body as AdminProvisionRequest;

    if (!companyName || !contactEmail || !plan) {
      res.status(400).json({ error: "companyName, contactEmail, plan required" });
      return;
    }

    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data: tenant, error: tenantErr } = await supabaseAdmin
      .from("tenants")
      .insert({
        company_name: companyName,
        slug: `${slug}-${nanoid(6)}`,
        plan,
        contact_email: contactEmail,
        contact_name: contactName ?? null,
        status: "onboarding",
        approved_by_admin: true,
      })
      .select()
      .single();

    if (tenantErr || !tenant) {
      res.status(500).json({ error: tenantErr?.message ?? "Failed to create tenant" });
      return;
    }

    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await supabaseAdmin.from("onboarding_links").insert({
      token,
      tenant_id: tenant.id,
      expires_at: expiresAt,
      used: false,
    });

    await supabaseAdmin.from("workspace_status").insert({
      tenant_id: tenant.id,
    });

    const baseUrl = process.env.APP_URL ?? "https://myersdigitalconsulting.com";
    const joinUrl = `${baseUrl}/portal/join?token=${token}`;

    res.json({
      tenantId: tenant.id,
      slug: tenant.slug,
      joinUrl,
      token,
    });
  });

  router.patch("/admin/workspace/:tenantId", adminAuth, async (req, res) => {
    if (!isSupabaseConfigured()) {
      res.status(503).json({ error: "Portal not configured" });
      return;
    }

    const { tenantId } = req.params;
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>;

    const { error } = await supabaseAdmin
      .from("workspace_status")
      .update(updates)
      .eq("tenant_id", tenantId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ success: true });
  });

  return router;
}

// ─── Background: generate SOPs + company profile via Director agent ───────────

async function generateForClient(
  tenantId: string,
  intake: OnboardingFormData
): Promise<void> {
  const tenantRes = await supabaseAdmin
    .from("tenants")
    .select("company_name")
    .eq("id", tenantId)
    .single();
  const companyName = tenantRes.data?.company_name ?? intake.businessName;

  // Generate SOPs
  const sopTask = `Generate 8 client-specific Standard Operating Procedures for ${companyName}.
Return ONLY a valid JSON array with exactly this structure:
[{"title":"...","department":"...","content":"..."}]

Departments to cover: operations, marketing, sales, finance, content, crm, analytics, delivery.
Tailor each SOP to: industry="${intake.industry}", team size="${intake.teamSize}",
paid ads="${intake.runsPaidAds}", CRM tools="${intake.currentCrmTools}",
content cadence="${intake.contentCadence}", services="${intake.servicesOffered}".
Each SOP content should be 300-500 words of actionable step-by-step instructions.`;

  try {
    const director = createDirectorAgent();
    const result = await director.run(sopTask, JSON.stringify(intake));

    if (result.success && result.output) {
      const jsonMatch = result.output.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const sops = JSON.parse(jsonMatch[0]) as Array<{
          title: string;
          department: string;
          content: string;
        }>;

        const sopRows = sops.map((s) => ({
          tenant_id: tenantId,
          department: s.department,
          title: s.title,
          body: { content: s.content },
          status: "draft" as const,
        }));

        await supabaseAdmin.from("sops").insert(sopRows);
        await supabaseAdmin
          .from("workspace_status")
          .update({ sops_generated_at: new Date().toISOString() })
          .eq("tenant_id", tenantId);

        console.log(`[portal] Generated ${sopRows.length} SOPs for ${companyName}`);
      }
    }
  } catch (err) {
    console.error("[portal] SOP generation error:", err);
  }

  // Generate company profile
  const profileTask = `Analyze this business intake and produce a company profile.
Return ONLY valid JSON with this exact structure:
{"summary":"...","positioning":"...","biggest_leverage":"..."}

summary: 2-3 sentences describing the business.
positioning: The unique market angle or differentiation (1-2 sentences).
biggest_leverage: The single highest-ROI automation or system improvement (1-2 sentences).`;

  try {
    const director = createDirectorAgent();
    const result = await director.run(profileTask, JSON.stringify(intake));

    if (result.success && result.output) {
      const jsonMatch = result.output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const profile = JSON.parse(jsonMatch[0]) as {
          summary: string;
          positioning: string;
          biggest_leverage: string;
        };

        await supabaseAdmin.from("company_profiles").upsert({
          tenant_id: tenantId,
          ...profile,
          generated_at: new Date().toISOString(),
        });

        console.log(`[portal] Company profile generated for ${companyName}`);
      }
    }
  } catch (err) {
    console.error("[portal] Profile generation error:", err);
  }
}
