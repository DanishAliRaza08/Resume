// JD analysis and resume tailoring (spec §9): requirement extraction and classification, keyword
// normalization, evidence matching, transparent coverage scoring and traceable edit suggestions.

import { DOMAINS } from "@/data/domains";
import type { Bullet, ResumeContent } from "./resume-schema";
import { allBullets } from "./resume-schema";
import { Catalog, normalizeName, shortId, termRegex, tokens } from "./text";

export type RequirementCategory = "MUST_HAVE" | "PREFERRED" | "DOMAIN" | "RESPONSIBILITY" | "QUALIFICATION" | "METHODOLOGY";
export type MatchState = "SUPPORTED" | "PARTIAL" | "MISSING" | "NEEDS_CONFIRMATION";

export const CATEGORY_WEIGHTS: Record<RequirementCategory, number> = {
  MUST_HAVE: 3,
  DOMAIN: 2,
  RESPONSIBILITY: 2,
  PREFERRED: 1.5,
  METHODOLOGY: 1,
  QUALIFICATION: 1,
};

export interface ExtractedRequirement {
  keyword: string; // surface form in the JD
  canonical: string; // normalized/canonical form
  technologyName: string | null; // catalog canonical name when the requirement is a technology
  techCategory: string | null;
  category: RequirementCategory;
  weight: number;
  required: boolean;
  sourceLine: string;
  minYears?: number;
}

const RESPONSIBILITY_TERMS = [
  "requirements gathering", "requirements elicitation", "stakeholder management", "gap analysis", "process mapping",
  "process improvement", "data analysis", "data mapping", "data validation", "data quality", "data migration",
  "impact analysis", "root cause analysis", "user acceptance testing", "test planning", "test cases", "defect management",
  "backlog management", "backlog grooming", "sprint planning", "user stories", "acceptance criteria", "use cases",
  "business requirements", "functional requirements", "functional specifications", "workflow analysis", "dashboards",
  "reporting", "documentation", "change management", "risk management", "vendor management", "release management",
  "production support", "training", "cost-benefit analysis", "feasibility analysis", "process documentation",
  "solution design", "system integration", "requirements traceability", "wireframes", "kpis", "data governance",
  "infrastructure as code", "monitoring", "incident management", "test automation", "regression testing", "api testing",
  "budget management", "resource planning", "status reporting",
];

const QUALIFICATION_TERMS = [
  "bachelor's degree", "bachelors degree", "bachelor", "master's degree", "masters degree", "mba", "computer science",
  "cbap", "ccba", "pmp", "csm", "certified scrum master", "psm", "safe agilist", "pmi-acp", "istqb", "six sigma green belt",
  "aws certified", "aws solutions architect", "itil certification", "security clearance",
];

type SectionKind = "REQUIRED" | "PREFERRED" | "RESPONSIBILITIES" | "EDUCATION" | "OTHER";

