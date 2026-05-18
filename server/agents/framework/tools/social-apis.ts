import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import type { BaseAgent } from "../base-agent.ts";

// ── Meta Graph API ─────────────────────────────────────────────────────────────

const META_BASE = "https://graph.facebook.com/v19.0";

function metaHeaders() {
  return { Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}` };
}

async function postToFacebook(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { message, link, scheduled_publish_time } = input as {
    message: string;
    link?: string;
    scheduled_publish_time?: number; // Unix timestamp
  };

  const pageId = process.env.META_PAGE_ID;
  const token = process.env.META_ACCESS_TOKEN;

  if (!pageId || !token) {
    return {
      simulated: true,
      platform: "facebook",
      message: message.slice(0, 80) + "...",
      action: "Would post to Facebook Page",
      note: "Set META_PAGE_ID and META_ACCESS_TOKEN in .env",
    };
  }

  try {
    const body: Record<string, unknown> = { message, access_token: token };
    if (link) body.link = link;
    if (scheduled_publish_time) {
      body.scheduled_publish_time = scheduled_publish_time;
      body.published = false;
    }

    const res = await axios.post(`${META_BASE}/${pageId}/feed`, body);
    return { success: true, post_id: res.data.id, platform: "facebook" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Facebook API: ${msg}` };
  }
}

async function postToInstagram(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { caption, image_url, media_type = "IMAGE" } = input as {
    caption: string;
    image_url?: string;
    media_type?: "IMAGE" | "REELS" | "CAROUSEL_ALBUM";
  };

  const igAccountId = process.env.META_IG_ACCOUNT_ID;
  const token = process.env.META_ACCESS_TOKEN;

  if (!igAccountId || !token) {
    return {
      simulated: true,
      platform: "instagram",
      caption: caption.slice(0, 80) + "...",
      action: "Would post to Instagram",
      note: "Set META_IG_ACCOUNT_ID and META_ACCESS_TOKEN in .env",
    };
  }

  try {
    // Step 1: Create media container
    const containerRes = await axios.post(
      `${META_BASE}/${igAccountId}/media`,
      {
        caption,
        ...(image_url && { image_url }),
        media_type,
        access_token: token,
      },
    );

    // Step 2: Publish the container
    const publishRes = await axios.post(
      `${META_BASE}/${igAccountId}/media_publish`,
      { creation_id: containerRes.data.id, access_token: token },
    );

    return {
      success: true,
      media_id: publishRes.data.id,
      platform: "instagram",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Instagram API: ${msg}` };
  }
}

async function getMetaAdInsights(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { campaign_id, date_preset = "last_7d", level = "campaign" } =
    input as {
      campaign_id?: string;
      date_preset?: string;
      level?: "campaign" | "adset" | "ad";
    };

  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  const token = process.env.META_ACCESS_TOKEN;

  if (!adAccountId || !token) {
    return {
      simulated: true,
      data: [
        {
          campaign_name: "Myers Digital — Cold Traffic",
          spend: "247.50",
          impressions: "18420",
          clicks: "312",
          ctr: "1.69",
          cpc: "0.79",
          leads: 9,
          cpl: "27.50",
          date_start: "2026-05-11",
          date_stop: "2026-05-17",
        },
      ],
      note: "Set META_AD_ACCOUNT_ID and META_ACCESS_TOKEN for live data",
    };
  }

  try {
    const fields =
      "campaign_name,spend,impressions,clicks,ctr,cpc,actions,cost_per_action_type";
    const target = campaign_id ?? `act_${adAccountId}`;
    const endpoint = campaign_id
      ? `${META_BASE}/${campaign_id}/insights`
      : `${META_BASE}/act_${adAccountId}/insights`;

    const res = await axios.get(endpoint, {
      params: { fields, date_preset, level, access_token: token },
    });

    return { success: true, data: res.data.data, paging: res.data.paging };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Meta Ads API: ${msg}` };
  }
}

