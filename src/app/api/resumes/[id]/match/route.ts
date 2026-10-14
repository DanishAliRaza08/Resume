import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/server/api";
import { prisma } from "@/lib/server/db";
import { matchVersion } from "@/lib/server/jd-service";

const Body = z.object({ jobDescriptionId: z.string(), versionId: z.string().optional() });

// POST /api/resumes/:id/match — match JD requirements to resume evidence and propose edits.
export const POST = withApi<{ params: Promise<{ id: string }> }>(async (req, user, { params }) => {
  const { id } = await params;
  const body = Body.parse(await req.json());
  const version = body.versionId
    ? await prisma.resumeVersion.findFirstOrThrow({ where: { id: body.versionId, resumeId: id } })
    : await prisma.resumeVersion.findFirstOrThrow({ where: { resumeId: id }, orderBy: { version: "desc" } });
  const result = await matchVersion(user, version.id, body.jobDescriptionId);
  const suggestions = await prisma.editSuggestion.findMany({ where: { resumeVersionId: version.id, jobDescriptionId: body.jobDescriptionId } });
  return NextResponse.json({ data: { versionId: version.id, score: result.score, matches: result.matches, suggestions } });
});
