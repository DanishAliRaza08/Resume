// Resume orchestration: build generation input from verified records, run idempotent generation
// jobs, persist immutable versions, run validation, and drive the review workflow (spec §5, §10.4).
import type { Prisma, ProjectMode, ResumeStatus } from "@prisma/client";
import { generateResume, type GenerationInput, type GenProject } from "../generator";
import { ResumeContent } from "../resume-schema";
import { toDate, type Interval } from "../timeline";
import { validateResume, type ValidationReport } from "../validation";
import { polishBullets } from "./ai";
import { audit, logEvent } from "./audit";
import type { SessionUser } from "./auth";
import { getSettings, loadCatalog } from "./catalog";
import { prisma } from "./db";
import { AccessDenied, assertCan, authorizeCandidate, authorizeResume } from "./permissions";

export const CONFIG_VERSION = "gen-config-2026.10";

export interface ResumeRequest {
  candidateId: string;
  domainKey: string;
  roleKey: string;
  seniority: string | null;
  targetTitle: string | null;
  projectIds: string[];
  mode: ProjectMode;
  pageTarget: number;
  templateKey: string;
  includeHighlights: boolean;
  useAi: boolean;
  resumeId?: string; // regenerate into an existing resume as a new version
}

export async function candidateEvidence(candidateId: string) {
  const candidate = await prisma.candidate.findUniqueOrThrow({
    where: { id: candidateId },
    include: {
      employments: { orderBy: { startDate: "desc" } },
      education: true,
      certifications: true,
      skills: { include: { technology: true } },
      projects: { include: { technologies: { include: { technology: true } }, template: true, employment: true }, orderBy: { position: "asc" } },
    },
  });
  const employments: Interval[] = candidate.employments.map((e) => ({
    start: toDate(e.startDate),
    end: e.endDate ? toDate(e.endDate) : null,
    label: `${e.employer} (${e.title})`,
    concurrent: e.engagement !== "FULL_TIME",
  }));
  const confirmedTechs = new Set<string>([
    ...candidate.skills.filter((s) => s.status !== "UNVERIFIED").map((s) => s.technology.canonicalName),
    ...candidate.projects.flatMap((p) => p.technologies.filter((t) => t.confirmed).map((t) => t.technology.canonicalName)),
  ]);
  return { candidate, employments, confirmedTechs };
}

async function clientVerification(name: string): Promise<{ status: "UNVERIFIED" | "CANDIDATE_CONFIRMED" | "VERIFIED"; isDemo: boolean; id: string | null }> {
  const client = await prisma.client.findUnique({ where: { normalizedName: normalizeClientName(name) } });
  if (!client) return { status: "CANDIDATE_CONFIRMED", isDemo: false, id: null };
  return { status: client.verificationStatus, isDemo: client.isDemo, id: client.id };
}

