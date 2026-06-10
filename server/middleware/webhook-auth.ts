import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time secret comparison. timingSafeEqual throws on length
 * mismatch, so compare digests of equal length instead of raw strings.
 */
export function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type WebhookAuthDecision =
  | { allow: true; warning?: string }
  | { allow: false; status: 401 | 503; error: string };

/**
 * Pure decision logic for webhook authentication.
 *
 * - Secret configured: callers must present it (header or query param).
 * - Secret missing in production: fail closed — these endpoints run
 *   Anthropic-billed agents and must never be open to the internet.
 * - Secret missing outside production: allow, for local development.
 */
export function evaluateWebhookAuth(
  provided: string | undefined,
  secret: string | undefined,
  nodeEnv: string | undefined
): WebhookAuthDecision {
  if (!secret) {
    if (nodeEnv === "production") {
      return {
        allow: false,
        status: 503,
        error: "Webhook auth not configured — set AIOS_WEBHOOK_SECRET",
      };
    }
    return {
      allow: true,
      warning:
        "[webhook-auth] AIOS_WEBHOOK_SECRET not set — webhooks are UNAUTHENTICATED (allowed outside production only)",
    };
  }

  if (!provided || !secretsMatch(provided, secret)) {
    return { allow: false, status: 401, error: "Invalid webhook secret" };
  }
  return { allow: true };
}

let warnedOnce = false;

/**
 * Auth gate for the agent-dispatching webhooks (/webhooks/*).
 * Callers authenticate with the `x-aios-secret` header, or `?secret=` for
 * services that can't set custom headers. The Stripe webhook is NOT behind
 * this — it has its own signature verification.
 */
export function webhookAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const headerSecret = req.headers["x-aios-secret"];
  const provided =
    (typeof headerSecret === "string" ? headerSecret : undefined) ??
    (typeof req.query.secret === "string" ? req.query.secret : undefined);

  const decision = evaluateWebhookAuth(
    provided,
    process.env.AIOS_WEBHOOK_SECRET,
    process.env.NODE_ENV
  );

  if (!decision.allow) {
    res.status(decision.status).json({ error: decision.error });
    return;
  }
  if (decision.warning && !warnedOnce) {
    console.warn(decision.warning);
    warnedOnce = true;
  }
  next();
}
