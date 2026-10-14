import { DOMAINS, ROLES } from "@/data/domains";
import { DEMO_CANDIDATE } from "@/data/demo";
import { TECHNOLOGIES } from "@/data/technologies";
import { TEMPLATES } from "@/data/templates";
import type { GenerationInput, GenProject, ProjectMode } from "@/lib/generator";
import { Catalog } from "@/lib/text";
import { toDate } from "@/lib/timeline";

export const catalog = new Catalog(TECHNOLOGIES);
export const ASOF = toDate("2026-10-01");

export function categoryOf(name: string): string {
  return catalog.resolve(name)?.category ?? "Other Tools";
}

export function demoInput(overrides: Partial<GenerationInput> = {}, mode: ProjectMode = "STANDARD"): GenerationInput {
  const domain = DOMAINS.find((d) => d.key === "BANKING")!;
  const role = ROLES.find((r) => r.key === "BUSINESS_ANALYST")!;
  const projects: GenProject[] = DEMO_CANDIDATE.projects.map((p, i) => {
    const tpl = TEMPLATES.find((t) => t.name === p.templateName)!;
    return {
      id: `p${i + 1}`,
      position: i + 1,
      title: p.projectTitle,
      client: p.employer,
      clientConfirmed: true,
      clientVerification: "CANDIDATE_CONFIRMED",
      location: p.location,
      role: p.title,
      domainKey: "BANKING",
      subdomain: p.subdomain,
      startDate: p.start,
      endDate: p.end,
      responsibilities: p.responsibilities,
      outcomes: [],
      technologies: p.technologies.map((name) => ({ name, category: categoryOf(name), confirmed: true })),
      template: { name: tpl.name, domainBullets: tpl.domainBullets, projectBullets: tpl.projectBullets, qaBullets: tpl.qaBullets },
    };
  });
  return {
    candidate: { fullName: DEMO_CANDIDATE.fullName, email: DEMO_CANDIDATE.email, phone: DEMO_CANDIDATE.phone, location: DEMO_CANDIDATE.location, linkedin: null, targetTitle: DEMO_CANDIDATE.targetTitle },
    domain: { key: domain.key, name: domain.name, industryPhrase: domain.industryPhrase },
    role,
    seniority: "Senior",
    employments: DEMO_CANDIDATE.projects.map((p) => ({ start: toDate(p.start), end: p.end ? toDate(p.end) : null })),
    projects,
    candidateSkills: DEMO_CANDIDATE.skills.map((name) => ({ name, category: categoryOf(name), confirmed: true })),
    education: DEMO_CANDIDATE.education,
    certifications: DEMO_CANDIDATE.certifications,
    mode,
    pageTarget: 4,
    templateKey: "classic",
    includeHighlights: false,
    isDemo: true,
    asOf: ASOF,
    catalog,
    ...overrides,
  };
}
