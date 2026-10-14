// Deterministic resume generator (spec §6, §10). Builds a structured draft from verified candidate
// facts plus template phrasing. Template phrasing is always flagged `requiresConfirmation`; a
// template can only reference technologies the candidate has confirmed for that project.

import { PROFESSIONALISM_BULLETS, ROLE_PROJECT_BULLETS, SUPPORTING_TOOL_BULLETS } from "@/data/templates";
import type { Bullet, ProjectSection, ResumeContent, SkillRow } from "./resume-schema";
import { firstWord, joinList, shortId, similarity, type Catalog } from "./text";
import { formatYears, totalExperienceMonths, toDate, type Interval } from "./timeline";

export type ProjectMode = "FULL_DETAIL" | "STANDARD" | "CONCISE";

export interface GenTech {
  name: string;
  category: string;
  confirmed: boolean;
}

export interface GenProject {
  id: string;
  position: number;
  title: string;
  client: string;
  clientConfirmed: boolean;
  clientVerification: "UNVERIFIED" | "CANDIDATE_CONFIRMED" | "VERIFIED";
  location: string | null;
  role: string;
  domainKey: string;
  subdomain: string | null;
  startDate: string;
  endDate: string | null;
  responsibilities: string[];
  outcomes: string[];
  technologies: GenTech[];
  template: { name: string; domainBullets: string[]; projectBullets: string[]; qaBullets: string[] } | null;
}

export interface GenerationInput {
  candidate: {
    fullName: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    targetTitle: string | null;
  };
  domain: { key: string; name: string; industryPhrase: string };
  role: { key: string; name: string; skillCategories: string[]; summaryFocus: string[]; includeQaBullets: boolean };
  seniority: string | null;
  employments: Interval[];
  projects: GenProject[];
  candidateSkills: GenTech[];
  education: string[];
  certifications: string[];
  mode: ProjectMode;
  pageTarget: number;
  templateKey: string;
  includeHighlights: boolean;
  isDemo: boolean;
  asOf?: Date;
  /** When provided, template text that mentions an unconfirmed catalog technology is skipped. */
  catalog?: Catalog;
}

export interface GenerationWarning {
  code: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

export interface GenerationResult {
  content: ResumeContent;
  warnings: GenerationWarning[];
}

export const MODE_COUNTS: Record<ProjectMode, { domain: number; project: number; supporting: number; qa: number }> = {
  FULL_DETAIL: { domain: 3, project: 8, supporting: 2, qa: 1 },
  STANDARD: { domain: 2, project: 5, supporting: 1, qa: 1 },
  CONCISE: { domain: 1, project: 3, supporting: 1, qa: 0 },
};

const SUMMARY_OPENINGS = ["Proficient in", "Experienced in", "Skilled in", "Demonstrated expertise in", "Well-versed in", "Adept at"];

const CATEGORY_PHRASES: Record<string, (techs: string) => string> = {
  "Business Analysis": (t) => `${t} to elicit, document, and communicate business and functional requirements`,
  Methodologies: (t) => `delivering projects using ${t} methodologies, adapting the approach to project needs`,
  Databases: (t) => `${t} for data querying, validation, and analysis`,
  "Reporting & BI": (t) => `building reports and dashboards with ${t} to communicate insights to stakeholders`,
  "Data Engineering": (t) => `${t} to support data integration, data quality, and governance`,
  "Domain Platforms": (t) => `${t} within enterprise ${"{domain}"} environments`,
  Cloud: (t) => `${t} for building and operating cloud workloads`,
  Programming: (t) => `${t} for automation and data processing`,
  Integrations: (t) => `${t} for defining and validating system integrations`,
  Testing: (t) => `${t} to validate solutions against business requirements`,
  Deployment: (t) => `${t} for build, release, and deployment automation`,
  "Project Management": (t) => `${t} for planning, tracking, and documenting delivery`,
};

interface Ctx {
  all: Bullet[];
  warnings: GenerationWarning[];
  confirmed: Set<string>;
  catalog?: Catalog;
}

/** Template text may only mention technologies the candidate confirmed (anywhere on the profile). */
function mentionsOnlyConfirmed(text: string, ctx: Ctx): boolean {
  if (!ctx.catalog) return true;
  return ctx.catalog.find(text).every((f) => ctx.confirmed.has(f.entry.canonicalName));
}

function makeBullet(partial: Partial<Bullet> & Pick<Bullet, "text" | "section" | "type" | "source">, seed: string): Bullet {
  return {
    id: shortId("b", seed + partial.text),
    projectId: null,
    action: firstWord(partial.text) || null,
    domainConcept: null,
    technologyRefs: [],
    evidenceRefs: [],
    jdKeywordRefs: [],
    confidence: "medium",
    requiresConfirmation: false,
    confirmed: false,
    ...partial,
  };
}

function isDuplicate(text: string, ctx: Ctx, threshold = 0.5): boolean {
  return ctx.all.some((b) => similarity(b.text, text) >= threshold);
}

function confirmedByCategory(techs: GenTech[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const t of techs) {
    if (!t.confirmed) continue;
    const list = map.get(t.category) ?? [];
    if (!list.includes(t.name)) list.push(t.name);
    map.set(t.category, list);
  }
  return map;
}

/**
 * Resolve placeholders. Returns null when a {tech:Category} placeholder has no confirmed technology,
 * so the bullet is skipped rather than inventing a tool.
 */
export function fillPattern(
  pattern: string,
  vars: { client: string; subdomain: string; byCategory: Map<string, string[]>; rotate?: number },
): { text: string; techs: string[] } | null {
  const used: string[] = [];
  let failed = false;
  const confirmed = new Set([...vars.byCategory.values()].flat());
  const text = pattern.replace(/\{(tech:[^}]+|any:[^}]+|client|subdomain)\}/g, (_m, key: string) => {
    if (key === "client") return vars.client;
    if (key === "subdomain") return vars.subdomain;
    if (key.startsWith("any:")) {
      const pick = key.slice(4).split("|").find((name) => confirmed.has(name));
      if (!pick) failed = true;
      else used.push(pick);
      return pick ?? "";
    }
    const category = key.slice(5);
    const list = vars.byCategory.get(category);
    if (!list?.length) {
      failed = true;
      return "";
    }
    const r = (vars.rotate ?? 0) % list.length;
    const picked = [...list.slice(r), ...list.slice(0, r)].slice(0, 3);
    used.push(...picked);
    return joinList(picked);
  });
  return failed ? null : { text, techs: used };
}

