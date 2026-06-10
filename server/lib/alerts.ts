import * as Sentry from "@sentry/node";
import axios from "axios";

/**
 * Error tracking + ops notifications.
 * - Sentry: enabled when SENTRY_DSN is set; otherwise capture is a no-op.
 * - Slack pings: SLACK_BOT_TOKEN/SLACK_NOTIFY_CHANNEL, falling back to the
 *   ZAPIER_WEBHOOK_NOTIFY_SLACK webhook. No-op when neither is configured.
 */

let sentryEnabled = false;

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn("[alerts] SENTRY_DSN not set — error tracking disabled");
    return;
  }
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    // API-only server — error capture matters here, not perf tracing
    tracesSampleRate: 0,
  });
  sentryEnabled = true;
  console.log("[alerts] Sentry error tracking enabled");
}

/** Attach Sentry's Express error handler (after routes). No-op without DSN. */
export function setupSentryErrorHandler(app: unknown): void {
  if (!sentryEnabled) return;
  Sentry.setupExpressErrorHandler(
    app as Parameters<typeof Sentry.setupExpressErrorHandler>[0]
  );
}

/** Log + capture an exception with a scope tag. Never throws. */
export function reportError(scope: string, err: unknown): void {
  console.error(`[${scope}]`, err);
  if (!sentryEnabled) return;
  try {
    Sentry.captureException(err, { tags: { scope } });
  } catch {
    // never let telemetry break the caller
  }
}

/** Post a message to the ops Slack channel. Fire-safe; reports send failures. */
export async function notifyOps(text: string): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_NOTIFY_CHANNEL;
  try {
    if (token && channel) {
      const res = await axios.post(
        "https://slack.com/api/chat.postMessage",
        { channel, text, unfurl_links: false },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10_000,
        }
      );
      if (!res.data?.ok)
        throw new Error(String(res.data?.error ?? "slack error"));
      return;
    }
    const zapierUrl = process.env.ZAPIER_WEBHOOK_NOTIFY_SLACK;
    if (zapierUrl) {
      await axios.post(zapierUrl, { message: text }, { timeout: 10_000 });
      return;
    }
    // Neither configured — the console is the notification channel
    console.warn(`[alerts] (no Slack configured) ${text}`);
  } catch (err) {
    console.error("[alerts] failed to send ops notification:", err);
  }
}

// ─── Agent-failure alerting with a cooldown ────────────────────────────────────
// A tripped daily budget fails every run; without a cooldown that's one
// Slack ping per webhook call.

const COOLDOWN_MS = 15 * 60 * 1000;
const lastAlertAt = new Map<string, number>();

/** Pure cooldown check (exported for tests). Mutates `seen` when allowing. */
export function shouldAlert(
  key: string,
  nowMs: number,
  seen: Map<string, number>,
  cooldownMs = COOLDOWN_MS
): boolean {
  const last = seen.get(key);
  if (last !== undefined && nowMs - last < cooldownMs) return false;
  seen.set(key, nowMs);
  return true;
}

/**
 * Ping ops about a failed agent run (deduped per agent+error for 15 min)
 * and capture it in Sentry. Fire-and-forget.
 */
export function alertAgentFailure(
  agent: string,
  task: string,
  error: string
): void {
  if (sentryEnabled) {
    try {
      Sentry.captureMessage(`Agent run failed: ${agent} — ${error}`, {
        level: "error",
        tags: { scope: "agent-run", agent },
        extra: { task: task.slice(0, 500) },
      });
    } catch {
      // ignore
    }
  }

  const key = `${agent}:${error.slice(0, 60)}`;
  if (!shouldAlert(key, Date.now(), lastAlertAt)) return;

  void notifyOps(
    `:rotating_light: *Agent run failed* — ${agent}\n> ${error}\nTask: ${task.slice(0, 140)}`
  );
}
