import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class NewsletterWriterAgent extends BaseAgent {
  constructor() {
    super({
      name: "NewsletterWriter",
      skillPath: "custom/newsletter-skill/SKILL.md",
      maxTokens: 12288,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "save_newsletter_draft",
        description:
          "Save a completed newsletter draft to Google Drive and log it in Notion for Callan's review.",
        input_schema: {
          type: "object" as const,
          properties: {
            subject_a: {
              type: "string",
              description: "A/B test subject line A",
            },
            subject_b: {
              type: "string",
              description: "A/B test subject line B",
            },
            body: { type: "string", description: "Full newsletter body" },
            hook_source: {
              type: "string",
              description: "Where the hook came from (transcript date, topic, case study)",
            },
            word_count: { type: "number" },
            send_date: {
              type: "string",
              description: "Planned send date (Thursday)",
            },
          },
          required: ["subject_a", "body"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "newsletter_saved",
        draft_id: `NL-${Date.now()}`,
        ...input,
        status: "Awaiting Callan Review",
      }),
    );
  }
}

export function createNewsletterWriterAgent(): NewsletterWriterAgent {
  return new NewsletterWriterAgent();
}

registerAgent("newsletter-writer", createNewsletterWriterAgent);
