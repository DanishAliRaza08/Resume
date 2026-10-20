import { getDesign } from "@/lib/designs";
import { renderDocx, renderPdf } from "@/lib/export";
import { withApi } from "@/lib/server/api";
import { tailoredForApplication } from "@/lib/server/apply-service";
import { audit } from "@/lib/server/audit";

const safe = (s: string) => s.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 60) || "x";

// GET /api/applications/:id/resume?format=pdf|docx — resume tailored to this job (evidence-backed edits only).
export const GET = withApi<{ params: Promise<{ id: string }> }>(async (req, user, { params }) => {
  const { id } = await params;
  const format = new URL(req.url).searchParams.get("format") === "docx" ? "docx" : "pdf";
  const { app, content } = await tailoredForApplication(user, id);
  const design = getDesign(content.meta.templateKey);
  const fileName = `${safe(content.header.fullName)}_Resume_${safe(app.company ?? "Dice")}.${format}`;
  const buffer = format === "pdf" ? (await renderPdf(content)).buffer : await renderDocx(content);
  await audit(user.id, "apply.resume.download", "JobApplication", id, "SUCCESS", { format, design: design.key });
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
});
