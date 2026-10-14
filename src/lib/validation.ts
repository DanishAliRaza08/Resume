// Validation layers (spec §10.3): schema, factual, consistency, quality and layout checks.
// Critical issues block approval/export until resolved or explicitly confirmed by a user.

import { estimatePages, proposeCompression, type CompressionStep } from "./layout";
import { allBullets, ResumeContent } from "./resume-schema";
import type { Catalog } from "./text";
import { findNearDuplicates, firstWord } from "./text";
import { analyzeTimeline, anachronismWarnings, outsideEmploymentWarnings, toDate, type Interval } from "./timeline";

export type Layer = "SCHEMA" | "FACTUAL" | "CONSISTENCY" | "QUALITY" | "LAYOUT";
export type Severity = "critical" | "warning" | "info";

export interface ValidationIssue {
  code: string;
  layer: Layer;
  severity: Severity;
  message: string;
  ref?: string; // bullet id / project id / skill category
}

export interface ValidationReport {
  issues: ValidationIssue[];
  counts: Record<Severity, number>;
  estimatedPages: number;
  pageTarget: number;
  compression: CompressionStep[];
  blocking: boolean; // true when critical issues remain
  checkedAt: string;
}

export interface ValidationContext {
  catalog: Catalog;
  /** Canonical names of technologies the candidate has confirmed (profile skills + project technologies). */
  confirmedTechs: Set<string>;
  employments: Interval[];
  techAvailability: Map<string, number | null>;
  asOf?: Date;
}

const METRIC = /(\d+(?:\.\d+)?\s?%|\$\s?\d|\b\d{2,}(?:,\d{3})*\+?\s+(?:users|customers|records|transactions|claims|stores|clients|accounts)\b)/i;

