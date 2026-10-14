import { NextResponse } from "next/server";
import { paginate, withApi } from "@/lib/server/api";
import { prisma } from "@/lib/server/db";
import { assertCan } from "@/lib/server/permissions";

// GET /api/admin/audit-events?action=&outcome=&recordType=&recordId= — restricted audit search.
export const GET = withApi(async (req, user) => {
  await assertCan(user, "admin:audit", "AuditEvent");
  const url = new URL(req.url);
  const { take, skip } = paginate(url);
  const p = (k: string) => url.searchParams.get(k) || undefined;
  const rows = await prisma.auditEvent.findMany({
    where: { action: p("action") ? { contains: p("action") } : undefined, outcome: p("outcome"), recordType: p("recordType"), recordId: p("recordId") },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });
  return NextResponse.json({ data: rows, limit: take, offset: skip });
});
