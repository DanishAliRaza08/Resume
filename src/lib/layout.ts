// Page-count estimation and compression proposals (spec §6.5). Estimates are a pre-check only;
// the export service reports the page count of the actually rendered document.

import { MODE_COUNTS } from "./generator";
import type { Bullet, ResumeContent } from "./resume-schema";

export const LAYOUT = {
  charsPerBulletLine: 92,
  charsPerLine: 100,
  linesPerPage: 50,
};

export function estimateLines(content: ResumeContent, spacing: "normal" | "compact" = "normal"): number {
  const gap = spacing === "compact" ? 0.5 : 1;
  const bulletLines = (text: string) => Math.max(1, Math.ceil(text.length / LAYOUT.charsPerBulletLine));
  let lines = 4; // name, title, contact line, rule
  lines += 1 + gap; // "Professional Summary"
  for (const b of content.summary) lines += bulletLines(b.text);
  lines += gap + 1 + gap; // "Professional Experience"
  for (const p of content.projects) {
    lines += 3 + gap; // client/location, dates, role/title
    for (const b of p.bullets) lines += bulletLines(b.text);
    if (p.technologies.length) lines += Math.ceil(("Environment: " + p.technologies.join(", ")).length / LAYOUT.charsPerLine);
  }
  if (content.skills.length) {
    lines += gap + 1 + gap;
    for (const row of content.skills) lines += Math.max(1, Math.ceil((row.category.length + row.values.join(", ").length) / 80));
  }
  if (content.education.length) lines += gap + 1 + content.education.length;
  if (content.certifications.length) lines += gap + 1 + content.certifications.length;
  for (const s of content.extraSections) lines += gap + 1 + s.lines.length;
  return Math.ceil(lines);
}

export function estimatePages(content: ResumeContent, spacing: "normal" | "compact" = "normal"): number {
  return Math.max(1, Math.ceil(estimateLines(content, spacing) / LAYOUT.linesPerPage));
}

export interface CompressionStep {
  kind: "SPACING" | "MODE" | "DROP_BULLETS";
  description: string;
  estimatedPages: number;
  bulletIds?: string[];
  mode?: "STANDARD" | "CONCISE";
}

/**
 * Ordered, approval-required compression proposals: spacing first, then a shorter project mode,
 * then removal of the lowest-value template bullets. Candidate-supplied facts are never proposed for removal.
 */
export function proposeCompression(content: ResumeContent): CompressionStep[] {
  const target = content.meta.pageTarget;
  const steps: CompressionStep[] = [];
  const current = estimatePages(content);
  if (current <= target) return steps;

  const compact = estimatePages(content, "compact");
  steps.push({ kind: "SPACING", description: "Tighten paragraph and section spacing (font size unchanged).", estimatedPages: compact });
  if (compact <= target) return steps;

  const order: ("STANDARD" | "CONCISE")[] = content.meta.projectMode === "FULL_DETAIL" ? ["STANDARD", "CONCISE"] : content.meta.projectMode === "STANDARD" ? ["CONCISE"] : [];
  for (const mode of order) {
    const trimmed = applyModeCaps(content, mode);
    const pages = estimatePages(trimmed, "compact");
    steps.push({ kind: "MODE", mode, description: `Switch project detail to ${mode === "STANDARD" ? "Standard" : "Concise"} mode (removes template bullets beyond the mode's limits).`, estimatedPages: pages });
    if (pages <= target) return steps;
  }

  // Lowest value first: unconfirmed template bullets with low confidence, from older projects first.
  const candidates = [...content.projects]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .flatMap((p) => p.bullets.filter((b) => b.source === "TEMPLATE" && !b.confirmed).reverse());
  const drop: string[] = [];
  let working = applyModeCaps(content, "CONCISE");
  for (const b of candidates) {
    if (estimatePages(working, "compact") <= target) break;
    drop.push(b.id);
    working = { ...working, projects: working.projects.map((p) => ({ ...p, bullets: p.bullets.filter((x) => x.id !== b.id) })) };
  }
  if (drop.length) {
    steps.push({ kind: "DROP_BULLETS", description: `Remove ${drop.length} unconfirmed template bullet(s) from older projects.`, bulletIds: drop, estimatedPages: estimatePages(working, "compact") });
  }
  return steps;
}

function isProtected(b: Bullet): boolean {
  return b.source === "CANDIDATE" || b.source === "RESUME_IMPORT" || b.source === "USER_EDIT" || b.confirmed;
}

/** Apply a project mode's per-type caps, keeping candidate-supplied and confirmed bullets. */
export function applyModeCaps(content: ResumeContent, mode: "FULL_DETAIL" | "STANDARD" | "CONCISE"): ResumeContent {
  const caps = MODE_COUNTS[mode];
  const capFor: Record<string, number> = { DOMAIN: caps.domain, PROJECT: caps.project, SUPPORTING_TOOL: caps.supporting, QA: caps.qa };
  return {
    ...content,
    meta: { ...content.meta, projectMode: mode },
    projects: content.projects.map((p) => {
      const protectedCount: Record<string, number> = {};
      for (const b of p.bullets) if (isProtected(b)) protectedCount[b.type] = (protectedCount[b.type] ?? 0) + 1;
      const kept: Record<string, number> = {};
      const bullets = p.bullets.filter((b) => {
        if (isProtected(b)) return true;
        const cap = capFor[b.type] ?? Infinity;
        const used = (protectedCount[b.type] ?? 0) + (kept[b.type] ?? 0);
        if (used >= cap) return false;
        kept[b.type] = (kept[b.type] ?? 0) + 1;
        return true;
      });
      return { ...p, bullets };
    }),
  };
}
