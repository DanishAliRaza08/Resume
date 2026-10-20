import { NextResponse } from "next/server";
import { paginate, withApi } from "@/lib/server/api";
import { prisma } from "@/lib/server/db";

// GET /api/clients?q=&domain=&status= — search the client library.
export const GET = withApi(async (req) => {
  const url = new URL(req.url);
  const { take, skip } = paginate(url);
  const q = url.searchParams.get("q");
  const domain = url.searchParams.get("domain");
  const status = url.searchParams.get("status");
  const rows = await prisma.client.findMany({
    where: {
      ...(q ? { name: { contains: q } } : {}),
      ...(domain ? { domain: { key: domain } } : {}),
      ...(status ? { verificationStatus: status as "VERIFIED" } : {}),
    },
    include: { domain: { select: { key: true } }, technologies: { include: { technology: { select: { canonicalName: true } } } } },
    orderBy: { name: "asc" },
    take,
    skip,
  });
  return NextResponse.json({
    data: rows.map((c) => ({ id: c.id, name: c.name, domain: c.domain.key, subdomain: c.subdomain, market: c.market, verificationStatus: c.verificationStatus, isDemo: c.isDemo, active: c.active, technologies: c.technologies.map((t) => t.technology.canonicalName), usageCount: c.usageCount, lastUsedAt: c.lastUsedAt })),
    limit: take,
    offset: skip,
  });
});
