// Record-level authorization (spec §4, §14). Enforced on every server action / route handler,
// never only by hiding UI controls. Denials are written to the audit log (AT-07).
import type { UserRole } from "@prisma/client";
import { audit } from "./audit";
import type { SessionUser } from "./auth";
import { prisma } from "./db";

export class AccessDenied extends Error {
  constructor(message = "You do not have access to this record.") {
    super(message);
    this.name = "AccessDenied";
  }
}

export type Capability =
  | "candidate:create"
  | "resume:generate"
  | "resume:review"
  | "resume:export"
  | "library:edit"
  | "admin:users"
  | "admin:audit"
  | "admin:settings";

const CAPABILITIES: Record<UserRole, Capability[]> = {
  ADMIN: ["candidate:create", "resume:generate", "resume:review", "resume:export", "library:edit", "admin:users", "admin:audit", "admin:settings"],
  CREATOR: ["candidate:create", "resume:generate", "resume:export"],
  REVIEWER: ["resume:review", "resume:export"],
  READONLY: [],
};

export function can(user: SessionUser, capability: Capability): boolean {
  return CAPABILITIES[user.role].includes(capability);
}

export async function assertCan(user: SessionUser, capability: Capability, recordType = "capability", recordId: string | null = null): Promise<void> {
  if (!can(user, capability)) {
    await audit(user.id, `denied:${capability}`, recordType, recordId, "DENIED");
    throw new AccessDenied();
  }
}

export type CandidateAccess = "read" | "write";

/**
 * Candidate-level access rules:
 *  - ADMIN: read/write all.
 *  - CREATOR: read/write candidates they own.
 *  - REVIEWER: read all (to review); no candidate edits.
 *  - READONLY: read candidates that have an approved resume.
 */
export async function authorizeCandidate(user: SessionUser, candidateId: string, access: CandidateAccess) {
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) throw new AccessDenied("Record not found.");
  let ok = false;
  if (user.role === "ADMIN") ok = true;
  else if (user.role === "CREATOR") ok = candidate.ownerId === user.id;
  else if (user.role === "REVIEWER") ok = access === "read";
  else if (user.role === "READONLY" && access === "read") {
    ok = (await prisma.resumeVersion.count({ where: { resume: { candidateId }, status: { in: ["APPROVED", "EXPORTED"] } } })) > 0;
  }
  if (!ok) {
    await audit(user.id, `denied:candidate:${access}`, "Candidate", candidateId, "DENIED");
    throw new AccessDenied();
  }
  return candidate;
}

export async function authorizeResume(user: SessionUser, resumeId: string, access: CandidateAccess) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new AccessDenied("Record not found.");
  try {
    await authorizeCandidate(user, resume.candidateId, access);
  } catch (e) {
    await audit(user.id, `denied:resume:${access}`, "Resume", resumeId, "DENIED");
    throw e;
  }
  return resume;
}

/** Prisma `where` filter limiting candidate lists to what the user may read. */
export function candidateScope(user: SessionUser) {
  if (user.role === "ADMIN" || user.role === "REVIEWER") return {};
  if (user.role === "CREATOR") return { ownerId: user.id };
  return { resumes: { some: { versions: { some: { status: { in: ["APPROVED", "EXPORTED"] as ("APPROVED" | "EXPORTED")[] } } } } } };
}

/** Non-auditing check used only to decide which controls to render (enforcement happens in actions). */
export function candidateWritable(user: SessionUser, candidate: { ownerId: string }): boolean {
  return user.role === "ADMIN" || (user.role === "CREATOR" && candidate.ownerId === user.id);
}
