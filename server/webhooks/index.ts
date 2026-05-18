import { Router, type Request, type Response } from "express";

// Import all agents so registry is populated
import "../agents/index.ts";
import { createDirectorAgent } from "../agents/director.ts";
import { createCrmAgent } from "../agents/modules/crm.ts";
import { createSalesCallCoachAgent } from "../agents/custom/sales-call-coach.ts";
import { createTranscriptMinerAgent } from "../agents/custom/transcript-miner.ts";
import { createMeetingTranscriptAgent } from "../agents/custom/meeting-transcript.ts";
import { createGeoSeoAuditorAgent } from "../agents/custom/geo-seo-auditor.ts";

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

  return router;
}