function sectionOf(line: string): SectionKind | null {
  const trimmed = line.trim();
  // Headings are short and are not sentences ("Hands-on experience with X." is a requirement, not a heading).
  if (/[.;,]$/.test(trimmed) || trimmed.split(/\s+/).length > (trimmed.endsWith(":") ? 8 : 5)) return null;
  const l = trimmed.toLowerCase().replace(/[:*#•\-–]+/g, " ").trim();
  if (l.length > 60) return null;
  if (/(preferred|nice to have|nice-to-have|bonus|desired|pluses|good to have)/.test(l)) return "PREFERRED";
  if (/(responsibilit|duties|what you('|’)?ll do|what you will do|day to day|role overview|the role|job description)/.test(l)) return "RESPONSIBILITIES";
  if (/(education|certification)/.test(l)) return "EDUCATION";
  if (/(requirement|qualification|must have|must-have|required|what you bring|skills|experience|who you are|about you)/.test(l)) return "REQUIRED";
  return null;
}

function isInlinePreferred(line: string): boolean {
  return /(preferred|nice to have|a plus|is a plus|bonus|desirable|familiarity with)/i.test(line);
}

export function splitLines(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/\n|(?<=[.;])\s+(?=[A-Z•\-])/)
    .map((l) => l.replace(/^[\s•\-*–·▪●]+/, "").trim())
    .filter(Boolean);
}

export function extractRequirements(text: string, catalog: Catalog): ExtractedRequirement[] {
  const found = new Map<string, ExtractedRequirement>();
  const add = (r: ExtractedRequirement) => {
    const key = `${r.technologyName ?? r.canonical}`;
    const prev = found.get(key);
    if (!prev || r.weight > prev.weight) found.set(key, r);
  };
  let section: SectionKind = "OTHER";
  // Use the JD's own domain vocabulary when it can be detected, to avoid cross-domain false hits.
  const jdDomain = detectDomain(text);
  const domainTerms = DOMAINS.filter((d) => !jdDomain || d.key === jdDomain).flatMap((d) => d.terminology.map((t) => ({ term: t, domain: d.key })));

  for (const line of splitLines(text)) {
    const heading = sectionOf(line);
    if (heading) {
      section = heading;
      continue;
    }
    const preferred = section === "PREFERRED" || isInlinePreferred(line);

    for (const { entry, matched } of catalog.find(line)) {
      const methodology = entry.category === "Methodologies";
      const category: RequirementCategory = methodology ? "METHODOLOGY" : preferred ? "PREFERRED" : "MUST_HAVE";
      add({
        keyword: matched,
        canonical: entry.canonicalName,
        technologyName: entry.canonicalName,
        techCategory: entry.category,
        category,
        weight: CATEGORY_WEIGHTS[category] * (methodology && !preferred ? 1.5 : 1),
        required: !preferred,
        sourceLine: line.slice(0, 300),
      });
    }
    const lower = ` ${line.toLowerCase()} `;
    for (const { term } of domainTerms) {
      if (termRegex(term).test(lower) && !catalog.resolve(term)) {
        add({ keyword: term, canonical: normalizeName(term), technologyName: null, techCategory: null, category: "DOMAIN", weight: CATEGORY_WEIGHTS.DOMAIN * (preferred ? 0.5 : 1), required: !preferred, sourceLine: line.slice(0, 300) });
      }
    }
    for (const term of RESPONSIBILITY_TERMS) {
      if (termRegex(term).test(lower) && !catalog.resolve(term)) {
        add({ keyword: term, canonical: normalizeName(term), technologyName: null, techCategory: null, category: "RESPONSIBILITY", weight: CATEGORY_WEIGHTS.RESPONSIBILITY * (preferred ? 0.5 : 1), required: !preferred, sourceLine: line.slice(0, 300) });
      }
    }
    for (const term of QUALIFICATION_TERMS) {
      if (termRegex(term).test(lower)) {
        add({ keyword: term, canonical: normalizeName(term), technologyName: null, techCategory: null, category: "QUALIFICATION", weight: CATEGORY_WEIGHTS.QUALIFICATION, required: !preferred, sourceLine: line.slice(0, 300) });
      }
    }
    const years = /(\d{1,2})\s*\+?\s*(?:or more\s+)?years?/i.exec(line);
    if (years && /experience/i.test(line)) {
      const n = Number(years[1]);
      if (n > 0 && n < 40) {
        add({ keyword: `${n}+ years experience`, canonical: `min-years-${n}`, technologyName: null, techCategory: null, category: "QUALIFICATION", weight: CATEGORY_WEIGHTS.QUALIFICATION, required: !preferred, sourceLine: line.slice(0, 300), minYears: n });
      }
    }
  }
  // Keep only the strongest "min years" requirement.
  const yearsReqs = [...found.values()].filter((r) => r.minYears);
  if (yearsReqs.length > 1) {
    const max = yearsReqs.reduce((a, b) => ((a.minYears ?? 0) >= (b.minYears ?? 0) ? a : b));
    for (const r of yearsReqs) if (r !== max) found.delete(r.canonical);
  }
  // Drop non-technology terms that are contained in a longer extracted term ("bachelor" ⊂ "bachelor's degree").
  const nonTech = [...found.values()].filter((r) => !r.technologyName);
  for (const r of nonTech) {
    if (nonTech.some((o) => o !== r && o.keyword.length > r.keyword.length && termRegex(r.keyword).test(o.keyword))) found.delete(r.canonical);
  }
  return [...found.values()].sort((a, b) => b.weight - a.weight || a.keyword.localeCompare(b.keyword));
}

/** Detect the likely domain/role of a JD to pre-fill the analyzer. */
export function detectDomain(text: string): string | null {
  const lower = text.toLowerCase();
  let best: { key: string; score: number } | null = null;
  for (const d of DOMAINS) {
    const score = [...d.terminology, ...d.aliases].reduce((s, t) => s + (termRegex(t).test(lower) ? 1 : 0), 0);
    if (!best || score > best.score) best = { key: d.key, score };
  }
  return best && best.score > 0 ? best.key : null;
}

// ---------------------------------------------------------------------------------------------
// Evidence matching
// ---------------------------------------------------------------------------------------------

export interface Evidence {
  /** Confirmed technology → evidence references (e.g. "project:<id>", "skill:profile"). */
  confirmedTechs: Map<string, string[]>;
  /** Technologies the candidate explicitly confirmed during JD review (provenance retained). */
  userConfirmed: Set<string>;
  education: string[];
  certifications: string[];
  totalExperienceMonths: number;
}

export interface RequirementMatch {
  requirementKey: string;
  state: MatchState;
  evidenceRefs: string[];
  explanation: string;
}

function bulletIsEvidence(b: Bullet): boolean {
  return b.confirmed || b.source === "CANDIDATE" || b.source === "RESUME_IMPORT" || b.source === "USER_EDIT";
}

export function requirementKey(r: { technologyName: string | null; canonical: string }): string {
  return r.technologyName ?? r.canonical;
}

export function matchRequirements(reqs: ExtractedRequirement[], content: ResumeContent, evidence: Evidence, catalog: Catalog): RequirementMatch[] {
  const bullets = allBullets(content);
  const evidenceBullets = bullets.filter(bulletIsEvidence);
  const unconfirmedBullets = bullets.filter((b) => !bulletIsEvidence(b));
  const projectOf = (b: Bullet) => (b.projectId ? `project:${b.projectId}` : "summary");
  const skillsText = content.skills.map((r) => r.values.join(", ")).join("; ");

  return reqs.map((r) => {
    const key = requirementKey(r);
    if (r.technologyName) {
      const name = r.technologyName;
      if (evidence.userConfirmed.has(name)) {
        return { requirementKey: key, state: "SUPPORTED", evidenceRefs: ["jd-confirmation"], explanation: `${name} was confirmed by the user during JD review.` };
      }
      const refs = evidence.confirmedTechs.get(name);
      if (refs?.length) {
        return { requirementKey: key, state: "SUPPORTED", evidenceRefs: refs, explanation: `${name} is a confirmed technology (${refs.length} reference${refs.length > 1 ? "s" : ""}).` };
      }
      const inBullets = evidenceBullets.filter((b) => catalog.mentions(b.text, name));
      if (inBullets.length) {
        return { requirementKey: key, state: "SUPPORTED", evidenceRefs: [...new Set(inBullets.map(projectOf))], explanation: `${name} appears in evidence-backed bullets.` };
      }
      if (catalog.mentions(skillsText, name) || unconfirmedBullets.some((b) => catalog.mentions(b.text, name))) {
        return { requirementKey: key, state: "NEEDS_CONFIRMATION", evidenceRefs: [], explanation: `${name} is listed but has no project-level evidence. Ask the candidate to confirm where it was used.` };
      }
      const related = [...evidence.confirmedTechs.keys()].filter((t) => catalog.resolve(t)?.category === r.techCategory && r.techCategory !== "Methodologies");
      if (related.length && r.techCategory !== null) {
        return { requirementKey: key, state: "PARTIAL", evidenceRefs: related.slice(0, 3).map((t) => `tech:${t}`), explanation: `No direct ${name} evidence; related ${r.techCategory} experience: ${related.slice(0, 3).join(", ")}. Confirm before adding.` };
      }
      return { requirementKey: key, state: "MISSING", evidenceRefs: [], explanation: `No evidence of ${name}. Not inserted; shown as a development gap.` };
    }

    if (r.minYears) {
      const years = Math.floor(evidence.totalExperienceMonths / 12);
      return years >= r.minYears
        ? { requirementKey: key, state: "SUPPORTED", evidenceRefs: ["employment:total"], explanation: `${years} year(s) of verified experience.` }
        : { requirementKey: key, state: "MISSING", evidenceRefs: [], explanation: `${years} year(s) verified; JD asks for ${r.minYears}+.` };
    }

    if (r.category === "QUALIFICATION") {
      const hay = [...evidence.education, ...evidence.certifications].join(" ; ");
      const hit = termRegex(r.keyword).test(hay) || (r.keyword.includes("bachelor") && /bachelor|b\.?s\.?|b\.?a\.?|b\.?tech|b\.?e\./i.test(hay)) || (r.keyword.includes("master") && /master|m\.?s\.?|m\.?tech|mba/i.test(hay));
      return hit
        ? { requirementKey: key, state: "SUPPORTED", evidenceRefs: ["education/certification"], explanation: `Found on the candidate's education/certification records.` }
        : { requirementKey: key, state: "MISSING", evidenceRefs: [], explanation: `Not on the candidate's records. Credentials are never added without evidence.` };
    }

    const rx = termRegex(r.keyword);
    const direct = evidenceBullets.filter((b) => rx.test(b.text));
    if (direct.length) {
      return { requirementKey: key, state: "SUPPORTED", evidenceRefs: [...new Set(direct.map(projectOf))].slice(0, 5), explanation: `"${r.keyword}" appears in evidence-backed content.` };
    }
    if (unconfirmedBullets.some((b) => rx.test(b.text))) {
      return { requirementKey: key, state: "NEEDS_CONFIRMATION", evidenceRefs: [], explanation: `"${r.keyword}" appears only in unconfirmed template wording.` };
    }
    const termTokens = tokens(r.keyword);
    const partial = evidenceBullets.filter((b) => {
      const bt = new Set(tokens(b.text));
      const hits = termTokens.filter((t) => bt.has(t)).length;
      return termTokens.length > 1 && hits / termTokens.length >= 0.5;
    });
    if (partial.length) {
      return { requirementKey: key, state: "PARTIAL", evidenceRefs: [...new Set(partial.map(projectOf))].slice(0, 3), explanation: `Related wording found but not "${r.keyword}" itself.` };
    }
    return { requirementKey: key, state: "MISSING", evidenceRefs: [], explanation: `No evidence of "${r.keyword}".` };
  });
}

export interface CoverageScore {
  score: number; // 0-100
  supported: number;
  partial: number;
  missing: number;
  needsConfirmation: number;
  userConfirmed: number;
  byCategory: Record<string, { weight: number; earned: number }>;
}

const CREDIT: Record<MatchState, number> = { SUPPORTED: 1, PARTIAL: 0.5, NEEDS_CONFIRMATION: 0.25, MISSING: 0 };

/** Transparent weighted coverage — a diagnostic aid, not a prediction of ATS ranking or hiring outcomes. */
export function coverageScore(reqs: ExtractedRequirement[], matches: RequirementMatch[]): CoverageScore {
  const byKey = new Map(matches.map((m) => [m.requirementKey, m]));
  let total = 0;
  let earned = 0;
  const out: CoverageScore = { score: 0, supported: 0, partial: 0, missing: 0, needsConfirmation: 0, userConfirmed: 0, byCategory: {} };
  for (const r of reqs) {
    const m = byKey.get(requirementKey(r));
    if (!m) continue;
    total += r.weight;
    earned += r.weight * CREDIT[m.state];
    const cat = (out.byCategory[r.category] ??= { weight: 0, earned: 0 });
    cat.weight += r.weight;
    cat.earned += r.weight * CREDIT[m.state];
    if (m.state === "SUPPORTED") out.supported++;
    if (m.state === "PARTIAL") out.partial++;
    if (m.state === "MISSING") out.missing++;
    if (m.state === "NEEDS_CONFIRMATION") out.needsConfirmation++;
    if (m.evidenceRefs.includes("jd-confirmation")) out.userConfirmed++;
  }
  out.score = total ? Math.round((earned / total) * 100) : 0;
  return out;
}

// ---------------------------------------------------------------------------------------------
// Edit suggestions
// ---------------------------------------------------------------------------------------------

export interface Suggestion {
  key: string;
  section: "SUMMARY" | "PROJECT" | "SKILLS";
  projectRef: string | null;
  originalText: string | null;
  proposedText: string;
  skillCategory?: string;
  jdKeywordRefs: string[];
  evidenceRefs: string[];
  requiresConfirmation: boolean;
  rationale: string;
}

const PROJECT_TECH_PHRASES: Record<string, (t: string) => string> = {
  Databases: (t) => `Used ${t} to query, analyze, and validate project data.`,
  "Reporting & BI": (t) => `Built reports and dashboards in ${t} for project stakeholders.`,
  "Project Management": (t) => `Tracked requirements, tasks, and delivery progress in ${t}.`,
  Testing: (t) => `Performed ${t} activities to validate delivered functionality against requirements.`,
  Cloud: (t) => `Worked with ${t} services supporting project workloads.`,
  "Domain Platforms": (t) => `Delivered requirements and enhancements within ${t}.`,
  Integrations: (t) => `Defined and validated system integrations using ${t}.`,
  Programming: (t) => `Developed ${t} scripts to automate analysis and validation tasks.`,
  "Data Engineering": (t) => `Supported data integration and quality activities using ${t}.`,
  "Business Analysis": (t) => `Produced ${t} deliverables to document and communicate requirements.`,
  Deployment: (t) => `Used ${t} to support build and release activities.`,
};

export function buildSuggestions(reqs: ExtractedRequirement[], matches: RequirementMatch[], content: ResumeContent, evidence: Evidence, catalog: Catalog): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const byKey = new Map(matches.map((m) => [m.requirementKey, m]));
  const bullets = allBullets(content);
  const resumeText = bullets.map((b) => b.text).join("\n");
  const summaryText = content.summary.map((b) => b.text).join("\n");
  const skillsValues = new Set(content.skills.flatMap((r) => r.values.map((v) => catalog.resolve(v)?.canonicalName ?? v)));
  const domainName = DOMAINS.find((d) => d.key === content.meta.domainKey)?.name ?? "industry";

  const supportedTech = reqs.filter((r) => r.technologyName && byKey.get(requirementKey(r))?.state === "SUPPORTED");
  const rewordedBullets = new Set<string>(); // at most one wording change per bullet so edits never conflict

  for (const r of supportedTech) {
    const name = r.technologyName!;
    const m = byKey.get(requirementKey(r))!;
    // (a) Normalize wording: an evidence bullet uses a different alias than the JD.
    for (const b of bullets) {
      if (rewordedBullets.has(b.id)) continue;
      const hit = catalog.find(b.text).find((f) => f.entry.canonicalName === name);
      if (hit && normalizeName(hit.matched) !== normalizeName(r.keyword) && normalizeName(r.keyword) !== "") {
        rewordedBullets.add(b.id);
        suggestions.push({
          key: shortId("sg", `alias:${b.id}:${name}`),
          section: b.section === "SUMMARY" ? "SUMMARY" : "PROJECT",
          projectRef: b.projectId,
          originalText: b.text,
          proposedText: b.text.replace(hit.matched, r.keyword),
          jdKeywordRefs: [r.keyword],
          evidenceRefs: [`bullet:${b.id}`],
          requiresConfirmation: false,
          rationale: `Use the JD's wording "${r.keyword}" for ${name} (same technology).`,
        });
        break;
      }
    }
    // (b) Supported but never mentioned in bullet text → propose a bullet in the project that used it.
    if (!catalog.mentions(resumeText, name)) {
      const projectRef = m.evidenceRefs.find((e) => e.startsWith("project:"))?.slice(8);
      const project = content.projects.find((p) => p.id === projectRef) ?? content.projects.find((p) => p.technologies.includes(name));
      if (project) {
        const phrase = (PROJECT_TECH_PHRASES[r.techCategory ?? ""] ?? ((t: string) => `Applied ${t} in project delivery.`))(r.keyword);
        suggestions.push({
          key: shortId("sg", `addbullet:${project.id}:${name}`),
          section: "PROJECT",
          projectRef: project.id,
          originalText: null,
          proposedText: phrase,
          jdKeywordRefs: [r.keyword],
          evidenceRefs: [`project:${project.id}`, `tech:${name}`],
          requiresConfirmation: true,
          rationale: `${name} is confirmed on "${project.title}" but not described. Confirm the activity wording is accurate.`,
        });
      }
    }
    // (c) Supported technology missing from the Technical Skills table.
    if (!skillsValues.has(name)) {
      suggestions.push({
        key: shortId("sg", `skill:${name}`),
        section: "SKILLS",
        projectRef: null,
        originalText: null,
        proposedText: name,
        skillCategory: r.techCategory ?? "Other Tools",
        jdKeywordRefs: [r.keyword],
        evidenceRefs: m.evidenceRefs,
        requiresConfirmation: false,
        rationale: `${name} is supported by evidence but missing from Technical Skills.`,
      });
    }
  }

  // (d) Summary bullet surfacing must-have supported technologies not yet in the summary.
  const surface = supportedTech.filter((r) => r.category === "MUST_HAVE" && !catalog.mentions(summaryText, r.technologyName!)).slice(0, 4);
  if (surface.length >= 2) {
    const names = surface.map((r) => r.keyword);
    suggestions.push({
      key: shortId("sg", `summary:${names.join(",")}`),
      section: "SUMMARY",
      projectRef: null,
      originalText: null,
      proposedText: `Hands-on experience with ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}, applied across ${domainName} projects.`,
      jdKeywordRefs: names,
      evidenceRefs: surface.flatMap((r) => byKey.get(requirementKey(r))!.evidenceRefs).slice(0, 6),
      requiresConfirmation: false,
      rationale: "Surfaces must-have JD technologies that are already supported by project evidence.",
    });
  }

  // (e) Supported domain / responsibility terms absent from the summary.
  const terms = reqs
    .filter((r) => (r.category === "DOMAIN" || r.category === "RESPONSIBILITY") && byKey.get(requirementKey(r))?.state === "SUPPORTED" && !termRegex(r.keyword).test(summaryText))
    .slice(0, 4);
  if (terms.length >= 2) {
    const names = terms.map((r) => r.keyword);
    suggestions.push({
      key: shortId("sg", `summaryterms:${names.join(",")}`),
      section: "SUMMARY",
      projectRef: null,
      originalText: null,
      proposedText: `Experienced in ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} within ${domainName} environments.`,
      jdKeywordRefs: names,
      evidenceRefs: terms.flatMap((r) => byKey.get(requirementKey(r))!.evidenceRefs).slice(0, 6),
      requiresConfirmation: false,
      rationale: "These JD terms are supported by project bullets but not reflected in the summary.",
    });
  }

  // (f) Partial / needs-confirmation technologies: can only be added after explicit user confirmation.
  for (const r of reqs.filter((x) => x.technologyName)) {
    const m = byKey.get(requirementKey(r));
    if (!m || (m.state !== "PARTIAL" && m.state !== "NEEDS_CONFIRMATION")) continue;
    if (skillsValues.has(r.technologyName!) && m.state === "NEEDS_CONFIRMATION") continue;
    suggestions.push({
      key: shortId("sg", `confirm:${r.technologyName}`),
      section: "SKILLS",
      projectRef: null,
      originalText: null,
      proposedText: r.technologyName!,
      skillCategory: r.techCategory ?? "Other Tools",
      jdKeywordRefs: [r.keyword],
      evidenceRefs: m.evidenceRefs,
      requiresConfirmation: true,
      rationale: `${m.explanation} Accept only if the candidate confirms real experience with ${r.technologyName}.`,
    });
  }

  // De-duplicate by key.
  const seen = new Set<string>();
  return suggestions.filter((s) => (seen.has(s.key) ? false : (seen.add(s.key), true)));
}

/** Apply accepted suggestions to produce a new content snapshot (never mutates the input). */
export function applySuggestions(content: ResumeContent, accepted: (Suggestion & { id?: string })[]): ResumeContent {
  const next: ResumeContent = structuredClone(content);
  for (const s of accepted) {
    const bulletBase = {
      action: s.proposedText.split(/\s+/)[0] ?? null,
      domainConcept: null,
      technologyRefs: [],
      evidenceRefs: s.evidenceRefs,
      jdKeywordRefs: s.jdKeywordRefs,
      confidence: "high" as const,
      requiresConfirmation: false,
      confirmed: true,
      source: "JD_SUGGESTION" as const,
    };
    if (s.section === "SKILLS") {
      const row = next.skills.find((r) => r.category === s.skillCategory) ?? next.skills.find((r) => r.category === "Other Tools");
      if (row) {
        if (!row.values.includes(s.proposedText)) row.values.push(s.proposedText);
      } else {
        next.skills.push({ category: s.skillCategory ?? "Other Tools", values: [s.proposedText] });
      }
      continue;
    }
    if (s.originalText) {
      const targets = s.section === "SUMMARY" ? next.summary : next.projects.find((p) => p.id === s.projectRef)?.bullets ?? [];
      const b = targets.find((x) => x.text === s.originalText);
      if (b) {
        b.text = s.proposedText;
        b.jdKeywordRefs = [...new Set([...b.jdKeywordRefs, ...s.jdKeywordRefs])];
      }
      continue;
    }
    const newBullet: Bullet = {
      ...bulletBase,
      id: shortId("b", `${s.key}:${s.proposedText}`),
      section: s.section === "SUMMARY" ? "SUMMARY" : "PROJECT",
      projectId: s.section === "PROJECT" ? s.projectRef : null,
      type: s.section === "SUMMARY" ? "PRIMARY" : "PROJECT",
      text: s.proposedText,
    };
    if (s.section === "SUMMARY") {
      // Insert after the opening bullet so the experience statement stays first.
      next.summary.splice(Math.min(1, next.summary.length), 0, newBullet);
    } else {
      const p = next.projects.find((x) => x.id === s.projectRef);
      if (p) {
        const techs = s.evidenceRefs.filter((e) => e.startsWith("tech:")).map((e) => e.slice(5));
        newBullet.technologyRefs = techs;
        p.bullets.push(newBullet);
      }
    }
  }
  return next;
}
