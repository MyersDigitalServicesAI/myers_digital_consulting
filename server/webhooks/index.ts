import { Router, type Request, type Response } from "express";

// Import all agents so registry is populated
import "../agents/index.ts";
import { createDirectorAgent } from "../agents/director.ts";
import { createCrmAgent } from "../agents/modules/crm.ts";
import { createSalesCallCoachAgent } from "../agents/custom/sales-call-coach.ts";
import { createTranscriptMinerAgent } from "../agents/custom/transcript-miner.ts";
import { createMeetingTranscriptAgent } from "../agents/custom/meeting-transcript.ts";
import { createGeoSeoAuditorAgent } from "../agents/custom/geo-seo-auditor.ts";
import { createSocialMediaManagerAgent } from "../agents/custom/social-media-manager.ts";
import { createMetaAdsManagerAgent } from "../agents/custom/meta-ads-manager.ts";
import { createAdPerformanceAgent } from "../agents/custom/ad-performance.ts";
import { createContentCalendarAgent } from "../agents/custom/content-calendar.ts";
import { createCostBreakdownAgent } from "../agents/custom/cost-breakdown.ts";
import { createWorkspaceArchitectAgent } from "../agents/custom/workspace-architect.ts";
import { createAiosSalesAgent } from "../agents/custom/aios-sales.ts";

