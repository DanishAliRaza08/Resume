"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { str } from "@/lib/server/forms";
import { runGenerationJob } from "@/lib/server/resume-service";

export async function retryJob(form: FormData) {
  const user = await requireUser(["ADMIN", "CREATOR"]);
  const id = str(form, "jobId");
  const job = await prisma.generationJob.findUnique({ where: { id } });
  if (!job || (job.createdById !== user.id && user.role !== "ADMIN")) redirect("/?denied=1");
  if (job.status === "FAILED") void runGenerationJob(job.id);
  redirect(`/jobs/${id}`);
}
