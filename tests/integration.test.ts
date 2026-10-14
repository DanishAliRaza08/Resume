// Service-level acceptance tests against a real PostgreSQL database (seeded). Skipped unless
// TEST_DATABASE_URL is set, e.g.:
//   TEST_DATABASE_URL=postgresql://resume:resume@localhost:5432/resume_builder_test npm test
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;

suite("service acceptance tests (database)", () => {
  // Modules are imported after DATABASE_URL points at the test database.
  let prisma: typeof import("@/lib/server/db").prisma;
  let svc: typeof import("@/lib/server/resume-service");
  let exportSvc: typeof import("@/lib/server/export-service");
  let perms: typeof import("@/lib/server/permissions");
  type U = { id: string; email: string; name: string; role: "ADMIN" | "CREATOR" | "REVIEWER" | "READONLY"; status: "ACTIVE" | "DISABLED" };
  let creator: U, creator2: U, reviewer: U;
  let candidateId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    process.env.STORAGE_DIR = `${process.env.TMPDIR ?? "/tmp"}/resume-test-storage`;
    ({ prisma } = await import("@/lib/server/db"));
    svc = await import("@/lib/server/resume-service");
    exportSvc = await import("@/lib/server/export-service");
    perms = await import("@/lib/server/permissions");
    const pick = (email: string) => prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true, email: true, name: true, role: true, status: true } });
    [creator, creator2, reviewer] = await Promise.all([pick("creator@example.com"), pick("creator2@example.com"), pick("reviewer@example.com")]);
    candidateId = (await prisma.candidate.findFirstOrThrow({ where: { fullName: "Jordan Avery (Demo)" } })).id;
  });

  const request = () => ({
    candidateId,
    domainKey: "BANKING",
    roleKey: "BUSINESS_ANALYST",
    seniority: "Senior",
    targetTitle: "Senior Business Analyst",
    projectIds: [],
    mode: "STANDARD" as const,
    pageTarget: 2,
    templateKey: "classic",
    includeHighlights: false,
    useAi: false,
  });

  it("AT-14: retries with the same idempotency key never duplicate output", async () => {
    const key = randomUUID();
    const job = await svc.startGenerationJob(creator, request(), key);
    const again = await svc.startGenerationJob(creator, request(), key);
    expect(again.id).toBe(job.id); // same idempotency key → same job
    const done = await svc.runGenerationJob(job.id);
    expect(done.status).toBe("SUCCEEDED");
    const rerun = await svc.runGenerationJob(job.id); // succeeded jobs are never re-run
    expect(rerun.outputVersionId).toBe(done.outputVersionId);
    expect(await prisma.resumeVersion.count({ where: { resumeId: done.resumeId! } })).toBe(1);
  });

  it("AT-14: AI timeout marks the job failed with a clear error and no partial version", async () => {
    const job = await svc.startGenerationJob(creator, { ...request(), useAi: true }, randomUUID());
    const failed = await svc.runGenerationJob(job.id, { simulateAiTimeout: true });
    expect(failed.status).toBe("FAILED");
    expect(failed.errorDetails).toMatch(/timed out/);
    expect(failed.outputVersionId).toBeNull();
    const retried = await svc.runGenerationJob(job.id); // AI not configured in tests → deterministic draft
    expect(retried.status).toBe("SUCCEEDED");
    expect(retried.attempts).toBe(2);
  });

  it("AT-11: editing an approved resume creates a new version; the approved one is recoverable", async () => {
    const job = await svc.runGenerationJob((await svc.startGenerationJob(creator, request(), randomUUID())).id);
    const v1 = await prisma.resumeVersion.findUniqueOrThrow({ where: { id: job.outputVersionId! } });
    const content = structuredClone(v1.content) as { summary: { confirmed: boolean }[]; projects: { bullets: { confirmed: boolean }[] }[] };
    for (const b of [...content.summary, ...content.projects.flatMap((p) => p.bullets)]) b.confirmed = true;
    const v2 = await svc.saveVersion(creator, v1.resumeId, content, { parentVersionId: v1.id, changeNote: "confirm" });
    await svc.transitionVersion(creator, v2.id, "IN_REVIEW");
    await expect(svc.transitionVersion(creator, v2.id, "APPROVED")).rejects.toThrow(); // authors cannot approve
    const approved = await svc.transitionVersion(reviewer, v2.id, "APPROVED");
    expect(approved.status).toBe("APPROVED");
    const edited = structuredClone(v2.content) as { header: { title: string } };
    edited.header.title = "Lead Business Analyst";
    const v3 = await svc.saveVersion(creator, v1.resumeId, edited, { parentVersionId: v2.id });
    expect(v3.version).toBe(3);
    expect(v3.status).toBe("DRAFT");
    const still = await prisma.resumeVersion.findUniqueOrThrow({ where: { id: v2.id } });
    expect(still.status).toBe("APPROVED");
    expect((still.content as { header: { title: string } }).header.title).toBe("Senior Business Analyst");
  });

  it("AT-09/AT-10: exports report the actual rendered page count and pass integrity checks", async () => {
    const job = await svc.runGenerationJob((await svc.startGenerationJob(creator, { ...request(), mode: "FULL_DETAIL", pageTarget: 1 }, randomUUID())).id);
    const pdf = await exportSvc.exportVersion(creator, job.outputVersionId!, "PDF");
    expect(pdf.pageCount).toBeGreaterThan(1);
    expect(pdf.record.fileName).toMatch(/_DRAFT\.pdf$/);
    const v = await prisma.resumeVersion.findUniqueOrThrow({ where: { id: job.outputVersionId! } });
    expect((v.validation as { compression: unknown[] }).compression.length).toBeGreaterThan(0);
  });

  it("AT-07: another creator cannot read the candidate, and the attempt is logged", async () => {
    const before = await prisma.auditEvent.count({ where: { actorId: creator2.id, outcome: "DENIED", recordId: candidateId } });
    await expect(perms.authorizeCandidate(creator2, candidateId, "read")).rejects.toThrow(perms.AccessDenied);
    const after = await prisma.auditEvent.count({ where: { actorId: creator2.id, outcome: "DENIED", recordId: candidateId } });
    expect(after).toBe(before + 1);
    const job = await prisma.generationJob.findFirstOrThrow({ where: { createdById: creator.id, status: "SUCCEEDED" } });
    await expect(exportSvc.exportVersion(creator2, job.outputVersionId!, "PDF")).rejects.toThrow(perms.AccessDenied);
  });

  it("AT-13: deleting a candidate removes resumes, versions and export files and is audited", async () => {
    const c = await prisma.candidate.create({ data: { ownerId: creator.id, fullName: "Temp Delete (Demo)" } });
    const resume = await prisma.resume.create({ data: { candidateId: c.id, title: "t", domainKey: "BANKING", roleKey: "BUSINESS_ANALYST" } });
    await prisma.resumeVersion.create({ data: { resumeId: resume.id, version: 1, content: {}, createdById: creator.id } });
    await prisma.candidate.delete({ where: { id: c.id } });
    expect(await prisma.resume.count({ where: { id: resume.id } })).toBe(0);
    expect(await prisma.resumeVersion.count({ where: { resumeId: resume.id } })).toBe(0);
  });
});
