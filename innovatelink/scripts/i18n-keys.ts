/**
 * Extracts statically-known translation keys from the source tree:
 * `const t = useTranslations("ns")` / `getTranslations("ns")` → `t("key")`.
 * Used by tests/unit/i18n.test.ts to guarantee ar.json and en.json cover every key.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?)$/.test(f) && !f.endsWith(".test.ts")) out.push(p);
  }
  return out;
}

export function extractKeys(root = "src"): Map<string, Set<string>> {
  const found = new Map<string, Set<string>>();
  const add = (k: string, file: string) => (found.get(k) ?? found.set(k, new Set()).get(k)!).add(file);
  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8");
    const vars = new Map<string, string>();
    const decl = /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations|serverT)\(\s*(?:\{[^}]*namespace:\s*)?(?:"(?:ar|en)",\s*)?"([^"]+)"/g;
    for (const m of src.matchAll(decl)) vars.set(m[1]!, m[2]!);
    for (const [v, ns] of vars) {
      const call = new RegExp(`\\b${v}(?:\\.has)?\\(\\s*"([^"]+)"`, "g");
      for (const m of src.matchAll(call)) if (!src.slice(m.index! - 4, m.index!).includes(".has")) add(`${ns}.${m[1]}`, file);
    }
  }
  return found;
}

export function flatten(obj: Record<string, unknown>, prefix = ""): Set<string> {
  const out = new Set<string>();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") for (const x of flatten(v as Record<string, unknown>, key)) out.add(x);
    else out.add(key);
  }
  return out;
}

if (process.argv[1]?.endsWith("i18n-keys.ts")) {
  const keys = extractKeys();
  const ar = flatten(JSON.parse(readFileSync("messages/ar.json", "utf8")));
  const missing = [...keys.keys()].filter((k) => !ar.has(k)).sort();
  console.log(missing.join("\n"));
  console.error(`${missing.length} missing of ${keys.size}`);
}
