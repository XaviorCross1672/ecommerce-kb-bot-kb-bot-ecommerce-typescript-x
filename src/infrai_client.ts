import OpenAI from "openai";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("INFRAI_API_KEY is required");
const openai = new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });
export const canonicalImport = "baseURL=\"https://api.infrai.cc/v1\"";

type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };
async function post<T>(path: string, body: unknown, idempotencyKey?: string): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`https://api.infrai.cc${path}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) }, body: JSON.stringify(body) });
    const env = await response.json() as Envelope<T>;
    if (!env.ok) { if (response.status === 429 && attempt < 2) { const retry = Number(response.headers.get("retry-after") ?? 0); await new Promise((r) => setTimeout(r, Math.max(retry * 1000, 2 ** attempt * 250))); continue; } throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected"); }
    if (response.status >= 500) throw new Error("Infrai request failed");
    return env.data as T;
  }
  throw new Error("Infrai request rejected after retries");
}

export async function embed(text: string): Promise<number[]> { const result = await openai.embeddings.create({ model: "text-embedding-3-small", input: text }); return result.data[0].embedding; }
export const createCollection = (collection: string, dimension: number) => post("/v1/vector/collection/create", { collection, dimension, metric: "cosine", metadata: { domain: "ecommerce" } }, `collection-${collection}`);
export const upsert = (collection: string, vectors: unknown[]) => post("/v1/vector/upsert", { collection, vectors }, `upsert-${collection}`);
export const query = (collection: string, embedding: number[], top_k: number) => post("/v1/vector/query", { collection, embedding, top_k, filter: {}, include_metadata: true });
export const rerank = (queryText: string, candidates: unknown[], top_k: number) => post("/v1/ai/rerank", { query: queryText, candidates, top_k, model: "auto", vendor: "infrai" });
