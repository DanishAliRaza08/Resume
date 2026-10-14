// Document export (spec §6.5, §13.1): ATS-readable DOCX and PDF with the actual rendered page count.
// Layouts use simple single-column text, real headings, and a plain table for skills — no text in
// images, icons or colour-only meaning.

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import PDFDocument from "pdfkit";
import type { ResumeContent } from "./resume-schema";
import { formatRange } from "./timeline";

export type Spacing = "normal" | "compact";

export const RESUME_TEMPLATES: Record<string, { name: string; accent: string; font: string; description: string }> = {
  classic: { name: "Classic", accent: "000000", font: "Calibri", description: "Black-and-white, Calibri 11pt, matches common staffing formats." },
  modern: { name: "Modern", accent: "1F4E79", font: "Calibri", description: "Navy section headings with rules; meaning never relies on colour." },
};

function contactLine(c: ResumeContent): string {
  return [c.header.email, c.header.phone, c.header.location, c.header.linkedin].filter(Boolean).join("  |  ");
}

function demoNotice(c: ResumeContent): string | null {
  return c.meta.isDemo ? "SAMPLE / DEMO OUTPUT — contains illustrative data and must not be submitted to employers." : null;
}

// ------------------------------------------------------------------------------------------------
// DOCX
// ------------------------------------------------------------------------------------------------

export async function renderDocx(content: ResumeContent, spacing: Spacing = "normal"): Promise<Buffer> {
  const tpl = RESUME_TEMPLATES[content.meta.templateKey] ?? RESUME_TEMPLATES.classic;
  const after = spacing === "compact" ? 40 : 100;
  const size = 22; // 11pt
  const heading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: spacing === "compact" ? 120 : 220, after },
      border: content.meta.templateKey === "modern" ? { bottom: { color: tpl.accent, size: 6, style: BorderStyle.SINGLE, space: 2 } } : undefined,
      children: [new TextRun({ text, bold: true, size: 24, color: tpl.accent, font: tpl.font })],
    });
  const bullet = (text: string) =>
    new Paragraph({
      numbering: { reference: "bullets", level: 0 },
      spacing: { after: spacing === "compact" ? 0 : 40 },
      children: [new TextRun({ text, size, font: tpl.font })],
    });
  const plain = (text: string, opts: { bold?: boolean; italics?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}) =>
    new Paragraph({ alignment: opts.align, spacing: { after: spacing === "compact" ? 0 : 40 }, children: [new TextRun({ text, size, bold: opts.bold, italics: opts.italics, font: tpl.font })] });

  const children: (Paragraph | Table)[] = [];
  const notice = demoNotice(content);
  if (notice) children.push(plain(notice, { bold: true, align: AlignmentType.CENTER }));
  children.push(
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: content.header.fullName, bold: true, size: 32, font: tpl.font })] }),
    plain(content.header.title, { align: AlignmentType.CENTER, bold: true }),
  );
  const contact = contactLine(content);
  if (contact) children.push(plain(contact, { align: AlignmentType.CENTER }));

  children.push(heading("Professional Summary"));
  for (const b of content.summary) children.push(bullet(b.text));

  children.push(heading("Professional Experience"));
  for (const p of content.projects) {
    children.push(
      new Paragraph({
        spacing: { before: spacing === "compact" ? 80 : 160 },
        children: [new TextRun({ text: [p.client, p.location].filter(Boolean).join(", "), bold: true, size, font: tpl.font })],
      }),
      plain(formatRange(p.startDate, p.endDate)),
      plain(p.role, { bold: true }),
    );
    if (p.title && p.title !== p.role) children.push(plain(`Project: ${p.title}`, { italics: true }));
    for (const b of p.bullets) children.push(bullet(b.text));
    if (p.technologies.length) children.push(plain(`Environment: ${p.technologies.join(", ")}`, { italics: true }));
  }

  if (content.skills.length) {
    children.push(heading("Technical Skills"));
    const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "999999" };
    const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: content.skills.map(
          (row) =>
            new TableRow({
              children: [
                new TableCell({ borders, width: { size: 28, type: WidthType.PERCENTAGE }, children: [plain(row.category, { bold: true })] }),
                new TableCell({ borders, width: { size: 72, type: WidthType.PERCENTAGE }, children: [plain(row.values.join(", "))] }),
              ],
            }),
        ),
      }),
    );
  }
  if (content.education.length) {
    children.push(heading("Education"));
    for (const e of content.education) children.push(plain(e));
  }
  if (content.certifications.length) {
    children.push(heading("Certifications"));
    for (const c of content.certifications) children.push(bullet(c));
  }
  for (const s of content.extraSections) {
    children.push(heading(s.heading));
    for (const l of s.lines) children.push(bullet(l));
  }

  const doc = new Document({
    creator: "Multi-Domain Resume Builder",
    title: `${content.header.fullName} — Resume`,
    styles: { default: { document: { run: { font: tpl.font, size } } } },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }],
        },
      ],
    },
    sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1080, right: 1080 } } }, children }],
  });
  return Packer.toBuffer(doc);
}

// ------------------------------------------------------------------------------------------------
// PDF
// ------------------------------------------------------------------------------------------------

