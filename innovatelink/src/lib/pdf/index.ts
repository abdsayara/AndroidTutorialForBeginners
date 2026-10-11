import { readFileSync } from "node:fs";
import path from "node:path";

let fontCss: string | null = null;

/** Self-hosted IBM Plex Sans Arabic embedded as data URIs so PDFs never fetch remote fonts. */
export function embeddedFontCss(): string {
  if (fontCss) return fontCss;
  const dir = path.join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans-arabic/files");
  const face = (w: number, subset: string) => {
    const f = path.join(dir, `ibm-plex-sans-arabic-${subset}-${w}-normal.woff2`);
    return `@font-face{font-family:"IBM Plex Sans Arabic";font-weight:${w};src:url(data:font/woff2;base64,${readFileSync(f).toString("base64")}) format("woff2");}`;
  };
  fontCss = [400, 700].flatMap((w) => ["arabic", "latin"].map((s) => face(w, s))).join("\n");
  return fontCss;
}

/**
 * HTML → PDF with headless Chromium (FR-4.6). Chromium's text shaping renders
 * Arabic RTL correctly, which JS PDF libraries do not (see DECISIONS.md).
 */
export async function htmlToPdf(html: string): Promise<Uint8Array> {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.route("**/*", (r) => (r.request().url().startsWith("data:") ? r.continue() : r.abort()));
    await page.setContent(html, { waitUntil: "load" });
    return await page.pdf({ format: "A4", printBackground: true, margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" } });
  } finally {
    await browser.close();
  }
}
