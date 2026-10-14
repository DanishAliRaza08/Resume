const STATUS: Record<string, string> = {
  DRAFT: "neutral",
  IN_REVIEW: "info",
  APPROVED: "ok",
  REJECTED: "bad",
  EXPORTED: "ok",
  QUEUED: "neutral",
  RUNNING: "info",
  SUCCEEDED: "ok",
  FAILED: "bad",
  UNVERIFIED: "warn",
  CANDIDATE_CONFIRMED: "info",
  VERIFIED: "ok",
  SUPPORTED: "ok",
  PARTIAL: "warn",
  MISSING: "bad",
  NEEDS_CONFIRMATION: "info",
  PROPOSED: "neutral",
  ACCEPTED: "ok",
  critical: "bad",
  warning: "warn",
  info: "info",
  SUCCESS: "ok",
  DENIED: "bad",
  FAILURE: "bad",
};

export function StatusBadge({ value }: { value: string }) {
  const label = value.replace(/_/g, " ").toLowerCase();
  return <span className={`badge ${STATUS[value] ?? "neutral"}`}>{label}</span>;
}
