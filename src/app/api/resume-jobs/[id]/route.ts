import { NextResponse } from "next/server";
import { apiError, withApi } from "@/lib/server/api";
import { prisma } from "@/lib/server/db";

// GET /api/resume-jobs/:id — job status and warnings.
export const GET = withApi<{ params: Promise<{ id: string }> }>(async (_req, user, { params }) => {
  const { id } = await params;
  const job = await prisma.generationJob.findUnique({ where: { id } });
  if (!job || (job.createdById !== user.id && user.role !== "ADMIN")) return apiError(404, "not_found", "Job not found.");
  return NextResponse.json({
    data: { id: job.id, status: job.status, attempts: job.attempts, resumeId: job.resumeId, versionId: job.outputVersionId, warnings: job.warnings, error: job.errorDetails, durationMs: job.durationMs, model: job.modelName, tokens: { input: job.inputTokens, output: job.outputTokens }, costUsd: job.costUsd },
  });
});
