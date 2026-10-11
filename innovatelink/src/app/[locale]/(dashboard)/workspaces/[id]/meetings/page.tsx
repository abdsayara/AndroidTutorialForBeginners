import { getLocale } from "next-intl/server";
import { requireActive } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui";
import { MeetingForm } from "@/components/workspace/forms";
import { getWorkspace, listMeetings } from "@/modules/workspaces/service";

export const dynamic = "force-dynamic";

export default async function Meetings({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const actor = await requireActive(locale);
  const loc = await getLocale();
  const [ws, ms] = await Promise.all([getWorkspace(actor, id), listMeetings(actor, id)]);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        {ms.map((m) => (
          <Card key={m.id} className="space-y-1">
            <div className="num text-sm font-semibold">{formatDate(m.held_at, loc)}</div>
            {m.attendees.length > 0 && <div className="text-xs text-muted-foreground">{m.attendees.join("، ")}</div>}
            <p className="whitespace-pre-wrap text-sm">{m.notes}</p>
            {m.action_items.length > 0 && <ul className="list-disc ps-5 text-sm">{m.action_items.map((a, i) => <li key={i}>{a}</li>)}</ul>}
          </Card>
        ))}
      </div>
      {ws.can.edit && <MeetingForm wsId={id} />}
    </div>
  );
}
