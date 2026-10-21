import { NextResponse } from "next/server";
import { ROLES } from "@/data/domains";
import { withApi } from "@/lib/server/api";
import { prisma } from "@/lib/server/db";
import { candidateScope } from "@/lib/server/permissions";

// GET /api/extension/me — who is signed in and the people they can apply for, with each
// person's role (from their latest resume) as the default Dice search.
export const GET = withApi(async (_req, user) => {
  const candidates = await prisma.candidate.findMany({
    where: candidateScope(user),
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: { id: true, fullName: true, targetRole: true, targetTitle: true, location: true, resumes: { orderBy: { updatedAt: "desc" }, take: 1, select: { roleKey: true } }, applicantProfile: { select: { id: true } } },
  });
  return NextResponse.json(
    {
      user: { name: user.name, email: user.email },
      candidates: candidates.map((c) => {
        const roleKey = c.resumes[0]?.roleKey ?? c.targetRole ?? null;
        const role = ROLES.find((r) => r.key === roleKey)?.name ?? null;
        return { id: c.id, name: c.fullName, role, search: role ?? c.targetTitle ?? "", location: c.location ?? "", hasAnswers: Boolean(c.applicantProfile) };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
