import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class AiosSalesAgent extends BaseAgent {
  constructor() {
    super({
      name: "AiosSales",
      skillPath: "custom/aios-sales/SKILL.md",
      maxTokens: 12288,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "log_prospect",
        description:
          "Create or update a prospect record in the AIOS sales pipeline. Logs qualification status, recommended tier, and next action.",
        input_schema: {
          type: "object" as const,
          properties: {
            prospect_name: { type: "string" },
            business_name: { type: "string" },
            business_type: { type: "string" },
            monthly_revenue: { type: "string", description: "e.g. '$45K/mo'" },
            primary_pain: { type: "string" },
            qualification_status: {
              type: "string",
              enum: ["qualified", "not_qualified", "pending"],
            },
            recommended_tier: {
              type: "string",
              enum: ["starter", "growth", "scale", "none"],
            },
            pipeline_stage: {
              type: "string",
              enum: [
                "inquiry",
                "qualified",
                "demo_booked",
                "demo_done",
                "proposal_sent",
                "negotiating",
                "closed_won",
                "closed_lost",
              ],
            },
            notes: { type: "string" },
          },
          required: ["prospect_name", "qualification_status", "pipeline_stage"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "prospect_logged",
        record_id: `SAL-${Date.now()}`,
        ghl_pipeline_updated: true,
        notion_logged: true,
        ...input,
      }),
    );

    this.registerTool(
      {
        name: "draft_proposal",
        description:
          "Build a customized AIOS proposal for a qualified prospect. Returns the full proposal text in Dustin's voice.",
        input_schema: {
          type: "object" as const,
          properties: {
            prospect_name: { type: "string" },
            business_type: { type: "string" },
            monthly_revenue: { type: "string" },
            primary_pain: { type: "string" },
            recommended_tier: {
              type: "string",
              enum: ["starter", "growth", "scale"],
            },
            specific_agents: {
              type: "array",
              items: { type: "string" },
              description: "Agent names most relevant to this prospect's pain",
            },
          },
          required: [
            "prospect_name",
            "business_type",
            "monthly_revenue",
            "primary_pain",
            "recommended_tier",
          ],
        },
      },
      async (input) => {
        const { recommended_tier } = input as { recommended_tier: string };
        const tiers: Record<string, { setup: string; monthly: string }> = {
          starter: { setup: "$1,497", monthly: "$497/mo" },
          growth: { setup: "$3,997", monthly: "$997/mo" },
          scale: { setup: "$7,997", monthly: "$1,997/mo" },
        };
        const pricing = tiers[recommended_tier] ?? tiers.growth;
        return {
          simulated: true,
          action: "proposal_drafted",
          proposal_id: `PROP-${Date.now()}`,
          pricing,
          saved_to_notion: true,
          ...input,
        };
      },
    );

    this.registerTool(
      {
        name: "book_demo",
        description:
          "Mark a prospect as demo-booked in GHL and trigger the pre-demo prep sequence (calendar invite + context brief for Dustin).",
        input_schema: {
          type: "object" as const,
          properties: {
            prospect_name: { type: "string" },
            demo_date: { type: "string", description: "ISO date-time" },
            recommended_tier: { type: "string" },
            prospect_context: {
              type: "string",
              description: "Key pain points and qualifying info for Dustin's prep",
            },
          },
          required: ["prospect_name", "demo_date"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "demo_booked",
        calendar_invite_sent: true,
        ghl_stage: "Demo Booked",
        dustin_brief_created: true,
        zapier_fired: "SAL-03",
        ...input,
      }),
    );

    this.registerTool(
      {
        name: "send_follow_up",
        description:
          "Queue a follow-up message in Dustin's voice for a specific prospect at the right sequence step (post-demo D1/D3/D7 or post-proposal D2/D5/D10).",
        input_schema: {
          type: "object" as const,
          properties: {
            prospect_name: { type: "string" },
            follow_up_type: {
              type: "string",
              enum: ["post_demo_d1", "post_demo_d3", "post_demo_d7", "post_proposal_d2", "post_proposal_d5", "post_proposal_d10"],
            },
            message_draft: {
              type: "string",
              description: "Message in Dustin's voice",
            },
            send_via: {
              type: "string",
              enum: ["email", "sms", "slack"],
            },
          },
          required: ["prospect_name", "follow_up_type", "send_via"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "follow_up_queued",
        queued_id: `FU-${Date.now()}`,
        awaiting_dustin_approval: true,
        ...input,
      }),
    );

    this.registerTool(
      {
        name: "fire_onboarding_chain",
        description:
          "Fire the Closed-Won automation chain: SAL-04 → DEL-02. Triggers GHL sub-account provisioning, invoice generation, and welcome sequence for a new client.",
        input_schema: {
          type: "object" as const,
          properties: {
            client_name: { type: "string" },
            package_tier: {
              type: "string",
              enum: ["starter", "growth", "scale"],
            },
            setup_fee: { type: "number" },
            monthly_fee: { type: "number" },
          },
          required: ["client_name", "package_tier"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "onboarding_chain_fired",
        zapier_sequence: ["SAL-04", "DEL-02"],
        ghl_subaccount_queued: true,
        invoice_queued: true,
        welcome_sequence_queued: true,
        ...input,
      }),
    );
  }
}

export function createAiosSalesAgent(): AiosSalesAgent {
  return new AiosSalesAgent();
}

registerAgent("aios-sales", createAiosSalesAgent);
