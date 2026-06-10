import cron from "node-cron";
import { reportError, notifyOps } from "../lib/alerts.ts";

// Import all agents so the Director registry is populated
import "../agents/index.ts";
import { createDirectorAgent } from "../agents/director.ts";
import { createTranscriptMinerAgent } from "../agents/custom/transcript-miner.ts";
import { createAnalyticsAgent } from "../agents/modules/analytics.ts";
import { createBookkeepingAgent } from "../agents/custom/bookkeeping.ts";
import { createMarketingAgent } from "../agents/modules/marketing.ts";
import { createContentCalendarAgent } from "../agents/custom/content-calendar.ts";
import { createAdPerformanceAgent } from "../agents/custom/ad-performance.ts";
import { createSocialMediaManagerAgent } from "../agents/custom/social-media-manager.ts";
import { createCostBreakdownAgent } from "../agents/custom/cost-breakdown.ts";

async function runSafe(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    console.log(`[Scheduler] Starting: ${name}`);
    await fn();
    console.log(`[Scheduler] Completed: ${name}`);
  } catch (err) {
    reportError("scheduler", err);
    void notifyOps(
      `:warning: *Scheduled job failed* — ${name}\n> ${String(err).slice(0, 200)}`
    );
  }
}

export function startScheduler(): void {
  console.log("[Scheduler] AIOS scheduler starting...");

  // --- DAILY: 7:00 AM — Morning intelligence digest ---
  cron.schedule("0 7 * * *", async () => {
    await runSafe("Daily Digest", async () => {
      const analytics = createAnalyticsAgent();
      await analytics.run(
        "Generate the daily KPI snapshot. Pull current metrics from all available sources, identify any anomalies vs yesterday's baseline, and write the snapshot to Notion KPI Snapshots. Format as the standard daily digest."
      );
    });
  });

  // --- DAILY: 9:00 AM — Transcript Miner (if new recordings available) ---
  cron.schedule("0 9 * * *", async () => {
    await runSafe("Transcript Miner", async () => {
      const miner = createTranscriptMinerAgent();
      await miner.run(
        "Check Notion Module Memory for any unprocessed call transcripts from the last 24 hours. If any exist, mine them for high-scoring hooks (7+/10), stories, and proof points. Save all hooks scoring 7 or above. Output a summary of today's mining results."
      );
    });
  });

  // --- TUESDAY: 10:00 AM — Newsletter draft ---
  cron.schedule("0 10 * * 2", async () => {
    await runSafe("Newsletter Draft", async () => {
      const marketing = createMarketingAgent();
      await marketing.run(
        "It's Tuesday — newsletter draft day. Check Notion Module Memory for the highest-scoring hook mined this week. Use it as the foundation for this week's newsletter. Load the newsletter-writer agent context. Generate a complete draft following the 7-part framework with 2 subject line variants (A/B). Save it for Dustin's Wednesday review."
      );
    });
  });

  // --- MONDAY: 7:00 AM — Weekly cost breakdown report (runs before weekly business report) ---
  cron.schedule("0 7 * * 1", async () => {
    await runSafe("Weekly Cost Report", async () => {
      const costAgent = createCostBreakdownAgent();
      await costAgent.run(
        "Generate the weekly AIOS cost breakdown report. Pull the full cost model for all 22 agents. Calculate total daily and monthly spend, identify the top 5 cost drivers, flag any agent with cost-per-run over $0.50, and check if total daily cost exceeds the $5.00 alert threshold. Write a KPI Snapshot to Notion with the total daily cost metric. Notify Dustin via Slack with the summary and any optimization opportunities."
      );
    });
  });

  // --- MONDAY: 8:00 AM — Weekly business report ---
  cron.schedule("0 8 * * 1", async () => {
    await runSafe("Weekly Report", async () => {
      const director = createDirectorAgent();
      await director.run(
        "Generate the Monday weekly business report. Route to Analytics for KPI summary (MRR, new clients, churn risk), CRM for pipeline status, Marketing for content performance, and Operations for any blocked client onboardings. Synthesize into a single executive summary and notify Dustin via Slack."
      );
    });
  });

  // --- 1st of MONTH: 6:00 AM — Bookkeeping trigger ---
  cron.schedule("0 6 1 * *", async () => {
    await runSafe("Monthly Bookkeeping Trigger", async () => {
      const bookkeeping = createBookkeepingAgent();
      await bookkeeping.run(
        "It's the 1st of the month. Send Dustin a notification that it's time to export last month's bank and credit card transactions for categorization. Log this reminder in Notion Automation Log and fire the OPS-01 Zapier webhook."
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
          "It's the first Monday of the month. Route to Finance module for monthly P&L calculation. Include: total revenue (setup fees + MRR), expenses by category, net profit, MRR growth vs last month, and any overdue invoices. Write results to Notion KPI Snapshots. Notify Dustin via Slack with the summary."
        );
      });
    }
  });

  // --- MONDAY: 8:30 AM — Weekly content calendar planning ---
  cron.schedule("30 8 * * 1", async () => {
    await runSafe("Content Calendar Plan", async () => {
      const calendar = createContentCalendarAgent();
      await calendar.run(
        "It's Monday — plan this week's content calendar. Check Notion Module Memory for hooks scored 7+ from last week's calls. Assign the top hook to newsletter + Meta ad + LinkedIn. Fill all 5 LinkedIn post slots, 7 Instagram slots, and 3 Facebook slots. Save the plan to Notion Content Calendar. Route the newsletter brief to the newsletter-writer agent and Meta ad brief to the scroll-stopper-ad agent."
      );
    });
  });

  // --- TUESDAY: 9:00 AM — Social posts drafted and queued ---
  cron.schedule("0 9 * * 2", async () => {
    await runSafe("Social Posts Draft", async () => {
      const social = createSocialMediaManagerAgent();
      await social.run(
        "Draft this week's social posts based on the Content Calendar plan in Notion. Write all 5 LinkedIn posts, 3 Facebook posts, and captions for 5 Instagram posts. Apply Dustin's voice. Save all as 'Awaiting Review' in Notion Content Calendar."
      );
    });
  });

  // --- FRIDAY: 4:00 PM — Weekly ad performance review ---
  cron.schedule("0 16 * * 5", async () => {
    await runSafe("Ad Performance Review", async () => {
      const adPerf = createAdPerformanceAgent();
      await adPerf.run(
        "Pull this week's ad performance from Meta Ads and Google Ads. Calculate spend, leads, and blended CPL for each platform. Identify the best-performing creative and any campaigns over CPL threshold. Generate the weekly ad report, write it to Notion KPI Snapshots, and notify Dustin with the summary and top 3 recommended actions for next week."
      );
    });
  });

  // --- THURSDAY: 8:00 AM — Publish scheduled social content ---
  cron.schedule("0 8 * * 4", async () => {
    await runSafe("Publish Social Content", async () => {
      const social = createSocialMediaManagerAgent();
      await social.run(
        "Check Notion Content Calendar for posts with status 'Approved' scheduled for today. Publish each approved post to its assigned platform. Log published status and post IDs back to Notion."
      );
    });
  });

  console.log("[Scheduler] Schedules registered:");
  console.log("  • Monday 7 AM     — Cost breakdown report");
  console.log("  • 7:00 AM daily   — Analytics digest");
  console.log("  • 9:00 AM daily   — Transcript miner");
  console.log("  • Tuesday 10 AM   — Newsletter draft");
  console.log("  • Monday 8 AM     — Weekly business report");
  console.log("  • Monday 8:30 AM  — Content calendar planning");
  console.log("  • Tuesday 9 AM    — Social posts drafted");
  console.log("  • Thursday 8 AM   — Approved posts published");
  console.log("  • Friday 4 PM     — Ad performance review");
  console.log("  • 1st of month    — Bookkeeping reminder");
  console.log("  • 1st Monday      — Monthly finance report");
}
