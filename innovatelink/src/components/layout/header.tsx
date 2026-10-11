import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { getActor } from "@/lib/auth/current";
import { db } from "@/lib/db";
import { LocaleSwitcher } from "./locale-switcher";
import { LogoutButton } from "./logout-button";
import { MobileMenu } from "./mobile-menu";
import type { Actor } from "@/modules/auth/policy";

export interface NavItem { href: string; label: string }

async function navFor(actor: Actor | null): Promise<NavItem[]> {
  const t = await getTranslations("nav");
  const items: NavItem[] = [
    { href: "/challenges", label: t("challenges") },
    { href: "/projects", label: t("projects") },
  ];
  if (actor?.status === "active") items.push({ href: "/experts", label: t("experts") }, { href: "/labs", label: t("labs") });
  if (actor) items.push({ href: "/dashboard", label: t("dashboard") });
  if (actor?.status === "active" && ["platform_coordinator", "platform_admin", "university_coordinator"].includes(actor.role)) items.push({ href: "/coordinator/review", label: t("review") });
  if (actor?.status === "active") items.push({ href: "/analytics", label: t("analytics") });
  if (actor?.role === "platform_admin" && actor.status === "active") items.push({ href: "/admin", label: t("admin") });
  return items;
}

export async function Header() {
  const actor = await getActor();
  const t = await getTranslations("nav");
  const locale = await getLocale();
  const items = await navFor(actor);
  const unread = actor ? await db.notification.count({ where: { user_id: actor.id, read_at: null } }) : 0;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-primary">
          <span aria-hidden className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">IL</span>
          <span className="hidden sm:inline">{t("brand")}</span>
        </Link>
        <nav aria-label={t("main")} className="hidden flex-1 items-center gap-1 lg:flex">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="rounded-md px-3 py-2 text-sm hover:bg-muted">{i.label}</Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <LocaleSwitcher current={locale} />
          {actor ? (
            <>
              <Link href="/notifications" className="relative rounded-md px-2 py-2 text-sm hover:bg-muted" aria-label={t("notifications_count", { count: unread })}>
                <span aria-hidden>🔔</span>
                {unread > 0 && <span className="num absolute -top-0.5 end-0 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">{unread}</span>}
              </Link>
              <Link href="/settings" className="hidden rounded-md px-3 py-2 text-sm hover:bg-muted sm:inline">{t("settings")}</Link>
              <LogoutButton label={t("logout")} />
            </>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-md px-3 py-2 text-sm hover:bg-muted">{t("login")}</Link>
              <Link href="/auth/register" className="hidden rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground sm:inline">{t("register")}</Link>
            </>
          )}
          <MobileMenu items={items} label={t("menu")} />
        </div>
      </div>
    </header>
  );
}
