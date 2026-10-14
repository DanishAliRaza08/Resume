import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/server/api";
import { prisma } from "@/lib/server/db";
import { authorizeResume } from "@/lib/server/permissions";
import { saveVersion } from "@/lib/server/resume-service";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/resumes/:id/versions — version history (metadata only).
export const GET = withApi<Ctx>(async (_req, user, { params }) => {
  const { id } = await params;
  await authorizeResume(user, id, "read");
  const versions = await prisma.resumeVersion.findMany({ where: { resumeId: id }, orderBy: { version: "desc" }, select: { id: true, version: true, status: true, changeNote: true, createdAt: true, parentVersionId: true } });
  return NextResponse.json({ data: versions });
});

const Body = z.object({ content: z.unknown(), parentVersionId: z.string().nullish(), changeNote: z.string().max(300).optional() });

// POST /api/resumes/:id/versions — save a new immutable version (content is schema-validated).
export const POST = withApi<Ctx>(async (req, user, { params }) => {
  const { id } = await params;
  const body = Body.parse(await req.json());
  const v = await saveVersion(user, id, body.content, { parentVersionId: body.parentVersionId ?? null, changeNote: body.changeNote });
  return NextResponse.json({ data: { id: v.id, version: v.version, validation: v.validation } }, { status: 201 });
});
