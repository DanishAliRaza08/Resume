"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { attempt, str, withMessage } from "@/lib/server/forms";
import { readUploadOrText } from "@/lib/server/uploads";
import { applyAccepted, createJobDescription, decideSuggestion, matchVersion } from "@/lib/server/jd-service";

export async function createJd(form: FormData) {
  const user = await requireUser(["ADMIN", "CREATOR"]);
  const resumeVersion = str(form, "resumeVersion");
  let id = "";
  let warn = "";
  await attempt(`/jd${resumeVersion ? `?resumeVersion=${resumeVersion}` : ""}`, async () => {
    const { text, fileName, mime, warnings } = await readUploadOrText(form, "file", "text");
    const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean) ?? "Job description";
    const jd = await createJobDescription(user, { title: str(form, "title") || firstLine.slice(0, 120), text, fileName, mime });
    id = jd.id;
    warn = warnings.join(" ");
  });
  const target = resumeVersion ? `/jd/${id}/tailor?v=${resumeVersion}` : `/jd/${id}`;
  redirect(warn ? withMessage(target, "error", warn) : target);
}

export async function runMatch(form: FormData) {
  const user = await requireUser();
  const jdId = str(form, "jdId");
  const versionId = str(form, "versionId");
  await attempt(`/jd/${jdId}`, async () => {
    await matchVersion(user, versionId, jdId);
  });
  redirect(`/jd/${jdId}/tailor?v=${versionId}`);
}

export async function decide(form: FormData) {
  const user = await requireUser();
  const jdId = str(form, "jdId");
  const versionId = str(form, "versionId");
  const back = `/jd/${jdId}/tailor?v=${versionId}`;
  await attempt(back, async () => {
    const decision = str(form, "decision") === "ACCEPTED" ? "ACCEPTED" : "REJECTED";
    await decideSuggestion(user, str(form, "suggestionId"), decision, { editedText: str(form, "editedText") || undefined, confirmed: form.get("confirmed") === "on" });
  });
  redirect(`${back}#s-${str(form, "suggestionId")}`);
}

export async function applyTailoring(form: FormData) {
  const user = await requireUser();
  const jdId = str(form, "jdId");
  const versionId = str(form, "versionId");
  let resumeId = "";
  let newId = "";
  await attempt(`/jd/${jdId}/tailor?v=${versionId}`, async () => {
    const v = await applyAccepted(user, versionId, jdId);
    resumeId = v.resumeId;
    newId = v.id;
  });
  redirect(`/resumes/${resumeId}?v=${newId}&ok=Tailored+version+created%3B+the+original+is+preserved`);
}
