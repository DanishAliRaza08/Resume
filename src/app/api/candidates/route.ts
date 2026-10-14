import { NextResponse } from "next/server";
import { z } from "zod";
import { paginate, withApi } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { prisma } from "@/lib/server/db";
import { assertCan, candidateScope } from "@/lib/server/permissions";

const Body = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email().nullish(),
  phone: z.string().max(50).nullish(),
  location: z.string().max(200).nullish(),
  targetRole: z.string().max(50).nullish(),
  targetTitle: z.string().max(200).nullish(),
  domainKey: z.string().max(50).nullish(),
});

// GET /api/candidates — list candidates the caller may read.
export const GET = withApi(async (req, user) => {
  const { take, skip } = paginate(new URL(req.url));
  const rows = await prisma.candidate.findMany({ where: candidateScope(user), take, skip, orderBy: { updatedAt: "desc" }, select: { id: true, fullName: true, domainKey: true, targetRole: true, updatedAt: true } });
  return NextResponse.json({ data: rows, limit: take, offset: skip });
});

// POST /api/candidates — create a candidate profile.
export const POST = withApi(async (req, user) => {
  await assertCan(user, "candidate:create");
  const body = Body.parse(await req.json());
  const c = await prisma.candidate.create({ data: { ...body, ownerId: user.id } });
  await audit(user.id, "candidate.create", "Candidate", c.id, "SUCCESS", { via: "api" });
  return NextResponse.json({ data: { id: c.id } }, { status: 201 });
});
