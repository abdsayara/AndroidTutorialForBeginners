import { redirect } from "next/navigation";

export default async function AdminIndex({ params }: { params: Promise<{ locale: string }> }) {
  redirect(`/${(await params).locale}/admin/users`);
}
