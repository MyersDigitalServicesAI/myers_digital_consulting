// Smoke test for the Resend integration. Uses the same sendEmail helper and
// branded template as production (invites, dunning, SOPs-ready), so a pass
// here means those flows can deliver too.
//
//   RESEND_API_KEY=re_... EMAIL_FROM="Myers Digital <hello@myersdigitalconsulting.com>" \
//     npx tsx scripts/send-test-email.ts you@example.com
//
// Or put the two vars in .env and run: npx tsx --env-file=.env scripts/send-test-email.ts you@example.com

import { sendEmail, isEmailConfigured } from "../server/lib/email.ts";

const to = process.argv[2];
if (!to) {
  console.error("Usage: npx tsx scripts/send-test-email.ts <recipient@example.com>");
  process.exit(1);
}
if (!isEmailConfigured()) {
  console.error(
    "RESEND_API_KEY and EMAIL_FROM must be set (see .env.example). Never hardcode the key."
  );
  process.exit(1);
}

const result = await sendEmail({
  to,
  subject: "AIOS email test — Resend is wired up",
  html: "<p>Congrats — your <strong>Resend integration</strong> works. Invites, dunning, and SOPs-ready emails will deliver.</p>",
});

if (!result.sent) {
  console.error(`Send failed: ${result.error}`);
  process.exit(1);
}
console.log(`Test email sent to ${to}.`);