function buildProject(p: GenProject, input: GenerationInput, ctx: Ctx): ProjectSection {
  const counts = MODE_COUNTS[input.mode];
  const byCategory = confirmedByCategory(p.technologies);
  const vars = { client: p.client, subdomain: p.subdomain ?? input.domain.name, byCategory, rotate: p.position };
  const bullets: Bullet[] = [];
  const push = (b: Bullet) => {
    bullets.push(b);
    ctx.all.push(b);
  };
  const seed = `${p.id}:`;

  // 1) Domain bullets (template phrasing → needs confirmation).
  const domainPatterns = p.template?.domainBullets ?? [];
  let domainAdded = 0;
  for (const pattern of domainPatterns) {
    if (domainAdded >= counts.domain) break;
    const filled = fillPattern(pattern, vars);
    if (!filled || isDuplicate(filled.text, ctx) || !mentionsOnlyConfirmed(filled.text, ctx)) continue;
    push(
      makeBullet(
        {
          text: filled.text,
          section: "PROJECT",
          projectId: p.id,
          type: "DOMAIN",
          source: "TEMPLATE",
          domainConcept: p.subdomain,
          technologyRefs: filled.techs,
          evidenceRefs: [`template:${p.template?.name}`],
          requiresConfirmation: true,
          confidence: "low",
        },
        seed + domainAdded,
      ),
    );
    domainAdded++;
  }

  // 2) Project bullets: candidate-supplied facts first (never silently dropped), then template patterns.
  const facts = [...p.responsibilities, ...p.outcomes].map((s) => s.trim()).filter(Boolean);
  for (const fact of facts) {
    const techRefs = p.technologies.filter((t) => t.confirmed && fact.toLowerCase().includes(t.name.toLowerCase())).map((t) => t.name);
    push(
      makeBullet(
        {
          text: /[.!?]$/.test(fact) ? fact : `${fact}.`,
          section: "PROJECT",
          projectId: p.id,
          type: "PROJECT",
          source: "CANDIDATE",
          technologyRefs: techRefs,
          evidenceRefs: [`project:${p.id}`],
          confidence: "high",
          confirmed: true,
        },
        seed + fact,
      ),
    );
  }
  if (facts.length > counts.project) {
    ctx.warnings.push({
      code: "MODE_OVERFLOW",
      severity: "info",
      message: `Project ${p.position} has ${facts.length} candidate-supplied bullets, more than the ${input.mode} target of ${counts.project}. All were kept; trim manually if needed.`,
    });
  }
  const rolePatterns = ROLE_PROJECT_BULLETS[input.role.key];
  const projectPatterns = rolePatterns ? [...rolePatterns, ...(p.template?.projectBullets ?? [])] : p.template?.projectBullets ?? [];
  let projectCount = facts.length;
  for (const pattern of projectPatterns) {
    if (projectCount >= counts.project) break;
    const filled = fillPattern(pattern, vars);
    if (!filled || isDuplicate(filled.text, ctx) || !mentionsOnlyConfirmed(filled.text, ctx)) continue;
    push(
      makeBullet(
        {
          text: filled.text,
          section: "PROJECT",
          projectId: p.id,
          type: "PROJECT",
          source: "TEMPLATE",
          technologyRefs: filled.techs,
          evidenceRefs: [`template:${p.template?.name ?? input.role.key}`, ...filled.techs.map((t) => `tech:${t}`)],
          requiresConfirmation: true,
          confidence: filled.techs.length ? "medium" : "low",
        },
        seed + pattern,
      ),
    );
    projectCount++;
  }
  if (projectCount < counts.project) {
    ctx.warnings.push({
      code: "THIN_PROJECT",
      severity: "info",
      message: `Project ${p.position} has ${projectCount} project bullets (target ${counts.project}). Add candidate responsibilities or confirm more technologies rather than padding.`,
    });
  }

  // 3) Supporting-tool bullets built from confirmed PM/methodology tools.
  let supporting = 0;
  for (let k = 0; k < SUPPORTING_TOOL_BULLETS.length && supporting < counts.supporting; k++) {
    const pattern = SUPPORTING_TOOL_BULLETS[(k + p.position * 2) % SUPPORTING_TOOL_BULLETS.length];
    const filled = fillPattern(pattern, vars);
    if (!filled || isDuplicate(filled.text, ctx, 0.5) || !mentionsOnlyConfirmed(filled.text, ctx)) continue;
    push(
      makeBullet(
        {
          text: filled.text,
          section: "PROJECT",
          projectId: p.id,
          type: "SUPPORTING_TOOL",
          source: "TOOL",
          technologyRefs: filled.techs,
          evidenceRefs: filled.techs.map((t) => `tech:${t}`),
          confidence: "medium",
        },
        seed + "tool" + k,
      ),
    );
    supporting++;
  }

  // 4) QA / validation bullet.
  if (input.role.includeQaBullets && counts.qa > 0) {
    const qaPatterns = p.template?.qaBullets ?? [];
    for (let k = 0; k < qaPatterns.length; k++) {
      const filled = fillPattern(qaPatterns[(k + p.position) % qaPatterns.length], vars);
      if (!filled || isDuplicate(filled.text, ctx) || !mentionsOnlyConfirmed(filled.text, ctx)) continue;
      push(
        makeBullet(
          {
            text: filled.text,
            section: "PROJECT",
            projectId: p.id,
            type: "QA",
            source: "TEMPLATE",
            technologyRefs: filled.techs,
            evidenceRefs: [`template:${p.template?.name}`],
            requiresConfirmation: true,
            confidence: "low",
          },
          seed + "qa" + k,
        ),
      );
      break;
    }
  }

  return {
    id: p.id,
    position: p.position,
    title: p.title,
    client: p.client,
    clientConfirmed: p.clientConfirmed,
    clientVerification: p.clientVerification,
    location: p.location,
    role: p.role,
    domainKey: p.domainKey,
    subdomain: p.subdomain,
    startDate: p.startDate,
    endDate: p.endDate,
    technologies: p.technologies.filter((t) => t.confirmed).map((t) => t.name),
    bullets,
  };
}

