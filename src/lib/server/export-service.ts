// Export service (FR-11): renders DOCX/PDF, inspects the actual page count, verifies the file
// re-opens with the expected sections, stores it privately and records the export.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { docxPageCount, renderDocx, renderPdf, verifyExport, type Spacing } from "../export";
import { ResumeContent } from "../resume-schema";
import { audit } from "./audit";
import type { SessionUser } from "./auth";
import { prisma } from "./db";
import { assertCan, authorizeResume } from "./permissions";
import { transitionVersion } from "./resume-service";

export const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR ?? "storage");

function safeName(s: string): string {
  return s.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/_+/g, "_").slice(0, 80);
}

export async function exportVersion(user: SessionUser, versionId: string, format: "DOCX" | "PDF", spacing: Spacing = "normal") {
  await assertCan(user, "resume:export", "ResumeVersion", versionId);
  const version = await prisma.resumeVersion.findUniqueOrThrow({ where: { id: versionId } });
  const resume = await authorizeResume(user, version.resumeId, "read");
  const content = ResumeContent.parse(version.content);
  const approved = version.status === "APPROVED" || version.status === "EXPORTED";
  // Unapproved exports are for internal review only and say so on the document.
  const rendered = approved ? content : { ...content, extraSections: [...content.extraSections], header: { ...content.header, title: `${content.header.title}  [DRAFT v${version.version} — not approved for external use]` } };

  let buffer: Buffer;
  let pageCount: number | null;
  if (format === "PDF") {
    const pdf = await renderPdf(rendered, spacing);
    buffer = pdf.buffer;
    pageCount = pdf.pageCount;
  } else {
    buffer = await renderDocx(rendered, spacing);
    pageCount = await docxPageCount(buffer);
    if (pageCount === null) pageCount = (await renderPdf(rendered, spacing)).pageCount;
  }
  const integrity = await verifyExport(format, buffer, rendered);
  if (!integrity.ok) {
    await audit(user.id, "resume.export.integrity_failed", "ResumeVersion", versionId, "FAILURE", { missing: integrity.missing });
    throw new Error(`Export failed integrity check (missing: ${integrity.missing.join(", ")}). No file was produced.`);
  }
  const fileName = `${safeName(content.header.fullName)}_${safeName(resume.roleKey)}_v${version.version}${approved ? "" : "_DRAFT"}.${format.toLowerCase()}`;
  const dir = path.join(STORAGE_DIR, "exports", resume.id);
  await mkdir(dir, { recursive: true });
  const storagePath = path.join(dir, `${Date.now()}_${fileName}`);
  await writeFile(storagePath, buffer, { mode: 0o600 });
  const record = await prisma.exportFile.create({
    data: { resumeId: resume.id, resumeVersionId: version.id, format, fileName, storagePath, bytes: buffer.length, pageCount, createdById: user.id },
  });
  if (version.status === "APPROVED") await transitionVersion(user, version.id, "EXPORTED");
  await audit(user.id, "resume.export", "ExportFile", record.id, "SUCCESS", { format, pageCount, versionId, approved });
  return { record, pageCount, pageTarget: version.pageTarget };
}

export async function readExport(user: SessionUser, exportId: string) {
  const record = await prisma.exportFile.findUniqueOrThrow({ where: { id: exportId } });
  await authorizeResume(user, record.resumeId, "read");
  const resolved = path.resolve(record.storagePath);
  if (!resolved.startsWith(STORAGE_DIR + path.sep)) throw new Error("Invalid storage path.");
  await audit(user.id, "resume.export.download", "ExportFile", exportId);
  return { record, buffer: await readFile(resolved) };
}
