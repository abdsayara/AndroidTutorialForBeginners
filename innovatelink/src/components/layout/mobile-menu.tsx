"use client";
import { useState } from "react";
import { Link } from "@/lib/i18n/routing";
import type { NavItem } from "./header";

export function MobileMenu({ items, label }: { items: NavItem[]; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button type="button" aria-expanded={open} aria-controls="mobile-nav" aria-label={label} onClick={() => setOpen((o) => !o)} className="rounded-md px-2 py-2 hover:bg-muted">
        <span aria-hidden>☰</span>
      </button>
      {open && (
        <nav id="mobile-nav" className="absolute inset-x-0 top-14 border-b border-border bg-card p-2 shadow">
          {items.map((i) => (
            <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 hover:bg-muted">{i.label}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