async function pauseMetaAd(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { object_id, object_type, reason } = input as {
    object_id: string;
    object_type: "campaign" | "adset" | "ad";
    reason: string;
  };

  const token = process.env.META_ACCESS_TOKEN;

  if (!token) {
    return {
      simulated: true,
      action: "pause",
      object_id,
      object_type,
      reason,
      note: "Set META_ACCESS_TOKEN to execute",
    };
  }

  try {
    const res = await axios.post(
      `${META_BASE}/${object_id}`,
      { status: "PAUSED", access_token: token },
    );
    return {
      success: true,
      object_id,
      object_type,
      new_status: "PAUSED",
      reason,
      api_response: res.data,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Meta pause failed: ${msg}` };
  }
}

async function createMetaCampaign(
  input: Record<string, unknown>,
): Promise<unknown> {
  const {
    name,
    objective,
    daily_budget_usd,
    targeting,
    creative_id,
  } = input as {
    name: string;
    objective: string;
    daily_budget_usd: number;
    targeting?: Record<string, unknown>;
    creative_id?: string;
  };

  const token = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;

  if (!token || !adAccountId) {
    return {
      simulated: true,
      action: "create_campaign",
      name,
      objective,
      daily_budget_usd,
      campaign_id: `CAMP-${Date.now()}`,
      note: "Set META_ACCESS_TOKEN and META_AD_ACCOUNT_ID to create live campaign",
    };
  }

  try {
    const campRes = await axios.post(
      `${META_BASE}/act_${adAccountId}/campaigns`,
      {
        name,
        objective: objective.toUpperCase(),
        status: "PAUSED",
        access_token: token,
      },
    );

    return {
      success: true,
      campaign_id: campRes.data.id,
      name,
      status: "PAUSED",
      note: "Campaign created in PAUSED state — review before activating",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Meta campaign creation failed: ${msg}` };
  }
}

// ── LinkedIn API ───────────────────────────────────────────────────────────────

const LINKEDIN_BASE = "https://api.linkedin.com/v2";

