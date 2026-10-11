/** Arabic-aware normalisation used by the mock embedder and keyword features. */
export function normalizeArabic(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "") // diacritics + tatweel
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}\s]/gu, " ");
}

const PREFIXES = ["وال", "بال", "كال", "فال", "لل", "ال", "و"];
const SUFFIXES = ["ات", "ون", "ين", "ها", "هم", "ه", "يه", "ي"];

/** Light stemmer: strips common Arabic prefixes/suffixes. */
export function stem(token: string): string {
  let t = token;
  for (const p of PREFIXES) if (t.startsWith(p) && t.length - p.length >= 3) { t = t.slice(p.length); break; }
  for (const s of SUFFIXES) if (t.endsWith(s) && t.length - s.length >= 3) { t = t.slice(0, -s.length); break; }
  return t;
}

/** Common Arabic/English function words (normalised) ignored by keyword features. */
const STOP = new Set([
  "ما", "ماذا", "هو", "هي", "في", "من", "الي", "علي", "عن", "مع", "هذا", "هذه", "ذلك", "التي", "الذي", "او", "ان", "كان", "كيف", "هل", "لا", "قد", "كل", "بين", "عند", "بعد", "قبل", "اليوم", "تبلغ", "مما", "يجعل",
  "the", "of", "and", "to", "in", "is", "a", "for", "on", "what", "how", "with",
]);

export function tokens(s: string): string[] {
  return normalizeArabic(s).split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t)).map(stem);
}

/**
 * Small concept lexicon so the offline mock embedder behaves semantically
 * enough for tests and demos (synonyms map onto shared concept features).
 * Real deployments use a multilingual embedding model instead.
 */
export const CONCEPTS: Record<string, string[]> = {
  water: ["ميا", "ماء", "صرف", "مياه", "ري", "تحليه", "wastewater", "water", "معالج"],
  waste: ["مخلف", "نفاي", "رواسب", "روب", "ردم", "فضلات", "waste", "sludge", "تلوث", "ملوث"],
  recycle: ["تدوير", "اعاد", "استخدام", "استرجاع", "recycl", "reuse", "circular"],
  stone: ["حجر", "رخام", "قص", "محاجر", "مناشير", "stone", "marble", "كسار"],
  construction: ["بناء", "انشاء", "خرسان", "اسمنت", "طوب", "بلوك", "construct", "concrete", "cement"],
  energy: ["طاق", "كهرب", "شمسي", "energy", "solar", "استهلاك"],
  food: ["غذا", "اغذي", "البان", "حليب", "زيت", "زيتون", "food", "dairy", "olive", "تعبي"],
  pharma: ["دوا", "ادوي", "صيدل", "pharma", "drug", "تعقيم"],
  plastic: ["بلاستيك", "بوليمر", "plastic", "polymer", "حقن"],
  software: ["برمج", "تطبيق", "نظام", "رقمي", "ذكاء", "بيانات", "software", "digital", "data", "اتمت", "automation"],
  quality: ["جود", "فحص", "عيوب", "quality", "defect", "inspection"],
  logistics: ["توزيع", "شحن", "مخزون", "سلسل", "logistic", "supply", "تسويق"],
};

export function conceptsOf(text: string): string[] {
  const norm = normalizeArabic(text);
  const toks = tokens(text);
  const out: string[] = [];
  for (const [concept, roots] of Object.entries(CONCEPTS)) {
    const hit = roots.some((r) => {
      const root = normalizeArabic(r).trim();
      // Short roots must start a token; longer ones may appear anywhere (compound words).
      return toks.some((t) => t.startsWith(root)) || (root.length >= 4 && norm.includes(root));
    });
    if (hit) out.push(concept);
  }
  return out;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]! * b[i]!; na += a[i]! ** 2; nb += b[i]! ** 2; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
