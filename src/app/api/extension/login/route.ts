import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/server/api";
import { audit } from "@/lib/server/audit";
import { createApiToken } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/passwords";

const Body = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) });
const failures = new Map<string, { count: number; until: number }>();

// POST /api/extension/login — the Dice Helper extension signs in and receives a 30-day token.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, "invalid_request", "Enter your email and password.");
  const email = parsed.data.email.toLowerCase();
  const f = failures.get(email);
  if (f && f.until > Date.now()) return apiError(429, "rate_limited", "Too many attempts. Try again in a few minutes.");
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && user.status === "ACTIVE" && (await verifyPassword(parsed.data.password, user.passwordHash));
  if (!ok) {
    const next = { count: (f?.count ?? 0) + 1, until: 0 };
    if (next.count >= 5) next.until = Date.now() + 5 * 60_000;
    failures.set(email, next);
    await audit(user?.id ?? null, "auth.extension_login", "User", user?.id ?? null, "FAILURE");
    return apiError(401, "unauthorized", "Wrong email or password.");
  }
  failures.delete(email);
  const token = await createApiToken(user.id);
  await audit(user.id, "auth.extension_login", "User", user.id);
  return NextResponse.json({ token, user: { name: user.name, email: user.email } }, { headers: { "Cache-Control": "no-store" } });
}
