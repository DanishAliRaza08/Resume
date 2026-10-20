"use server";
import { redirect } from "next/navigation";
import { SCREENING_QUESTIONS } from "@/data/screening";
import { extractText } from "@/lib/files";
import { parseResumeText } from "@/lib/resume-parser";
import { addJobs, prepareJob, saveProfile, setStatus } from "@/lib/server/apply-service";
import { requireUser } from "@/lib/server/auth";
import { loadCatalog } from "@/lib/server/catalog";
import { attempt, str, withMessage } from "@/lib/server/forms";
import { importParsedResume } from "@/lib/server/jd-service";

/** Start from an uploaded resume: extract the person's details and create their profile. */
export async function startFromResume(form: FormData) {
  const user = await requireUser(["ADMIN", "CREATOR"]);
  let target = "/apply";
  await attempt("/apply", async () => {
    const file = form.get("resume");
    if (!file || typeof file !== "object" || !("arrayBuffer" in file) || file.size === 0) throw new Error("Choose the candidate's resume (.docx, .pdf or .txt).");
    const extracted = await extractText(file.name, file.type, new Uint8Array(await file.arrayBuffer()));
    const { catalog } = await loadCatalog();
    const parsed = parseResumeText(extracted.text, catalog);
    if (!parsed.experiences.length) throw new Error("No dated work experience was found in the resume. Each job needs a date range such as “March 2021 – Current”.");
    const fullName = str(form, "fullName") || parsed.fullName || "";
    if (!fullName) throw new Error("Enter the candidate's name (it was not found in the resume).");
    const { candidate } = await importParsedResume(user, parsed, { fullName, domainKey: str(form, "domainKey") || "BANKING", roleKey: str(form, "roleKey") || "BUSINESS_ANALYST", fileName: file.name, pageTarget: 3 });
    target = withMessage(`/apply/${candidate.id}`, "ok", `Read ${parsed.experiences.length} job(s) and ${parsed.detectedTechs.length} skills from the resume. Check the answers below, then add Dice jobs.`);
  });
  redirect(target);
}

export async function saveAnswers(form: FormData) {
  const user = await requireUser();
  const candidateId = str(form, "candidateId");
  await attempt(`/apply/${candidateId}`, async () => {
    const answers: Record<string, string> = {};
    for (const q of SCREENING_QUESTIONS) answers[q.key] = str(form, `a_${q.key}`);
    const qs = form.getAll("custom_q").map(String);
    const as = form.getAll("custom_a").map(String);
    const custom = qs.map((question, i) => ({ question, answer: as[i] ?? "" }));
    await saveProfile(user, candidateId, answers, custom, str(form, "baseResumeId") || null);
  });
  redirect(withMessage(`/apply/${candidateId}#jobs`, "ok", "Answers saved."));
}

export async function addDiceJobs(form: FormData) {
  const user = await requireUser();
  const candidateId = str(form, "candidateId");
  let msg = "";
  await attempt(`/apply/${candidateId}#jobs`, async () => {
    const r = await addJobs(user, candidateId, str(form, "links"));
    msg = `Added ${r.added} job(s).${r.duplicates ? ` ${r.duplicates} already in your list were skipped.` : ""}${r.invalid.length ? ` ${r.invalid.length} link(s) were not Dice job links.` : ""}${r.truncated ? " Only the first 500 links were added." : ""}`;
  });
  redirect(withMessage(`/apply/${candidateId}#queue`, "ok", msg));
}

export async function updateStatus(form: FormData) {
  const user = await requireUser();
  const candidateId = str(form, "candidateId");
  const id = str(form, "applicationId");
  const status = str(form, "status") as "APPLIED" | "SKIPPED" | "NOT_AVAILABLE" | "READY";
  const back = str(form, "back") === "session" ? `/apply/${candidateId}/session?done=${encodeURIComponent(id)}` : `/apply/${candidateId}#queue`;
  await attempt(back, async () => {
    if (!["APPLIED", "SKIPPED", "NOT_AVAILABLE", "READY"].includes(status)) throw new Error("Unknown status.");
    await setStatus(user, id, status, str(form, "notes") || undefined);
  });
  redirect(back);
}

export async function provideDescription(form: FormData) {
  const user = await requireUser();
  const candidateId = str(form, "candidateId");
  const id = str(form, "applicationId");
  await attempt(`/apply/${candidateId}/session?id=${id}`, async () => {
    await prepareJob(user, id, str(form, "description"));
  });
  redirect(`/apply/${candidateId}/session?id=${id}`);
}

