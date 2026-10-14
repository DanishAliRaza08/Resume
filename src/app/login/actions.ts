"use server";
import { redirect } from "next/navigation";
import { audit } from "@/lib/server/audit";
import { createSession, destroySession, getSessionUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { str, withMessage } from "@/lib/server/forms";
import { verifyPassword } from "@/lib/server/passwords";

// Simple in-process throttle for repeated failures per email (replace with a shared store in production).
const failures = new Map<string, { count: number; until: number }>();

export async function login(form: FormData) {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  const f = failures.get(email);
  if (f && f.until > Date.now()) redirect(withMessage("/login", "error", "Too many attempts. Try again in a few minutes."));
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && user.status === "ACTIVE" && (await verifyPassword(password, user.passwordHash));
  if (!ok) {
    const next = { count: (f?.count ?? 0) + 1, until: 0 };
    if (next.count >= 5) next.until = Date.now() + 5 * 60_000;
    failures.set(email, next);
    await audit(user?.id ?? null, "auth.login", "User", user?.id ?? null, "FAILURE");
    redirect(withMessage("/login", "error", "Invalid email or password."));
  }
  failures.delete(email);
  await createSession(user.id);
  await audit(user.id, "auth.login", "User", user.id);
  redirect("/");
}

export async function logout() {
  const user = await getSessionUser();
  await destroySession();
  if (user) await audit(user.id, "auth.logout", "User", user.id);
  redirect("/login");
}
