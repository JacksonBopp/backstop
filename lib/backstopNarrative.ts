import type { CycleSummary, ConcentrationResult } from "@/data/backstopScoring";

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
}

/**
 * Generates a short analyst note over already-aggregated, already
 * suppression-guarded cycle stats, never raw ticket content. Returns null
 * on any failure (missing key, timeout, API error) so callers always have
 * the static template guidance to fall back to.
 */
export async function generateCycleNarrative(
  cycle: CycleSummary,
  concentration: ConcentrationResult
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const groupLines = cycle.groups
    .filter((g) => !g.suppressed)
    .map((g) => `- ${g.label}: ${g.ticketCount} tickets, ${Math.round((g.rate ?? 0) * 100)}% AI-assisted`)
    .join("\n");

  const trendLines = concentration.groups
    .filter((g) => g.direction !== "insufficientData")
    .map(
      (g) =>
        `- ${g.label}: ${Math.round((g.earliestRate ?? 0) * 100)}% -> ${Math.round((g.latestRate ?? 0) * 100)}% (${g.direction})`
    )
    .join("\n");

  const prompt = `Cycle ${cycle.cycle}: ${cycle.ticketCount} tickets synced, ${cycle.aiAssistedCount} flagged AI-assisted.

Per-group AI-assisted rate this cycle:
${groupLines || "(all groups suppressed, too few tickets)"}

Trend across ${concentration.cyclesObserved} cycles observed (earliest rate -> latest rate):
${trendLines || "(no groups with enough data across cycles)"}

Verdict: ${concentration.verdict}
Rising groups: ${concentration.risingGroups.join(", ") || "none"}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 220,
        system:
          "You write a short analyst note (2-4 sentences, plain prose, no bullet points, no em dashes, no hedging filler) for an internal support-ops dashboard. You're given aggregate AI-verification-load stats for one Zendesk account, already privacy-suppressed for small groups. Say what's actually notable: what changed, which group is worth a look, whether it's worth a conversation. Don't just restate every number, the reader can already see the table above this. Don't invent causes you can't see in the data, suggest what to check instead.",
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data: AnthropicResponse = await res.json();
    const text = data.content?.find((b) => b.type === "text")?.text?.trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
