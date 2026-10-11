import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";

export default function NotFound() {
  const t = useTranslations("errors");
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="num text-5xl font-bold text-primary">404</p>
      <p className="mt-3 text-lg">{t("not_found")}</p>
      <Link href="/" className="mt-6 inline-block text-primary underline">InnovateLink</Link>
    </div>
  );
}
