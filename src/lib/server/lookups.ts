import { prisma } from "./db";

export async function templateOptions() {
  const rows = await prisma.projectTemplate.findMany({ where: { status: "ACTIVE" }, include: { domain: true }, orderBy: [{ domainId: "asc" }, { name: "asc" }] });
  return rows.map((t) => ({ id: t.id, name: t.name, domainKey: t.domain.key, subdomain: t.subdomain }));
}

export async function techOptions() {
  const rows = await prisma.technology.findMany({ where: { lifecycle: { not: "RETIRED" } }, select: { id: true, canonicalName: true, category: true, domains: true }, orderBy: [{ category: "asc" }, { canonicalName: "asc" }] });
  return rows.map((t) => ({ ...t, domains: Array.isArray(t.domains) ? (t.domains as string[]) : [] }));
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

/** Client names grouped by industry for the project editor (the person's past clients appear in every list). */
export async function clientsByDomain(candidateId?: string): Promise<{ byDomain: Record<string, string[]>; own: string[] }> {
  const [library, employers] = await Promise.all([
    prisma.client.findMany({ where: { active: true, isDemo: false }, select: { name: true, domain: { select: { key: true } } }, orderBy: { name: "asc" } }),
    candidateId ? prisma.employment.findMany({ where: { candidateId }, select: { employer: true } }) : Promise.resolve([]),
  ]);
  const byDomain: Record<string, string[]> = {};
  for (const c of library) (byDomain[c.domain.key] ??= []).push(c.name);
  return { byDomain, own: [...new Set(employers.map((e) => e.employer))] };
}
