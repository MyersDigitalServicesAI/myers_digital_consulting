import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerSocialTools } from "../framework/tools/social-apis.ts";
import { registerAgent } from "../director.ts";

export class ContentCalendarAgent extends BaseAgent {
  constructor() {
    super({
      name: "ContentCalendar",
      skillPath: "custom/content-calendar/SKILL.md",
      maxTokens: 12288,
    });
    registerStandardTools(this);
    registerSocialTools(this);

    // Weekly plan tool
    this.registerTool(
      {
        name: "create_weekly_content_plan",
        description:
          "Build and save the weekly content calendar to Notion. Assigns hooks to posts, sets publish times, and queues tasks for specialist agents.",
        input_schema: {
          type: "object" as const,
          properties: {
            week_of: { type: "string", description: "ISO date of Monday" },
            top_hook: {
              type: "string",
              description: "The highest-scored hook from TranscriptMiner this week",
            },
            hook_score: { type: "number" },
            slots: {
              type: "array",
              items: {
                type: "object",
                description:
                  "{ day, platform, content_type, hook_assignment, publish_time }",
              },
            },
            newsletter_topic: { type: "string" },
            meta_ad_brief: {
              type: "string",
              description: "Hook and angle for this week's Meta ad variants",
            },
          },
          required: ["week_of", "top_hook", "slots"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "weekly_plan_created",
        plan_id: `CP-${Date.now()}`,
        week_of: input.week_of,
        total_slots: (input.slots as unknown[]).length,
        status: "Awaiting Dustin Review",
      }),
    );

    // Repurpose tool
    this.registerTool(
      {
        name: "repurpose_content",
        description:
          "Take one piece of content (newsletter, blog post, or case study) and break it into platform-specific derivative posts for LinkedIn, Instagram, and Facebook.",
        input_schema: {
          type: "object" as const,
          properties: {
            source_type: {
              type: "string",
              enum: ["newsletter", "case-study", "blog-post", "hook"],
            },
            source_content: { type: "string" },
            target_platforms: {
              type: "array",
              items: {
                type: "string",
                enum: ["linkedin", "instagram", "facebook", "twitter"],
              },
            },
          },
          required: ["source_type", "source_content", "target_platforms"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "content_repurposed",
        repurpose_id: `RPP-${Date.now()}`,
        source_type: input.source_type,
        platforms: input.target_platforms,
        posts_created: (input.target_platforms as string[]).length,
        status: "Drafted — routed to SocialMediaManager for review",
      }),
    );
  }
}

export function createContentCalendarAgent(): ContentCalendarAgent {
  return new ContentCalendarAgent();
}

registerAgent("content-calendar", createContentCalendarAgent);
