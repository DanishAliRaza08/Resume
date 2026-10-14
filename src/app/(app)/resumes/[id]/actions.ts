"use server";
import { redirect } from "next/navigation";
import { applyModeCaps } from "@/lib/layout";
import { ResumeContent } from "@/lib/resume-schema";
import { audit } from "@/lib/server/audit";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { exportVersion } from "@/lib/server/export-service";
import { attempt, str, withMessage } from "@/lib/server/forms";
import { authorizeResume } from "@/lib/server/permissions";
import { saveVersion, transitionVersion } from "@/lib/server/resume-service";

export async function saveEdits(form: FormData) {
  const user = await requireUser();
  const resumeId = str(form, "resumeId");
  const parentVersionId = str(form, "parentVersionId");
  let versionId = "";
  await attempt(`/resumes/${resumeId}?v=${parentVersionId}`, async () => {
    const parent = await prisma.resumeVersion.findFirstOrThrow({ where: { id: parentVersionId, resumeId } });
    let raw: unknown;
    try {
      raw = JSON.parse(str(form, "content"));
    } catch {
      throw new Error("The edited content could not be read.");
    }
    const parsed = ResumeContent.safeParse(raw);
    if (!parsed.success) throw new Error(`Edited content is invalid: ${parsed.error.issues[0]?.path.join(".")} ${parsed.error.issues[0]?.message}`);
    const before = ResumeContent.parse(parent.content);
    // Provenance is server-owned: new bullets are user edits needing confirmation, and editing an
    // evidence-backed bullet's wording turns it into a user edit (it is no longer verbatim evidence).
    const prior = new Map([...before.summary, ...before.projects.flatMap((p) => p.bullets)].map((b) => [b.id, b]));
    for (const b of [...parsed.data.summary, ...parsed.data.projects.flatMap((p) => p.bullets)]) {
      const old = prior.get(b.id);
      if (!old) {
        Object.assign(b, { source: "USER_EDIT", requiresConfirmation: true, evidenceRefs: ["user-entered"], technologyRefs: [] });
        continue;
      }
      Object.assign(b, { source: old.source, evidenceRefs: old.evidenceRefs, requiresConfirmation: old.requiresConfirmation, technologyRefs: old.technologyRefs });
      if (b.text.trim() !== old.text.trim() && (old.source === "CANDIDATE" || old.source === "RESUME_IMPORT")) {
        Object.assign(b, { source: "USER_EDIT", requiresConfirmation: true, confirmed: false });
      }
    }
    const confirmedBefore = new Set([...before.summary, ...before.projects.flatMap((p) => p.bullets)].filter((b) => b.confirmed).map((b) => b.id));
    const newlyConfirmed = [...parsed.data.summary, ...parsed.data.projects.flatMap((p) => p.bullets)].filter((b) => b.confirmed && !confirmedBefore.has(b.id)).length;
    const v = await saveVersion(user, resumeId, parsed.data, { parentVersionId, changeNote: str(form, "changeNote") || "Edited in resume editor" });
    if (newlyConfirmed) await audit(user.id, "resume.bullets.confirm", "ResumeVersion", v.id, "SUCCESS", { count: newlyConfirmed });
    versionId = v.id;
  });
  redirect(`/resumes/${resumeId}?v=${versionId}&ok=Saved+as+a+new+version`);
}

export async function changeStatus(form: FormData) {
  const user = await requireUser();
  const resumeId = str(form, "resumeId");
  const versionId = str(form, "versionId");
  const to = str(form, "to") as "IN_REVIEW" | "APPROVED" | "REJECTED";
  await attempt(`/resumes/${resumeId}?v=${versionId}`, async () => {
    if (!["IN_REVIEW", "APPROVED", "REJECTED"].includes(to)) throw new Error("Unknown status.");
    await transitionVersion(user, versionId, to, str(form, "note") || undefined);
  });
  redirect(withMessage(`/resumes/${resumeId}?v=${versionId}`, "ok", to === "IN_REVIEW" ? "Submitted for review." : to === "APPROVED" ? "Approved." : "Rejected and returned for editing."));
}

export async function exportFile(form: FormData) {
  const user = await requireUser();
  const resumeId = str(form, "resumeId");
  const versionId = str(form, "versionId");
  let message = "";
  await attempt(`/resumes/${resumeId}?v=${versionId}`, async () => {
    const format = str(form, "format") === "PDF" ? "PDF" : "DOCX";
    const spacing = str(form, "spacing") === "compact" ? "compact" : "normal";
    const { record, pageCount, pageTarget } = await exportVersion(user, versionId, format, spacing);
    message = `${format} exported: ${pageCount ?? "?"} rendered page(s) (target ${pageTarget}).${pageCount && pageCount > pageTarget ? " Over target — review the compression proposal." : ""} |${record.id}`;
  });
  const [text, id] = message.split(" |");
  redirect(withMessage(`/resumes/${resumeId}?v=${versionId}&download=${id}`, "ok", text));
}

/** Apply an approved compression step as a new version (spacing applies at export time). */
export async function applyCompression(form: FormData) {
  const user = await requireUser();
  const resumeId = str(form, "resumeId");
  const versionId = str(form, "versionId");
  let newId = "";
  await attempt(`/resumes/${resumeId}?v=${versionId}`, async () => {
    await authorizeResume(user, resumeId, "write");
    const version = await prisma.resumeVersion.findFirstOrThrow({ where: { id: versionId, resumeId } });
    const content = ResumeContent.parse(version.content);
    const kind = str(form, "kind");
    let next = content;
    if (kind === "MODE") next = applyModeCaps(content, str(form, "mode") as "STANDARD" | "CONCISE");
    else if (kind === "DROP_BULLETS") {
      const drop = new Set(str(form, "bulletIds").split(","));
      next = { ...content, projects: content.projects.map((p) => ({ ...p, bullets: p.bullets.filter((b) => !drop.has(b.id)) })) };
    } else throw new Error("Unknown compression step.");
    const v = await saveVersion(user, resumeId, next, { parentVersionId: versionId, changeNote: `Approved compression: ${str(form, "description")}`, projectMode: next.meta.projectMode });
    newId = v.id;
  });
  redirect(`/resumes/${resumeId}?v=${newId}&ok=Compression+applied+as+a+new+version`);
}

export async function restoreVersion(form: FormData) {
  const user = await requireUser();
  const resumeId = str(form, "resumeId");
  const versionId = str(form, "versionId");
  let newId = "";
  await attempt(`/resumes/${resumeId}?v=${versionId}`, async () => {
    const version = await prisma.resumeVersion.findFirstOrThrow({ where: { id: versionId, resumeId } });
    const v = await saveVersion(user, resumeId, version.content, { parentVersionId: versionId, changeNote: `Restored from v${version.version}` });
    newId = v.id;
  });
  redirect(`/resumes/${resumeId}?v=${newId}&ok=Restored+as+a+new+draft`);
}