export function createWebhookRouter(): Router {
  const router = Router();

  // POST /webhooks/director — General task dispatch to Director
  // Use this from Zapier, n8n, or direct API calls for any ad-hoc task
  router.post("/director", async (req: Request, res: Response) => {
    const { task, context } = req.body as { task: string; context?: string };

    if (!task) {
      res.status(400).json({ error: "task is required" });
      return;
    }

    try {
      const director = createDirectorAgent();
      const result = await director.run(task, context);
      res.json({
        success: result.success,
        output: result.output,
        toolCalls: result.toolCalls.length,
      });
    } catch (err) {
      console.error("[Webhook] Director error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  // POST /webhooks/ghl/new-lead — GHL new lead → CRM agent
  // Configure this as the GHL webhook URL for new lead notifications
  router.post("/ghl/new-lead", async (req: Request, res: Response) => {
    const { contact_name, email, phone, source, pipeline_stage } =
      req.body as {
        contact_name: string;
        email?: string;
        phone?: string;
        source?: string;
        pipeline_stage?: string;
      };

    // Acknowledge immediately — GHL expects fast response
    res.json({ received: true });

    // Process asynchronously
    setImmediate(async () => {
      try {
        const crm = createCrmAgent();
        await crm.run(
          `New lead received from GHL: ${contact_name}`,
          JSON.stringify({ contact_name, email, phone, source, pipeline_stage }),
        );
      } catch (err) {
        console.error("[Webhook] GHL new-lead error:", err);
      }
    });
  });

  // POST /webhooks/sales-call — Submit a sales call transcript for coaching
  router.post("/sales-call", async (req: Request, res: Response) => {
    const { transcript, rep_name, call_date } = req.body as {
      transcript: string;
      rep_name?: string;
      call_date?: string;
    };

    if (!transcript) {
      res.status(400).json({ error: "transcript is required" });
      return;
    }

    try {
      const coach = createSalesCallCoachAgent();
      const result = await coach.run(
        `Score and coach this sales call${rep_name ? ` by ${rep_name}` : ""}. Apply the 6-category 100-point rubric. Provide specific scripted fixes for the top 3 improvement areas.`,
        transcript,
      );
      res.json({ success: result.success, report: result.output });
    } catch (err) {
      console.error("[Webhook] sales-call error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  // POST /webhooks/transcript — Mine a call transcript for hooks
  router.post("/transcript", async (req: Request, res: Response) => {
    const { transcript, call_name } = req.body as {
      transcript: string;
      call_name?: string;
    };

    if (!transcript) {
      res.status(400).json({ error: "transcript is required" });
      return;
    }

    // Acknowledge immediately
    res.json({ received: true, call_name });

    setImmediate(async () => {
      try {
        const miner = createTranscriptMinerAgent();
        await miner.run(
          `Mine this transcript for high-value hooks, stories, and proof points. Score each hook 1-10. Save all hooks scoring 7 or above to Notion Module Memory.`,
          `CALL: ${call_name ?? "Unknown"}\n\n${transcript}`,
        );
      } catch (err) {
        console.error("[Webhook] transcript error:", err);
      }
    });
  });

  // POST /webhooks/meeting — Process meeting transcript into tasks
  router.post("/meeting", async (req: Request, res: Response) => {
    const { transcript, meeting_title, participants } = req.body as {
      transcript: string;
      meeting_title: string;
      participants?: string[];
    };

    if (!transcript || !meeting_title) {
      res.status(400).json({ error: "transcript and meeting_title are required" });
      return;
    }

    try {
      const agent = createMeetingTranscriptAgent();
      const result = await agent.run(
        `Process this meeting transcript. Extract all action items with owners and due dates. Extract key decisions. Create tasks in Notion. Title: ${meeting_title}`,
        `PARTICIPANTS: ${(participants ?? []).join(", ")}\n\nTRANSCRIPT:\n${transcript}`,
      );
      res.json({ success: result.success, summary: result.output });
    } catch (err) {
      console.error("[Webhook] meeting error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  // POST /webhooks/seo-audit — Run a GEO+SEO audit for a client
  router.post("/seo-audit", async (req: Request, res: Response) => {
    const { client_name, business_name, location, keywords } = req.body as {
      client_name: string;
      business_name: string;
      location: string;
      keywords?: string[];
    };

    if (!business_name || !location) {
      res.status(400).json({ error: "business_name and location are required" });
      return;
    }

    // Acknowledge — audit takes time
    res.json({ received: true, client_name });

    setImmediate(async () => {
      try {
        const auditor = createGeoSeoAuditorAgent();
        await auditor.run(
          `Run a complete GEO+SEO audit for ${business_name} in ${location}. Cover all 3 parts: Google Search presence, Google Business Profile, and AI Visibility. Deliver the 90-day action guide.`,
          JSON.stringify({ client_name, business_name, location, keywords }),
        );
      } catch (err) {
        console.error("[Webhook] seo-audit error:", err);
      }
    });
  });

  // POST /webhooks/social/post — Publish a post to a social platform
  router.post("/social/post", async (req: Request, res: Response) => {
    const { platform, content, image_url, link } = req.body as {
      platform: string;
      content: string;
      image_url?: string;
      link?: string;
    };

    if (!platform || !content) {
      res.status(400).json({ error: "platform and content are required" });
      return;
    }

    try {
      const social = createSocialMediaManagerAgent();
      const result = await social.run(
        `Publish this post to ${platform}. Apply Dustin's voice if needed, then post it.`,
        JSON.stringify({ platform, content, image_url, link }),
      );
      res.json({ success: result.success, output: result.output });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // POST /webhooks/social/draft-week — Draft full week of social content
  router.post("/social/draft-week", async (req: Request, res: Response) => {
    const { hook, hook_score, week_of } = req.body as {
      hook?: string;
      hook_score?: number;
      week_of?: string;
    };

    res.json({ received: true, week_of });

    setImmediate(async () => {
      try {
        const calendar = createContentCalendarAgent();
        await calendar.run(
          `Plan and draft this week's full content calendar. Top hook: "${hook ?? "pull from Notion Module Memory"}" (score: ${hook_score ?? "TBD"}). Week of: ${week_of ?? "this week"}. Draft all posts, assign platforms, and save to Notion.`,
        );
      } catch (err) {
        console.error("[Webhook] social/draft-week error:", err);
      }
    });
  });

  // POST /webhooks/ads/meta-lead — Meta lead form submission → GHL
  // Wire this as the Meta Lead Form webhook URL
  router.post("/ads/meta-lead", async (req: Request, res: Response) => {
    // Acknowledge immediately — Meta expects fast response
    res.json({ received: true });

    setImmediate(async () => {
      try {
        const { full_name, email, phone, ad_name, campaign_name } =
          req.body as {
            full_name: string;
            email: string;
            phone?: string;
            ad_name?: string;
            campaign_name?: string;
          };

        const director = createDirectorAgent();
        await director.run(
          `New Meta Ads lead received. Route to CRM to create contact and trigger lead nurture sequence.`,
          JSON.stringify({ full_name, email, phone, source: "meta-ads", ad_name, campaign_name }),
        );
      } catch (err) {
        console.error("[Webhook] ads/meta-lead error:", err);
      }
    });
  });

  // POST /webhooks/ads/performance — Trigger ad performance review
  router.post("/ads/performance", async (req: Request, res: Response) => {
    const { period = "weekly" } = req.body as { period?: string };
    res.json({ received: true, period });

    setImmediate(async () => {
      try {
        const adPerf = createAdPerformanceAgent();
        await adPerf.run(
          `Run ${period} ad performance review. Pull Meta and Google Ads data, calculate blended CPL, identify winners and losers, write report to Notion, notify Dustin.`,
        );
      } catch (err) {
        console.error("[Webhook] ads/performance error:", err);
      }
    });
  });

  // POST /webhooks/ads/meta-alert — Meta spend/performance alert from Zapier
  router.post("/ads/meta-alert", async (req: Request, res: Response) => {
    const { alert_type, campaign_id, campaign_name, metric, value } =
      req.body as {
        alert_type: string;
        campaign_id: string;
        campaign_name: string;
        metric: string;
        value: number;
      };

    res.json({ received: true });

    setImmediate(async () => {
      try {
        const metaAds = createMetaAdsManagerAgent();
        await metaAds.run(
          `Meta alert received: ${alert_type} on campaign "${campaign_name}". ${metric}: ${value}. Evaluate against benchmarks and take appropriate action (pause/scale/maintain). Log decision.`,
          JSON.stringify({ alert_type, campaign_id, campaign_name, metric, value }),
        );
      } catch (err) {
        console.error("[Webhook] ads/meta-alert error:", err);
      }
    });
  });

  // POST /webhooks/cost/breakdown — On-demand cost analysis for all 24 agents
  router.post("/cost/breakdown", async (req: Request, res: Response) => {
    const { detailed = false } = req.body as { detailed?: boolean };
    res.json({ received: true });

    setImmediate(async () => {
      try {
        const costAgent = createCostBreakdownAgent();
        await costAgent.run(
          `Generate an on-demand AIOS cost breakdown report. Analyze all 24 agents — cost per run, daily cost, and monthly projection. Identify top cost drivers and any agents over the $0.50/run threshold. ${detailed ? "Include specific optimization recommendations with implementation steps for the top 3 cost reduction opportunities." : ""} Write results to Notion KPI Snapshots and notify Dustin with the full summary.`,
        );
      } catch (err) {
        console.error("[Webhook] cost/breakdown error:", err);
      }
    });
  });

  // POST /webhooks/workspace/audit — Run workspace structural audit
  // Scope: "root" | "skills" | "sops" | "full"
  router.post("/workspace/audit", async (req: Request, res: Response) => {
    const { scope = "full", file_path } = req.body as {
      scope?: string;
      file_path?: string;
    };

    res.json({ received: true, scope });

    setImmediate(async () => {
      try {
        const architect = createWorkspaceArchitectAgent();
        await architect.run(
          `Run a workspace audit with scope: ${scope}. ${file_path ? `Focus on file: ${file_path}.` : ""} Identify structural violations, token inefficiencies, modularization opportunities, and routing gaps. Output the full WORKSPACE ARCHITECT report and log decision to Notion.`,
        );
      } catch (err) {
        console.error("[Webhook] workspace/audit error:", err);
      }
    });
  });

  // POST /webhooks/workspace/optimize — Optimize a specific workspace file
  router.post("/workspace/optimize", async (req: Request, res: Response) => {
    const { file_path, task } = req.body as {
      file_path: string;
      task: string;
    };

    if (!file_path || !task) {
      res.status(400).json({ error: "file_path and task are required" });
      return;
    }

    try {
      const architect = createWorkspaceArchitectAgent();
      const result = await architect.run(
        `Workspace optimization task for ${file_path}: ${task}. Read the file, apply the optimization, write back only if changes are needed, and log the decision.`,
      );
      res.json({ success: result.success, output: result.output });
    } catch (err) {
      console.error("[Webhook] workspace/optimize error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  // POST /webhooks/sales/inquiry — New AIOS sales inquiry from website or referral
  router.post("/sales/inquiry", async (req: Request, res: Response) => {
    const { prospect_name, business_name, business_type, monthly_revenue, primary_pain, source } =
      req.body as {
        prospect_name: string;
        business_name: string;
        business_type?: string;
        monthly_revenue?: string;
        primary_pain?: string;
        source?: string;
      };

    if (!prospect_name || !business_name) {
      res.status(400).json({ error: "prospect_name and business_name are required" });
      return;
    }

    // Acknowledge immediately
    res.json({ received: true, prospect_name });

    setImmediate(async () => {
      try {
        const sales = createAiosSalesAgent();
        await sales.run(
          `New AIOS inquiry received from ${prospect_name} at ${business_name}. Qualify this prospect, recommend a tier, draft a personalized response in Dustin's voice, log to CRM pipeline, and notify Dustin.`,
          JSON.stringify({ prospect_name, business_name, business_type, monthly_revenue, primary_pain, source }),
        );
      } catch (err) {
        console.error("[Webhook] sales/inquiry error:", err);
      }
    });
  });

  // POST /webhooks/sales/demo-complete — Post-demo follow-up sequence
  router.post("/sales/demo-complete", async (req: Request, res: Response) => {
    const { prospect_name, demo_outcome, notes } = req.body as {
      prospect_name: string;
      demo_outcome: "positive" | "neutral" | "negative";
      notes?: string;
    };

    if (!prospect_name || !demo_outcome) {
      res.status(400).json({ error: "prospect_name and demo_outcome are required" });
      return;
    }

    res.json({ received: true, prospect_name });

    setImmediate(async () => {
      try {
        const sales = createAiosSalesAgent();
        await sales.run(
          `Demo completed for ${prospect_name}. Outcome: ${demo_outcome}. Draft the Day 1 post-demo follow-up in Dustin's voice, update CRM stage, and queue the follow-up sequence.`,
          notes ? `NOTES FROM DEMO: ${notes}` : undefined,
        );
      } catch (err) {
        console.error("[Webhook] sales/demo-complete error:", err);
      }
    });
  });

  // POST /webhooks/sales/closed-won — New client signed — fire onboarding chain
  router.post("/sales/closed-won", async (req: Request, res: Response) => {
    const { client_name, package_tier, business_type } = req.body as {
      client_name: string;
      package_tier: "starter" | "growth" | "scale";
      business_type?: string;
    };

    if (!client_name || !package_tier) {
      res.status(400).json({ error: "client_name and package_tier are required" });
      return;
    }

    res.json({ received: true, client_name });

    setImmediate(async () => {
      try {
        const director = createDirectorAgent();
        await director.run(
          `New client closed: ${client_name} signed the ${package_tier} package. Route to Sales agent to fire the SAL-04 → DEL-02 onboarding chain, then route to Operations to provision GHL sub-account, and Finance to generate setup fee invoice.`,
          JSON.stringify({ client_name, package_tier, business_type }),
        );
      } catch (err) {
        console.error("[Webhook] sales/closed-won error:", err);
      }
    });
  });

  return router;
}
