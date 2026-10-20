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
import { DESIGNS, getDesign, type ResumeDesign } from "./designs";
import type { ResumeContent } from "./resume-schema";
import { formatRange } from "./timeline";

export type Spacing = "normal" | "compact";

/** @deprecated use DESIGNS from ./designs — kept for callers that list design names. */
export const RESUME_TEMPLATES: Record<string, { name: string; description: string }> = Object.fromEntries(DESIGNS.map((d) => [d.key, { name: d.name, description: d.description }]));

function contactLine(c: ResumeContent): string {
  return [c.header.email, c.header.phone, c.header.location, c.header.linkedin].filter(Boolean).join("  |  ");
}

function demoNotice(c: ResumeContent): string | null {
  return c.meta.isDemo ? "SAMPLE / DEMO OUTPUT — contains illustrative data and must not be submitted to employers." : null;
}

const headingText = (d: ResumeDesign, text: string) => (d.headingCaps ? text.toUpperCase() : text);

// ------------------------------------------------------------------------------------------------
// DOCX
// ------------------------------------------------------------------------------------------------

export async function renderDocx(content: ResumeContent, spacing: Spacing = "normal"): Promise<Buffer> {
  const d = getDesign(content.meta.templateKey);
  const tight = spacing === "compact" || d.key === "compact";
  const after = tight ? 40 : 100;
  const size = Math.round(d.bodySize * 2) + 1; // half-points (10.5pt → 22)
  const font = d.docxFont;
  const align = d.headerAlign === "center" ? AlignmentType.CENTER : AlignmentType.LEFT;
  const rule = (color: string, sz = 6) => ({ color, size: sz, style: BorderStyle.SINGLE, space: 2 });

  const heading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: tight ? 120 : 220, after },
      border:
        d.heading === "rule" || d.heading === "caps-rule"
          ? { bottom: rule(d.accent) }
          : d.heading === "double-rule"
            ? { top: rule(d.accent, 4), bottom: rule(d.accent, 4) }
            : d.heading === "bar"
              ? { left: { color: d.accent, size: 24, style: BorderStyle.SINGLE, space: 6 } }
              : undefined,
      shading: d.heading === "band" ? { fill: d.accent, color: "auto", type: "clear" } : undefined,
      children: [
        new TextRun({
          text: headingText(d, text),
          bold: d.heading !== "small-caps",
          smallCaps: d.heading === "small-caps",
          size: size + 2,
          color: d.heading === "band" ? "FFFFFF" : d.accent,
          font,
          characterSpacing: d.headingCaps ? 20 : undefined,
        }),
      ],
    });
  const bullet = (text: string) =>
    new Paragraph({
      numbering: { reference: "bullets", level: 0 },
      spacing: { after: tight ? 0 : 40 },
      children: [new TextRun({ text, size, font, color: d.text })],
    });
  const plain = (text: string, opts: { bold?: boolean; italics?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; color?: string } = {}) =>
    new Paragraph({ alignment: opts.align, spacing: { after: tight ? 0 : 40 }, children: [new TextRun({ text, size, bold: opts.bold, italics: opts.italics, font, color: opts.color ?? d.text })] });

  const children: (Paragraph | Table)[] = [];
  const notice = demoNotice(content);
  if (notice) children.push(plain(notice, { bold: true, align: AlignmentType.CENTER }));
  children.push(
    new Paragraph({ alignment: align, children: [new TextRun({ text: content.header.fullName, bold: true, size: d.nameSize * 2, font, color: d.heading === "plain" ? d.text : d.accent })] }),
    plain(content.header.title, { align, bold: true }),
  );
  const contact = contactLine(content);
  if (contact) children.push(plain(contact, { align }));

  children.push(heading("Professional Summary"));
  for (const b of content.summary) children.push(bullet(b.text));

  children.push(heading("Professional Experience"));
  for (const p of content.projects) {
    children.push(
      new Paragraph({
        spacing: { before: tight ? 80 : 160 },
        children: [new TextRun({ text: [p.client, p.location].filter(Boolean).join(", "), bold: true, size, font, color: d.text })],
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
    if (d.skillsAsTable) {
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
    } else {
      for (const row of content.skills) {
        children.push(new Paragraph({ spacing: { after: tight ? 0 : 40 }, children: [new TextRun({ text: `${row.category}: `, bold: true, size, font, color: d.text }), new TextRun({ text: row.values.join(", "), size, font, color: d.text })] }));
      }
    }
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
    creator: "Resume Builder",
    title: `${content.header.fullName} — Resume`,
    styles: { default: { document: { run: { font, size } } } },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }],
        },
      ],
    },
    sections: [{ properties: { page: { margin: tight ? { top: 720, bottom: 720, left: 900, right: 900 } : { top: 1000, bottom: 1000, left: 1080, right: 1080 } } }, children }],
  });
  return Packer.toBuffer(doc);
}

// ------------------------------------------------------------------------------------------------
// PDF
// ------------------------------------------------------------------------------------------------

