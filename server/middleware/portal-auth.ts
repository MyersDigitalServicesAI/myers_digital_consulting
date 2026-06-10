import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase-admin.ts";

export interface PortalRequest extends Request {
  portalUserId: string;
  portalTenantId: string;
  portalRole: string;
}

export async function portalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!isSupabaseConfigured()) {
    res
      .status(503)
      .json({
        error: "Portal not configured — SUPABASE_SERVICE_ROLE_KEY missing",
      });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const { data: member, error: memberErr } = await supabaseAdmin
    .from("tenant_members")
    .select("tenant_id, role")
    .eq("user_id", data.user.id)
    .single();

  if (memberErr || !member) {
    res
      .status(403)
      .json({ error: "No portal access — account not linked to a tenant" });
    return;
  }

  const r = req as PortalRequest;
  r.portalUserId = data.user.id;
  r.portalTenantId = member.tenant_id as string;
  r.portalRole = member.role as string;
  next();
}

export interface TenantAccessFields {
  status: string;
  approved_by_admin: boolean;
}

export type TenantAccessDecision =
  | { allow: true }
  | { allow: false; status: 402 | 403; error: string; code: string };

/**
 * Pure decision logic for tenant content access.
 *
 * "paused" is the terminal billing state — the Stripe webhook sets it when a
 * subscription is deleted (canceled or dunning exhausted). Tenants with a
 * null subscription (manually invoiced) are unaffected: their status stays
 * "onboarding"/"active" unless an admin pauses them.
 */
export function evaluateTenantAccess(
  tenant: TenantAccessFields | null
): TenantAccessDecision {
  if (!tenant) {
    return {
      allow: false,
      status: 403,
      error: "Tenant not found",
      code: "tenant_missing",
    };
  }
  if (!tenant.approved_by_admin) {
    return {
      allow: false,
      status: 403,
      error: "Account pending approval",
      code: "pending_approval",
    };
  }
  if (tenant.status === "paused") {
    return {
      allow: false,
      status: 402,
      error: "Subscription inactive — reactivate from the billing page",
      code: "subscription_inactive",
    };
  }
  return { allow: true };
}

/**
 * Billing/status gate for tenant content routes. Mount AFTER portalAuth.
 * Deliberately not applied to /me (the client needs it to render the gate)
 * or /billing/* (a paused tenant must be able to re-subscribe).
 */
export async function requireActiveTenant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const pr = req as PortalRequest;

  const { data } = await supabaseAdmin
    .from("tenants")
    .select("status, approved_by_admin")
    .eq("id", pr.portalTenantId)
    .single();

  const decision = evaluateTenantAccess(
    (data as TenantAccessFields | null) ?? null
  );
  if (!decision.allow) {
    res
      .status(decision.status)
      .json({ error: decision.error, code: decision.code });
    return;
  }
  next();
}

export function adminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = process.env.PORTAL_ADMIN_SECRET;
  if (!secret) {
    res.status(503).json({ error: "Admin portal not configured" });
    return;
  }
  const provided = req.headers["x-admin-secret"];
  if (provided !== secret) {
    res.status(401).json({ error: "Invalid admin secret" });
    return;
  }
  next();
}