export async function renderPdf(content: ResumeContent, spacing: Spacing = "normal"): Promise<{ buffer: Buffer; pageCount: number }> {
  const tpl = RESUME_TEMPLATES[content.meta.templateKey] ?? RESUME_TEMPLATES.classic;
  const accent = `#${tpl.accent}`;
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 50, bottom: 50, left: 54, right: 54 }, bufferPages: true, info: { Title: `${content.header.fullName} — Resume`, Creator: "Multi-Domain Resume Builder" } });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<void>((resolve) => doc.on("end", () => resolve()));
  const gap = spacing === "compact" ? 0.25 : 0.6;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const heading = (text: string) => {
    doc.moveDown(gap);
    // Keep headings with their first lines (avoid orphan headings at the page bottom).
    if (doc.y > doc.page.height - doc.page.margins.bottom - 60) doc.addPage();
    doc.font("Helvetica-Bold").fontSize(12).fillColor(accent).text(text, { width });
    if (content.meta.templateKey === "modern") {
      doc.moveTo(doc.page.margins.left, doc.y + 1).lineTo(doc.page.margins.left + width, doc.y + 1).strokeColor(accent).lineWidth(0.7).stroke();
    }
    doc.fillColor("black").moveDown(gap / 2);
  };
  const bullet = (text: string) => {
    doc.font("Helvetica").fontSize(10.5);
    const x = doc.page.margins.left;
    const lineGap = spacing === "compact" ? 0 : 1;
    // Never split a bullet marker from its text across pages.
    if (doc.y + doc.heightOfString(text, { width: width - 16, lineGap }) > doc.page.height - doc.page.margins.bottom) doc.addPage();
    const y = doc.y;
    doc.text("•", x + 4, y, { width: 10, lineBreak: false });
    doc.text(text, x + 16, y, { width: width - 16, lineGap });
    doc.x = x;
  };

  const notice = demoNotice(content);
  if (notice) doc.font("Helvetica-Bold").fontSize(9).text(notice, { align: "center", width });
  doc.font("Helvetica-Bold").fontSize(16).text(content.header.fullName, { align: "center", width });
  doc.font("Helvetica-Bold").fontSize(11).text(content.header.title, { align: "center", width });
  const contact = contactLine(content);
  if (contact) doc.font("Helvetica").fontSize(9.5).text(contact, { align: "center", width });

  heading("Professional Summary");
  for (const b of content.summary) bullet(b.text);

  heading("Professional Experience");
  for (const p of content.projects) {
    doc.moveDown(gap);
    if (doc.y > doc.page.height - doc.page.margins.bottom - 70) doc.addPage();
    doc.font("Helvetica-Bold").fontSize(10.5).text([p.client, p.location].filter(Boolean).join(", "), { width });
    doc.font("Helvetica").fontSize(10.5).text(formatRange(p.startDate, p.endDate), { width });
    doc.font("Helvetica-Bold").text(p.role, { width });
    if (p.title && p.title !== p.role) doc.font("Helvetica-Oblique").text(`Project: ${p.title}`, { width });
    for (const b of p.bullets) bullet(b.text);
    if (p.technologies.length) doc.font("Helvetica-Oblique").fontSize(10).text(`Environment: ${p.technologies.join(", ")}`, { width });
  }

  if (content.skills.length) {
    heading("Technical Skills");
    for (const row of content.skills) {
      doc.font("Helvetica-Bold").fontSize(10.5).text(`${row.category}: `, { continued: true, width }).font("Helvetica").text(row.values.join(", "));
    }
  }
  if (content.education.length) {
    heading("Education");
    for (const e of content.education) doc.font("Helvetica").fontSize(10.5).text(e, { width });
  }
  if (content.certifications.length) {
    heading("Certifications");
    for (const c of content.certifications) bullet(c);
  }
  for (const s of content.extraSections) {
    heading(s.heading);
    for (const l of s.lines) bullet(l);
  }

  const pageCount = doc.bufferedPageRange().count;
  doc.end();
  await done;
  return { buffer: Buffer.concat(chunks), pageCount };
}

// ------------------------------------------------------------------------------------------------
// Rendered page count for DOCX (via LibreOffice when installed) and export integrity checks
// ------------------------------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

export async function docxPageCount(docx: Buffer): Promise<number | null> {
  const bin = process.env.SOFFICE_PATH ?? "soffice";
  const dir = await mkdtemp(path.join(tmpdir(), "resume-pages-"));
  try {
    const input = path.join(dir, "resume.docx");
    await writeFile(input, docx);
    await execFileAsync(bin, ["--headless", "--convert-to", "pdf", "--outdir", dir, input], { timeout: 60_000 });
    const pdf = await readFile(path.join(dir, "resume.pdf"));
    return countPdfPages(pdf);
  } catch {
    return null; // LibreOffice not available: the PDF render's count is reported instead.
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export function countPdfPages(pdf: Buffer): number {
  const text = pdf.toString("latin1");
  const m = text.match(/\/Type\s*\/Page[^s]/g);
  return m ? m.length : 0;
}

/** Re-open the exported file and confirm the expected sections survived (AT-10). */
export async function verifyExport(format: "DOCX" | "PDF", buffer: Buffer, content: ResumeContent): Promise<{ ok: boolean; missing: string[] }> {
  let text = "";
  if (format === "DOCX") {
    const mammoth = (await import("mammoth")).default;
    text = (await mammoth.extractRawText({ buffer })).value;
  } else {
    const mod = (await import("pdf-parse/lib/pdf-parse.js")) as unknown as { default: (b: Buffer) => Promise<{ text: string }> };
    text = (await mod.default(buffer)).text;
  }
  const expected = ["Professional Summary", "Professional Experience", content.header.fullName];
  if (content.skills.length) expected.push("Technical Skills");
  const norm = text.replace(/\s+/g, " ");
  const missing = expected.filter((e) => !norm.includes(e));
  return { ok: missing.length === 0, missing };
}