export async function renderPdf(content: ResumeContent, spacing: Spacing = "normal"): Promise<{ buffer: Buffer; pageCount: number }> {
  const d = getDesign(content.meta.templateKey);
  const tight = spacing === "compact" || d.key === "compact";
  const accent = `#${d.accent}`;
  const ink = `#${d.text}`;
  const F = d.pdfFont;
  const size = d.bodySize;
  const margin = tight ? 40 : 54;
  const doc = new PDFDocument({ size: "LETTER", margins: { top: tight ? 40 : 50, bottom: tight ? 40 : 50, left: margin, right: margin }, bufferPages: true, info: { Title: `${content.header.fullName} — Resume`, Creator: "Resume Builder" } });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<void>((resolve) => doc.on("end", () => resolve()));
  const gap = tight ? 0.25 : 0.6;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;
  const align = d.headerAlign;

  const heading = (raw: string) => {
    const text = headingText(d, raw);
    doc.moveDown(gap);
    // Keep headings with their first lines (avoid orphan headings at the page bottom).
    if (doc.y > doc.page.height - doc.page.margins.bottom - 60) doc.addPage();
    const hs = size + 1.5;
    doc.font(d.heading === "small-caps" ? F.regular : F.bold).fontSize(hs);
    const opts = { width, characterSpacing: d.headingCaps ? 0.8 : 0 };
    if (d.heading === "band") {
      const h = doc.heightOfString(text, opts) + 6;
      const y = doc.y;
      doc.rect(left, y, width, h).fill(accent);
      doc.fillColor("#FFFFFF").text(text, left + 6, y + 3, { ...opts, width: width - 12 });
      doc.x = left;
      doc.y = y + h;
    } else if (d.heading === "bar") {
      const y = doc.y;
      const h = doc.heightOfString(text, opts);
      doc.rect(left, y, 3, h).fill(accent);
      doc.fillColor(accent).text(text, left + 9, y, { ...opts, width: width - 9 });
      doc.x = left;
    } else if (d.heading === "double-rule") {
      doc.moveTo(left, doc.y).lineTo(left + width, doc.y).strokeColor(accent).lineWidth(0.5).stroke();
      doc.moveDown(0.2);
      doc.fillColor(accent).text(text, left, doc.y, opts);
      doc.moveTo(left, doc.y + 1).lineTo(left + width, doc.y + 1).strokeColor(accent).lineWidth(0.5).stroke();
    } else {
      doc.fillColor(accent).text(text, left, doc.y, opts);
      if (d.heading === "rule" || d.heading === "caps-rule") {
        doc.moveTo(left, doc.y + 1).lineTo(left + width, doc.y + 1).strokeColor(accent).lineWidth(d.heading === "caps-rule" ? 1 : 0.7).stroke();
      }
    }
    doc.fillColor(ink).moveDown(gap / 2);
  };
  const bullet = (text: string) => {
    doc.font(F.regular).fontSize(size).fillColor(ink);
    const lineGap = tight ? 0 : 1;
    // Never split a bullet marker from its text across pages.
    if (doc.y + doc.heightOfString(text, { width: width - 16, lineGap }) > doc.page.height - doc.page.margins.bottom) doc.addPage();
    const y = doc.y;
    doc.text("•", left + 4, y, { width: 10, lineBreak: false });
    doc.text(text, left + 16, y, { width: width - 16, lineGap });
    doc.x = left;
  };

  const notice = demoNotice(content);
  if (notice) doc.font(F.bold).fontSize(9).fillColor(ink).text(notice, { align: "center", width });
  doc.font(F.bold).fontSize(d.nameSize).fillColor(d.heading === "plain" ? ink : accent).text(content.header.fullName, { align, width });
  doc.font(F.bold).fontSize(size + 1).fillColor(ink).text(content.header.title, { align, width });
  const contact = contactLine(content);
  if (contact) doc.font(F.regular).fontSize(size - 1).fillColor(ink).text(contact, { align, width });

  heading("Professional Summary");
  for (const b of content.summary) bullet(b.text);

  heading("Professional Experience");
  for (const p of content.projects) {
    doc.moveDown(gap);
    if (doc.y > doc.page.height - doc.page.margins.bottom - 70) doc.addPage();
    doc.font(F.bold).fontSize(size).fillColor(ink).text([p.client, p.location].filter(Boolean).join(", "), left, doc.y, { width });
    doc.font(F.regular).fontSize(size).text(formatRange(p.startDate, p.endDate), { width });
    doc.font(F.bold).text(p.role, { width });
    if (p.title && p.title !== p.role) doc.font(F.italic).text(`Project: ${p.title}`, { width });
    for (const b of p.bullets) bullet(b.text);
    if (p.technologies.length) doc.font(F.italic).fontSize(size - 0.5).text(`Environment: ${p.technologies.join(", ")}`, { width });
  }

  if (content.skills.length) {
    heading("Technical Skills");
    for (const row of content.skills) {
      doc.font(F.bold).fontSize(size).fillColor(ink).text(`${row.category}: `, { continued: true, width }).font(F.regular).text(row.values.join(", "));
    }
  }
  if (content.education.length) {
    heading("Education");
    for (const e of content.education) doc.font(F.regular).fontSize(size).fillColor(ink).text(e, { width });
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
  const norm = text.replace(/\s+/g, " ").toLowerCase();
  const missing = expected.filter((e) => !norm.includes(e.toLowerCase()));
  return { ok: missing.length === 0, missing };
}
