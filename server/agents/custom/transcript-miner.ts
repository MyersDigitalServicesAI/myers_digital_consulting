import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class TranscriptMinerAgent extends BaseAgent {
  constructor() {
    super({
      name: "TranscriptMiner",
      skillPath: "custom/transcript-miner-ad-builder/SKILL.md",
      maxTokens: 12288,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "save_hook",
        description:
          "Save a high-scoring content hook to Notion Module Memory for use in future newsletters, ads, and LinkedIn posts.",
        input_schema: {
          type: "object" as const,
          properties: {
            hook: { type: "string", description: "The hook text" },
            hook_type: {
              type: "string",
              enum: ["story", "pain-point", "result", "contrarian", "question"],
            },
            score: {
              type: "number",
              description: "Hook score 1-10",
            },
            source_transcript: {
              type: "string",
              description: "Name or date of the source call",
            },
            output_formats: {
              type: "array",
              items: {
                type: "string",
                enum: ["newsletter", "linkedin", "meta-ad", "google-ad"],
              },
              description: "Which content formats this hook works for",
            },
          },
          required: ["hook", "hook_type", "score"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "hook_saved",
        hook_id: `HOOK-${Date.now()}`,
        ...input,
      }),
    );
  }
}

export function createTranscriptMinerAgent(): TranscriptMinerAgent {
  return new TranscriptMinerAgent();
}

registerAgent("transcript-miner", createTranscriptMinerAgent);
