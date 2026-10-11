"use client";
import { useState, useTransition } from "react";
import { useRouter } from "@/lib/i18n/routing";
import { api } from "@/lib/api/client";
import { Button, type ButtonProps } from "@/components/ui";
import { useErrorText } from "./use-api-error";

/** Calls an API endpoint then refreshes the server-rendered page. */
export function ActionButton({ path, method = "POST", json, confirm, redirectTo, children, ...rest }: Omit<ButtonProps, "onClick"> & { path: string; method?: string; json?: unknown; confirm?: string; redirectTo?: string }) {
  const router = useRouter();
  const errText = useErrorText();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col gap-1">
      <Button
        {...rest}
        disabled={pending || rest.disabled}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          setErr(null);
          start(async () => {
            try {
              const r = await api<{ id?: string }>(path, { method, json: json ?? {} });
              if (redirectTo) router.push(redirectTo.replace(":id", r?.id ?? ""));
              router.refresh();
            } catch (e) {
              setErr(errText(e));
            }
          });
        }}
      >
        {children}
      </Button>
      {err && <span role="alert" className="text-xs text-destructive">{err}</span>}
    </span>
  );
}
