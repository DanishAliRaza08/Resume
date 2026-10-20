// JD analysis and tailoring service (FR-08, FR-09, FR-10) and the "Update Existing Resume" import.
import { strs } from "../json";
import { applySuggestions, buildSuggestions, coverageScore, extractRequirements, matchRequirements, requirementKey, type Evidence, type ExtractedRequirement } from "../jd";
import type { Bullet, ProjectSection, ResumeContent } from "../resume-schema";
import { ResumeContent as ResumeContentSchema } from "../resume-schema";
import type { ParsedResume } from "../resume-parser";
import { shortId } from "../text";
import { totalExperienceMonths } from "../timeline";
import { audit } from "./audit";
import type { SessionUser } from "./auth";
import { loadCatalog } from "./catalog";
import { prisma } from "./db";
import { AccessDenied, assertCan, authorizeCandidate, authorizeResume } from "./permissions";
import { candidateEvidence, normalizeClientName, saveVersion } from "./resume-service";

export async function createJobDescription(user: SessionUser, data: { title: string; text: string; fileName?: string | null; mime?: string | null; targetRole?: string | null }) {
  await assertCan(user, "resume:generate");
  const jd = await prisma.jobDescription.create({
    data: { ownerId: user.id, title: data.title.slice(0, 200), extractedText: data.text, sourceFileName: data.fileName ?? null, sourceMime: data.mime ?? null, targetRole: data.targetRole ?? null, processingStatus: "EXTRACTED" },
  });
  await analyzeJobDescription(user, jd.id);
  await audit(user.id, "jd.create", "JobDescription", jd.id);
  return jd;
}

export async function authorizeJd(user: SessionUser, jdId: string) {
  const jd = await prisma.jobDescription.findUniqueOrThrow({ where: { id: jdId } });
  if (jd.ownerId !== user.id && user.role !== "ADMIN" && user.role !== "REVIEWER") {
    await audit(user.id, "denied:jd:read", "JobDescription", jdId, "DENIED");
    throw new AccessDenied();
  }
  return jd;
}

export async function analyzeJobDescription(user: SessionUser, jdId: string) {
  const jd = await authorizeJd(user, jdId);
  const { catalog } = await loadCatalog();
  const reqs = extractRequirements(jd.extractedText, catalog);
  const techIds = new Map((await prisma.technology.findMany({ select: { id: true, canonicalName: true } })).map((t) => [t.canonicalName, t.id]));
  await prisma.$transaction([
    prisma.jDRequirement.deleteMany({ where: { jobDescriptionId: jdId } }),
    prisma.jDRequirement.createMany({
      data: reqs.map((r) => ({
        jobDescriptionId: jdId,
        keyword: r.keyword,
        canonical: r.technologyName ?? r.canonical,
        technologyId: r.technologyName ? techIds.get(r.technologyName) ?? null : null,
        category: r.category,
        weight: r.weight,
        required: r.required,
        sourceLine: r.sourceLine,
      })),
    }),
    prisma.jobDescription.update({ where: { id: jdId }, data: { processingStatus: "ANALYZED" } }),
  ]);
  return reqs;
}

function toExtracted(rows: { keyword: string; canonical: string; technologyId: string | null; category: ExtractedRequirement["category"]; weight: number; required: boolean; sourceLine: string | null }[], techCategory: Map<string, string>): ExtractedRequirement[] {
  return rows.map((r) => {
    const years = /^min-years-(\d+)$/.exec(r.canonical);
    return {
      keyword: r.keyword,
      canonical: r.canonical,
      technologyName: r.technologyId ? r.canonical : null,
      techCategory: r.technologyId ? techCategory.get(r.canonical) ?? null : null,
      category: r.category,
      weight: r.weight,
      required: r.required,
      sourceLine: r.sourceLine ?? "",
      minYears: years ? Number(years[1]) : undefined,
    };
  });
}

async function evidenceFor(candidateId: string, content: ResumeContent): Promise<Evidence> {
  const { candidate, employments } = await candidateEvidence(candidateId);
  const confirmedTechs = new Map<string, string[]>();
  const add = (name: string, ref: string) => confirmedTechs.set(name, [...new Set([...(confirmedTechs.get(name) ?? []), ref])]);
  for (const s of candidate.skills) {
    if (s.status === "UNVERIFIED") continue;
    if (s.source === "JD_CONFIRMATION") continue; // reported separately as user-confirmed
    add(s.technology.canonicalName, s.source === "RESUME_IMPORT" ? "skill:resume" : "skill:profile");
  }
  for (const p of content.projects) for (const t of p.technologies) add(t, `project:${p.id}`);
  return {
    confirmedTechs,
    userConfirmed: new Set(candidate.skills.filter((s) => s.source === "JD_CONFIRMATION").map((s) => s.technology.canonicalName)),
    education: candidate.education.map((e) => `${e.qualification} ${e.institution}`),
    certifications: candidate.certifications.map((c) => `${c.name} ${c.issuer}`),
    totalExperienceMonths: totalExperienceMonths(employments),
  };
}

