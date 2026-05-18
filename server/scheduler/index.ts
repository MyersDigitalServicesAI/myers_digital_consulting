import cron from "node-cron";

// Import all agents so the Director registry is populated
import "../agents/index.ts";
import { createDirectorAgent } from "../agents/director.ts";
import { createTranscriptMinerAgent } from "../agents/custom/transcript-miner.ts";
import { createAnalyticsAgent } from "../agents/modules/analytics.ts";
import { createBookkeepingAgent } from "../agents/custom/bookkeeping.ts";
import { createMarketingAgent } from "../agents/modules/marketing.ts";

async function runSafe(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    console.log(`[Scheduler] Starting: ${name}`);
    await fn();
    console.log(`[Scheduler] Completed: ${name}`);
  } catch (err) {
    console.error(`[Scheduler] Failed: ${name}`, err);
  }
}

export function startScheduler(): void {
  console.log("[Scheduler] AIOS scheduler starting...");

  // --- DAILY: 7:00 AM — Morning intelligence digest ---
  cron.schedule("0 7 * * *", async () => {
    await runSafe("Daily Digest", async () => {
      const analytics = createAnalyticsAgent();
      await analytics.run(
        "Generate the daily KPI snapshot. Pull current metrics from all available sources, identify any anomalies vs yesterday's baseline, and write the snapshot to Notion KPI Snapshots. Format as the standard daily digest.",
      );
    });
  });

  // --- DAILY: 9:00 AM — Transcript Miner (if new recordings available) ---
  cron.schedule("0 9 * * *", async () => {
    await runSafe("Transcript Miner", async () => {
      const miner = createTranscriptMinerAgent();
      await miner.run(
        "Check Notion Module Memory for any unprocessed call transcripts from the last 24 hours. If any exist, mine them for high-scoring hooks (7+/10), stories, and proof points. Save all hooks scoring 7 or above. Output a summary of today's mining results.",
      );
    });
  });

  // --- TUESDAY: 10:00 AM — Newsletter draft ---
  cron.schedule("0 10 * * 2", async () => {
    await runSafe("Newsletter Draft", async () => {
      const marketing = createMarketingAgent();
      await marketing.run(
        "It's Tuesday — newsletter draft day. Check Notion Module Memory for the highest-scoring hook mined this week. Use it as the foundation for this week's newsletter. Load the newsletter-writer agent context. Generate a complete draft following the 7-part framework with 2 subject line variants (A/B). Save it for Callan's Wednesday review.",
      );
    });
  });

  // --- MONDAY: 8:00 AM — Weekly business report ---
  cron.schedule("0 8 * * 1", async () => {
    await runSafe("Weekly Report", async () => {
      const director = createDirectorAgent();
      await director.run(
        "Generate the Monday weekly business report. Route to Analytics for KPI summary (MRR, new clients, churn risk), CRM for pipeline status, Marketing for content performance, and Operations for any blocked client onboardings. Synthesize into a single executive summary and notify Callan via Slack.",
      );
    });
  });

  // --- 1st of MONTH: 6:00 AM — Bookkeeping trigger ---
  cron.schedule("0 6 1 * *", async () => {
    await runSafe("Monthly Bookkeeping Trigger", async () => {
      const bookkeeping = createBookkeepingAgent();
      await bookkeeping.run(
        "It's the 1st of the month. Send Callan a notification that it's time to export last month's bank and credit card transactions for categorization. Log this reminder in Notion Automation Log and fire the OPS-01 Zapier webhook.",
      );
    });
  });

  // --- MONDAY: 9:00 AM — Monthly finance report (1st Monday of month) ---
  // Note: node-cron doesn't support "first Monday of month" natively,
  // so we check the date inside the job
  cron.schedule("0 9 * * 1", async () => {
    const today = new Date();
    if (today.getDate() <= 7) {
      await runSafe("Monthly Finance Report", async () => {
        const director = createDirectorAgent();
        await director.run(
          "It's the first Monday of the month. Route to Finance module for monthly P&L calculation. Include: total revenue (setup fees + MRR), expenses by category, net profit, MRR growth vs last month, and any overdue invoices. Write results to Notion KPI Snapshots. Notify Callan via Slack with the summary.",
        );
      });
    }
  });

  console.log("[Scheduler] Schedules registered:");
  console.log("  • 7:00 AM daily   — Analytics digest");
  console.log("  • 9:00 AM daily   — Transcript miner");
  console.log("  • Tuesday 10 AM   — Newsletter draft");
  console.log("  • Monday 8 AM     — Weekly business report");
  console.log("  • 1st of month    — Bookkeeping reminder");
  console.log("  • 1st Monday      — Monthly finance report");
}
