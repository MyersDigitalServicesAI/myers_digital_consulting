// Lightweight Slack notification for billing/system events.
// Deliberately does not import the agents framework — safe to use from
// webhook handlers and routes without pulling in the full agent stack.
// Uses the same env vars as the agents' notify_dustin tool.

export async function notifySlack(message: string): Promise<boolean> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_NOTIFY_CHANNEL;
  if (!token || !channel) return false;

  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel, text: message }),
    });
    const body = (await res.json()) as { ok?: boolean; error?: string };
    if (!body.ok) {
      console.warn("[notify] Slack API error:", body.error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[notify] Slack request failed:", err);
    return false;
  }
}
