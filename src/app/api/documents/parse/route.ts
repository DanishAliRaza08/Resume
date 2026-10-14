import { NextResponse } from "next/server";
import { apiError, withApi } from "@/lib/server/api";
import { extractText } from "@/lib/files";
import { parseResumeText } from "@/lib/resume-parser";
import { loadCatalog } from "@/lib/server/catalog";
import { extractRequirements } from "@/lib/jd";
import { assertCan } from "@/lib/server/permissions";

// POST /api/documents/parse — multipart upload (field "file", optional "kind" = resume|jd).
// Validates the file and returns extracted text plus parsed structure. Nothing is stored.
export const POST = withApi(async (req, user) => {
  await assertCan(user, "resume:generate");
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return apiError(400, "file_required", "Upload a file in the 'file' field.");
  const ex = await extractText(file.name, file.type, new Uint8Array(await file.arrayBuffer()));
  const { catalog } = await loadCatalog();
  const kind = form.get("kind") === "jd" ? "jd" : "resume";
  const parsed = kind === "jd" ? { requirements: extractRequirements(ex.text, catalog) } : parseResumeText(ex.text, catalog);
  return NextResponse.json({ data: { kind, fileType: ex.kind, warnings: ex.warnings, characters: ex.text.length, parsed } });
});
