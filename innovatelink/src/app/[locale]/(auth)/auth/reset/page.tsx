import { setRequestLocale } from "next-intl/server";
import { ResetForm } from "@/components/auth/forms";

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string }> }) {
  setRequestLocale((await params).locale);
  return <ResetForm token={(await searchParams).token ?? ""} />;
}