/** Match a JD against a resume version, persist match states and proposed edits (FR-09). */
export async function matchVersion(user: SessionUser, versionId: string, jdId: string) {
  const version = await prisma.resumeVersion.findUniqueOrThrow({ where: { id: versionId } });
  const resume = await authorizeResume(user, version.resumeId, "read");
  await authorizeJd(user, jdId);
  const content = ResumeContentSchema.parse(version.content);
  const { catalog } = await loadCatalog();
  const rows = await prisma.jDRequirement.findMany({ where: { jobDescriptionId: jdId } });
  const techCategory = new Map((await prisma.technology.findMany({ select: { canonicalName: true, category: true } })).map((t) => [t.canonicalName, t.category]));
  const reqs = toExtracted(rows, techCategory);
  const evidence = await evidenceFor(resume.candidateId, content);
  const matches = matchRequirements(reqs, content, evidence, catalog);
  const suggestions = buildSuggestions(reqs, matches, content, evidence, catalog);
  const rowByKey = new Map(rows.map((r) => [r.technologyId ? r.canonical : r.canonical, r]));

  await prisma.$transaction(async (tx) => {
    for (const m of matches) {
      const row = rowByKey.get(m.requirementKey);
      if (!row) continue;
      await tx.resumeMatch.upsert({
        where: { resumeVersionId_requirementId: { resumeVersionId: versionId, requirementId: row.id } },
        create: { resumeVersionId: versionId, requirementId: row.id, state: m.state, evidenceRefs: m.evidenceRefs, explanation: m.explanation, userConfirmed: m.evidenceRefs.includes("jd-confirmation") },
        update: { state: m.state, evidenceRefs: m.evidenceRefs, explanation: m.explanation, userConfirmed: m.evidenceRefs.includes("jd-confirmation") },
      });
    }
    // Keep decided suggestions (traceability); replace still-pending proposals for this JD.
    await tx.editSuggestion.deleteMany({ where: { resumeVersionId: versionId, jobDescriptionId: jdId, decision: "PROPOSED" } });
    const decided = await tx.editSuggestion.findMany({ where: { resumeVersionId: versionId, jobDescriptionId: jdId }, select: { proposedText: true, section: true, projectRef: true } });
    const decidedKeys = new Set(decided.map((d) => `${d.section}|${d.projectRef}|${d.proposedText}`));
    await tx.editSuggestion.createMany({
      data: suggestions
        .filter((s) => !decidedKeys.has(`${s.section}|${s.projectRef}|${s.proposedText}`))
        .map((s) => ({
          resumeVersionId: versionId,
          jobDescriptionId: jdId,
          section: s.skillCategory ? `SKILLS:${s.skillCategory}` : s.section,
          projectRef: s.projectRef,
          originalText: s.originalText,
          proposedText: s.proposedText,
          jdKeywordRefs: s.jdKeywordRefs,
          evidenceRefs: [...s.evidenceRefs, `rationale:${s.rationale}`],
          requiresConfirmation: s.requiresConfirmation,
        })),
    });
  });
  await audit(user.id, "jd.match", "ResumeVersion", versionId, "SUCCESS", { jdId });
  return { reqs, matches, score: coverageScore(reqs, matches) };
}

export async function decideSuggestion(user: SessionUser, suggestionId: string, decision: "ACCEPTED" | "REJECTED", opts: { editedText?: string; confirmed?: boolean }) {
  const s = await prisma.editSuggestion.findUniqueOrThrow({ where: { id: suggestionId }, include: { resumeVersion: true } });
  const resume = await authorizeResume(user, s.resumeVersion.resumeId, "write");
  if (decision === "ACCEPTED" && s.requiresConfirmation && !opts.confirmed) {
    throw new Error("This suggestion needs explicit confirmation that it accurately reflects the candidate's experience.");
  }
  const proposedText = opts.editedText?.trim() || s.proposedText;
  await prisma.editSuggestion.update({ where: { id: suggestionId }, data: { decision, proposedText, decidedById: user.id, decidedAt: new Date() } });
  // A confirmed technology becomes candidate evidence with provenance (spec §9.3 "retain provenance").
  if (decision === "ACCEPTED" && s.section.startsWith("SKILLS:")) {
    const tech = await prisma.technology.findUnique({ where: { canonicalName: proposedText } });
    if (tech) {
      await prisma.candidateSkill.upsert({
        where: { candidateId_technologyId: { candidateId: resume.candidateId, technologyId: tech.id } },
        create: { candidateId: resume.candidateId, technologyId: tech.id, source: s.requiresConfirmation ? "JD_CONFIRMATION" : "USER_CONFIRMED", status: "CANDIDATE_CONFIRMED" },
        update: {},
      });
    }
  }
  await audit(user.id, `jd.suggestion.${decision.toLowerCase()}`, "EditSuggestion", suggestionId, "SUCCESS", { confirmed: Boolean(opts.confirmed), edited: Boolean(opts.editedText) });
}

