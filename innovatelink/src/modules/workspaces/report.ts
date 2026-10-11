import { serverT } from "@/lib/i18n/server-t";
import { embeddedFontCss } from "@/lib/pdf";
import type { getFinalReport } from "./service";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** FR-4.6: final report HTML for PDF export (RTL for Arabic). */
export function finalReportHtml(data: Awaited<ReturnType<typeof getFinalReport>>, locale: "ar" | "en"): string {
  const t = serverT(locale, "workspace.report");
  const dir = locale === "ar" ? "rtl" : "ltr";
  const sections = ["summary", "solution", "results", "technical_recommendations", "business_recommendations", "next_steps"] as const;
  const fmt = (d: Date | null) => (d ? new Intl.DateTimeFormat(locale === "ar" ? "ar-u-nu-latn-ca-gregory" : "en-GB", { dateStyle: "medium" }).format(d) : "—");
  return `<!doctype html><html lang="${locale}" dir="${dir}"><head><meta charset="utf-8"><style>
${embeddedFontCss()}
body{font-family:"IBM Plex Sans Arabic",sans-serif;color:#1d2a24;font-size:12pt;line-height:1.8}
h1{color:#0f5132;font-size:20pt;margin:0 0 4pt} h2{color:#0f5132;font-size:13pt;border-bottom:1px solid #cfe3d8;padding-bottom:3pt;margin-top:18pt}
.meta{color:#55635c;font-size:10pt} table{border-collapse:collapse;width:100%;font-size:10.5pt} td{padding:3pt 6pt;border-bottom:1px solid #eee;vertical-align:top}
p{white-space:pre-wrap;margin:4pt 0} .footer{margin-top:28pt;font-size:9pt;color:#777}
</style></head><body>
<h1>${esc(t("title"))}</h1>
<div class="meta">${esc(data.workspace.title)}</div>
<table>
<tr><td>${esc(t("company"))}</td><td>${esc(data.challenge.org.name_ar)}</td></tr>
${data.project ? `<tr><td>${esc(t("project"))}</td><td>${esc(data.project.title)} — ${esc(data.project.org.name_ar)}</td></tr>` : ""}
<tr><td>${esc(t("period"))}</td><td>${fmt(data.workspace.start_date)} – ${fmt(data.workspace.end_date)}</td></tr>
<tr><td>${esc(t("team"))}</td><td>${data.members.map((m) => esc(m.user.full_name)).join("، ")}</td></tr>
${data.workspace.course_code ? `<tr><td>${esc(t("course"))}</td><td>${esc(data.workspace.course_code)} / ${esc(data.workspace.semester)}</td></tr>` : ""}
</table>
${sections.map((s) => `<h2>${esc(t(`sections.${s}`))}</h2><p>${esc(data.report[s] || "—")}</p>`).join("\n")}
<div class="footer">InnovateLink Palestine — ${esc(t("generated"))} ${fmt(new Date())}</div>
</body></html>`;
}
