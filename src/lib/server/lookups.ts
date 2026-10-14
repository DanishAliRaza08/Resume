import { prisma } from "./db";

export async function templateOptions() {
  const rows = await prisma.projectTemplate.findMany({ where: { status: "ACTIVE" }, include: { domain: true }, orderBy: [{ domainId: "asc" }, { name: "asc" }] });
  return rows.map((t) => ({ id: t.id, name: t.name, domainKey: t.domain.key, subdomain: t.subdomain }));
}

export async function techOptions() {
  return prisma.technology.findMany({ where: { lifecycle: { not: "RETIRED" } }, select: { id: true, canonicalName: true, category: true }, orderBy: [{ category: "asc" }, { canonicalName: "asc" }] });
}