/** Apply all accepted suggestions on a version into a new draft version; the original is preserved. */
export async function applyAccepted(user: SessionUser, versionId: string, jdId: string) {
  const version = await prisma.resumeVersion.findUniqueOrThrow({ where: { id: versionId } });
  await authorizeResume(user, version.resumeId, "write");
  const accepted = await prisma.editSuggestion.findMany({ where: { resumeVersionId: versionId, jobDescriptionId: jdId, decision: "ACCEPTED" } });
  if (!accepted.length) throw new Error("No accepted suggestions to apply.");
  const content = ResumeContentSchema.parse(version.content);
  const next = applySuggestions(
    content,
    accepted.map((a) => ({
      key: a.id,
      section: a.section.startsWith("SKILLS") ? "SKILLS" : (a.section as "SUMMARY" | "PROJECT"),
      skillCategory: a.section.startsWith("SKILLS:") ? a.section.slice(7) : undefined,
      projectRef: a.projectRef,
      originalText: a.originalText,
      proposedText: a.proposedText,
      jdKeywordRefs: strs(a.jdKeywordRefs),
      evidenceRefs: strs(a.evidenceRefs).filter((e) => !e.startsWith("rationale:")),
      requiresConfirmation: false,
      rationale: "",
    })),
  );
  // Technologies added through confirmed suggestions are recorded on the relevant project too.
  for (const a of accepted) {
    if (a.section === "PROJECT" && a.projectRef) {
      const techs = strs(a.evidenceRefs).filter((e) => e.startsWith("tech:")).map((e) => e.slice(5));
      const p = next.projects.find((x) => x.id === a.projectRef);
      if (p) for (const t of techs) if (!p.technologies.includes(t)) p.technologies.push(t);
    }
  }
  const created = await saveVersion(user, version.resumeId, next, { parentVersionId: version.id, changeNote: `Tailored to JD (${accepted.length} accepted edit${accepted.length > 1 ? "s" : ""})` });
  await audit(user.id, "jd.apply", "ResumeVersion", created.id, "SUCCESS", { from: versionId, jdId, count: accepted.length });
  return created;
}

// ------------------------------------------------------------------------------------------------
// Update Existing Resume: import a parsed resume as candidate evidence + a resume version
// ------------------------------------------------------------------------------------------------

