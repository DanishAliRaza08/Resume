import { NextResponse } from "next/server";
import { toCsv } from "@/lib/csv";
import { getSessionUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const techs = await prisma.technology.findMany({ orderBy: [{ category: "asc" }, { canonicalName: "asc" }] });
  const csv = toCsv([
    ["canonical_name", "category", "aliases", "roles", "domains", "available_from", "lifecycle"],
    ...techs.map((t) => [t.canonicalName, t.category, t.aliases.join("; "), t.roles.join("; "), t.domains.join("; "), t.availableFrom, t.lifecycle]),
  ]);
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="technologies.csv"', "Cache-Control": "no-store" } });
}
