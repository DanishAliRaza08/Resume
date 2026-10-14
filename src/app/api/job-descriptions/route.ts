import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/server/api";
import { createJobDescription } from "@/lib/server/jd-service";

const Body = z.object({ title: z.string().min(1).max(200), text: z.string().min(40).max(200_000), targetRole: z.string().max(50).optional() });

// POST /api/job-descriptions — store pasted JD text and analyze it.
export const POST = withApi(async (req, user) => {
  const body = Body.parse(await req.json());
  const jd = await createJobDescription(user, body);
  return NextResponse.json({ data: { id: jd.id } }, { status: 201 });
});
