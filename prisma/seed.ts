// Seed reference data plus a synthetic demo workspace. Idempotent: safe to run repeatedly.
//   npm run db:seed
// Demo accounts (change or disable before any real use):
//   admin@example.com / reviewer@example.com / creator@example.com / viewer@example.com
//   password: value of SEED_PASSWORD (default "ChangeMe-2026!")
import { PrismaClient } from "@prisma/client";
import { CLIENTS } from "../src/data/clients";
import { DEMO_CANDIDATE, DEMO_CLIENTS } from "../src/data/demo";
import { DOMAINS, ROLES } from "../src/data/domains";
import { TECHNOLOGIES } from "../src/data/technologies";
import { TEMPLATES } from "../src/data/templates";
import { hashPassword } from "../src/lib/server/passwords";

const prisma = new PrismaClient();

function normalizeClientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(demo\)/g, " demo ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(inc|llc|ltd|corp|corporation|co|company|plc|group)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  for (const d of DOMAINS) {
    await prisma.domain.upsert({
      where: { key: d.key },
      create: { key: d.key, name: d.name, aliases: d.aliases, subdomains: d.subdomains, terminology: d.terminology },
      update: { name: d.name, aliases: d.aliases, subdomains: d.subdomains, terminology: d.terminology },
    });
  }
  for (const r of ROLES) {
    await prisma.jobRole.upsert({
      where: { key: r.key },
      create: { key: r.key, name: r.name, aliases: r.aliases, skillCategories: r.skillCategories, summaryFocus: r.summaryFocus, includeQaBullets: r.includeQaBullets },
      update: { name: r.name, aliases: r.aliases, skillCategories: r.skillCategories, summaryFocus: r.summaryFocus, includeQaBullets: r.includeQaBullets },
    });
  }
  for (const t of TECHNOLOGIES) {
    const data = { aliases: t.aliases, category: t.category, roles: t.roles, domains: t.domains, projectTypes: t.projectTypes, availableFrom: t.availableFrom ?? null };
    await prisma.technology.upsert({ where: { canonicalName: t.canonicalName }, create: { canonicalName: t.canonicalName, ...data }, update: data });
  }
  const domainIds = new Map((await prisma.domain.findMany()).map((d) => [d.key, d.id]));
  for (const t of TEMPLATES) {
    const data = {
      domainId: domainIds.get(t.domain)!,
      subdomain: t.subdomain,
      projectPattern: t.projectPattern,
      requiredInputs: ["verified client/employer", "verified dates", "confirmed technologies"],
      optionalInputs: ["candidate responsibilities", "candidate-supplied outcomes"],
      domainBullets: t.domainBullets,
      projectBullets: t.projectBullets,
      supportingBullets: [],
      qaBullets: t.qaBullets,
      excludedClaims: t.excludedClaims,
      terminology: t.terminology,
      suggestedTech: t.suggestedTech,
      lastReviewedAt: new Date("2026-10-14"),
      reviewer: "Seed data (requires administrator review)",
    };
    await prisma.projectTemplate.upsert({ where: { name_version: { name: t.name, version: 1 } }, create: { name: t.name, version: 1, ...data }, update: data });
  }
  for (const c of CLIENTS) {
    const normalizedName = normalizeClientName(c.name);
    await prisma.client.upsert({
      where: { normalizedName },
      create: { name: c.name, normalizedName, domainId: domainIds.get(c.domain)!, subdomain: c.subdomain, market: c.market, verificationStatus: "UNVERIFIED" },
      update: {},
    });
  }
  for (const c of DEMO_CLIENTS) {
    const normalizedName = normalizeClientName(c.name);
    await prisma.client.upsert({
      where: { normalizedName },
      create: { name: c.name, normalizedName, domainId: domainIds.get(c.domain)!, subdomain: c.subdomain, market: "Demo", verificationStatus: "VERIFIED", isDemo: true, evidence: "Fictional organization for demo/sample outputs only", verifiedAt: new Date() },
      update: {},
    });
  }

  const password = await hashPassword(process.env.SEED_PASSWORD ?? "ChangeMe-2026!");
  const users = [
    { email: "admin@example.com", name: "Avery Admin", role: "ADMIN" as const },
    { email: "reviewer@example.com", name: "Riley Reviewer", role: "REVIEWER" as const },
    { email: "creator@example.com", name: "Casey Creator", role: "CREATOR" as const },
    { email: "creator2@example.com", name: "Morgan Creator", role: "CREATOR" as const },
    { email: "viewer@example.com", name: "Val Viewer", role: "READONLY" as const },
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { email: u.email }, create: { ...u, passwordHash: password }, update: {} });
  }

  // Demo candidate owned by the first creator.
  const creator = await prisma.user.findUniqueOrThrow({ where: { email: "creator@example.com" } });
  const existing = await prisma.candidate.findFirst({ where: { fullName: DEMO_CANDIDATE.fullName } });
  if (!existing) {
    const techs = new Map((await prisma.technology.findMany()).map((t) => [t.canonicalName, t.id]));
    const templates = new Map((await prisma.projectTemplate.findMany()).map((t) => [t.name, t.id]));
    const candidate = await prisma.candidate.create({
      data: {
        ownerId: creator.id,
        fullName: DEMO_CANDIDATE.fullName,
        email: DEMO_CANDIDATE.email,
        phone: DEMO_CANDIDATE.phone,
        location: DEMO_CANDIDATE.location,
        targetRole: DEMO_CANDIDATE.roleKey,
        targetTitle: DEMO_CANDIDATE.targetTitle,
        domainKey: DEMO_CANDIDATE.domainKey,
        consentObtainedAt: new Date(),
        notes: "Synthetic demo record.",
        education: { create: DEMO_CANDIDATE.education.map((e) => ({ institution: e.split(" — ")[1] ?? "", qualification: e.split(" — ")[0] })) },
        certifications: { create: DEMO_CANDIDATE.certifications.map((c) => ({ name: c.split(" — ")[0], issuer: c.split(" — ")[1] ?? "" })) },
        skills: { create: DEMO_CANDIDATE.skills.filter((s) => techs.has(s)).map((s) => ({ technologyId: techs.get(s)!, source: "USER_CONFIRMED" })) },
      },
    });
    let position = 1;
    for (const p of DEMO_CANDIDATE.projects) {
      const employment = await prisma.employment.create({
        data: { candidateId: candidate.id, employer: p.employer, location: p.location, title: p.title, startDate: new Date(p.start), endDate: p.end ? new Date(p.end) : null, evidence: "Synthetic demo record", status: "CANDIDATE_CONFIRMED" },
      });
      await prisma.project.create({
        data: {
          candidateId: candidate.id,
          employmentId: employment.id,
          templateId: templates.get(p.templateName) ?? null,
          position: position++,
          title: p.projectTitle,
          role: p.title,
          domainKey: "BANKING",
          subdomain: p.subdomain,
          responsibilities: p.responsibilities,
          outcomes: [],
          startDate: new Date(p.start),
          endDate: p.end ? new Date(p.end) : null,
          clientConfirmed: true,
          technologies: { create: p.technologies.filter((t) => techs.has(t)).map((t) => ({ technologyId: techs.get(t)!, confirmed: true, evidence: "Synthetic demo record" })) },
        },
      });
    }
  }
  const counts = {
    domains: await prisma.domain.count(),
    roles: await prisma.jobRole.count(),
    templates: await prisma.projectTemplate.count(),
    technologies: await prisma.technology.count(),
    clients: await prisma.client.count(),
    users: await prisma.user.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