export function normalizeClientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(demo\)/g, " demo ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(inc|llc|ltd|corp|corporation|co|company|plc|group)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function buildInput(req: ResumeRequest): Promise<GenerationInput> {
  const [{ candidate, employments }, domain, role, { catalog }] = await Promise.all([
    candidateEvidence(req.candidateId),
    prisma.domain.findUniqueOrThrow({ where: { key: req.domainKey } }),
    prisma.jobRole.findUniqueOrThrow({ where: { key: req.roleKey } }),
    loadCatalog(),
  ]);
  const { DOMAINS } = await import("@/data/domains");
  const industryPhrase = DOMAINS.find((d) => d.key === domain.key)?.industryPhrase ?? domain.name;
  const selected = req.projectIds.length ? candidate.projects.filter((p) => req.projectIds.includes(p.id)) : candidate.projects.slice(0, 5);
  let isDemo = false;
  const projects: GenProject[] = [];
  for (const p of selected) {
    const client = p.employment?.employer ?? "Unspecified employer";
    const v = await clientVerification(client);
    isDemo ||= v.isDemo;
    projects.push({
      id: p.id,
      position: p.position,
      title: p.title,
      client,
      clientConfirmed: p.clientConfirmed,
      clientVerification: v.status,
      location: p.employment?.location ?? null,
      role: p.role,
      domainKey: p.domainKey,
      subdomain: p.subdomain,
      startDate: p.startDate.toISOString().slice(0, 10),
      endDate: p.endDate ? p.endDate.toISOString().slice(0, 10) : null,
      responsibilities: p.responsibilities,
      outcomes: p.outcomes,
      technologies: p.technologies.map((t) => ({ name: t.technology.canonicalName, category: t.technology.category, confirmed: t.confirmed })),
      template: p.template ? { name: p.template.name, domainBullets: p.template.domainBullets, projectBullets: p.template.projectBullets, qaBullets: p.template.qaBullets } : null,
    });
  }
  return {
    candidate: { fullName: candidate.fullName, email: candidate.email, phone: candidate.phone, location: candidate.location, linkedin: candidate.linkedin, targetTitle: req.targetTitle },
    domain: { key: domain.key, name: domain.name, industryPhrase },
    role: { key: role.key, name: role.name, skillCategories: role.skillCategories, summaryFocus: role.summaryFocus, includeQaBullets: role.includeQaBullets },
    seniority: req.seniority,
    employments,
    projects,
    candidateSkills: candidate.skills.filter((s) => s.status !== "UNVERIFIED").map((s) => ({ name: s.technology.canonicalName, category: s.technology.category, confirmed: true })),
    education: candidate.education.map((e) => [e.qualification, e.institution].filter(Boolean).join(" — ")),
    certifications: candidate.certifications.map((c) => [c.name, c.issuer].filter(Boolean).join(" — ")),
    mode: req.mode,
    pageTarget: req.pageTarget,
    templateKey: req.templateKey,
    includeHighlights: req.includeHighlights,
    isDemo,
    catalog,
  };
}

export async function validateForCandidate(candidateId: string, content: unknown): Promise<ValidationReport> {
  const [{ employments, confirmedTechs }, { catalog, availability }] = await Promise.all([candidateEvidence(candidateId), loadCatalog()]);
  const report = validateResume(content, { catalog, confirmedTechs, employments, techAvailability: availability });
  const settings = await getSettings();
  if (settings.blockUnverifiedClientsOnApproval) {
    // Unverified library clients block approval by default (spec §8.2).
    for (const i of report.issues) if (i.code === "CLIENT_UNVERIFIED") i.severity = "critical";
    report.counts = { critical: 0, warning: 0, info: 0 };
    for (const i of report.issues) report.counts[i.severity]++;
    report.blocking = report.counts.critical > 0;
  }
  return report;
}

/**
 * Re-derive fields the server owns instead of trusting submitted content: experience totals,
 * client verification/confirmation, demo status, and project technologies (limited to confirmed ones).
 */
export async function refreshServerFields(candidateId: string, content: ResumeContent): Promise<ResumeContent> {
  const { employments, candidate } = await candidateEvidence(candidateId);
  const next = structuredClone(content);
  const { totalExperienceMonths } = await import("../timeline");
  next.meta.totalExperienceMonths = totalExperienceMonths(employments);
  let isDemo = false;
  for (const p of next.projects) {
    const v = await clientVerification(p.client);
    p.clientVerification = v.status;
    isDemo ||= v.isDemo;
    const dbProject = candidate.projects.find((x) => x.id === p.id);
    if (dbProject) {
      p.clientConfirmed = dbProject.clientConfirmed;
      const confirmed = new Set(dbProject.technologies.filter((t) => t.confirmed).map((t) => t.technology.canonicalName));
      const skills = new Set(candidate.skills.map((s) => s.technology.canonicalName));
      p.technologies = p.technologies.filter((t) => confirmed.has(t) || skills.has(t));
    } else {
      p.clientConfirmed = false;
    }
  }
  next.meta.isDemo = isDemo;
  return next;
}

