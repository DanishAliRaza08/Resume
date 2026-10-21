// Dice Apply assistant: saved screening answers, a queue of Dice jobs per candidate, per-job
// tailored resumes, and application tracking/reporting. The candidate submits each application
// on Dice themselves; this service never logs into Dice or submits anything on their behalf.
import type { Prisma } from "@prisma/client";
import { SCREENING_QUESTIONS } from "@/data/screening";
import { parseJobLinks } from "../jobs";
import { ResumeContent } from "../resume-schema";
import { totalExperienceMonths } from "../timeline";
import { audit } from "./audit";
import type { SessionUser } from "./auth";
import { prisma } from "./db";
import { createJobDescription, tailorContent } from "./jd-service";
import { fetchDiceJob } from "./job-fetch";
import { AccessDenied, authorizeCandidate } from "./permissions";
import { candidateEvidence } from "./resume-service";

export type Answers = Record<string, string>;
export type CustomAnswer = { question: string; answer: string };

/** Answers to show: saved values, or values derived from the candidate profile when not yet saved. */
export async function getProfile(user: SessionUser, candidateId: string) {
  const candidate = await authorizeCandidate(user, candidateId, "read");
  const saved = await prisma.applicantProfile.findUnique({ where: { candidateId } });
  const { employments, candidate: full } = await candidateEvidence(candidateId);
  const [first, ...rest] = candidate.fullName.replace(/\(demo\)/i, "").trim().split(/\s+/);
  const [city, state] = (candidate.location ?? "").split(",").map((s) => s.trim());
  const derived: Answers = {
    first_name: first ?? "",
    last_name: rest.join(" "),
    email: candidate.email ?? "",
    phone: candidate.phone ?? "",
    linkedin: candidate.linkedin ?? "",
    city: city ?? "",
    state: state ?? "",
    country: "United States",
    years_experience: employments.length ? String(Math.floor(totalExperienceMonths(employments) / 12)) : "",
    highest_education: /master|m\.s|mba/i.test(full.education.map((e) => e.qualification).join(" ")) ? "Master's" : /bachelor|b\.s|b\.a|b\.tech/i.test(full.education.map((e) => e.qualification).join(" ")) ? "Bachelor's" : "",
  };
  const answers: Answers = { ...derived, ...((saved?.answers as Answers | null) ?? {}) };
  for (const k of Object.keys(answers)) if (answers[k] === undefined || answers[k] === null) answers[k] = "";
  const custom = ((saved?.custom as CustomAnswer[] | null) ?? []).filter((c) => c && c.question);
  return { candidate, answers, custom, baseResumeId: saved?.baseResumeId ?? null, saved: Boolean(saved) };
}

export async function saveProfile(user: SessionUser, candidateId: string, answers: Answers, custom: CustomAnswer[], baseResumeId: string | null) {
  await authorizeCandidate(user, candidateId, "write");
  if (baseResumeId) {
    const r = await prisma.resume.findFirst({ where: { id: baseResumeId, candidateId } });
    if (!r) throw new Error("Choose one of this person's resumes.");
  }
  const allowed = new Set(SCREENING_QUESTIONS.map((q) => q.key));
  const clean: Answers = {};
  for (const [k, v] of Object.entries(answers)) if (allowed.has(k)) clean[k] = String(v ?? "").slice(0, 300).trim();
  const cleanCustom = custom.filter((c) => c.question.trim()).slice(0, 50).map((c) => ({ question: c.question.slice(0, 300).trim(), answer: c.answer.slice(0, 1000).trim() }));
  await prisma.applicantProfile.upsert({
    where: { candidateId },
    create: { candidateId, answers: clean, custom: cleanCustom, baseResumeId },
    update: { answers: clean, custom: cleanCustom, baseResumeId },
  });
  await audit(user.id, "apply.profile.save", "Candidate", candidateId);
}

/** Add Dice job links to the candidate's queue. Already-queued jobs are skipped (never applied twice). */
export async function addJobs(user: SessionUser, candidateId: string, text: string) {
  await authorizeCandidate(user, candidateId, "write");
  const { links, invalid, truncated } = parseJobLinks(text, 500);
  if (!links.length) throw new Error(invalid.length ? "Only Dice job links (https://www.dice.com/job-detail/…) can be added." : "Paste at least one Dice job link.");
  const existing = new Set((await prisma.jobApplication.findMany({ where: { candidateId, jobKey: { in: links.map((l) => l.key) } }, select: { jobKey: true } })).map((e) => e.jobKey));
  const fresh = links.filter((l) => !existing.has(l.key));
  if (fresh.length) {
    await prisma.jobApplication.createMany({ data: fresh.map((l) => ({ ownerId: user.id, candidateId, jobKey: l.key, jobUrl: l.url, source: "DICE" })), skipDuplicates: true });
  }
  await audit(user.id, "apply.jobs.add", "Candidate", candidateId, "SUCCESS", { added: fresh.length, duplicates: links.length - fresh.length, invalid: invalid.length });
  return { added: fresh.length, duplicates: links.length - fresh.length, invalid, truncated };
}

