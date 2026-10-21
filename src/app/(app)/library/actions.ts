"use server";
import { redirect } from "next/navigation";
import { audit } from "@/lib/server/audit";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { attempt, str, withMessage } from "@/lib/server/forms";

export async function deleteSample(form: FormData) {
  const user = await requireUser();
  const id = str(form, "sampleId");
  await attempt("/library", async () => {
    // Admins can remove any sample; everyone else only the ones they uploaded.
    const where = user.role === "ADMIN" ? { id } : { id, createdById: user.id };
    const { count } = await prisma.resumeSample.deleteMany({ where });
    if (!count) throw new Error("You can only remove resumes you uploaded.");
    await audit(user.id, "library.delete", "ResumeSample", id);
  });
  redirect(withMessage("/library", "ok", "Removed from the library."));
}
