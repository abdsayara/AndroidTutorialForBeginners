import { requireActive } from "@/lib/auth/guards";
import { TasksBoard } from "@/components/workspace/forms";
import { getWorkspace, listMilestones } from "@/modules/workspaces/service";

export const dynamic = "force-dynamic";

export default async function Tasks({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const actor = await requireActive(locale);
  const [ws, ms] = await Promise.all([getWorkspace(actor, id), listMilestones(actor, id)]);
  const serial = ms.map((m) => ({ id: m.id, title: m.title, status: m.status, due_date: m.due_date?.toISOString() ?? null, tasks: m.tasks.map((x) => ({ id: x.id, title: x.title, status: x.status, assignee_id: x.assignee_id, due_date: x.due_date?.toISOString() ?? null })) }));
  return <TasksBoard wsId={id} milestones={serial} members={ws.members.map((m) => ({ id: m.user.id, name: m.user.full_name }))} editable={ws.can.edit} />;
}
