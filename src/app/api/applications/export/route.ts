import { toCsv } from "@/lib/csv";
import { apiError, withApi } from "@/lib/server/api";
import { prisma } from "@/lib/server/db";
import { authorizeCandidate } from "@/lib/server/permissions";

// GET /api/applications/export?candidateId= — application report as CSV.
export const GET = withApi(async (req, user) => {
  const candidateId = new URL(req.url).searchParams.get("candidateId");
  if (!candidateId) return apiError(400, "candidate_required", "candidateId is required.");
  const c = await authorizeCandidate(user, candidateId, "read");
  const rows = await prisma.jobApplication.findMany({ where: { candidateId }, orderBy: { createdAt: "asc" } });
  const csv = toCsv([
    ["job_title", "company", "location", "status", "coverage_percent", "applied_at", "job_url", "notes"],
    ...rows.map((r) => [r.title, r.company, r.location, r.status, r.coverage, r.appliedAt?.toISOString() ?? "", r.jobUrl, r.notes]),
  ]);
  const name = c.fullName.replace(/[^A-Za-z0-9]+/g, "_");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}_dice_applications.csv"`, "Cache-Control": "no-store" } });
});
