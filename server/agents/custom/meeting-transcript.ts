import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";

export class MeetingTranscriptAgent extends BaseAgent {
  constructor() {
    super({
      name: "MeetingTranscript",
      skillPath: "custom/meeting-transcript-task-creator/SKILL.md",
      maxTokens: 12288,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "create_tasks_from_meeting",
        description:
          "Create tasks in Notion and calendar events from meeting action items. Triggers OPS-02 team notify Zap.",
        input_schema: {
          type: "object" as const,
          properties: {
            meeting_title: { type: "string" },
            meeting_date: { type: "string" },
            participants: {
              type: "array",
              items: { type: "string" },
            },
            action_items: {
              type: "array",
              items: {
                type: "object",
                description:
                  "{ owner, task, due_date, priority: 'low'|'medium'|'high' }",
              },
            },
            decisions: {
              type: "array",
              items: { type: "string" },
            },
            next_meeting: {
              type: "string",
              description: "ISO datetime for next meeting if scheduled",
            },
          },
          required: ["meeting_title", "action_items"],
        },
      },
      async (input) => {
        const items = input.action_items as unknown[];
        return {
          simulated: true,
          action: "tasks_created",
          meeting: input.meeting_title,
          tasks_created: items.length,
          task_ids: items.map((_, i) => `TASK-${Date.now()}-${i}`),
          calendar_events_created: input.next_meeting ? 1 : 0,
        };
      },
    );
  }
}

export function createMeetingTranscriptAgent(): MeetingTranscriptAgent {
  return new MeetingTranscriptAgent();
}

registerAgent("meeting-transcript", createMeetingTranscriptAgent);