function buildSummary(input: GenerationInput, projects: ProjectSection[], allTechs: GenTech[], months: number, ctx: Ctx): Bullet[] {
  const summary: Bullet[] = [];
  const push = (b: Bullet) => {
    summary.push(b);
    ctx.all.push(b);
  };
  const subdomains = [...new Set(projects.map((p) => p.subdomain).filter((s): s is string => !!s))].slice(0, 3);
  const seniority = input.seniority && input.seniority !== "Mid-level" ? `${input.seniority} ` : "";
  push(
    makeBullet(
      {
        text: `${seniority}${input.role.name} with ${formatYears(months)} years of experience in the ${input.domain.industryPhrase} industry${
          subdomains.length ? `, specializing in ${joinList(subdomains)}` : ""
        }.`,
        section: "SUMMARY",
        type: "PRIMARY",
        source: "CANDIDATE",
        evidenceRefs: ["employment:total"],
        confidence: "high",
        confirmed: true,
      },
      "sum0",
    ),
  );

  const byCategory = confirmedByCategory(allTechs);
  const categories = [...input.role.skillCategories, "Domain Platforms"].filter((c, i, a) => a.indexOf(c) === i && byCategory.has(c));
  let opening = 0;
  for (const category of categories) {
    if (summary.length >= 5) break;
    const phrase = CATEGORY_PHRASES[category];
    if (!phrase) continue;
    const techs = byCategory.get(category)!.slice(0, 4);
    const body = phrase(joinList(techs)).replace("{domain}", input.domain.name);
    const text = `${SUMMARY_OPENINGS[opening % SUMMARY_OPENINGS.length]} ${body}.`;
    opening++;
    push(
      makeBullet(
        {
          text,
          section: "SUMMARY",
          type: "PRIMARY",
          source: "TOOL",
          technologyRefs: techs,
          evidenceRefs: techs.map((t) => `tech:${t}`),
          confidence: "medium",
        },
        "sum" + category,
      ),
    );
  }
  // Fall back to role focus areas (template phrasing) only when evidence-backed bullets are too few.
  for (const focus of input.role.summaryFocus) {
    if (summary.length >= 5) break;
    const text = `${SUMMARY_OPENINGS[opening % SUMMARY_OPENINGS.length]} ${focus} across ${input.domain.name} initiatives.`;
    opening++;
    if (isDuplicate(text, ctx) || !mentionsOnlyConfirmed(text, ctx)) continue;
    push(
      makeBullet(
        { text, section: "SUMMARY", type: "PRIMARY", source: "TEMPLATE", requiresConfirmation: true, confidence: "low" },
        "sumf" + focus,
      ),
    );
  }

  // Optional highlights: only candidate-supplied outcomes, which add information beyond project duties.
  if (input.includeHighlights) {
    const outcomes = input.projects.flatMap((p) => p.outcomes.map((o) => ({ o, p }))).slice(0, 8);
    if (outcomes.length < 6) {
      ctx.warnings.push({
        code: "FEW_HIGHLIGHTS",
        severity: "info",
        message: `Only ${outcomes.length} candidate-supplied outcomes are available for project highlights (6–8 requested). Highlights are never invented.`,
      });
    }
    for (const { o, p } of outcomes) {
      push(
        makeBullet(
          {
            text: /[.!?]$/.test(o) ? o : `${o}.`,
            section: "SUMMARY",
            type: "HIGHLIGHT",
            source: "CANDIDATE",
            evidenceRefs: [`project:${p.id}`],
            confidence: "high",
            confirmed: true,
          },
          "hl" + o,
        ),
      );
    }
  }

  // QA bullets (2) when the role calls for them and testing evidence exists.
  if (input.role.includeQaBullets) {
    const testing = byCategory.get("Testing") ?? [];
    if (testing.length) {
      const t = testing.slice(0, 4);
      push(
        makeBullet(
          {
            text: `Experienced in ${joinList(t)}, including planning, coordination, and support for business users to confirm solutions are fit for purpose.`,
            section: "SUMMARY",
            type: "QA",
            source: "TOOL",
            technologyRefs: t,
            evidenceRefs: t.map((x) => `tech:${x}`),
          },
          "sumqa1",
        ),
      );
      const qa2 = "Collaborates with QA teams by reviewing test plans and test cases, participating in defect triage, and maintaining requirement traceability.";
      if (mentionsOnlyConfirmed(qa2, ctx)) {
        push(makeBullet({ text: qa2, section: "SUMMARY", type: "QA", source: "TEMPLATE", requiresConfirmation: true, confidence: "low" }, "sumqa2"));
      }
    } else {
      ctx.warnings.push({
        code: "NO_QA_EVIDENCE",
        severity: "info",
        message: "No confirmed testing tools/practices; QA summary bullets were omitted.",
      });
    }
  }

  const prof = PROFESSIONALISM_BULLETS[input.candidate.fullName.length % PROFESSIONALISM_BULLETS.length];
  push(makeBullet({ text: prof, section: "SUMMARY", type: "PROFESSIONALISM", source: "TEMPLATE", confidence: "medium" }, "prof"));
  return summary;
}

