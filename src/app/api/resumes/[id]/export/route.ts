import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/server/api";
import { prisma } from "@/lib/server/db";
import { exportVersion } from "@/lib/server/export-service";

const Body = z.object({ format: z.enum(["DOCX", "PDF"]), versionId: z.string().optional(), spacing: z.enum(["normal", "compact"]).default("normal") });

// POST /api/resumes/:id/export — render, verify and store a DOCX/PDF export.
export const POST = withApi<{ params: Promise<{ id: string }> }>(async (req, user, { params }) => {
  const { id } = await params;
  const body = Body.parse(await req.json());
  const version = body.versionId
    ? await prisma.resumeVersion.findFirstOrThrow({ where: { id: body.versionId, resumeId: id } })
    : await prisma.resumeVersion.findFirstOrThrow({ where: { resumeId: id }, orderBy: { version: "desc" } });
  const { record, pageCount, pageTarget } = await exportVersion(user, version.id, body.format, body.spacing);
  return NextResponse.json({ data: { exportId: record.id, url: `/api/exports/${record.id}`, pageCount, pageTarget } }, { status: 201 });
});
