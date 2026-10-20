"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { attempt, str } from "@/lib/server/forms";
import { runGenerationJob, startGenerationJob, type ResumeRequest } from "@/lib/server/resume-service";

export async function generate(form: FormData) {
  const user = await requireUser();
  const back = `/resumes/new?${new URLSearchParams(Object.fromEntries([...form.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$")) as [string, string][])).toString()}&step=5`;
  let jobId = "";
  await attempt(back, async () => {
    const req: ResumeRequest = {
      candidateId: str(form, "candidateId"),
      domainKey: str(form, "domainKey"),
      roleKey: str(form, "roleKey"),
      seniority: str(form, "seniority") || null,
      targetTitle: str(form, "targetTitle") || null,
      projectIds: form.getAll("projectId").map(String),
      mode: (str(form, "mode") || "STANDARD") as ResumeRequest["mode"],
      pageTarget: Math.min(6, Math.max(1, Number(str(form, "pageTarget") || "4"))),
      templateKey: str(form, "templateKey") || "classic",
      includeHighlights: str(form, "includeHighlights") === "on",
      useAi: str(form, "useAi") === "on",
      resumeId: str(form, "resumeId") || undefined,
    };
    if (!req.candidateId || !req.domainKey || !req.roleKey) throw new Error("Candidate, domain and role are required.");
    if (!req.projectIds.length) throw new Error("Select at least one project.");
    // The idempotency key is minted when the review step renders, so a double submit or retry reuses the job.
    const key = str(form, "idempotencyKey") || randomUUID();
    const job = await startGenerationJob(user, req, key);
    jobId = job.id;
    // Generation takes well under a second without AI, so it runs inline; the job record keeps
    // retries idempotent and the job page shows the outcome (including failures).
    if (job.status === "QUEUED") await runGenerationJob(job.id);
  });
  redirect(`/jobs/${jobId}`);
}
