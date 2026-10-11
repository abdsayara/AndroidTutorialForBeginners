import { setRequestLocale } from "next-intl/server";
import { RegisterForm } from "@/components/auth/forms";
import { CURRENT_CONSENT_VERSION } from "@/modules/auth/service";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <RegisterForm consentVersion={CURRENT_CONSENT_VERSION} />;
}