async function postToLinkedIn(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { text, article_url, article_title } = input as {
    text: string;
    article_url?: string;
    article_title?: string;
  };

  const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
  const token = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!orgId || !token) {
    return {
      simulated: true,
      platform: "linkedin",
      preview: text.slice(0, 100) + "...",
      action: "Would post to LinkedIn Organization page",
      note: "Set LINKEDIN_ORGANIZATION_ID and LINKEDIN_ACCESS_TOKEN in .env",
    };
  }

  const body: Record<string, unknown> = {
    author: `urn:li:organization:${orgId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: article_url ? "ARTICLE" : "NONE",
        ...(article_url && {
          media: [
            {
              status: "READY",
              originalUrl: article_url,
              title: { text: article_title ?? "" },
            },
          ],
        }),
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  try {
    const res = await axios.post(`${LINKEDIN_BASE}/ugcPosts`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });
    return {
      success: true,
      post_id: res.headers["x-restli-id"],
      platform: "linkedin",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `LinkedIn API: ${msg}` };
  }
}

// ── Google Ads API (simplified) ────────────────────────────────────────────────

async function getGoogleAdPerformance(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { customer_id, date_range = "LAST_7_DAYS" } = input as {
    customer_id?: string;
    date_range?: string;
  };

  const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const cid = customer_id ?? process.env.GOOGLE_ADS_CUSTOMER_ID;

  if (!devToken || !cid) {
    return {
      simulated: true,
      data: {
        campaigns: [
          {
            name: "Myers Digital Search — Contractors",
            status: "ENABLED",
            clicks: 124,
            impressions: 2840,
            ctr: "4.37%",
            avg_cpc: "$1.82",
            conversions: 11,
            cost: "$225.68",
            cpl: "$20.52",
            quality_score_avg: 7.2,
          },
        ],
        date_range,
      },
      note: "Set GOOGLE_ADS_DEVELOPER_TOKEN and GOOGLE_ADS_CUSTOMER_ID for live data",
    };
  }

  return {
    error: "Google Ads REST API requires OAuth2 — use Google Ads SDK or MCC-level access. Zapier integration recommended for simpler setup.",
    recommendation: "Set ZAPIER_WEBHOOK_ADS_02 and use the zapier_fire tool to pull reports via Zapier Google Ads integration.",
  };
}

async function createGoogleCampaign(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { name, budget_daily_usd, keywords, ad_copy } = input as {
    name: string;
    budget_daily_usd: number;
    keywords: string[];
    ad_copy: { headlines: string[]; descriptions: string[] };
  };

  const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  if (!devToken) {
    return {
      simulated: true,
      action: "create_google_search_campaign",
      name,
      budget_daily_usd,
      keywords,
      ad_copy,
      campaign_id: `GCAM-${Date.now()}`,
      note: "Set GOOGLE_ADS_DEVELOPER_TOKEN + configure OAuth2 for live creation. Alternatively use Zapier ADS-02 webhook.",
    };
  }

  return {
    error: "Google Ads REST API requires OAuth2 setup. Use Google Ads MCC login, generate refresh token, and set GOOGLE_ADS_REFRESH_TOKEN.",
  };
}

// ── Unified post_to_social tool ────────────────────────────────────────────────

async function postToSocial(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { platform, content, image_url, link, scheduled_at } = input as {
    platform: "linkedin" | "facebook" | "instagram" | "twitter";
    content: string;
    image_url?: string;
    link?: string;
    scheduled_at?: string; // ISO datetime
  };

  switch (platform) {
    case "linkedin":
      return postToLinkedIn({ text: content, article_url: link });
    case "facebook":
      return postToFacebook({ message: content, link });
    case "instagram":
      return postToInstagram({ caption: content, image_url });
    case "twitter": {
      const twitterToken = process.env.TWITTER_BEARER_TOKEN;
      if (!twitterToken) {
        return {
          simulated: true,
          platform: "twitter",
          content: content.slice(0, 100),
          note: "Set TWITTER_BEARER_TOKEN for live posting",
        };
      }
      return { error: "Twitter/X posting requires OAuth 1.0a — use Zapier SOC-04 webhook instead" };
    }
    default:
      return { error: `Unknown platform: ${platform}` };
  }
}

async function getSocialAnalytics(
  input: Record<string, unknown>,
): Promise<unknown> {
  const { platform, post_id, period = "7d" } = input as {
    platform: "linkedin" | "facebook" | "instagram" | "meta-ads" | "google-ads";
    post_id?: string;
    period?: string;
  };

  if (platform === "meta-ads") return getMetaAdInsights({ date_preset: `last_${period}` });
  if (platform === "google-ads") return getGoogleAdPerformance({ date_range: "LAST_7_DAYS" });

  // Organic social — return simulated or real depending on credentials
  const token = process.env.META_ACCESS_TOKEN;
  if (!token && (platform === "facebook" || platform === "instagram")) {
    return {
      simulated: true,
      platform,
      period,
      metrics: {
        impressions: Math.floor(Math.random() * 2000 + 500),
        reach: Math.floor(Math.random() * 1500 + 300),
        engagement: Math.floor(Math.random() * 150 + 20),
        engagement_rate: ((Math.random() * 4) + 1).toFixed(2) + "%",
        clicks: Math.floor(Math.random() * 80 + 10),
      },
      note: "Set META_ACCESS_TOKEN for live analytics",
    };
  }

  return {
    simulated: true,
    platform,
    period,
    metrics: {
      impressions: 1247,
      engagement_rate: "3.8%",
      clicks: 43,
      new_followers: 12,
    },
  };
}

// ── Tool definitions ───────────────────────────────────────────────────────────

export const SOCIAL_TOOLS: Anthropic.Tool[] = [
  {
    name: "post_to_social",
    description:
      "Publish or schedule a post to LinkedIn, Facebook, Instagram, or Twitter/X. Always apply Dustin's voice before calling this tool — the content should be ready to publish.",
    input_schema: {
      type: "object" as const,
      properties: {
        platform: {
          type: "string",
          enum: ["linkedin", "facebook", "instagram", "twitter"],
        },
        content: { type: "string", description: "Full post copy" },
        image_url: {
          type: "string",
          description: "Public URL of image to attach (Instagram requires this)",
        },
        link: {
          type: "string",
          description: "URL to attach as article link (LinkedIn/Facebook)",
        },
        scheduled_at: {
          type: "string",
          description: "ISO datetime to schedule post (leave empty to publish now)",
        },
      },
      required: ["platform", "content"],
    },
  },
  {
    name: "get_social_analytics",
    description:
      "Pull performance metrics for an organic post or ad campaign. Use to assess what content is working and inform next week's strategy.",
    input_schema: {
      type: "object" as const,
      properties: {
        platform: {
          type: "string",
          enum: ["linkedin", "facebook", "instagram", "meta-ads", "google-ads"],
        },
        post_id: { type: "string", description: "Specific post or campaign ID (optional)" },
        period: {
          type: "string",
          enum: ["24h", "7d", "30d", "90d"],
          description: "Time period for data (default: 7d)",
        },
      },
      required: ["platform"],
    },
  },
  {
    name: "get_meta_ad_insights",
    description:
      "Pull Meta Ads performance data: spend, impressions, CTR, CPL, ROAS. Use for weekly ad performance review and pause/scale decisions.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "Specific campaign ID (optional — omit for all campaigns)" },
        date_preset: {
          type: "string",
          enum: ["today", "yesterday", "last_7d", "last_14d", "last_30d", "this_month"],
        },
        level: {
          type: "string",
          enum: ["campaign", "adset", "ad"],
          description: "Breakdown level (default: campaign)",
        },
      },
      required: [],
    },
  },
  {
    name: "pause_meta_ad",
    description:
      "Pause a Meta campaign, ad set, or individual ad. Use when CPL exceeds $50 after $100 spend, or CTR drops below 0.8%.",
    input_schema: {
      type: "object" as const,
      properties: {
        object_id: { type: "string", description: "Campaign, ad set, or ad ID" },
        object_type: {
          type: "string",
          enum: ["campaign", "adset", "ad"],
        },
        reason: {
          type: "string",
          description: "Why this is being paused (logged to Decision Log)",
        },
      },
      required: ["object_id", "object_type", "reason"],
    },
  },
  {
    name: "create_meta_campaign",
    description:
      "Create a new Meta ad campaign structure. Campaign is created in PAUSED state — always review before activating.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        objective: {
          type: "string",
          enum: ["LEAD_GENERATION", "LINK_CLICKS", "REACH", "VIDEO_VIEWS", "CONVERSIONS"],
        },
        daily_budget_usd: { type: "number" },
        targeting: {
          type: "object",
          description: "Meta audience targeting object (age, interests, locations, behaviors)",
        },
      },
      required: ["name", "objective", "daily_budget_usd"],
    },
  },
  {
    name: "get_google_ad_performance",
    description:
      "Pull Google Ads campaign performance: clicks, impressions, CTR, CPL, Quality Score.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_id: { type: "string", description: "Google Ads customer ID (optional — uses env default)" },
        date_range: {
          type: "string",
          enum: ["TODAY", "YESTERDAY", "LAST_7_DAYS", "LAST_14_DAYS", "LAST_30_DAYS", "THIS_MONTH"],
        },
      },
      required: [],
    },
  },
  {
    name: "create_google_campaign",
    description:
      "Create a new Google Search campaign with keyword list and responsive search ad copy.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        budget_daily_usd: { type: "number" },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "Keywords to target (use [exact], \"phrase\", or broad match)",
        },
        ad_copy: {
          type: "object",
          description: "{ headlines: string[15], descriptions: string[4] } for RSA",
        },
      },
      required: ["name", "budget_daily_usd", "keywords", "ad_copy"],
    },
  },
];

// ── Registration helper ────────────────────────────────────────────────────────

export function registerSocialTools(agent: BaseAgent): void {
  const a = agent as unknown as {
    registerTool: (
      tool: Anthropic.Tool,
      executor: (input: Record<string, unknown>) => Promise<unknown>,
    ) => void;
  };

  const executors: Record<string, (input: Record<string, unknown>) => Promise<unknown>> = {
    post_to_social: postToSocial,
    get_social_analytics: getSocialAnalytics,
    get_meta_ad_insights: getMetaAdInsights,
    pause_meta_ad: pauseMetaAd,
    create_meta_campaign: createMetaCampaign,
    get_google_ad_performance: getGoogleAdPerformance,
    create_google_campaign: createGoogleCampaign,
  };

  for (const tool of SOCIAL_TOOLS) {
    a.registerTool(tool, executors[tool.name]);
  }
}
