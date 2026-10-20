"use server";
import { redirect } from "next/navigation";
import { audit } from "@/lib/server/audit";
import { prisma } from "@/lib/server/db";
import { str, withMessage } from "@/lib/server/forms";
import { hashPassword, passwordProblems, sha256 } from "@/lib/server/passwords";
import { issueResetToken } from "@/lib/server/reset";
import { appUrl, sendMail } from "@/lib/server/mail";

const lastSent = new Map<string, number>();

export async function requestReset(form: FormData) {
  const email = str(form, "email").toLowerCase().slice(0, 200);
  const recently = (lastSent.get(email) ?? 0) > Date.now() - 2 * 60_000; // at most one email per 2 minutes
  const user = recently ? null : await prisma.user.findUnique({ where: { email } });
  if (user && user.status === "ACTIVE") {
    lastSent.set(email, Date.now());
    const token = await issueResetToken(user.id);
    await sendMail(
      user.email,
      "Reset your Benchsale Dan password",
      `Hi ${user.name},\n\nUse this link within one hour to set a new password:\n${appUrl()}/reset-password?token=${token}\n\nIf you did not ask for this, you can ignore this email.`,
    );
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
