import { NextResponse } from "next/server";
import { withApi } from "@/lib/server/api";
import { analyzeJobDescription } from "@/lib/server/jd-service";

// POST /api/job-descriptions/:id/analyze — (re)extract and classify JD requirements.
export const POST = withApi<{ params: Promise<{ id: string }> }>(async (_req, user, { params }) => {
  const { id } = await params;
  const requirements = await analyzeJobDescription(user, id);
  return NextResponse.json({ data: { requirements } });
});
