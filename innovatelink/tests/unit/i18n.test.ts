import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import * as Prisma from "@prisma/client";
import { extractKeys, flatten } from "../../scripts/i18n-keys";

const ar = JSON.parse(readFileSync("messages/ar.json", "utf8"));
const en = JSON.parse(readFileSync("messages/en.json", "utf8"));

describe("i18n (PRD: every visible string goes through ar.json / en.json)", () => {
  it("ar and en have identical key sets", () => {
    const a = flatten(ar), e = flatten(en);
    expect([...a].filter((k) => !e.has(k))).toEqual([]);
    expect([...e].filter((k) => !a.has(k))).toEqual([]);
  });

  it("every statically referenced key exists", () => {
    const a = flatten(ar);
    expect([...extractKeys().keys()].filter((k) => !a.has(k))).toEqual([]);
  });

  it("every enum value used in the UI has a label", () => {
    const pairs: [string, Record<string, string>][] = [
      ["category", Prisma.ChallengeCategory], ["project_type", Prisma.ProjectType], ["ip_status", Prisma.IpStatus], ["seeking", Prisma.Seeking],
      ["support", Prisma.SupportNeed], ["role", Prisma.Role], ["visibility", Prisma.Visibility], ["ws_role", Prisma.WsRole],
      ["stage", Prisma.CommercializationStage], ["pathway", Prisma.CommercializationPathway], ["target_type", Prisma.MatchTargetType],
      ["org_type", Prisma.OrgType], ["size", Prisma.OrgSize], ["milestone_status", Prisma.MilestoneStatus], ["task_status", Prisma.TaskStatus],
    ];
    for (const [ns, e] of pairs) for (const v of Object.values(e)) expect(ar.enums[ns][v], `${ns}.${v}`).toBeTruthy();
    for (const e of [Prisma.ChallengeStatus, Prisma.ProjectStatus, Prisma.MatchStatus, Prisma.WorkspaceStatus, Prisma.UserStatus, Prisma.AccessRequestStatus, Prisma.ContactStatus])
      for (const v of Object.values(e)) expect(ar.enums.status[v], `status.${v}`).toBeTruthy();
  });
});
