// JSON API helpers (Appendix B): authentication, consistent error responses, simple rate limiting.
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionUser, type SessionUser } from "./auth";
import { AccessDenied } from "./permissions";
import { UploadError } from "../files";

export type ApiError = { error: { code: string; message: string; details?: unknown } };

export function apiError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json<ApiError>({ error: { code, message, details } }, { status, headers: { "Cache-Control": "no-store" } });
}

const buckets = new Map<string, { count: number; reset: number }>();
function rateLimited(key: string, limit = 120, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  b.count++;
  return b.count > limit;
}

export function withApi<C>(handler: (req: Request, user: SessionUser, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C): Promise<Response> => {
    const user = await getSessionUser();
    if (!user) return apiError(401, "unauthorized", "Sign in required.");
    if (rateLimited(user.id)) return apiError(429, "rate_limited", "Too many requests; retry shortly.");
    try {
      return await handler(req, user, ctx);
    } catch (err) {
      if (err instanceof AccessDenied) return apiError(403, "forbidden", err.message);
      if (err instanceof ZodError) return apiError(400, "invalid_request", "Request validation failed.", err.issues.slice(0, 10));
      if (err instanceof UploadError) return apiError(422, "invalid_file", err.message);
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2025") return apiError(404, "not_found", "Record not found.");
      if (err instanceof Error && /cannot|required|invalid|No accepted/i.test(err.message)) return apiError(409, "conflict", err.message);
      console.error(err);
      return apiError(500, "internal_error", "The request could not be completed.");
    }
  };
}

export function paginate(url: URL): { take: number; skip: number } {
  const take = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "25")));
  const skip = Math.max(0, Number(url.searchParams.get("offset") ?? "0"));
  return { take, skip };
}
