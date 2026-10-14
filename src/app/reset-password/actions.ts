"use server";
import { redirect } from "next/navigation";
import { audit, logEvent } from "@/lib/server/audit";
import { prisma } from "@/lib/server/db";
import { str, withMessage } from "@/lib/server/forms";
import { hashPassword, passwordProblems, sha256 } from "@/lib/server/passwords";
import { issueResetToken } from "@/lib/server/reset";

export async function requestReset(form: FormData) {
  const email = str(form, "email").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.status === "ACTIVE") {
    const token = await issueResetToken(user.id);
    // Email delivery is an integration point; in development the link is written to the server log.
    logEvent("info", "password reset link issued", { userId: user.id, link: `/reset-password?token=${token}` });
    await audit(user.id, "auth.reset.request", "User", user.id);
  }
  // Same response whether or not the account exists (no account enumeration).
  redirect(withMessage("/reset-password", "ok", "If the account exists, a reset link has been sent."));
}

export async function completeReset(form: FormData) {
  const token = str(form, "token");
  const password = str(form, "password");
  const problem = passwordProblems(password);
  if (problem) redirect(withMessage(`/reset-password?token=${encodeURIComponent(token)}`, "error", problem));
  const row = await prisma.passwordResetToken.findUnique({ where: { id: sha256(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) redirect(withMessage("/reset-password", "error", "This reset link is invalid or has expired."));
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(password) } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: row.userId } }),
  ]);
  await audit(row.userId, "auth.reset.complete", "User", row.userId);
  redirect(withMessage("/login", "ok", "Password updated. Please sign in."));
}
