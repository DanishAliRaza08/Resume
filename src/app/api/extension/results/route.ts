import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAutoResult, report } from "@/lib/server/apply-service";
import { withApi } from "@/lib/server/api";

const Body = z.object({
  candidateId: z.string().min(1).max(100),
  jobUrl: z.string().url().max(1000),
  outcome: z.enum(["APPLIED", "SKIPPED", "NOT_AVAILABLE", "ALREADY_APPLIED", "NEEDS_ANSWERS"]),
  title: z.string().max(300).nullish(),
  company: z.string().max(300).nullish(),
  location: z.string().max(300).nullish(),
  reason: z.string().max(500).nullish(),
  questions: z.array(z.string().max(500)).max(30).optional(),
});

// POST /api/extension/results — one auto-apply result; returns the person's updated totals.
export const POST = withApi(async (req, user) => {
  const body = Body.parse(await req.json());
  await recordAutoResult(user, body.candidateId, body);
  return NextResponse.json({ ok: true, totals: await report(user, body.candidateId) }, { headers: { "Cache-Control": "no-store" } });
});
