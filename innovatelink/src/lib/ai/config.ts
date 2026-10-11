export const aiConfig = () => ({
  provider: (process.env.LLM_PROVIDER ?? "mock") as "mock" | "openai" | "anthropic",
  model: process.env.LLM_MODEL || "mock-llm",
  apiKey: process.env.LLM_API_KEY ?? "",
  baseUrl: process.env.LLM_BASE_URL ?? "",
  embeddingProvider: (process.env.EMBEDDING_PROVIDER ?? "mock") as "mock" | "openai",
  embeddingModel: process.env.EMBEDDING_MODEL || "mock-embed",
  embeddingApiKey: process.env.EMBEDDING_API_KEY || process.env.LLM_API_KEY || "",
  embeddingBaseUrl: process.env.EMBEDDING_BASE_URL ?? "",
  dim: Number(process.env.EMBEDDING_DIM ?? 256),
  allowConfidential: process.env.AI_ALLOW_CONFIDENTIAL === "true",
  dailyLimit: Number(process.env.AI_DAILY_LIMIT_PER_USER ?? 30),
});
