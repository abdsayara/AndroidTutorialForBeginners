"use client";
import { useRouter } from "@/lib/i18n/routing";
import { api } from "@/lib/api/client";

export function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="rounded-md px-3 py-2 text-sm hover:bg-muted"
      onClick={async () => {
        await api("/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
