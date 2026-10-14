import { NextResponse } from "next/server";
import { csvRecords } from "@/lib/csv";
import { apiError, withApi } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { prisma } from "@/lib/server/db";
import { assertCan } from "@/lib/server/permissions";
import { normalizeClientName } from "@/lib/server/resume-service";

// POST /api/clients/import — text/csv body with columns name,domain,subdomain,market,evidence.
export const POST = withApi(async (req, user) => {
  await assertCan(user, "library:edit", "Client");
  const text = await req.text();
  if (text.length > 2 * 1024 * 1024) return apiError(413, "too_large", "CSV must be under 2 MB.");
  const domains = new Map((await prisma.domain.findMany()).map((d) => [d.key, d.id]));
  const result = { created: 0, skipped: 0, errors: [] as { row: number; message: string }[] };
  for (const [i, r] of csvRecords(text).entries()) {
    const domainId = domains.get((r.domain ?? "").toUpperCase());
    if (!r.name || !domainId) {
      result.errors.push({ row: i + 2, message: "name and a valid domain key are required" });
      continue;
    }
    const normalizedName = normalizeClientName(r.name);
    if (await prisma.client.findUnique({ where: { normalizedName } })) {
      result.skipped++;
      continue;
    }
    await prisma.client.create({ data: { name: r.name, normalizedName, domainId, subdomain: r.subdomain || null, market: r.market || null, evidence: r.evidence || null, verificationStatus: "UNVERIFIED" } });
    result.created++;
  }
  await audit(user.id, "client.import", "Client", null, "SUCCESS", { created: result.created, skipped: result.skipped, errors: result.errors.length, via: "api" });
  return NextResponse.json({ data: result });
});
