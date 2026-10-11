import { createHash } from "node:crypto";
import { conceptsOf, tokens } from "../text";

function bucket(s: string, dim: number): number {
  return createHash("md5").update(s).digest().readUInt32BE(0) % dim;
}

/**
 * Deterministic offline embedder: hashed stems (weight 1) + concept features
 * (weight 3), L2-normalised. Concepts occupy reserved buckets so synonyms align.
 */
export function mockEmbed(texts: string[], dim: number): number[][] {
  return texts.map((t) => {
    const v = new Array<number>(dim).fill(0);
    for (const tok of tokens(t)) v[bucket(`t:${tok}`, dim)]! += 1;
    for (const c of conceptsOf(t)) v[bucket(`c:${c}`, dim)]! += 3;
    const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    return v.map((x) => x / n);
  });
}