function buildSkills(input: GenerationInput, projects: GenProject[], allTechs: GenTech[]): SkillRow[] {
  const byCategory = confirmedByCategory(allTechs);
  const rows: SkillRow[] = [];
  const subdomains = [...new Set(projects.map((p) => p.subdomain).filter((s): s is string => !!s))];
  for (const category of [...input.role.skillCategories, "Domain Platforms"]) {
    if (rows.some((r) => r.category === category)) continue;
    if (category === "Domain Knowledge") {
      if (subdomains.length) rows.push({ category, values: [input.domain.industryPhrase, ...subdomains] });
      continue;
    }
    const values = byCategory.get(category);
    if (values?.length) rows.push({ category, values });
  }
  // Confirmed technologies in categories the role does not list still belong somewhere.
  const listed = new Set(rows.flatMap((r) => r.values));
  const other = allTechs.filter((t) => t.confirmed && !listed.has(t.name)).map((t) => t.name);
  const uniqueOther = [...new Set(other)];
  if (uniqueOther.length) rows.push({ category: "Other Tools", values: uniqueOther });
  return rows;
}

export function generateResume(input: GenerationInput): GenerationResult {
  const confirmed = new Set<string>(
    [...input.projects.flatMap((p) => p.technologies), ...input.candidateSkills].filter((t) => t.confirmed).map((t) => t.name),
  );
  const ctx: Ctx = { all: [], warnings: [], confirmed, catalog: input.catalog };
  const asOf = input.asOf;
  const months = totalExperienceMonths(input.employments, asOf);
  const sorted = [...input.projects].sort((a, b) => a.position - b.position);
  if (sorted.length !== 5) {
    ctx.warnings.push({
      code: "PROJECT_COUNT",
      severity: "info",
      message: `${sorted.length} project(s) configured; the standard format uses five. Use only real projects.`,
    });
  }
  for (const p of sorted) {
    const unconfirmed = p.technologies.filter((t) => !t.confirmed).map((t) => t.name);
    if (unconfirmed.length) {
      ctx.warnings.push({
        code: "UNCONFIRMED_TECH",
        severity: "warning",
        message: `Project ${p.position}: ${joinList(unconfirmed)} not confirmed by the candidate and excluded from the draft.`,
      });
    }
    if (!p.clientConfirmed) {
      ctx.warnings.push({
        code: "CLIENT_UNCONFIRMED",
        severity: "critical",
        message: `Project ${p.position}: the relationship with ${p.client} has not been confirmed by the candidate.`,
      });
    }
  }
  const projects = sorted.map((p) => buildProject(p, input, ctx));
  const allTechs = [...sorted.flatMap((p) => p.technologies), ...input.candidateSkills];
  const summary = buildSummary(input, projects, allTechs, months, ctx);
  // Summary should come first in the output even though projects were built first (for de-duplication priority of facts).
  const skills = buildSkills(input, sorted, allTechs);

  const title = input.candidate.targetTitle || `${input.seniority && input.seniority !== "Mid-level" ? input.seniority + " " : ""}${input.role.name}`;
  const content: ResumeContent = {
    header: {
      fullName: input.candidate.fullName,
      title,
      email: input.candidate.email,
      phone: input.candidate.phone,
      location: input.candidate.location,
      linkedin: input.candidate.linkedin,
    },
    meta: {
      domainKey: input.domain.key,
      roleKey: input.role.key,
      seniority: input.seniority,
      totalExperienceMonths: months,
      projectMode: input.mode,
      pageTarget: input.pageTarget,
      templateKey: input.templateKey,
      isDemo: input.isDemo,
      generator: "deterministic-v1",
    },
    summary,
    projects,
    skills,
    education: input.education,
    certifications: input.certifications,
    extraSections: [],
  };
  // Ensure chronological sanity of projects (newest first) for display.
  content.projects.sort((a, b) => toDate(b.startDate).getTime() - toDate(a.startDate).getTime());
  return { content, warnings: ctx.warnings };
}