export function validateResume(raw: unknown, ctx: ValidationContext): ValidationReport {
  const issues: ValidationIssue[] = [];
  const parsed = ResumeContent.safeParse(raw);
  if (!parsed.success) {
    for (const e of parsed.error.issues.slice(0, 20)) {
      issues.push({ code: "SCHEMA", layer: "SCHEMA", severity: "critical", message: `${e.path.join(".")}: ${e.message}` });
    }
    return finish(issues, null);
  }
  const content = parsed.data;
  const bullets = allBullets(content);
  const isDemo = content.meta.isDemo;

  // ---------- Factual ----------
  for (const b of bullets) {
    if (b.requiresConfirmation && !b.confirmed) {
      issues.push({
        code: "NEEDS_CONFIRMATION",
        layer: "FACTUAL",
        severity: "critical",
        message: `"${truncate(b.text)}" comes from ${b.source === "TEMPLATE" ? "a template" : "a suggestion"} and must be confirmed as accurate before approval.`,
        ref: b.id,
      });
    }
    const candidateWords = b.source === "CANDIDATE" || b.source === "RESUME_IMPORT"; // the candidate's own statement is its evidence
    for (const found of candidateWords ? [] : ctx.catalog.find(b.text)) {
      if (!ctx.confirmedTechs.has(found.entry.canonicalName)) {
        issues.push({
          code: "UNSUPPORTED_TECH",
          layer: "FACTUAL",
          severity: "critical",
          message: `"${found.matched}" (${found.entry.canonicalName}) appears in a bullet but is not a confirmed skill or project technology.`,
          ref: b.id,
        });
      }
    }
    if (METRIC.test(b.text) && b.source !== "CANDIDATE" && b.source !== "RESUME_IMPORT" && !b.confirmed) {
      issues.push({ code: "UNVERIFIED_METRIC", layer: "FACTUAL", severity: "critical", message: `Metric in "${truncate(b.text)}" is not candidate-supplied.`, ref: b.id });
    }
  }
  for (const p of content.projects) {
    const label = `Project "${p.title}"`;
    if (!p.clientConfirmed) {
      issues.push({ code: "CLIENT_UNCONFIRMED", layer: "FACTUAL", severity: "critical", message: `${label}: candidate has not confirmed the relationship with ${p.client}.`, ref: p.id });
    }
    if (p.clientVerification === "UNVERIFIED" && !isDemo) {
      issues.push({ code: "CLIENT_UNVERIFIED", layer: "FACTUAL", severity: "warning", message: `${label}: ${p.client} is unverified in the client library. Verify it (with evidence) in the Client library before approval.`, ref: p.id });
    }
    for (const t of p.technologies) {
      if (!ctx.confirmedTechs.has(t)) {
        issues.push({ code: "UNSUPPORTED_TECH", layer: "FACTUAL", severity: "critical", message: `${label} lists ${t}, which is not confirmed.`, ref: p.id });
      }
    }
    const pi: Interval = { start: toDate(p.startDate), end: p.endDate ? toDate(p.endDate) : null, label };
    for (const w of outsideEmploymentWarnings(label, pi, ctx.employments, ctx.asOf)) issues.push({ code: w.code, layer: "FACTUAL", severity: w.severity, message: w.message, ref: p.id });
    const techs = p.technologies.map((name) => ({ name, availableFrom: ctx.techAvailability.get(name) }));
    for (const w of anachronismWarnings(label, pi.start, pi.end, techs)) issues.push({ code: w.code, layer: "FACTUAL", severity: w.severity, message: w.message, ref: p.id });
  }
  const projectIntervals: Interval[] = content.projects.map((p) => ({ start: toDate(p.startDate), end: p.endDate ? toDate(p.endDate) : null, label: `Project "${p.title}"` }));
  for (const w of analyzeTimeline(projectIntervals, ctx.asOf)) {
    issues.push({ code: w.code, layer: "FACTUAL", severity: w.severity, message: w.message });
  }

  // ---------- Consistency ----------
  for (const row of content.skills) {
    for (const v of row.values) {
      const entry = ctx.catalog.resolve(v);
      if (entry && !ctx.confirmedTechs.has(entry.canonicalName)) {
        issues.push({ code: "SKILL_UNSUPPORTED", layer: "CONSISTENCY", severity: "critical", message: `Technical Skills lists ${v}, which is not supported by the profile or a project.`, ref: row.category });
      }
    }
  }
  const yearsClaim = content.summary.map((b) => /(\d+)\+?\s+years/i.exec(b.text)).find(Boolean);
  if (yearsClaim) {
    const claimed = Number(yearsClaim[1]);
    const actual = Math.floor(content.meta.totalExperienceMonths / 12);
    if (claimed > actual) {
      issues.push({ code: "YEARS_MISMATCH", layer: "CONSISTENCY", severity: "critical", message: `Summary claims ${claimed}+ years; verified unique employment totals ${actual} year(s).` });
    }
  }
  const projectTechs = new Set(content.projects.flatMap((p) => p.technologies));
  for (const b of content.summary) {
    for (const t of b.technologyRefs) {
      if (!projectTechs.has(t) && !ctx.confirmedTechs.has(t)) {
        issues.push({ code: "SUMMARY_TECH_UNUSED", layer: "CONSISTENCY", severity: "warning", message: `Summary references ${t}, which no project or profile skill supports.`, ref: b.id });
      }
    }
  }

  // ---------- Quality ----------
  const dupes = findNearDuplicates(bullets.map((b) => ({ id: b.id, text: b.text })));
  for (const d of dupes) {
    const a = bullets.find((b) => b.id === d.a)!;
    issues.push({ code: "NEAR_DUPLICATE", layer: "QUALITY", severity: "warning", message: `Near-duplicate bullets (${Math.round(d.score * 100)}% similar): "${truncate(a.text)}"`, ref: d.b });
  }
  for (const p of content.projects) {
    let streak = 1;
    for (let i = 1; i < p.bullets.length; i++) {
      streak = firstWord(p.bullets[i].text).toLowerCase() === firstWord(p.bullets[i - 1].text).toLowerCase() ? streak + 1 : 1;
      if (streak === 3) issues.push({ code: "REPEATED_VERB", layer: "QUALITY", severity: "info", message: `Three consecutive bullets in "${p.title}" start with "${firstWord(p.bullets[i].text)}".`, ref: p.bullets[i].id });
    }
    if (p.endDate) {
      for (const b of p.bullets) {
        const w = firstWord(b.text).toLowerCase();
        if (w.endsWith("ing") && !["leveraging", "using", "including"].includes(w) && b.source !== "RESUME_IMPORT") {
          issues.push({ code: "TENSE", layer: "QUALITY", severity: "info", message: `Completed project bullet starts with "${firstWord(b.text)}"; past tense reads better.`, ref: b.id });
        }
      }
    }
  }
  for (const b of bullets) {
    const words = b.text.split(/\s+/).length;
    if (words > 50) issues.push({ code: "LONG_BULLET", layer: "QUALITY", severity: "info", message: `Bullet has ${words} words; consider splitting.`, ref: b.id });
    if (/\b(\w+)\s+\1\b/i.test(b.text)) issues.push({ code: "REPEATED_WORD", layer: "QUALITY", severity: "info", message: `Repeated word in "${truncate(b.text)}".`, ref: b.id });
    if (/\s{2,}|\s[,.]/.test(b.text)) issues.push({ code: "SPACING", layer: "QUALITY", severity: "info", message: `Spacing/punctuation issue in "${truncate(b.text)}".`, ref: b.id });
  }
  const openings = content.summary.map((b) => b.text.split(/\s+/).slice(0, 2).join(" ").toLowerCase());
  const repeated = openings.filter((o, i) => openings.indexOf(o) !== i);
  if (repeated.length) issues.push({ code: "SUMMARY_OPENINGS", layer: "QUALITY", severity: "info", message: `Summary bullets reuse openings: ${[...new Set(repeated)].join(", ")}.` });

  // ---------- Layout ----------
  if (!content.header.fullName.trim()) issues.push({ code: "MISSING_NAME", layer: "LAYOUT", severity: "critical", message: "Candidate name is missing from the header." });
  if (!content.header.email && !content.header.phone) issues.push({ code: "MISSING_CONTACT", layer: "LAYOUT", severity: "warning", message: "No contact information in the header." });
  if (!content.summary.length) issues.push({ code: "MISSING_SUMMARY", layer: "LAYOUT", severity: "critical", message: "Professional Summary is empty." });
  if (!content.projects.length) issues.push({ code: "MISSING_PROJECTS", layer: "LAYOUT", severity: "critical", message: "No project experience." });
  for (const p of content.projects) if (!p.bullets.length) issues.push({ code: "EMPTY_PROJECT", layer: "LAYOUT", severity: "warning", message: `"${p.title}" has no bullets.`, ref: p.id });
  const pages = estimatePages(content);
  if (pages > content.meta.pageTarget) {
    issues.push({ code: "PAGE_OVER", layer: "LAYOUT", severity: "warning", message: `Estimated ${pages} page(s) exceeds the ${content.meta.pageTarget}-page target. Review the compression proposal; the exported file reports the actual count.` });
  }

  return finish(issues, content);
}

function finish(issues: ValidationIssue[], content: ResumeContent | null): ValidationReport {
  const counts: Record<Severity, number> = { critical: 0, warning: 0, info: 0 };
  for (const i of issues) counts[i.severity]++;
  return {
    issues,
    counts,
    estimatedPages: content ? estimatePages(content) : 0,
    pageTarget: content?.meta.pageTarget ?? 0,
    compression: content ? proposeCompression(content) : [],
    blocking: counts.critical > 0,
    checkedAt: new Date().toISOString(),
  };
}

function truncate(s: string, n = 70): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
