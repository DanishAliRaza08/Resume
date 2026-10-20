import { prisma } from "./db";

export async function templateOptions() {
  const rows = await prisma.projectTemplate.findMany({ where: { status: "ACTIVE" }, include: { domain: true }, orderBy: [{ domainId: "asc" }, { name: "asc" }] });
  return rows.map((t) => ({ id: t.id, name: t.name, domainKey: t.domain.key, subdomain: t.subdomain }));
}

export async function techOptions() {
  return prisma.technology.findMany({ where: { lifecycle: { not: "RETIRED" } }, select: { id: true, canonicalName: true, category: true }, orderBy: [{ category: "asc" }, { canonicalName: "asc" }] });
}

/** Client name suggestions: the person's own past clients first, then the shared library (with industry). */
export async function clientNameOptions(candidateId?: string): Promise<{ name: string; hint: string }[]> {
  const [library, employers] = await Promise.all([
    prisma.client.findMany({ where: { active: true, isDemo: false }, select: { name: true, subdomain: true, domain: { select: { name: true } } }, orderBy: { name: "asc" } }),
    candidateId ? prisma.employment.findMany({ where: { candidateId }, select: { employer: true } }) : Promise.resolve([]),
  ]);
  return [
    ...employers.map((e) => ({ name: e.employer, hint: "Used before" })),
    ...library.map((c) => ({ name: c.name, hint: [c.domain.name, c.subdomain].filter(Boolean).join(" · ") })),
  ];
}
