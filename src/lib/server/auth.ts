// Session-based authentication (FR-01): opaque random token in an HttpOnly cookie, SHA-256 hash in the DB.
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { User, UserRole } from "@prisma/client";
import { prisma } from "./db";
import { newToken, sha256 } from "./passwords";

export const SESSION_COOKIE = "rb_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "status">;

export async function createSession(userId: string): Promise<void> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { id: sha256(token), userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

const API_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, for the browser extension

/** Sign-in token for the browser extension (sent as "Authorization: Bearer <token>"). */
export async function createApiToken(userId: string): Promise<string> {
  const token = newToken();
  await prisma.session.create({ data: { id: sha256(token), userId, expiresAt: new Date(Date.now() + API_TOKEN_TTL_MS) } });
  return token;
}

async function bearerToken(): Promise<string | null> {
  try {
    const h = await headers();
    const m = /^Bearer\s+([A-Za-z0-9_-]{20,200})$/.exec(h.get("authorization") ?? "");
    return m ? m[1] : null;
  } catch {
    return null; // not inside a request
  }
}

export async function revokeBearerToken(): Promise<void> {
  const token = await bearerToken();
  if (token) await prisma.session.deleteMany({ where: { id: sha256(token) } });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? (await bearerToken());
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { id: sha256(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, status: true } } },
  });
  if (!session || session.expiresAt < new Date() || session.user.status !== "ACTIVE") return null;
  return session.user;
}

/** Require a signed-in user (optionally with one of the given roles); redirects otherwise. */
export async function requireUser(roles?: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/?denied=1");
  return user;
}
