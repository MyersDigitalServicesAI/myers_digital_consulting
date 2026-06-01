import Anthropic from "@anthropic-ai/sdk";
import axios, { AxiosError } from "axios";
import type { BaseAgent } from "../base-agent.ts";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function ghlHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

function ghlError(err: unknown): string {
  if (err instanceof AxiosError) {
    return JSON.stringify(err.response?.data ?? err.message);
  }
  return String(err);
}

// ── Contacts ──────────────────────────────────────────────────────────────────

async function searchContacts(
  locationId: string,
  token: string,
  query: string,
): Promise<Array<{ id: string; firstName: string; lastName: string; email: string }>> {
  try {
    const res = await axios.get(`${GHL_BASE}/contacts/search`, {
      params: { locationId, query, limit: 5 },
      headers: ghlHeaders(token),
    });
    return res.data.contacts ?? [];
  } catch (err) {
    console.error("[GHL] searchContacts failed:", ghlError(err));
    return [];
  }
}

async function createContact(
  locationId: string,
  token: string,
  name: string,
  email?: string,
  tags?: string[],
): Promise<{ id: string } | null> {
  const parts = name.trim().split(" ");
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || "";
  try {
    const res = await axios.post(
      `${GHL_BASE}/contacts/`,
      { locationId, firstName, lastName, ...(email && { email }), tags: tags ?? [] },
      { headers: ghlHeaders(token) },
    );
    return { id: res.data.contact.id };
  } catch (err) {
    console.error("[GHL] createContact failed:", ghlError(err));
    return null;
  }
}

// ── Pipeline Stages ───────────────────────────────────────────────────────────

async function getPipelineStages(
  locationId: string,
  token: string,
  pipelineId: string,
): Promise<Array<{ id: string; name: string }>> {
  try {
    const res = await axios.get(`${GHL_BASE}/opportunities/pipelines`, {
      params: { locationId },
      headers: ghlHeaders(token),
    });
    const pipeline = (res.data.pipelines ?? []).find(
      (p: { id: string }) => p.id === pipelineId,
    );
    return pipeline?.stages ?? [];
  } catch (err) {
    console.error("[GHL] getPipelineStages failed:", ghlError(err));
    return [];
  }
}

// ── Opportunities ─────────────────────────────────────────────────────────────

async function findOpportunity(
  locationId: string,
  token: string,
  pipelineId: string,
  contactId: string,
): Promise<{ id: string } | null> {
  try {
    const res = await axios.get(`${GHL_BASE}/opportunities/search`, {
      params: { location_id: locationId, pipeline_id: pipelineId, contact_id: contactId, limit: 1 },
      headers: ghlHeaders(token),
    });
    return res.data.opportunities?.[0] ?? null;
  } catch {
    return null;
  }
}

async function createOpportunity(
  locationId: string,
  token: string,
  pipelineId: string,
  stageId: string,
  contactId: string,
  name: string,
): Promise<{ id: string } | null> {
  try {
    const res = await axios.post(
      `${GHL_BASE}/opportunities/`,
      { pipelineId, locationId, name: `${name} — AIOS`, pipelineStageId: stageId, status: "open", contactId },
      { headers: ghlHeaders(token) },
    );
    return { id: res.data.opportunity.id };
  } catch (err) {
    console.error("[GHL] createOpportunity failed:", ghlError(err));
    return null;
  }
}

async function updateOpportunityStage(
  token: string,
  opportunityId: string,
  stageId: string,
): Promise<boolean> {
  try {
    await axios.put(
      `${GHL_BASE}/opportunities/${opportunityId}`,
      { pipelineStageId: stageId, status: "open" },
      { headers: ghlHeaders(token) },
    );
    return true;
  } catch (err) {
    console.error("[GHL] updateOpportunityStage failed:", ghlError(err));
    return false;
  }
}

// ── Sub-accounts (Locations) ──────────────────────────────────────────────────

async function createLocation(
  agencyToken: string,
  name: string,
  email: string,
  snapshotId?: string,
): Promise<{ id: string; name: string } | null> {
  try {
    const res = await axios.post(
      `${GHL_BASE}/locations/`,
      {
        name,
        email,
        country: "US",
        timezone: "America/Chicago",
        ...(snapshotId && { snapshotId }),
      },
      { headers: ghlHeaders(agencyToken) },
    );
    return { id: res.data.location.id, name: res.data.location.name };
  } catch (err) {
    console.error("[GHL] createLocation failed:", ghlError(err));
    return null;
  }
}

// ── Tool Executors ────────────────────────────────────────────────────────────