export async function authorizeApplication(user: SessionUser, applicationId: string, access: "read" | "write" = "write") {
  const app = await prisma.jobApplication.findUnique({ where: { id: applicationId } });
  if (!app) throw new AccessDenied("Record not found.");
  await authorizeCandidate(user, app.candidateId, access);
  return app;
}

/** Read the job (title, company, description) and compute its coverage against the base resume. */
export async function prepareJob(user: SessionUser, applicationId: string, pastedDescription?: string) {
  const app = await authorizeApplication(user, applicationId);
  let description = pastedDescription?.trim() || null;
  let meta = { title: app.title, company: app.company, location: app.location };
  if (!description && !app.jobDescriptionId) {
    try {
      const posting = await fetchDiceJob(app.jobUrl);
      description = posting.description;
      meta = { title: posting.title ?? app.title, company: posting.company ?? app.company, location: posting.location ?? app.location };
    } catch (err) {
      await prisma.jobApplication.update({ where: { id: app.id }, data: { fetchError: (err instanceof Error ? err.message : String(err)).slice(0, 480) } });
      return prisma.jobApplication.findUniqueOrThrow({ where: { id: app.id } });
    }
  }
  let jobDescriptionId = app.jobDescriptionId;
  if (description) {
    if (description.length < 40) throw new Error("Paste the full job description.");
    const jd = await createJobDescription(user, { title: (meta.title ?? "Dice job").slice(0, 200), text: description.slice(0, 200_000) });
    jobDescriptionId = jd.id;
  }
  const coverage = jobDescriptionId ? await scoreFor(user, app.candidateId, jobDescriptionId) : null;
  return prisma.jobApplication.update({
    where: { id: app.id },
    data: { ...meta, jobDescriptionId, coverage: coverage ?? undefined, fetchError: null },
  });
}

async function baseContent(candidateId: string): Promise<{ content: ResumeContent; resumeId: string } | null> {
  const profile = await prisma.applicantProfile.findUnique({ where: { candidateId } });
  const resume = profile?.baseResumeId
    ? await prisma.resume.findFirst({ where: { id: profile.baseResumeId, candidateId } })
    : await prisma.resume.findFirst({ where: { candidateId }, orderBy: { updatedAt: "desc" } });
  if (!resume) return null;
  const version = await prisma.resumeVersion.findFirst({ where: { resumeId: resume.id }, orderBy: { version: "desc" } });
  if (!version) return null;
  return { content: ResumeContent.parse(version.content), resumeId: resume.id };
}

async function scoreFor(user: SessionUser, candidateId: string, jobDescriptionId: string): Promise<number | null> {
  const base = await baseContent(candidateId);
  if (!base) return null;
  const jd = await prisma.jobDescription.findUniqueOrThrow({ where: { id: jobDescriptionId } });
  return (await tailorContent(candidateId, base.content, jd.extractedText)).score.score;
}

/** Resume content tailored to this job (evidence-backed edits only). */
export async function tailoredForApplication(user: SessionUser, applicationId: string) {
  const app = await authorizeApplication(user, applicationId, "read");
  const base = await baseContent(app.candidateId);
  if (!base) throw new Error("Create a resume for this person first.");
  if (!app.jobDescriptionId) return { app, content: base.content, tailored: false, missing: [] as string[] };
  const jd = await prisma.jobDescription.findUniqueOrThrow({ where: { id: app.jobDescriptionId } });
  const t = await tailorContent(app.candidateId, base.content, jd.extractedText);
  return { app, content: t.content, tailored: t.applied > 0, missing: t.missing };
}

const STATUS_TIME: Partial<Record<string, "openedAt" | "appliedAt">> = { OPENED: "openedAt", APPLIED: "appliedAt" };

export async function setStatus(user: SessionUser, applicationId: string, status: "OPENED" | "APPLIED" | "SKIPPED" | "NOT_AVAILABLE" | "READY", notes?: string) {
  const app = await authorizeApplication(user, applicationId);
  const stamp = STATUS_TIME[status];
  const data: Prisma.JobApplicationUpdateInput = { status, ...(notes !== undefined ? { notes: notes.slice(0, 2000) } : {}) };
  if (stamp && !app[stamp]) data[stamp] = new Date();
  if (status === "READY") data.appliedAt = null;
  await prisma.jobApplication.update({ where: { id: app.id }, data });
  await audit(user.id, `apply.status.${status.toLowerCase()}`, "JobApplication", app.id);
}

export async function report(user: SessionUser, candidateId: string) {
  await authorizeCandidate(user, candidateId, "read");
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [byStatus, today, week, avg] = await Promise.all([
    prisma.jobApplication.groupBy({ by: ["status"], where: { candidateId }, _count: { _all: true } }),
    prisma.jobApplication.count({ where: { candidateId, status: "APPLIED", appliedAt: { gte: startOfDay } } }),
    prisma.jobApplication.count({ where: { candidateId, status: "APPLIED", appliedAt: { gte: weekAgo } } }),
    prisma.jobApplication.aggregate({ where: { candidateId, status: "APPLIED", coverage: { not: null } }, _avg: { coverage: true } }),
  ]);
  const count = (s: string) => byStatus.find((b) => b.status === s)?._count._all ?? 0;
  const total = byStatus.reduce((a, b) => a + b._count._all, 0);
  return {
    total,
    applied: count("APPLIED"),
    remaining: count("READY") + count("OPENED"),
    opened: count("OPENED"),
    skipped: count("SKIPPED") + count("NOT_AVAILABLE"),
    today,
    week,
    avgCoverage: avg._avg.coverage === null ? null : Math.round(avg._avg.coverage),
  };
}

