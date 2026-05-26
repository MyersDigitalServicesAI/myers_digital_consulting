// Import all agents to ensure they register themselves with the Director registry.
// Order matters for circular-dep safety: modules and custom agents must load after director.
export { DirectorAgent, createDirectorAgent } from "./director.ts";

// Module agents
export { createCrmAgent } from "./modules/crm.ts";
export { createFinanceAgent } from "./modules/finance.ts";
export { createMarketingAgent } from "./modules/marketing.ts";
export { createOperationsAgent } from "./modules/operations.ts";
export { createAnalyticsAgent } from "./modules/analytics.ts";
export { createHrAgent } from "./modules/hr.ts";
export { createLegalAgent } from "./modules/legal.ts";
export { createSecurityAgent } from "./modules/security.ts";

// Custom skill agents
export { createTranscriptMinerAgent } from "./custom/transcript-miner.ts";
export { createSalesCallCoachAgent } from "./custom/sales-call-coach.ts";
export { createNewsletterWriterAgent } from "./custom/newsletter-writer.ts";
export { createScrollStopperAdAgent } from "./custom/scroll-stopper-ad.ts";
export { createBookkeepingAgent } from "./custom/bookkeeping.ts";
export { createGeoSeoAuditorAgent } from "./custom/geo-seo-auditor.ts";
export { createMeetingTranscriptAgent } from "./custom/meeting-transcript.ts";

// Social & media agents
export { createSocialMediaManagerAgent } from "./custom/social-media-manager.ts";
export { createMetaAdsManagerAgent } from "./custom/meta-ads-manager.ts";
export { createGoogleAdsManagerAgent } from "./custom/google-ads-manager.ts";
export { createContentCalendarAgent } from "./custom/content-calendar.ts";
export { createAdPerformanceAgent } from "./custom/ad-performance.ts";
export { createCostBreakdownAgent } from "./custom/cost-breakdown.ts";

// Workspace & sales agents
export { createWorkspaceArchitectAgent } from "./custom/workspace-architect.ts";
export { createAiosSalesAgent } from "./custom/aios-sales.ts";
