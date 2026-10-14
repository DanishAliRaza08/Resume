"use server";
import { redirect } from "next/navigation";
import type { Prisma, UserRole } from "@prisma/client";
import { audit } from "@/lib/server/audit";
import { requireUser } from "@/lib/server/auth";
import { DEFAULT_SETTINGS } from "@/lib/server/catalog";
import { prisma } from "@/lib/server/db";
import { attempt, str, withMessage } from "@/lib/server/forms";
import { hashPassword, newToken, passwordProblems } from "@/lib/server/passwords";
import { assertCan } from "@/lib/server/permissions";
import { issueResetToken } from "@/lib/server/reset";

const ROLES: UserRole[] = ["ADMIN", "CREATOR", "REVIEWER", "READONLY"];

export async function createUser(form: FormData) {
  const admin = await requireUser();
  let link = "";
  await attempt("/admin", async () => {
    await assertCan(admin, "admin:users", "User");
    const email = str(form, "email").toLowerCase();
    const role = ROLES.find((r) => r === str(form, "role")) ?? "CREATOR";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email.");
    if (await prisma.user.findUnique({ where: { email } })) throw new Error("A user with that email already exists.");
    const user = await prisma.user.create({ data: { email, name: str(form, "name") || email, role, passwordHash: await hashPassword(newToken()) } });
    link = `/reset-password?token=${await issueResetToken(user.id)}`;
    await audit(admin.id, "admin.user.create", "User", user.id, "SUCCESS", { role });
  });
  redirect(withMessage("/admin", "ok", `User created. Share this one-time set-password link (valid 1 hour): ${link}`));
}

export async function updateUser(form: FormData) {
  const admin = await requireUser();
  const id = str(form, "userId");
  let message = "User updated.";
  await attempt("/admin", async () => {
    await assertCan(admin, "admin:users", "User", id);
    const op = str(form, "op");
    if (id === admin.id && op !== "reset") throw new Error("You cannot change your own role or status.");
    if (op === "role") {
      const role = ROLES.find((r) => r === str(form, "role"));
      if (!role) throw new Error("Unknown role.");
      await prisma.user.update({ where: { id }, data: { role } });
      await prisma.session.deleteMany({ where: { userId: id } });
      await audit(admin.id, "admin.user.role", "User", id, "SUCCESS", { role });
    } else if (op === "toggle") {
      const u = await prisma.user.findUniqueOrThrow({ where: { id } });
      const status = u.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
      await prisma.user.update({ where: { id }, data: { status } });
      if (status === "DISABLED") await prisma.session.deleteMany({ where: { userId: id } });
      await audit(admin.id, "admin.user.status", "User", id, "SUCCESS", { status });
    } else if (op === "reset") {
      message = `One-time reset link (valid 1 hour): /reset-password?token=${await issueResetToken(id)}`;
      await audit(admin.id, "admin.user.reset_link", "User", id);
    } else if (op === "password") {
      const pw = str(form, "password");
      const problem = passwordProblems(pw);
      if (problem) throw new Error(problem);
      await prisma.user.update({ where: { id }, data: { passwordHash: await hashPassword(pw) } });
      await audit(admin.id, "admin.user.password", "User", id);
    }
  });
  redirect(withMessage("/admin", "ok", message));
}

export async function saveSettings(form: FormData) {
  const admin = await requireUser();
  await attempt("/admin", async () => {
    await assertCan(admin, "admin:settings", "Setting");
    const values: Record<string, Prisma.InputJsonValue> = {
      retentionDays: Math.max(30, Number(str(form, "retentionDays")) || DEFAULT_SETTINGS.retentionDays),
      maxPages: Math.min(6, Math.max(1, Number(str(form, "maxPages")) || DEFAULT_SETTINGS.maxPages)),
      defaultPageTarget: Math.min(6, Math.max(1, Number(str(form, "defaultPageTarget")) || DEFAULT_SETTINGS.defaultPageTarget)),
      defaultProjectMode: ["FULL_DETAIL", "STANDARD", "CONCISE"].includes(str(form, "defaultProjectMode")) ? str(form, "defaultProjectMode") : "STANDARD",
      blockUnverifiedClientsOnApproval: form.get("blockUnverifiedClientsOnApproval") === "on",
      aiEnabled: form.get("aiEnabled") === "on",
    };
    for (const [key, value] of Object.entries(values)) await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
    await audit(admin.id, "admin.settings.update", "Setting", null, "SUCCESS", values);
  });
  redirect(withMessage("/admin", "ok", "Settings saved."));
}