export function answerSheet(answers: Answers, custom: CustomAnswer[]) {
  return [
    ...SCREENING_QUESTIONS.map((q) => ({ question: q.label, answer: answers[q.key] ?? "", type: q.type, group: q.group })),
    ...custom.map((c) => ({ question: c.question, answer: c.answer, type: "text" as const, group: "Your own questions" })),
  ];
}


/**
 * Portable "answer code" for the browser helper: the saved answers plus the keywords used to
 * recognise each question on an application form. Only answered questions are included.
 */
export function answerCode(candidateName: string, answers: Answers, custom: CustomAnswer[]): string {
  return Buffer.from(JSON.stringify(answerPayload(candidateName, answers, custom)), "utf8").toString("base64");
}

export function answerPayload(candidateName: string, answers: Answers, custom: CustomAnswer[]) {
  return {
    v: 1,
    candidate: candidateName,
    answers: SCREENING_QUESTIONS.filter((q) => (answers[q.key] ?? "").trim()).map((q) => ({ key: q.key, label: q.label, type: q.type, keywords: q.keywords, answer: answers[q.key].trim() })),
    custom: custom.filter((c) => c.question.trim() && c.answer.trim()),
  };
}

export type AutoOutcome = "APPLIED" | "SKIPPED" | "NOT_AVAILABLE" | "ALREADY_APPLIED" | "NEEDS_ANSWERS";

/** Record one result from the extension's auto-apply run (never counts a job twice). */
export async function recordAutoResult(
  user: SessionUser,
  candidateId: string,
  r: { jobUrl: string; outcome: AutoOutcome; title?: string | null; company?: string | null; location?: string | null; reason?: string | null; questions?: string[] },
) {
  await authorizeCandidate(user, candidateId, "write");
  const { links } = parseJobLinks(r.jobUrl, 1);
  if (!links.length) throw new Error("Only Dice job links are accepted.");
  const { key, url } = links[0];
  const status = r.outcome === "APPLIED" ? "APPLIED" : r.outcome === "NOT_AVAILABLE" ? "NOT_AVAILABLE" : "SKIPPED";
  const questions = (r.questions ?? []).map((q) => q.replace(/\s+/g, " ").trim().slice(0, 300)).filter(Boolean).slice(0, 15);
  const notes =
    r.outcome === "NEEDS_ANSWERS"
      ? `Needs answers: ${questions.join(" | ") || "a required question"}`
      : r.outcome === "ALREADY_APPLIED"
        ? "Already applied on Dice earlier."
        : [r.outcome === "APPLIED" ? "Auto-applied by the Dice Helper." : null, r.reason].filter(Boolean).join(" ");
  const meta = { title: r.title?.slice(0, 300) || undefined, company: r.company?.slice(0, 300) || undefined, location: r.location?.slice(0, 300) || undefined };
  const existing = await prisma.jobApplication.findUnique({ where: { candidateId_jobKey: { candidateId, jobKey: key } } });
  if (existing?.status === "APPLIED") return existing; // never downgrade or double count
  const data = { ...meta, status, notes: notes.slice(0, 2000) || null, ...(status === "APPLIED" ? { appliedAt: new Date() } : {}) } as const;
  const app = existing
    ? await prisma.jobApplication.update({ where: { id: existing.id }, data })
    : await prisma.jobApplication.create({ data: { ownerId: user.id, candidateId, jobKey: key, jobUrl: url, source: "DICE", ...data } });
  await audit(user.id, `apply.auto.${r.outcome.toLowerCase()}`, "JobApplication", app.id);
  return app;
}

/** Questions that stopped auto-apply recently (most frequent first), so the user can answer them once. */
export async function pendingQuestions(user: SessionUser, candidateId: string): Promise<{ question: string; count: number }[]> {
  await authorizeCandidate(user, candidateId, "read");
  const rows = await prisma.jobApplication.findMany({ where: { candidateId, status: "SKIPPED", notes: { startsWith: "Needs answers:" } }, select: { notes: true }, orderBy: { updatedAt: "desc" }, take: 300 });
  const { custom } = await getProfile(user, candidateId);
  const answered = new Set(custom.filter((c) => c.answer.trim()).map((c) => c.question.toLowerCase().trim()));
  const counts = new Map<string, number>();
  for (const r of rows)
    for (const q of (r.notes ?? "").replace(/^Needs answers:\s*/, "").split(" | ").map((x) => x.trim()).filter(Boolean)) {
      if (answered.has(q.toLowerCase())) continue;
      counts.set(q, (counts.get(q) ?? 0) + 1);
    }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([question, count]) => ({ question, count }));
}

