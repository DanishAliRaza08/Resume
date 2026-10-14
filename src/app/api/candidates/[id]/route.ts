import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { prisma } from "@/lib/server/db";
import { authorizeCandidate } from "@/lib/server/permissions";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/candidates/:id — read an authorized candidate profile with verified history.
export const GET = withApi<Ctx>(async (_req, user, { params }) => {
  const { id } = await params;
  await authorizeCandidate(user, id, "read");
  const c = await prisma.candidate.findUniqueOrThrow({ where: { id }, include: { employments: true, education: true, certifications: true, skills: { include: { technology: { select: { canonicalName: true } } } }, projects: { include: { technologies: { include: { technology: { select: { canonicalName: true } } } } } } } });
  await audit(user.id, "candidate.read", "Candidate", id, "SUCCESS", { via: "api" });
  return NextResponse.json({ data: c });
});

const Patch = z.object({
  fullName: z.string().min(1).max(200).optional(),
  email: z.string().email().nullish(),
  phone: z.string().max(50).nullish(),
  location: z.string().max(200).nullish(),
  targetRole: z.string().max(50).nullish(),
  targetTitle: z.string().max(200).nullish(),
  domainKey: z.string().max(50).nullish(),
}).strict();

// PATCH /api/candidates/:id — update candidate fields.
export const PATCH = withApi<Ctx>(async (req, user, { params }) => {
  const { id } = await params;
  await authorizeCandidate(user, id, "write");
  const body = Patch.parse(await req.json());
  await prisma.candidate.update({ where: { id }, data: body });
  await audit(user.id, "candidate.update", "Candidate", id, "SUCCESS", { via: "api", fields: Object.keys(body) });
  return NextResponse.json({ data: { id } });
});
