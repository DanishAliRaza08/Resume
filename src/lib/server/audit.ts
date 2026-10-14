// Audit trail (spec §14, FR-13). Details must never contain resume text or other sensitive content.
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";

export type AuditOutcome = "SUCCESS" | "DENIED" | "FAILURE";

export async function audit(
  actorId: string | null,
  action: string,
  recordType: string,
  recordId: string | null,
  outcome: AuditOutcome = "SUCCESS",
  detail?: Prisma.InputJsonValue,
): Promise<void> {
  try {
    await prisma.auditEvent.create({ data: { actorId, action, recordType, recordId, outcome, detail } });
  } catch (err) {
    // Audit failures must not take the request down, but they must be visible to operators.
    console.error(JSON.stringify({ level: "error", msg: "audit write failed", action, recordType, error: String(err) }));
  }
}

/** Structured operational log line with sensitive fields redacted. */
export function logEvent(level: "info" | "warn" | "error", msg: string, fields: Record<string, unknown> = {}): void {
  const redacted: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    redacted[k] = /text|content|email|phone|name|password|token/i.test(k) ? "[redacted]" : v;
  }
  console[level === "error" ? "error" : "log"](JSON.stringify({ level, msg, ...redacted, at: new Date().toISOString() }));
}
