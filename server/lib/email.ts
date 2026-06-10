import axios from "axios";

/**
 * Transactional email via Resend (https://resend.com — plain REST, no SDK).
 * Configured with RESEND_API_KEY + EMAIL_FROM; every send is a graceful
 * no-op when unconfigured so email is never load-bearing.
 */

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}

export interface SendEmailResult {
  sent: boolean;
  error?: string;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    console.warn(
      `[email] Not configured (RESEND_API_KEY/EMAIL_FROM) — skipping "${opts.subject}" to ${opts.to}`
    );
    return { sent: false, error: "email not configured" };
  }

  try {
    await axios.post(
      "https://api.resend.com/emails",
      {
        from: process.env.EMAIL_FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15_000,
      }
    );
    console.log(`[email] Sent "${opts.subject}" to ${opts.to}`);
    return { sent: true };
  } catch (err) {
    const msg = axios.isAxiosError(err)
      ? `${err.response?.status ?? ""} ${JSON.stringify(err.response?.data ?? err.message)}`
      : String(err);
    console.error(
      `[email] Failed to send "${opts.subject}" to ${opts.to}:`,
      msg
    );
    return { sent: false, error: msg };
  }
}

// ─── Templates ─────────────────────────────────────────────────────────────────
// Minimal inline-styled HTML — survives every email client, matches the
// portal's dark/cyan brand.

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0a0f;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <p style="color:#00f0ff;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px;">Myers Digital Consulting</p>
    <h1 style="color:#e8e8ec;font-size:22px;margin:0 0 16px;">${title}</h1>
    ${bodyHtml}
    <p style="color:#55556a;font-size:12px;margin-top:40px;border-top:1px solid #1c1c28;padding-top:16px;">
      Myers Digital Consulting · AIOS Client Portal<br/>
      Questions? Just reply to this email.
    </p>
  </div>
</body></html>`;
}

function paragraph(text: string): string {
  return `<p style="color:#a8a8b8;font-size:15px;line-height:1.6;margin:0 0 16px;">${text}</p>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:28px 0;"><a href="${href}" style="background:#00f0ff;color:#0a0a0f;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 28px;border-radius:6px;display:inline-block;">${label}</a></p>`;
}

export function buildInviteEmail(opts: {
  companyName: string;
  contactName: string | null;
  joinUrl: string;
}): { subject: string; html: string } {
  const greeting = opts.contactName ? `Hi ${opts.contactName},` : "Hi,";
  return {
    subject: `Your AIOS portal access for ${opts.companyName}`,
    html: layout(
      "Welcome to your AIOS Client Portal",
      paragraph(greeting) +
        paragraph(
          `Your workspace for <strong style="color:#e8e8ec;">${opts.companyName}</strong> is ready. Use the secure link below to create your account and complete your onboarding intake — it takes about 10 minutes and drives everything we build for you.`
        ) +
        button(opts.joinUrl, "Activate your portal") +
        paragraph(
          `This invite link is single-use and expires in 7 days. If it expires, just ask us for a fresh one.`
        )
    ),
  };
}

export function buildPaymentFailedEmail(opts: {
  companyName: string;
  billingUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Action needed: payment failed for ${opts.companyName}`,
    html: layout(
      "We couldn't process your payment",
      paragraph(
        `The latest payment for <strong style="color:#e8e8ec;">${opts.companyName}</strong>'s AIOS subscription didn't go through. This is usually an expired or declined card.`
      ) +
        paragraph(
          `We'll retry automatically over the next few days, but updating your payment method now keeps your portal and automations uninterrupted.`
        ) +
        button(opts.billingUrl, "Update payment method")
    ),
  };
}

export function buildSopsReadyEmail(opts: {
  companyName: string;
  dashboardUrl: string;
  sopCount: number;
}): { subject: string; html: string } {
  return {
    subject: `Your AIOS playbook is ready — ${opts.sopCount} SOPs generated`,
    html: layout(
      "Your custom SOP library is live",
      paragraph(
        `We've generated <strong style="color:#e8e8ec;">${opts.sopCount} Standard Operating Procedures</strong> tailored to ${opts.companyName} from your intake — covering operations, marketing, sales, finance, and more.`
      ) +
        paragraph(
          `Review them in your portal; we'll refine anything that doesn't fit how you work.`
        ) +
        button(opts.dashboardUrl, "View your SOPs")
    ),
  };
}
