import nodemailer, { type Transporter } from "nodemailer";
import { log } from "@/lib/log";

let transport: Transporter | null = null;

function getTransport() {
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transport;
}

/** Captured outgoing mail in tests. */
export const testOutbox: { to: string; subject: string; text: string }[] = [];

export async function sendMail(m: { to: string; subject: string; html: string; text: string }): Promise<void> {
  if (process.env.NODE_ENV === "test") {
    testOutbox.push({ to: m.to, subject: m.subject, text: m.text });
    return;
  }
  await getTransport().sendMail({ from: process.env.MAIL_FROM, ...m });
  log.info("mail sent", { to: m.to, subject: m.subject });
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Minimal RTL-aware HTML layout for transactional email. */
export function renderEmail(opts: { locale: "ar" | "en"; title: string; body: string; cta?: { label: string; url: string }; footer: string }) {
  const dir = opts.locale === "ar" ? "rtl" : "ltr";
  const html = `<!doctype html><html lang="${opts.locale}" dir="${dir}"><body style="margin:0;background:#f5f6f4;font-family:'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;padding:28px;text-align:${dir === "rtl" ? "right" : "left"}">
<tr><td style="font-size:20px;font-weight:700;color:#0f5132;padding-bottom:12px">${esc(opts.title)}</td></tr>
<tr><td style="font-size:15px;line-height:1.8;color:#222">${esc(opts.body)}</td></tr>
${opts.cta ? `<tr><td style="padding-top:20px"><a href="${esc(opts.cta.url)}" style="background:#0f5132;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${esc(opts.cta.label)}</a></td></tr>` : ""}
<tr><td style="font-size:12px;color:#777;padding-top:24px">${esc(opts.footer)}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${opts.title}\n\n${opts.body}${opts.cta ? `\n\n${opts.cta.label}: ${opts.cta.url}` : ""}\n\n${opts.footer}`;
  return { html, text };
}
