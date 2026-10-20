"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { audit } from "@/lib/server/audit";
import { createSession } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { explainDbError } from "@/lib/server/db-status";
import { str, withMessage } from "@/lib/server/forms";
import { hashPassword, passwordProblems } from "@/lib/server/passwords";

// In-process throttle per client IP (use a shared store such as Redis when running several instances).
const attempts = new Map<string, { count: number; reset: number }>();

export async function signup(form: FormData) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && a.reset > now && a.count >= 10) redirect(withMessage("/signup", "error", "Too many sign-ups from this network. Try again later."));
  attempts.set(ip, a && a.reset > now ? { count: a.count + 1, reset: a.reset } : { count: 1, reset: now + 60 * 60_000 });

  // Honeypot: real users never fill this hidden field.
  if (str(form, "website")) redirect("/login");
  const name = str(form, "name").slice(0, 120);
  const email = str(form, "email").toLowerCase().slice(0, 200);
  const password = str(form, "password");
  if (!name) redirect(withMessage("/signup", "error", "Enter your name."));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect(withMessage("/signup", "error", "Enter a valid email address."));
  const problem = passwordProblems(password);
  if (problem) redirect(withMessage("/signup", "error", problem));
  if (password !== str(form, "confirm")) redirect(withMessage("/signup", "error", "Passwords do not match."));
  let existing: unknown;
  try {
    existing = await prisma.user.findUnique({ where: { email } });
  } catch (err) {
    console.error("[signup] database error", err);
    const d = explainDbError(err);
    redirect(withMessage("/signup", "error", `Sign-up is unavailable: ${d.problem} (${d.code}). Open /api/health for details.`));
  }
  if (existing) {
    redirect(withMessage("/signup", "error", "An account with that email already exists. Sign in instead."));
  }
  // Only the address configured in ADMIN_EMAIL becomes an administrator; everyone else gets a normal account.
  const isAdmin = Boolean(process.env.ADMIN_EMAIL) && email === process.env.ADMIN_EMAIL!.toLowerCase();
  const user = await prisma.user.create({ data: { email, name, role: isAdmin ? "ADMIN" : "CREATOR", passwordHash: await hashPassword(password) } });
  await audit(user.id, "auth.signup", "User", user.id);
  await createSession(user.id);
  redirect("/?ok=Welcome!+Create+your+first+resume+below.");
}
