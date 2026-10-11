import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { dirOf, isLocale, locales } from "@/lib/i18n/config";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: { default: t("title"), template: `%s — ${t("short")}` }, description: t("description") };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations("common");
  return (
    <html lang={locale} dir={dirOf(locale)}>
      <body className="min-h-screen font-sans">
        <a href="#main" className="skip-link">{t("skip_to_content")}</a>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