/** Create a new immutable version. Previous versions (including approved ones) are never modified. */
export async function saveVersion(
  user: SessionUser,
  resumeId: string,
  content: unknown,
  opts: { parentVersionId?: string | null; changeNote?: string; templateKey?: string; pageTarget?: number; projectMode?: ProjectMode },
) {
  const resume = await authorizeResume(user, resumeId, "write");
  const parsed = await refreshServerFields(resume.candidateId, ResumeContent.parse(content));
  const validation = await validateForCandidate(resume.candidateId, parsed);
  const version = await prisma.$transaction(async (tx) => {
    const last = await tx.resumeVersion.findFirst({ where: { resumeId }, orderBy: { version: "desc" }, select: { version: true } });
    return tx.resumeVersion.create({
      data: {
        resumeId,
        version: (last?.version ?? 0) + 1,
        templateKey: opts.templateKey ?? parsed.meta.templateKey,
        pageTarget: opts.pageTarget ?? parsed.meta.pageTarget,
        projectMode: opts.projectMode ?? parsed.meta.projectMode,
        content: parsed as unknown as Prisma.InputJsonValue,
        validation: validation as unknown as Prisma.InputJsonValue,
        parentVersionId: opts.parentVersionId ?? null,
        changeNote: opts.changeNote ?? null,
        createdById: user.id,
      },
    });
  });
  await prisma.resume.update({ where: { id: resumeId }, data: { updatedAt: new Date() } });
  await audit(user.id, "resume.version.create", "ResumeVersion", version.id, "SUCCESS", { resumeId, version: version.version, note: opts.changeNote ?? null });
  return version;
}

/** Record client usage for rotation analytics (AT-08). */
async function recordClientUsage(resumeId: string, content: ResumeContent) {
  for (const p of content.projects) {
    const client = await prisma.client.findUnique({ where: { normalizedName: normalizeClientName(p.client) } });
    if (!client) continue;
    await prisma.clientUsage.create({ data: { clientId: client.id, resumeId } });
    await prisma.client.update({ where: { id: client.id }, data: { usageCount: { increment: 1 }, lastUsedAt: new Date() } });
  }
}

/**
 * Start (or return) an idempotent generation job. A retry with the same idempotency key returns the
 * existing job rather than creating a duplicate version (AT-14).
 */
export async function startGenerationJob(user: SessionUser, req: ResumeRequest, idempotencyKey: string) {
  await assertCan(user, "resume:generate");
  await authorizeCandidate(user, req.candidateId, "write");
  if (req.resumeId) await authorizeResume(user, req.resumeId, "write");
  const existing = await prisma.generationJob.findUnique({ where: { idempotencyKey } });
  if (existing) {
    if (existing.createdById !== user.id) throw new AccessDenied();
    return existing;
  }
  const job = await prisma.generationJob.create({
    data: { idempotencyKey, kind: "NEW_RESUME", status: "QUEUED", input: req as unknown as Prisma.InputJsonValue, configVersion: CONFIG_VERSION, createdById: user.id, resumeId: req.resumeId ?? null },
  });
  await audit(user.id, "resume.job.start", "GenerationJob", job.id);
  return job;
}

