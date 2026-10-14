import { NextResponse } from "next/server";
import { toCsv } from "@/lib/csv";
import { audit } from "@/lib/server/audit";
import { getSessionUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clients = await prisma.client.findMany({ include: { domain: true, technologies: { include: { technology: true } } }, orderBy: { name: "asc" } });
  const csv = toCsv([
    ["name", "domain", "subdomain", "market", "verification_status", "evidence", "technologies", "active", "is_demo", "usage_count"],
    ...clients.map((c) => [c.name, c.domain.key, c.subdomain, c.market, c.verificationStatus, c.evidence, c.technologies.map((t) => t.technology.canonicalName).join("; "), c.active ? "yes" : "no", c.isDemo ? "yes" : "no", c.usageCount]),
  ]);
  await audit(user.id, "client.export", "Client", null);
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="clients.csv"', "Cache-Control": "no-store" } });
}
