import { describe, expect, it } from "vitest";
import { testQueue } from "@/lib/jobs";
import { makeUser } from "../../../tests/helpers";
import { listNotifications, markRead, notify, updateEmailPrefs } from "./service";

describe("notifications", () => {
  it("FR-8.1/8.2: in-app + email, respecting per-type email prefs", async () => {
    const u = await makeUser("student");
    await notify([u.id], "new_match", { subject: "تحدي", url: "/dashboard/matches" });
    expect(testQueue.filter((j) => j.name === "mail.send")).toHaveLength(1);
    const mail = testQueue[0]!.data as { subject: string; html: string };
    expect(mail.subject).toBe("مطابقة جديدة");
    expect(mail.html).toContain('dir="rtl"');
    await updateEmailPrefs(u, { new_match: false });
    await notify([u.id], "new_match", { subject: "تحدي" });
    expect(testQueue.filter((j) => j.name === "mail.send")).toHaveLength(1);
    const l = await listNotifications(u);
    expect(l.total).toBe(2);
    expect(l.unread).toBe(2);
    await markRead(u, [l.items[0]!.id]);
    expect((await listNotifications(u)).unread).toBe(1);
    await markRead(u, "all");
    expect((await listNotifications(u)).unread).toBe(0);
    await notify([], "new_match", {});
  });
});