/** Execute a queued/failed job. Safe to call repeatedly: a succeeded job is never re-run. */
export async function runGenerationJob(jobId: string, opts: { simulateAiTimeout?: boolean } = {}) {
  const claimed = await prisma.generationJob.updateMany({ where: { id: jobId, status: { in: ["QUEUED", "FAILED"] } }, data: { status: "RUNNING", attempts: { increment: 1 } } });
  if (claimed.count === 0) return prisma.generationJob.findUniqueOrThrow({ where: { id: jobId } });
  const job = await prisma.generationJob.findUniqueOrThrow({ where: { id: jobId } });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: job.createdById }, select: { id: true, email: true, name: true, role: true, status: true } });
  const req = job.input as unknown as ResumeRequest;
  const started = Date.now();
  try {
    const input = await buildInput(req);
    const { content: draft, warnings } = generateResume(input);
    let content = draft;
    let usage = null;
    const settings = await getSettings();
    if (req.useAi && settings.aiEnabled) {
      if (opts.simulateAiTimeout) throw new Error("AI service timed out");
      const { catalog } = await loadCatalog();
      const polished = await polishBullets(content, catalog);
      content = polished.content;
      usage = polished.usage;
    }
    let resumeId = job.resumeId;
    if (!resumeId) {
      const domain = await prisma.domain.findUniqueOrThrow({ where: { key: req.domainKey } });
      const role = await prisma.jobRole.findUniqueOrThrow({ where: { key: req.roleKey } });
      const resume = await prisma.resume.create({
        data: { candidateId: req.candidateId, title: `${input.candidate.fullName} — ${role.name} (${domain.name})`, domainKey: req.domainKey, roleKey: req.roleKey },
      });
      resumeId = resume.id;
    }
    const version = await saveVersion(user, resumeId, content, { changeNote: `Generated (${req.mode.toLowerCase().replace("_", "-")}, ${content.meta.generator})`, templateKey: req.templateKey, pageTarget: req.pageTarget, projectMode: req.mode });
    await recordClientUsage(resumeId, content);
    for (const p of input.projects) if (p.template) await prisma.projectTemplate.updateMany({ where: { name: p.template.name }, data: { usageCount: { increment: 1 } } });
    const done = await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: "SUCCEEDED",
        resumeId,
        outputVersionId: version.id,
        inputVersion: version.version,
        warnings: warnings as unknown as Prisma.InputJsonValue,
        durationMs: Date.now() - started,
        modelName: usage?.model ?? "deterministic",
        inputTokens: usage?.inputTokens ?? 0,
        outputTokens: usage?.outputTokens ?? 0,
        costUsd: usage?.costUsd ?? 0,
        errorDetails: null,
      },
    });
    logEvent("info", "generation job succeeded", { jobId, durationMs: Date.now() - started, model: usage?.model ?? "deterministic" });
    return done;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logEvent("error", "generation job failed", { jobId, error: message });
    await audit(user.id, "resume.job.fail", "GenerationJob", jobId, "FAILURE", { error: message.slice(0, 200) });
    return prisma.generationJob.update({ where: { id: jobId }, data: { status: "FAILED", errorDetails: message.slice(0, 500), durationMs: Date.now() - started } });
  }
}

// ------------------------------------------------------------------------------------------------
// Review workflow: Draft → Automated checks → Human review → Approved → Exported (spec §5.3)
// ------------------------------------------------------------------------------------------------

const TRANSITIONS: Record<ResumeStatus, ResumeStatus[]> = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  REJECTED: [],
  APPROVED: ["EXPORTED"],
  EXPORTED: [],
};

export async function transitionVersion(user: SessionUser, versionId: string, to: ResumeStatus, note?: string) {
  const version = await prisma.resumeVersion.findUniqueOrThrow({ where: { id: versionId } });
  await authorizeResume(user, version.resumeId, to === "IN_REVIEW" ? "write" : "read");
  if (!TRANSITIONS[version.status].includes(to)) throw new Error(`A ${version.status.toLowerCase()} version cannot move to ${to.toLowerCase()}.`);
  if (to === "APPROVED" || to === "REJECTED") {
    await assertCan(user, "resume:review", "ResumeVersion", versionId);
    if (version.createdById === user.id && user.role !== "ADMIN") throw new AccessDenied("A different person must review this version.");
  }
  if (to === "REJECTED" && !note?.trim()) throw new Error("A rejection reason is required.");
  if (to === "IN_REVIEW" || to === "APPROVED") {
    const resume = await prisma.resume.findUniqueOrThrow({ where: { id: version.resumeId } });
    const report = await validateForCandidate(resume.candidateId, version.content);
    await prisma.resumeVersion.update({ where: { id: versionId }, data: { validation: report as unknown as Prisma.InputJsonValue } });
    if (to === "APPROVED" && report.blocking) throw new Error(`Cannot approve: ${report.counts.critical} critical issue(s) remain. Resolve them in a new draft version.`);
  }
  const updated = await prisma.resumeVersion.update({
    where: { id: versionId },
    data: { status: to, ...(to === "APPROVED" || to === "REJECTED" ? { reviewedById: user.id, reviewedAt: new Date(), reviewNote: note ?? null } : {}) },
  });
  await audit(user.id, `resume.version.${to.toLowerCase()}`, "ResumeVersion", versionId, "SUCCESS", note ? { note: note.slice(0, 300) } : undefined);
  return updated;
}
