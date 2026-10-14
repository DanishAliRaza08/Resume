import { describe, expect, it } from "vitest";
import { SAMPLE_JD } from "@/data/demo";
import { generateResume } from "@/lib/generator";
import { applySuggestions, buildSuggestions, coverageScore, extractRequirements, matchRequirements, requirementKey, type Evidence } from "@/lib/jd";
import { applyModeCaps, estimatePages, proposeCompression } from "@/lib/layout";
import { allBullets, type ResumeContent } from "@/lib/resume-schema";
import { validateResume, type ValidationContext } from "@/lib/validation";
import { TECHNOLOGIES } from "@/data/technologies";
import { ASOF, catalog, demoInput } from "./helpers";

function ctxFor(content: ResumeContent): ValidationContext {
  const input = demoInput();
  const confirmed = new Set([...input.candidateSkills.map((s) => s.name), ...input.projects.flatMap((p) => p.technologies.filter((t) => t.confirmed).map((t) => t.name))]);
  return {
    catalog,
    confirmedTechs: confirmed,
    employments: input.employments,
    techAvailability: new Map(TECHNOLOGIES.map((t) => [t.canonicalName, t.availableFrom ?? null])),
    asOf: ASOF,
  };
}

function confirmAll(content: ResumeContent): ResumeContent {
  const c = structuredClone(content);
  for (const b of allBullets(c)) b.confirmed = true;
  return c;
}

function evidenceFor(content: ResumeContent): Evidence {
  const techs = new Map<string, string[]>();
  for (const p of content.projects) for (const t of p.technologies) techs.set(t, [...(techs.get(t) ?? []), `project:${p.id}`]);
  return { confirmedTechs: techs, userConfirmed: new Set(), education: demoInput().education, certifications: demoInput().certifications, totalExperienceMonths: content.meta.totalExperienceMonths };
}

describe("validation layers", () => {
  it("blocks approval until template bullets are confirmed", () => {
    const { content } = generateResume(demoInput());
    const report = validateResume(content, ctxFor(content));
    expect(report.blocking).toBe(true);
    expect(report.issues.some((i) => i.code === "NEEDS_CONFIRMATION")).toBe(true);
    const clean = validateResume(confirmAll(content), ctxFor(content));
    expect(clean.issues.filter((i) => i.severity === "critical")).toEqual([]);
  });

  it("flags unsupported technology typed into a bullet", () => {
    const { content } = generateResume(demoInput());
    const edited = confirmAll(content);
    edited.projects[0].bullets.push({ ...edited.projects[0].bullets[0], id: "x1", text: "Built pipelines in Snowflake and Python.", source: "USER_EDIT" });
    const report = validateResume(edited, ctxFor(content));
    const unsupported = report.issues.filter((i) => i.code === "UNSUPPORTED_TECH").map((i) => i.message).join(" ");
    expect(unsupported).toContain("Snowflake");
    expect(unsupported).toContain("Python");
  });

  it("flags near-duplicate bullets (AT-12)", () => {
    const { content } = generateResume(demoInput());
    const edited = confirmAll(content);
    const original = edited.projects[0].bullets[0];
    edited.projects[1].bullets.push({ ...original, id: "dupe", text: original.text.replace(/\.$/, " for the program.") });
    const report = validateResume(edited, ctxFor(content));
    expect(report.issues.some((i) => i.code === "NEAR_DUPLICATE" && i.ref === "dupe")).toBe(true);
  });

  it("flags summary years that exceed verified experience", () => {
    const { content } = generateResume(demoInput());
    const edited = confirmAll(content);
    edited.summary[0].text = edited.summary[0].text.replace(/\d+\+ years/, "15+ years");
    expect(validateResume(edited, ctxFor(content)).issues.some((i) => i.code === "YEARS_MISMATCH")).toBe(true);
  });

  it("rejects malformed content at the schema layer", () => {
    const report = validateResume({ header: {} }, ctxFor(generateResume(demoInput()).content));
    expect(report.blocking).toBe(true);
    expect(report.issues[0].layer).toBe("SCHEMA");
  });

  it("proposes compression for an over-long resume without removing candidate facts (AT-09)", () => {
    const { content } = generateResume(demoInput({ pageTarget: 2 }, "FULL_DETAIL"));
    expect(estimatePages(content)).toBeGreaterThan(2);
    const steps = proposeCompression(content);
    expect(steps[0].kind).toBe("SPACING");
    const drop = steps.find((s) => s.kind === "DROP_BULLETS");
    const candidateIds = new Set(allBullets(content).filter((b) => b.source === "CANDIDATE").map((b) => b.id));
    for (const id of drop?.bulletIds ?? []) expect(candidateIds.has(id)).toBe(false);
    const concise = applyModeCaps(content, "CONCISE");
    expect(allBullets(concise).filter((b) => b.source === "CANDIDATE")).toHaveLength(candidateIds.size);
  });
});

