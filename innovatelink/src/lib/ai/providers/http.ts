/**
 * Real provider adapters. Provider names must not appear outside src/lib/ai (PRD §4).
 * Both send "no data retention / no training" hints where the provider supports them (PRD §7.4).
 */
export interface ChatResult { text: string; tokens_in: number; tokens_out: number }

export async function openaiChat(o: { baseUrl: string; apiKey: string; model: string; system: string; user: string }): Promise<ChatResult> {
  const res = await fetch(`${o.baseUrl || "https://api.openai.com/v1"}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${o.apiKey}` },
    body: JSON.stringify({
      model: o.model,
      response_format: { type: "json_object" },
      store: false,
      temperature: 0.2,
      messages: [{ role: "system", content: o.system }, { role: "user", content: o.user }],
    }),
  });
  if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = (await res.json()) as { choices: { message: { content: string } }[]; usage?: { prompt_tokens: number; completion_tokens: number } };
  return { text: j.choices[0]?.message.content ?? "", tokens_in: j.usage?.prompt_tokens ?? 0, tokens_out: j.usage?.completion_tokens ?? 0 };
}

export async function anthropicChat(o: { baseUrl: string; apiKey: string; model: string; system: string; user: string }): Promise<ChatResult> {
  const res = await fetch(`${o.baseUrl || "https://api.anthropic.com"}/v1/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": o.apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: o.model,
      max_tokens: 4096,
      temperature: 0.2,
      system: o.system + "\nRespond with a single JSON object only.",
      messages: [{ role: "user", content: o.user }],
    }),
  });
  if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = (await res.json()) as { content: { type: string; text?: string }[]; usage?: { input_tokens: number; output_tokens: number } };
  const text = j.content.filter((c) => c.type === "text").map((c) => c.text).join("");
  return { text, tokens_in: j.usage?.input_tokens ?? 0, tokens_out: j.usage?.output_tokens ?? 0 };
}

export async function openaiEmbed(o: { baseUrl: string; apiKey: string; model: string; dim: number; texts: string[] }): Promise<number[][]> {
  const res = await fetch(`${o.baseUrl || "https://api.openai.com/v1"}/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${o.apiKey}` },
    body: JSON.stringify({ model: o.model, input: o.texts, dimensions: o.dim }),
  });
  if (!res.ok) throw new Error(`Embedding HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  return j.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

/** Extracts the first JSON object from model text (tolerates code fences). */
export function extractJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("no_json");
  return JSON.parse(t.slice(start, end + 1));
}
