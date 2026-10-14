import { readExport } from "@/lib/server/export-service";
import { withApi } from "@/lib/server/api";

// GET /api/exports/:id — authorized download of a private export file.
export const GET = withApi<{ params: Promise<{ id: string }> }>(async (_req, user, { params }) => {
  const { id } = await params;
  const { record, buffer } = await readExport(user, id);
  const type = record.format === "PDF" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="${record.fileName}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
});
