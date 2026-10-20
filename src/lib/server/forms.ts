// Small helpers for server actions: typed form access and redirect-with-message error handling.
import { redirect } from "next/navigation";
import { AccessDenied } from "./permissions";

export function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function optStr(form: FormData, key: string): string | null {
  return str(form, key) || null;
}

export function lines(form: FormData, key: string): string[] {
  return str(form, key)
    .split("\n")
    .map((l) => l.replace(/^[\s•\-*]+/, "").trim())
    .filter(Boolean);
}

export function withMessage(path: string, kind: "error" | "ok", message: string): string {
  // Keep any #anchor at the end so the message stays in the query string.
  const hashAt = path.indexOf("#");
  const base = hashAt >= 0 ? path.slice(0, hashAt) : path;
  const hash = hashAt >= 0 ? path.slice(hashAt) : "";
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${kind}=${encodeURIComponent(message.slice(0, 300))}${hash}`;
}

export function isRedirect(err: unknown): boolean {
  return typeof err === "object" && err !== null && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT");
}

/** Run an action body; on failure redirect back with a safe message (no stack traces or record data). */
export async function attempt(backTo: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    if (isRedirect(err)) throw err;
    const message = err instanceof AccessDenied ? err.message : err instanceof Error && err.name !== "PrismaClientKnownRequestError" ? err.message : "The request could not be completed.";
    if (!(err instanceof AccessDenied)) console.error(err);
    redirect(withMessage(backTo, "error", message));
  }
}