async function ghlUpdatePipeline(input: Record<string, unknown>): Promise<unknown> {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  const pipelineId = process.env.GHL_PIPELINE_ID;

  if (!apiKey || !locationId || !pipelineId) {
    return {
      simulated: true,
      action: "pipeline_update",
      ...input,
      note: "Set GHL_API_KEY, GHL_LOCATION_ID, GHL_PIPELINE_ID to activate",
    };
  }

  const { contact_id, contact_name, to_stage, reason } = input as {
    contact_id?: string;
    contact_name: string;
    to_stage: string;
    reason?: string;
  };

  // Resolve stage name → stage ID
  const stages = await getPipelineStages(locationId, apiKey, pipelineId);
  const stage = stages.find((s) => s.name.toLowerCase() === to_stage.toLowerCase());
  if (!stage) {
    return {
      error: `Stage '${to_stage}' not found in pipeline`,
      available_stages: stages.map((s) => s.name),
    };
  }

  // Resolve contact
  let contactId = contact_id;
  if (!contactId) {
    const contacts = await searchContacts(locationId, apiKey, contact_name);
    if (contacts.length > 0) {
      contactId = contacts[0].id;
    } else {
      const created = await createContact(locationId, apiKey, contact_name, undefined, ["AIOS"]);
      if (!created) return { error: "Failed to find or create GHL contact" };
      contactId = created.id;
    }
  }

  // Find or create opportunity, then move to stage
  let opp = await findOpportunity(locationId, apiKey, pipelineId, contactId);
  let createdNew = false;

  if (!opp) {
    opp = await createOpportunity(locationId, apiKey, pipelineId, stage.id, contactId, contact_name);
    createdNew = true;
    if (!opp) return { error: "Failed to create GHL opportunity" };
  } else {
    const ok = await updateOpportunityStage(apiKey, opp.id, stage.id);
    if (!ok) return { error: "Failed to update opportunity stage in GHL" };
  }

  return {
    success: true,
    action: "pipeline_updated",
    contact_name,
    contact_id: contactId,
    opportunity_id: opp.id,
    stage: to_stage,
    stage_id: stage.id,
    reason: reason ?? "Agent-triggered stage update",
    created_new_opportunity: createdNew,
  };
}

async function ghlCreateSubAccount(input: Record<string, unknown>): Promise<unknown> {
  const agencyToken = process.env.GHL_AGENCY_API_KEY ?? process.env.GHL_API_KEY;
  const snapshotId = process.env.GHL_SNAPSHOT_ID;

  if (!agencyToken) {
    return {
      simulated: true,
      action: "ghl_subaccount_created",
      ...input,
      subaccount_id: `GHL-SIM-${Date.now()}`,
      note: "Set GHL_AGENCY_API_KEY to activate real sub-account creation",
    };
  }

  const { client_name, client_email, package: pkg, business_type } = input as {
    client_name: string;
    client_email: string;
    package: "Starter" | "Growth" | "Scale";
    business_type?: string;
  };

  const locationName = business_type
    ? `${client_name} — ${business_type}`
    : client_name;

  const location = await createLocation(agencyToken, locationName, client_email, snapshotId);
  if (!location) {
    return { error: "GHL sub-account creation failed — verify GHL_AGENCY_API_KEY has agency-level access" };
  }

  return {
    success: true,
    action: "ghl_subaccount_created",
    client_name,
    client_email,
    package: pkg,
    subaccount_id: location.id,
    subaccount_name: location.name,
    onboarding_timeline_days: pkg === "Starter" ? 5 : pkg === "Growth" ? 10 : 14,
  };
}

async function ghlCheckOnboardingStatus(input: Record<string, unknown>): Promise<unknown> {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    return {
      simulated: true,
      client: input.client_name,
      note: "Set GHL_API_KEY and GHL_LOCATION_ID to activate",
    };
  }

  const { client_name } = input as { client_name: string };
  const contacts = await searchContacts(locationId, apiKey, client_name);

  if (contacts.length === 0) {
    return { client: client_name, status: "not_found", message: "No GHL contact found — client may not be onboarded yet" };
  }

  const contact = contacts[0];
  return {
    success: true,
    client: client_name,
    contact_id: contact.id,
    contact_name: `${contact.firstName} ${contact.lastName}`.trim(),
    status: "found",
    message: "Contact found in GHL. Check Notion GHL Project Tracker for milestone details.",
  };
}

// ── Tool Definitions + Registration ──────────────────────────────────────────

export const GHL_TOOLS: Anthropic.Tool[] = [
  {
    name: "ghl_update_pipeline",
    description:
      "Move a GHL contact through the sales pipeline. Searches for the contact by name, finds or creates their opportunity, and updates the stage. Stages: New Lead → Proposal Sent → Active Client → Churned.",
    input_schema: {
      type: "object" as const,
      properties: {
        contact_id: { type: "string", description: "GHL contact ID (optional — will search by name if omitted)" },
        contact_name: { type: "string", description: "Client full name" },
        from_stage: { type: "string", description: "Current stage (for logging only)" },
        to_stage: { type: "string", description: "Target stage name — must match your GHL pipeline stage names exactly" },
        reason: { type: "string", description: "Reason for the stage change" },
      },
      required: ["contact_name", "to_stage"],
    },
  },
  {
    name: "ghl_create_subaccount",
    description:
      "Provision a new GHL sub-account (location) for an onboarding client. Requires agency-level API access.",
    input_schema: {
      type: "object" as const,
      properties: {
        client_name: { type: "string" },
        client_email: { type: "string" },
        package: { type: "string", enum: ["Starter", "Growth", "Scale"] },
        business_type: { type: "string", description: "Type of service business (e.g. roofing, HVAC)" },
      },
      required: ["client_name", "client_email", "package"],
    },
  },
  {
    name: "ghl_check_onboarding_status",
    description:
      "Look up a client's GHL contact record to verify they exist and retrieve their contact ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        client_name: { type: "string" },
      },
      required: ["client_name"],
    },
  },
];

export function registerGhlTools(agent: BaseAgent): void {
  const a = agent as unknown as {
    registerTool: (
      tool: Anthropic.Tool,
      executor: (input: Record<string, unknown>) => Promise<unknown>,
    ) => void;
  };
  a.registerTool(GHL_TOOLS[0], ghlUpdatePipeline);
  a.registerTool(GHL_TOOLS[1], ghlCreateSubAccount);
  a.registerTool(GHL_TOOLS[2], ghlCheckOnboardingStatus);
}
