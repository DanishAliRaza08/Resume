import { describe, expect, it } from "vitest";
import { TECH_KNOWLEDGE } from "@/data/tech-knowledge";
import { TECHNOLOGIES } from "@/data/technologies";
import { generateResume } from "@/lib/generator";
import { buildLibrarySample } from "@/lib/resume-library";
import type { ParsedResume } from "@/lib/resume-parser";
import { allBullets } from "@/lib/resume-schema";
import { suggestProjectDates, toDate, totalExperienceMonths } from "@/lib/timeline";
import { catalog, demoInput } from "./helpers";

const kb = Object.fromEntries(Object.entries(TECH_KNOWLEDGE).map(([k, v]) => [k, v.bullets as Record<string, string[]>]));

describe("technology knowledge base", () => {
  it("only describes catalog technologies and never names a different tool in a bullet", () => {
    const names = new Set(TECHNOLOGIES.map((t) => t.canonicalName));
    for (const [name, k] of Object.entries(TECH_KNOWLEDGE)) {
      expect(names.has(name), name).toBe(true);
      for (const b of Object.values(k.bullets).flat()) {
        const found = catalog.find(b!.replace(/\{client\}|\{subdomain\}/g, "X")).map((f) => f.entry.canonicalName);
        expect(found, b).toContain(name);
        expect(found.filter((f) => f !== name), b).toEqual([]);
      }
    }
  });

  it("no name or alias belongs to two technologies", () => {
    const seen = new Map<string, string>();
    for (const t of TECHNOLOGIES)
      for (const term of [t.canonicalName, ...t.aliases]) {
        const k = term.toLowerCase();
        expect(seen.get(k) ?? t.canonicalName, `${term}`).toBe(t.canonicalName);
        seen.set(k, t.canonicalName);
      }
  });

  it("the generator uses phrasing for the selected tools, marked as needing confirmation", () => {
    const { content } = generateResume(demoInput({ techKnowledge: kb }));
    const kbBullets = allBullets(content).filter((b) => b.evidenceRefs.some((e) => e.startsWith("knowledge:")));
    expect(kbBullets.length).toBeGreaterThan(0);
    for (const b of kbBullets) {
      expect(b.requiresConfirmation).toBe(true);
      const project = content.projects.find((p) => p.id === b.projectId)!;
      expect(project.technologies).toContain(b.technologyRefs[0]);
      expect(b.text).not.toMatch(/\{client\}|\{subdomain\}/);
    }
  });
});

describe("resume library", () => {
  const parsed: ParsedResume = {
    fullName: "Priya Raman",
    email: "priya@example.com",
    phone: "(555) 123-4567",
    linkedin: null,
    summary: ["Business Analyst with 9 years of experience in banking.", "Skilled at turning stakeholder needs into clear, testable requirements for delivery teams."],
    experiences: [
      {
        employer: "Wells Fargo",
        location: "Charlotte, NC",
        title: "Senior Business Analyst",
        startDate: "2020-01-01",
        endDate: null,
        bullets: [
          "Facilitated requirement workshops with lending operations and documented the agreed scope in JIRA for the delivery team.",
          "Reduced reconciliation effort by 40% through a new exception workflow.",
          "Partnered with Wells Fargo compliance to review policy changes before every release went live.",
          "Contact priya@example.com for references about this engagement and the work delivered there.",
        ],
      },
    ],
    skills: [],
    education: [],
    certifications: [],
    detectedTechs: [],
    unplaced: [],
    warnings: [],
  };

  it("keeps reusable wording and drops numbers, names, employers and contact details", () => {
    const s = buildLibrarySample(parsed, { fullName: "Priya Raman", knownClientNames: ["Wells Fargo", "Bank of America"] });
    expect(s.bullets).toContain("Facilitated requirement workshops with lending operations and documented the agreed scope in JIRA for the delivery team.");
    expect(s.bullets.join(" ")).not.toMatch(/\d|Wells Fargo|priya|Priya/i);
    expect(s.text).not.toMatch(/priya@example\.com|Priya|Wells Fargo/);
  });

  it("library lines are only used when every tool they name was selected on that project", () => {
    const lines = ["Facilitated requirement workshops with lending operations and documented the agreed scope in JIRA for the delivery team.", "Built monitoring dashboards in Splunk-like tooling using Kubernetes for every service."];
    const { content } = generateResume(demoInput({ libraryBullets: lines }));
    const used = allBullets(content).filter((b) => b.evidenceRefs.includes("library:uploaded-resumes"));
    for (const b of used) {
      expect(b.requiresConfirmation).toBe(true);
      const project = content.projects.find((p) => p.id === b.projectId)!;
      for (const t of b.technologyRefs) expect(project.technologies).toContain(t);
    }
    expect(used.some((b) => b.text.includes("Kubernetes"))).toBe(false);
  });
});

describe("suggested project dates", () => {
  it.each([[10, 5], [7, 3], [2, 4], [12, 8], [1, 1]])("%i years over %i projects adds up and ends today", (years, count) => {
    const asOf = toDate("2026-10-21");
    const r = suggestProjectDates(years, count, asOf);
    expect(r).toHaveLength(count);
    expect(r[0].end).toBeNull();
    const months = totalExperienceMonths(r.map((x) => ({ start: toDate(x.start), end: x.end ? toDate(x.end) : null })), asOf);
    expect(Math.abs(months / 12 - years)).toBeLessThan(0.2);
  });
});
