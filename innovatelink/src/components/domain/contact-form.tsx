"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api/client";
import { Button, Textarea } from "@/components/ui";
import { useErrorText } from "./use-api-error";

/** FR-1.7 "express interest" / FR-3.4 "request contact". */
export function ContactForm({ targetType, targetId, label }: { targetType: "challenge" | "project" | "researcher" | "lab"; targetId: string; label: string }) {
  const t = useTranslations("contact");
  const errText = useErrorText();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (done) return <p className="text-sm font-medium text-emerald-700">{t("sent")}</p>;
  if (!open) return <Button onClick={() => setOpen(true)}>{label}</Button>;
  return (
    <div className="space-y-2">
      <label htmlFor={`contact-${targetId}`} className="text-sm font-medium">{t("message")}</label>
      <Textarea id={`contact-${targetId}`} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t("placeholder")} />
      <div className="flex gap-2">
        <Button disabled={pending || msg.trim().length < 5} onClick={() => start(async () => {
          setErr(null);
          try { await api("/contact-requests", { json: { target_type: targetType, target_id: targetId, message: msg } }); setDone(true); } catch (e) { setErr(errText(e)); }
        })}>{t("send")}</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>{t("cancel")}</Button>
      </div>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
    </div>
  );
}
