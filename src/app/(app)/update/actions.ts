"use server";
import { redirect } from "next/navigation";
import { extractText } from "@/lib/files";
import { parseResumeText } from "@/lib/resume-parser";
import { requireUser } from "@/lib/server/auth";
import { loadCatalog } from "@/lib/server/catalog";
import { attempt, str, withMessage } from "@/lib/server/forms";
import { createJobDescription, importParsedResume, matchVersion } from "@/lib/server/jd-service";

export async function importAndTailor(form: FormData) {
  const user = await requireUser(["ADMIN", "CREATOR"]);
  let target = "";
  await attempt("/update", async () => {
    const file = form.get("resume");
    if (!file || typeof file !== "object" || !("arrayBuffer" in file) || file.size === 0) throw new Error("Upload the existing resume (.docx, .pdf or .txt).");
    const extracted = await extractText(file.name, file.type, new Uint8Array(await file.arrayBuffer()));
    const { catalog } = await loadCatalog();
    const parsed = parseResumeText(extracted.text, catalog);
    if (!parsed.experiences.length) throw new Error("No dated work experience could be detected in the resume. Check that each role has a date range such as “February 2021 – Current”.");
    const fullName = str(form, "fullName") || parsed.fullName || "";
    if (!fullName) throw new Error("Enter the candidate's name (it was not found in the document).");
    const { resume, version } = await importParsedResume(user, parsed, {
      fullName,
      domainKey: str(form, "domainKey"),
      roleKey: str(form, "roleKey"),
      fileName: file.name,
      candidateId: str(form, "candidateId") || null,
      pageTarget: Number(str(form, "pageTarget") || "4"),
    });
    const notes = [...extracted.warnings, ...parsed.warnings];
    const jdFile = form.get("jdFile");
    const jdText = str(form, "jdText");
    let jdId: string | null = null;
    if (jdFile && typeof jdFile === "object" && "arrayBuffer" in jdFile && jdFile.size > 0) {
      const jdEx = await extractText(jdFile.name, jdFile.type, new Uint8Array(await jdFile.arrayBuffer()));
      notes.push(...jdEx.warnings);
      jdId = (await createJobDescription(user, { title: jdEx.text.split("\n").find((l) => l.trim())?.trim().slice(0, 120) ?? "Job description", text: jdEx.text, fileName: jdFile.name, mime: jdFile.type })).id;
    } else if (jdText.length >= 40) {
      jdId = (await createJobDescription(user, { title: jdText.split("\n").find((l) => l.trim())?.trim().slice(0, 120) ?? "Job description", text: jdText })).id;
    }
    if (jdId) {
      await matchVersion(user, version.id, jdId);
      target = `/jd/${jdId}/tailor?v=${version.id}`;
    } else {
      target = `/resumes/${resume.id}?v=${version.id}`;
    }
    const summary = `Imported ${parsed.experiences.length} role(s), ${parsed.summary.length} summary bullet(s), ${parsed.detectedTechs.length} technologies.`;
    target = withMessage(target, notes.length ? "error" : "ok", notes.length ? `${summary} Please review: ${notes.join(" ")}` : summary);
  });
  redirect(target);
}
