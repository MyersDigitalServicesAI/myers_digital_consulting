import { BaseAgent } from "../framework/base-agent.ts";
import { registerStandardTools } from "../framework/tools/standard.ts";
import { registerAgent } from "../director.ts";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

export class WorkspaceArchitectAgent extends BaseAgent {
  constructor() {
    super({
      name: "WorkspaceArchitect",
      skillPath: "custom/workspace-architect/SKILL.md",
      maxTokens: 16384,
    });
    registerStandardTools(this);

    this.registerTool(
      {
        name: "read_file",
        description:
          "Read the contents of a workspace file (CLAUDE.md, MEMORY.md, SKILL.md, or any aios/ document) for structural analysis.",
        input_schema: {
          type: "object" as const,
          properties: {
            path: {
              type: "string",
              description:
                "Relative path from project root (e.g. 'aios/CLAUDE.md', 'aios-template/MEMORY.md')",
            },
          },
          required: ["path"],
        },
      },
      async (input) => {
        const { path } = input as { path: string };
        const fullPath = resolve(process.cwd(), path);
        if (!existsSync(fullPath)) {
          return { error: `File not found: ${path}` };
        }
        const content = readFileSync(fullPath, "utf-8");
        const lines = content.split("\n").length;
        return { path, lines, content };
      },
    );

    this.registerTool(
      {
        name: "write_file",
        description:
          "Write updated content to a workspace file after structural optimization. Always flag changes to Dustin before writing.",
        input_schema: {
          type: "object" as const,
          properties: {
            path: {
              type: "string",
              description: "Relative path from project root",
            },
            content: {
              type: "string",
              description: "Full new content for the file",
            },
            reason: {
              type: "string",
              description: "Why this change is being made",
            },
          },
          required: ["path", "content", "reason"],
        },
      },
      async (input) => {
        const { path, content, reason } = input as {
          path: string;
          content: string;
          reason: string;
        };
        const fullPath = resolve(process.cwd(), path);
        writeFileSync(fullPath, content, "utf-8");
        const lines = content.split("\n").length;
        return {
          simulated: false,
          action: "file_written",
          path,
          lines,
          reason,
        };
      },
    );

    this.registerTool(
      {
        name: "audit_workspace",
        description:
          "Run a structural audit of the AIOS workspace — count files, check line counts, detect oversized files, and identify missing directories.",
        input_schema: {
          type: "object" as const,
          properties: {
            scope: {
              type: "string",
              enum: ["root", "skills", "sops", "full"],
              description: "Which part of the workspace to audit",
            },
          },
          required: ["scope"],
        },
      },
      async (input) => {
        const { scope } = input as { scope: string };
        const targets: Record<string, string[]> = {
          root: ["aios/CLAUDE.md", "aios-template/CLAUDE.md", "aios-template/MEMORY.md"],
          skills: ["aios/skills/director/SKILL.md"],
          sops: ["aios/sops/00-master-aios-overview.md"],
          full: [
            "aios/CLAUDE.md",
            "aios-template/CLAUDE.md",
            "aios-template/MEMORY.md",
            "aios/skills/director/SKILL.md",
          ],
        };
        const files = targets[scope] ?? targets.root;
        const results = files.map((f) => {
          const fullPath = resolve(process.cwd(), f);
          if (!existsSync(fullPath)) return { file: f, status: "missing" };
          const lines = readFileSync(fullPath, "utf-8").split("\n").length;
          return { file: f, lines, status: lines > 350 ? "over_limit" : "ok" };
        });
        return { scope, files_checked: results.length, results };
      },
    );

    this.registerTool(
      {
        name: "archive_content",
        description:
          "Move completed project memory entries or outdated content to an ARCHIVE section or file to reduce active token load.",
        input_schema: {
          type: "object" as const,
          properties: {
            source_file: { type: "string", description: "File to archive from" },
            content_summary: {
              type: "string",
              description: "Brief description of what is being archived",
            },
            archive_reason: { type: "string" },
          },
          required: ["source_file", "content_summary"],
        },
      },
      async (input) => ({
        simulated: true,
        action: "content_archived",
        archive_id: `ARCH-${Date.now()}`,
        ...input,
      }),
    );
  }
}

export function createWorkspaceArchitectAgent(): WorkspaceArchitectAgent {
  return new WorkspaceArchitectAgent();
}

registerAgent("workspace-architect", createWorkspaceArchitectAgent);