describe("JD analysis and tailoring", () => {
  const reqs = extractRequirements(SAMPLE_JD, catalog);

  it("extracts and classifies requirements", () => {
    const byName = new Map(reqs.map((r) => [requirementKey(r), r]));
    expect(byName.get("Loan IQ")?.category).toBe("MUST_HAVE");
    expect(byName.get("SQL Server")?.category).toBe("MUST_HAVE");
    expect(byName.get("Power BI")?.category).toBe("PREFERRED");
    expect(byName.get("nCino")?.category).toBe("PREFERRED");
    expect(byName.get("Agile")?.category).toBe("METHODOLOGY");
    expect(byName.get("loan origination")?.category).toBe("DOMAIN");
    expect(byName.get("gap analysis")?.category ?? byName.get("Gap Analysis")?.category).toBeDefined();
    expect([...byName.values()].find((r) => r.minYears)?.minYears).toBe(7);
    expect(byName.get("cbap")?.category).toBe("QUALIFICATION");
  });

  it("matches evidence and never inserts unsupported technology (AT-05)", () => {
    const { content } = generateResume(demoInput());
    const confirmed = confirmAll(content);
    const evidence = evidenceFor(confirmed);
    const matches = matchRequirements(reqs, confirmed, evidence, catalog);
    const state = (k: string) => matches.find((m) => m.requirementKey === k)?.state;
    expect(state("Loan IQ")).toBe("SUPPORTED");
    expect(state("nCino")).toBe("PARTIAL"); // related Domain Platforms experience (Loan IQ) but no nCino
    expect(state("Power BI")).toBe("PARTIAL"); // has Tableau
    expect(state("SQL Server")).toBe("PARTIAL"); // has SQL, but SQL Server itself is not established
    expect(state("min-years-7")).toBe("SUPPORTED");
    expect(state("cbap")).toBe("SUPPORTED");

    const suggestions = buildSuggestions(reqs, matches, confirmed, evidence, catalog);
    const ncino = suggestions.find((s) => s.proposedText === "nCino");
    expect(ncino?.requiresConfirmation).toBe(true);
    // Applying only suggestions that do not require confirmation never adds nCino or Power BI.
    const applied = applySuggestions(confirmed, suggestions.filter((s) => !s.requiresConfirmation));
    const text = [...allBullets(applied).map((b) => b.text), ...applied.skills.flatMap((r) => r.values)].join("\n");
    expect(catalog.mentions(text, "nCino")).toBe(false);
    expect(catalog.mentions(text, "Power BI")).toBe(false);
  });

  it("produces a transparent coverage score", () => {
    const { content } = generateResume(demoInput());
    const confirmed = confirmAll(content);
    const evidence = evidenceFor(confirmed);
    const matches = matchRequirements(reqs, confirmed, evidence, catalog);
    const score = coverageScore(reqs, matches);
    expect(score.score).toBeGreaterThan(0);
    expect(score.score).toBeLessThanOrEqual(100);
    expect(score.supported + score.partial + score.missing + score.needsConfirmation).toBe(reqs.length);
    evidence.userConfirmed.add("Power BI");
    const after = coverageScore(reqs, matchRequirements(reqs, confirmed, evidence, catalog));
    expect(after.score).toBeGreaterThan(score.score);
    expect(after.userConfirmed).toBe(1);
  });

  it("applies accepted suggestions to a new snapshot without mutating the original", () => {
    const { content } = generateResume(demoInput());
    const confirmed = confirmAll(content);
    const evidence = evidenceFor(confirmed);
    const jd = extractRequirements("Requirements:\n- Strong experience with Atlassian Jira.\n- Experience leading user acceptance testing.", catalog);
    const matches = matchRequirements(jd, confirmed, evidence, catalog);
    const suggestions = buildSuggestions(jd, matches, confirmed, evidence, catalog);
    const before = JSON.stringify(confirmed);
    const alias = suggestions.find((s) => s.originalText && s.jdKeywordRefs.includes("Atlassian Jira"));
    expect(alias).toBeDefined();
    const next = applySuggestions(confirmed, [alias!]);
    expect(JSON.stringify(confirmed)).toBe(before);
    expect(allBullets(next).some((b) => b.text === alias!.proposedText)).toBe(true);
  });
});
