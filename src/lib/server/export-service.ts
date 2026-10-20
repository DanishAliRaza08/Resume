// Export service (FR-11): renders DOCX/PDF in the chosen design, inspects the actual page count,
// verifies the file re-opens with the expected sections, stores it and records the export.
// Files are stored in the database so the app works on hosts without persistent disk.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDesign } from "../designs";
import { docxPageCount, renderDocx, renderPdf, verifyExport, type Spacing } from "../export";
import { ResumeContent } from "../resume-schema";
import { audit } from "./audit";
import type { SessionUser } from "./auth";
import { prisma } from "./db";
import { assertCan, authorizeResume } from "./permissions";
import { transitionVersion } from "./resume-service";

const LEGACY_STORAGE_DIR = path.resolve(process.env.STORAGE_DIR ?? "storage");

function safeName(s: string): string {
  return s.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 80) || "resume";
}

export async function exportVersion(user: SessionUser, versionId: string, format: "DOCX" | "PDF", spacing: Spacing = "normal", designKey?: string) {
  await assertCan(user, "resume:export", "ResumeVersion", versionId);
  const version = await prisma.resumeVersion.findUniqueOrThrow({ where: { id: versionId } });
  const resume = await authorizeResume(user, version.resumeId, "read");
  const parsed = ResumeContent.parse(version.content);
  const design = getDesign(designKey ?? parsed.meta.templateKey);
  const content: ResumeContent = { ...parsed, meta: { ...parsed.meta, templateKey: design.key } };

  let buffer: Buffer;
  let pageCount: number | null;
  if (format === "PDF") {
    const pdf = await renderPdf(content, spacing);
    buffer = pdf.buffer;
    pageCount = pdf.pageCount;
  } else {
    buffer = await renderDocx(content, spacing);
    pageCount = await docxPageCount(buffer);
    if (pageCount === null) pageCount = (await renderPdf(content, spacing)).pageCount;
  }
  const integrity = await verifyExport(format, buffer, content);
  if (!integrity.ok) {
    await audit(user.id, "resume.export.integrity_failed", "ResumeVersion", versionId, "FAILURE", { missing: integrity.missing });
    throw new Error(`Export failed integrity check (missing: ${integrity.missing.join(", ")}). No file was produced.`);
  }
  const fileName = `${safeName(content.header.fullName)}_Resume_${design.name}_v${version.version}.${format.toLowerCase()}`;
  const record = await prisma.exportFile.create({
    data: { resumeId: resume.id, resumeVersionId: version.id, format, fileName, data: new Uint8Array(buffer), bytes: buffer.length, pageCount, createdById: user.id },
  });
  if (version.status === "APPROVED") await transitionVersion(user, version.id, "EXPORTED");
  await audit(user.id, "resume.export", "ExportFile", record.id, "SUCCESS", { format, pageCount, versionId, design: design.key });
  return { record, pageCount, pageTarget: version.pageTarget };
}

export async function readExport(user: SessionUser, exportId: string) {
  const record = await prisma.exportFile.findUniqueOrThrow({ where: { id: exportId } });
  await authorizeResume(user, record.resumeId, "read");
  let buffer: Buffer;
  if (record.data) buffer = Buffer.from(record.data);
  else if (record.storagePath) {
    const resolved = path.resolve(record.storagePath);
    if (!resolved.startsWith(LEGACY_STORAGE_DIR + path.sep)) throw new Error("Invalid storage path.");
    buffer = await readFile(resolved);
  } else throw new Error("Export file is missing.");
  await audit(user.id, "resume.export.download", "ExportFile", exportId);
  return { record, buffer };
}
