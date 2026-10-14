import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, withApi } from "@/lib/server/api";
import { runGenerationJob, startGenerationJob } from "@/lib/server/resume-service";

const Body = z.object({
  candidateId: z.string(),
  domainKey: z.enum(["BANKING", "RETAIL", "HEALTHCARE", "PHARMA", "PC_INSURANCE"]),
  roleKey: z.string(),
  seniority: z.string().nullish().transform((v) => v ?? null),
  targetTitle: z.string().nullish().transform((v) => v ?? null),
  projectIds: z.array(z.string()).max(10).default([]),
  mode: z.enum(["FULL_DETAIL", "STANDARD", "CONCISE"]).default("STANDARD"),
  pageTarget: z.number().int().min(1).max(6).default(4),
  templateKey: z.enum(["classic", "modern"]).default("classic"),
  includeHighlights: z.boolean().default(false),
  useAi: z.boolean().default(false),
  resumeId: z.string().optional(),
});

// POST /api/resume-jobs — start a new-resume generation job. Requires an Idempotency-Key header;
// retries with the same key return the original job instead of creating duplicate output.
export const POST = withApi(async (req, user) => {
  const key = req.headers.get("idempotency-key");
  if (!key || key.length < 8 || key.length > 200) return apiError(400, "idempotency_key_required", "Send an Idempotency-Key header (8–200 chars).");
  const body = Body.parse(await req.json());
  const job = await startGenerationJob(user, body, `${user.id}:${key}`);
  if (job.status === "QUEUED") void runGenerationJob(job.id);
  return NextResponse.json({ data: { id: job.id, status: job.status } }, { status: 202 });
});
