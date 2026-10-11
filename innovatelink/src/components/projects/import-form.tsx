"use client";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api/client";
import { Button, Card } from "@/components/ui";
import { useErrorText } from "@/components/domain/use-api-error";

/** FR-3.5: CSV upload with a per-row error report. */
export function ImportForm({ columns }: { columns: readonly string[] }) {
  const t = useTranslations("import");
  const errText = useErrorText();
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<{ created: number; errors: { row: number; errors: string[] }[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const template = `﻿${columns.join(",")}\ngraduation_project,"عنوان المشروع","ملخص","المشكلة",food,"وسم1|وسم2",4,supervisor@uni.edu,,,none,showcase|startup,ar\n`;
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <p className="text-sm">{t("instructions")}</p>
        <p className="text-xs text-muted-foreground" dir="ltr">{columns.join(", ")}</p>
        <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(template)}`} download="projects-template.csv" className="text-sm text-primary underline">{t("download_template")}</a>
        <input type="file" accept=".csv,text/csv" aria-label={t("choose_file")} onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
        <Button disabled={!file || pending} onClick={() => start(async () => {
          setErr(null); setReport(null);
          try { const fd = new FormData(); fd.set("file", file!); setReport(await api("/projects/import", { body: fd })); } catch (e) { setErr(errText(e)); }
        })}>{pending ? t("importing") : t("import")}</Button>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      </Card>
      {report && (
        <Card className="space-y-2">
          <p className="num font-medium">{t("created", { n: report.created })}</p>
          {report.errors.length > 0 && (
            <table className="w-full text-sm"><thead><tr><th className="text-start">{t("row")}</th><th className="text-start">{t("errors")}</th></tr></thead>
              <tbody>{report.errors.map((r) => <tr key={r.row} className="border-t border-border"><td className="num p-1">{r.row}</td><td className="p-1" dir="ltr">{r.errors.join("; ")}</td></tr>)}</tbody></table>
          )}
        </Card>
      )}
    </div>
  );
}
