import { describe, expect, it } from "vitest";
import { DOMAINS, ROLES } from "@/data/domains";
import { TEMPLATES } from "@/data/templates";
import { fillPattern, generateResume, MODE_COUNTS } from "@/lib/generator";
import { allBullets, ResumeContent } from "@/lib/resume-schema";
import { findNearDuplicates } from "@/lib/text";
import { catalog, categoryOf, demoInput } from "./helpers";

describe("resume generator", () => {
  it("creates a schema-valid Banking BA resume with five projects and a skills table (AT-01)", () => {
    const { content } = generateResume(demoInput());
    expect(ResumeContent.safeParse(content).success).toBe(true);
    expect(content.projects).toHaveLength(5);
    expect(content.skills.length).toBeGreaterThan(3);
    expect(content.summary[0].text).toMatch(/Senior Business Analyst with 9\+ years of experience in the Banking & Financial Services industry/);
    expect(content.summary.some((b) => b.type === "PROFESSIONALISM")).toBe(true);
    expect(content.summary.filter((b) => b.type === "QA").length).toBeGreaterThanOrEqual(1);
  });

  it("applies domain-specific templates in each of the five domains (AT-02)", () => {
    for (const domain of DOMAINS) {
      const tpl = TEMPLATES.find((t) => t.domain === domain.key)!;
      const base = demoInput();
      const input = demoInput({
        domain: { key: domain.key, name: domain.name, industryPhrase: domain.industryPhrase },
        projects: base.projects.map((p) => ({ ...p, domainKey: domain.key, subdomain: tpl.subdomain, template: { name: tpl.name, domainBullets: tpl.domainBullets, projectBullets: tpl.projectBullets, qaBullets: tpl.qaBullets } })),
      });
      const { content } = generateResume(input);
      expect(content.summary[0].text).toContain(domain.industryPhrase);
      const domainBullet = content.projects.flatMap((p) => p.bullets).find((b) => b.type === "DOMAIN");
      expect(domainBullet?.evidenceRefs[0]).toBe(`template:${tpl.name}`);
    }
  });

  it("never introduces technologies the candidate has not confirmed", () => {
    const input = demoInput();
    // Unconfirm Tableau everywhere.
    input.projects = input.projects.map((p) => ({ ...p, technologies: p.technologies.map((t) => (t.name === "Tableau" ? { ...t, confirmed: false } : t)) }));
    input.candidateSkills = input.candidateSkills.filter((t) => t.name !== "Tableau");
    const { content, warnings } = generateResume(input);
    const text = allBullets(content).map((b) => b.text).join("\n");
    expect(catalog.mentions(text, "Tableau")).toBe(false);
    expect(content.skills.flatMap((r) => r.values)).not.toContain("Tableau");
    expect(warnings.some((w) => w.code === "UNCONFIRMED_TECH")).toBe(true);
  });

  it("keeps tool assignments distinct per project (AT-04)", () => {
    const input = demoInput();
    input.projects[0].technologies.push({ name: "Power BI", category: categoryOf("Power BI"), confirmed: true });
    input.projects[0].technologies = input.projects[0].technologies.filter((t) => t.name !== "Tableau");
    input.projects[1].technologies.push({ name: "Tableau", category: categoryOf("Tableau"), confirmed: true });
    input.candidateSkills = input.candidateSkills.filter((t) => t.name !== "Tableau");
    const { content } = generateResume(input);
    const p1 = content.projects.find((p) => p.id === "p1")!;
    const p2 = content.projects.find((p) => p.id === "p2")!;
    expect(p1.technologies).toContain("Power BI");
    expect(p1.technologies).not.toContain("Tableau");
    expect(p2.technologies).toContain("Tableau");
    expect(p2.technologies).not.toContain("Power BI");
    for (const b of p1.bullets) expect(b.technologyRefs).not.toContain("Tableau");
    for (const b of p2.bullets) expect(b.technologyRefs).not.toContain("Power BI");
  });

  it("marks template bullets as requiring confirmation and keeps candidate facts", () => {
    const { content } = generateResume(demoInput({}, "CONCISE"));
    const bullets = allBullets(content);
    for (const b of bullets.filter((x) => x.source === "TEMPLATE" && x.type !== "PROFESSIONALISM")) expect(b.requiresConfirmation).toBe(true);
    const p1 = content.projects.find((p) => p.id === "p1")!;
    expect(p1.bullets.filter((b) => b.source === "CANDIDATE")).toHaveLength(2);
  });

  it("respects mode bullet budgets", () => {
    for (const mode of ["FULL_DETAIL", "STANDARD", "CONCISE"] as const) {
      const { content } = generateResume(demoInput({}, mode));
      for (const p of content.projects) {
        const nonCandidate = p.bullets.filter((b) => b.source !== "CANDIDATE");
        const caps = MODE_COUNTS[mode];
        expect(nonCandidate.filter((b) => b.type === "DOMAIN").length).toBeLessThanOrEqual(caps.domain);
        expect(p.bullets.filter((b) => b.type === "PROJECT").length).toBeLessThanOrEqual(Math.max(caps.project, p.bullets.filter((b) => b.source === "CANDIDATE").length));
      }
    }
  });

  it("produces no near-duplicate bullets across the resume", () => {
    const { content } = generateResume(demoInput({}, "FULL_DETAIL"));
    const dupes = findNearDuplicates(allBullets(content).map((b) => ({ id: b.id, text: b.text })));
    expect(dupes).toHaveLength(0);
  });

  it("skips placeholders that cannot be filled from confirmed technologies", () => {
    const byCategory = new Map([["Databases", ["SQL"]]]);
    expect(fillPattern("Used {tech:Databases} for checks.", { client: "X", subdomain: "Y", byCategory })?.text).toBe("Used SQL for checks.");
    expect(fillPattern("Built {tech:Reporting & BI} dashboards.", { client: "X", subdomain: "Y", byCategory })).toBeNull();
  });

  it("supports engineering roles with role-specific bullets", () => {
    const role = ROLES.find((r) => r.key === "AWS_ENGINEER")!;
    const input = demoInput({ role });
    input.projects[0].technologies.push({ name: "AWS Lambda", category: "Cloud", confirmed: true }, { name: "Terraform", category: "Deployment", confirmed: true });
    const { content } = generateResume(input);
    const text = content.projects[0].bullets.map((b) => b.text).join(" ");
    expect(text).toMatch(/AWS Lambda/);
    expect(content.skills.map((s) => s.category)).toContain("Cloud");
  });
});
