import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, withApi } from "@/lib/server/api";
import { prisma } from "@/lib/server/db";
import { decideSuggestion } from "@/lib/server/jd-service";

const Body = z.object({ decision: z.enum(["ACCEPTED", "REJECTED"]), editedText: z.string().max(1000).optional(), confirmed: z.boolean().default(false) });

// POST /api/resumes/:id/suggestions/:suggestionId/decision — accept or reject a proposed edit.
export const POST = withApi<{ params: Promise<{ id: string; suggestionId: string }> }>(async (req, user, { params }) => {
  const { id, suggestionId } = await params;
  const s = await prisma.editSuggestion.findUnique({ where: { id: suggestionId }, include: { resumeVersion: { select: { resumeId: true } } } });
  if (!s || s.resumeVersion.resumeId !== id) return apiError(404, "not_found", "Suggestion not found.");
  const body = Body.parse(await req.json());
  await decideSuggestion(user, suggestionId, body.decision, { editedText: body.editedText, confirmed: body.confirmed });
  return NextResponse.json({ data: { id: suggestionId, decision: body.decision } });
});