export async function importParsedResume(
  user: SessionUser,
  parsed: ParsedResume,
  opts: { fullName: string; domainKey: string; roleKey: string; fileName: string; candidateId?: string | null; pageTarget: number },
) {
  await assertCan(user, "candidate:create");
  const { catalog } = await loadCatalog();
  const techRows = await prisma.technology.findMany();
  const techByName = new Map(techRows.map((t) => [t.canonicalName, t]));
  const evidenceNote = `Imported from uploaded resume "${opts.fileName.slice(0, 120)}"`;

  const candidate = opts.candidateId
    ? await authorizeCandidate(user, opts.candidateId, "write")
    : await prisma.candidate.create({
        data: { ownerId: user.id, fullName: opts.fullName, email: parsed.email, phone: parsed.phone, linkedin: parsed.linkedin, domainKey: opts.domainKey, targetRole: opts.roleKey, consentObtainedAt: null },
      });

  const projects: ProjectSection[] = [];
  let position = 1;
  for (const exp of parsed.experiences) {
    const employment = await prisma.employment.create({
      data: { candidateId: candidate.id, employer: exp.employer, location: exp.location, title: exp.title, startDate: new Date(exp.startDate), endDate: exp.endDate ? new Date(exp.endDate) : null, evidence: evidenceNote, status: "CANDIDATE_CONFIRMED" },
    });
    const techs = [...new Set(exp.bullets.flatMap((b) => catalog.find(b).map((f) => f.entry.canonicalName)))];
    const project = await prisma.project.create({
      data: {
        candidateId: candidate.id,
        employmentId: employment.id,
        position: position++,
        title: `${exp.title} — ${exp.employer}`,
        role: exp.title,
        domainKey: opts.domainKey,
        responsibilities: exp.bullets,
        outcomes: [],
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        clientConfirmed: true,
        technologies: { create: techs.filter((t) => techByName.has(t)).map((t) => ({ technologyId: techByName.get(t)!.id, evidence: evidenceNote, confirmed: true })) },
      },
    });
    const verification = await prisma.client.findUnique({ where: { normalizedName: normalizeClientName(exp.employer) } });
    projects.push({
      id: project.id,
      position: project.position,
      title: exp.title,
      client: exp.employer,
      clientConfirmed: true,
      clientVerification: verification?.verificationStatus ?? "CANDIDATE_CONFIRMED",
      location: exp.location,
      role: exp.title,
      domainKey: opts.domainKey,
      subdomain: null,
      startDate: exp.startDate,
      endDate: exp.endDate,
      technologies: techs,
      bullets: exp.bullets.map((text, i): Bullet => ({
        id: shortId("b", `${project.id}:${i}:${text}`),
        section: "PROJECT",
        projectId: project.id,
        type: "PROJECT",
        text,
        action: text.split(/\s+/)[0] ?? null,
        domainConcept: null,
        technologyRefs: catalog.find(text).map((f) => f.entry.canonicalName),
        evidenceRefs: [`import:${opts.fileName.slice(0, 60)}`],
        jdKeywordRefs: [],
        confidence: "high",
        requiresConfirmation: false,
        confirmed: true,
        source: "RESUME_IMPORT",
      })),
    });
  }
  // Skills detected anywhere in the resume become candidate skills with resume provenance.
  for (const name of parsed.detectedTechs) {
    const t = techByName.get(name);
    if (!t) continue;
    await prisma.candidateSkill.upsert({
      where: { candidateId_technologyId: { candidateId: candidate.id, technologyId: t.id } },
      create: { candidateId: candidate.id, technologyId: t.id, source: "RESUME_IMPORT", status: "CANDIDATE_CONFIRMED" },
      update: {},
    });
  }
  for (const e of parsed.education) await prisma.education.create({ data: { candidateId: candidate.id, institution: "", qualification: e } });
  for (const c of parsed.certifications) await prisma.certification.create({ data: { candidateId: candidate.id, issuer: "", name: c } });

  const { employments } = await candidateEvidence(candidate.id);
  const role = await prisma.jobRole.findUniqueOrThrow({ where: { key: opts.roleKey } });
  const domain = await prisma.domain.findUniqueOrThrow({ where: { key: opts.domainKey } });
  const skills = parsed.skills.length
    ? parsed.skills
    : Object.entries(
        parsed.detectedTechs.reduce<Record<string, string[]>>((acc, name) => {
          const cat = techByName.get(name)?.category ?? "Other Tools";
          (acc[cat] ??= []).push(name);
          return acc;
        }, {}),
      ).map(([category, values]) => ({ category, values }));

  const content: ResumeContent = {
    header: { fullName: candidate.fullName, title: parsed.experiences[0]?.title ?? role.name, email: candidate.email, phone: candidate.phone, location: candidate.location, linkedin: candidate.linkedin },
    meta: { domainKey: domain.key, roleKey: role.key, seniority: null, totalExperienceMonths: totalExperienceMonths(employments), projectMode: "STANDARD", pageTarget: opts.pageTarget, templateKey: "classic", isDemo: false, generator: "resume-import-v1" },
    summary: parsed.summary.map((text, i): Bullet => ({
      id: shortId("b", `sum:${i}:${text}`),
      section: "SUMMARY",
      projectId: null,
      type: "PRIMARY",
      text,
      action: text.split(/\s+/)[0] ?? null,
      domainConcept: null,
      technologyRefs: catalog.find(text).map((f) => f.entry.canonicalName),
      evidenceRefs: [`import:${opts.fileName.slice(0, 60)}`],
      jdKeywordRefs: [],
      confidence: "high",
      requiresConfirmation: false,
      confirmed: true,
      source: "RESUME_IMPORT",
    })),
    projects,
    skills,
    education: parsed.education,
    certifications: parsed.certifications,
    extraSections: [],
  };
  const resume = await prisma.resume.create({ data: { candidateId: candidate.id, title: `${candidate.fullName} — ${role.name} (${domain.name}, imported)`, domainKey: domain.key, roleKey: role.key } });
  const version = await saveVersion(user, resume.id, content, { changeNote: `Original imported from ${opts.fileName.slice(0, 80)}` });
  await audit(user.id, "resume.import", "Resume", resume.id, "SUCCESS", { experiences: parsed.experiences.length });
  return { candidate, resume, version };
}

