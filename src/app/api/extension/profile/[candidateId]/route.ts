import { NextResponse } from "next/server";
import { answerPayload, getProfile } from "@/lib/server/apply-service";
import { withApi } from "@/lib/server/api";
import { prisma } from "@/lib/server/db";

// GET /api/extension/profile/:candidateId — saved screening answers plus the Dice jobs already
// handled for this person (so a run never applies to the same job twice).
export const GET = withApi<{ params: Promise<{ candidateId: string }> }>(async (_req, user, { params }) => {
  const { candidateId } = await params;
  const { candidate, answers, custom } = await getProfile(user, candidateId);
  const handled = await prisma.jobApplication.findMany({ where: { candidateId, status: { in: ["APPLIED", "SKIPPED", "NOT_AVAILABLE"] } }, select: { jobKey: true, status: true, notes: true } });
  return NextResponse.json(
    {
      profile: answerPayload(candidate.fullName.replace(/\(demo\)/i, "").trim(), answers, custom),
      // Jobs skipped only for missing answers are retried once the answers exist.
      done: handled.filter((h) => !(h.status === "SKIPPED" && (h.notes ?? "").startsWith("Needs answers:"))).map((h) => h.jobKey.replace(/^dice:/, "")),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
