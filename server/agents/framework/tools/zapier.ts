import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import type { BaseAgent } from "../base-agent.ts";

// Direct Slack API path — fires when SLACK_BOT_TOKEN is set, bypassing Zapier webhook
async function slackDirectMessage(
  channel: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return { success: false, error: "SLACK_BOT_TOKEN not set" };

  try {
    const res = await axios.post(
      "https://slack.com/api/chat.postMessage",
      { channel, text, unfurl_links: false },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
    );
    if (!res.data.ok) throw new Error(res.data.error ?? "Slack API error");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

// Zapier webhook registry — each Zap has a named URL in env
// Format: ZAPIER_WEBHOOK_<ZAP_NAME_UPPERCASE_UNDERSCORED>
// e.g., ZAPIER_WEBHOOK_NEW_LEAD_GHL → DEL-01
const ZAP_REGISTRY: Record<string, string> = {
  // Client Delivery
  "DEL-01-new-lead": "ZAPIER_WEBHOOK_DEL_01",
  "DEL-02-send-proposal": "ZAPIER_WEBHOOK_DEL_02",
  "DEL-03-kickoff-checklist": "ZAPIER_WEBHOOK_DEL_03",
  "DEL-04-weekly-report": "ZAPIER_WEBHOOK_DEL_04",
  // Sales
  "SAL-01-new-discovery": "ZAPIER_WEBHOOK_SAL_01",
  "SAL-02-follow-up": "ZAPIER_WEBHOOK_SAL_02",
  "SAL-03-proposal-sent": "ZAPIER_WEBHOOK_SAL_03",
  "SAL-04-deal-won": "ZAPIER_WEBHOOK_SAL_04",
  // Finance
  "FIN-01-invoice": "ZAPIER_WEBHOOK_FIN_01",
  "FIN-02-payment-received": "ZAPIER_WEBHOOK_FIN_02",
  "FIN-03-expense-log": "ZAPIER_WEBHOOK_FIN_03",
  "FIN-04-monthly-report": "ZAPIER_WEBHOOK_FIN_04",
  // Marketing
  "MKT-01-publish-content": "ZAPIER_WEBHOOK_MKT_01",
  "MKT-02-lead-magnet": "ZAPIER_WEBHOOK_MKT_02",
  "MKT-03-newsletter": "ZAPIER_WEBHOOK_MKT_03",
  // Operations
  "OPS-01-new-sop": "ZAPIER_WEBHOOK_OPS_01",
  "OPS-02-team-notify": "ZAPIER_WEBHOOK_OPS_02",
  "OPS-03-review-request": "ZAPIER_WEBHOOK_OPS_03",
  // Analytics
  "DAT-01-kpi-snapshot": "ZAPIER_WEBHOOK_DAT_01",
  "DAT-02-weekly-digest": "ZAPIER_WEBHOOK_DAT_02",
  "DAT-03-anomaly-alert": "ZAPIER_WEBHOOK_DAT_03",
  // Notifications
  "notify-dustin-sms": "ZAPIER_WEBHOOK_NOTIFY_SMS",
  "notify-dustin-slack": "ZAPIER_WEBHOOK_NOTIFY_SLACK",
  // Social Media Publishing
  "SOC-01-linkedin-post": "ZAPIER_WEBHOOK_SOC_01",
  "SOC-02-facebook-post": "ZAPIER_WEBHOOK_SOC_02",
  "SOC-03-instagram-post": "ZAPIER_WEBHOOK_SOC_03",
  "SOC-04-twitter-post": "ZAPIER_WEBHOOK_SOC_04",
  // Paid Ads
  "ADS-01-meta-lead-to-ghl": "ZAPIER_WEBHOOK_ADS_01",
  "ADS-02-google-lead-to-ghl": "ZAPIER_WEBHOOK_ADS_02",
  "ADS-03-linkedin-lead-to-ghl": "ZAPIER_WEBHOOK_ADS_03",
  "ADS-04-pause-ad-alert": "ZAPIER_WEBHOOK_ADS_04",
};

async function zapierFire(
  input: Record<string, unknown>,
): Promise<unknown> {
  const zap = input.zap as string;
  const payload = (input.payload as Record<string, unknown>) ?? {};

  const envKey = ZAP_REGISTRY[zap];
  if (!envKey) {
    return {
      error: `Unknown Zap: '${zap}'`,
      available: Object.keys(ZAP_REGISTRY),
    };
  }

  const webhookUrl = process.env[envKey];
  if (!webhookUrl) {
    return {
      simulated: true,
      zap,
      message: `Would fire ${zap} (${envKey} not set in .env)`,
      payload,
    };
  }

  try {
    const res = await axios.post(webhookUrl, {
      zap,
      timestamp: new Date().toISOString(),
      source: "myers-digital-aios",
      ...payload,
    });
    return { success: true, status: res.status, zap };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Zapier webhook failed: ${msg}`, zap };
  }
}

async function notifyDustin(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { urgency, message } = input as {
    urgency: "low" | "medium" | "high";
    message: string;
  };

  const timestamp = new Date().toISOString();
  const emoji = urgency === "high" ? "🚨" : urgency === "medium" ? "⚠️" : "ℹ️";
  const slackText = `${emoji} *AIOS Alert — ${urgency.toUpperCase()}*\n${message}\n_${timestamp}_`;

  // Primary: direct Slack API if SLACK_BOT_TOKEN is configured
  const slackChannel =
    process.env.SLACK_NOTIFY_CHANNEL ?? process.env.SLACK_CHANNEL_ID ?? "#general";
  const direct = await slackDirectMessage(slackChannel, slackText);
  if (direct.success) return { success: true, channel: slackChannel, urgency, via: "slack-direct" };

  // Fallback: Zapier webhook
  const zapChannel =
    urgency === "high" ? "notify-dustin-sms" : "notify-dustin-slack";
  return zapierFire({
    zap: zapChannel,
    payload: { urgency, message, timestamp },
  });
}

export const ZAPIER_TOOLS: Anthropic.Tool[] = [
  {
    name: "zapier_fire",
    description:
      "Fire a Zapier webhook to trigger an automation. Use this to create GHL contacts, send proposals, log invoices, publish content, or trigger any downstream workflow.",
    input_schema: {
      type: "object" as const,
      properties: {
        zap: {
          type: "string",
          enum: Object.keys(ZAP_REGISTRY),
          description: "The Zap to trigger",
        },
        payload: {
          type: "object",
          description:
            "Data to send with the webhook (client name, email, amounts, etc.)",
        },
      },
      required: ["zap"],
    },
  },
  {
    name: "notify_dustin",
    description:
      "Send an urgent notification to Dustin Myers. Use for decisions requiring human approval, escalations, or high-priority alerts.",
    input_schema: {
      type: "object" as const,
      properties: {
        urgency: {
          type: "string",
          enum: ["low", "medium", "high"],
          description:
            "low → Slack, medium → Slack @mention, high → SMS immediately",
        },
        message: {
          type: "string",
          description:
            "Clear, actionable message. Include what happened, what decision is needed, and the consequence of delay.",
        },
      },
      required: ["urgency", "message"],
    },
  },
];

export function registerZapierTools(agent: BaseAgent): void {
  const a = agent as unknown as {
    registerTool: (
      tool: Anthropic.Tool,
      executor: (input: Record<string, unknown>) => Promise<unknown>,
    ) => void;
  };

  a.registerTool(ZAPIER_TOOLS[0], zapierFire);
  a.registerTool(ZAPIER_TOOLS[1], notifyDustin);
}
