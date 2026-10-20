// Resume designs. Every design is single-column with real text headings so it stays ATS-readable;
// designs differ in typography, colour, alignment and heading treatment only.

export type HeadingStyle = "plain" | "rule" | "caps-rule" | "band" | "bar" | "double-rule" | "small-caps";

export interface ResumeDesign {
  key: string;
  name: string;
  description: string;
  bestFor: string;
  accent: string; // hex without '#'
  text: string; // body text colour
  headerAlign: "center" | "left";
  heading: HeadingStyle;
  headingCaps: boolean;
  nameSize: number; // pt
  bodySize: number; // pt
  // PDF (built-in fonts so no font files are needed on the server)
  pdfFont: { regular: string; bold: string; italic: string };
  // DOCX / preview
  docxFont: string;
  cssFont: string;
  skillsAsTable: boolean;
}

const HELVETICA = { regular: "Helvetica", bold: "Helvetica-Bold", italic: "Helvetica-Oblique" };
const TIMES = { regular: "Times-Roman", bold: "Times-Bold", italic: "Times-Italic" };

export const DESIGNS: ResumeDesign[] = [
  {
    key: "classic",
    name: "Classic",
    description: "Black and white, centered name, bold headings.",
    bestFor: "Staffing submissions and conservative employers",
    accent: "111111",
    text: "111111",
    headerAlign: "center",
    heading: "plain",
    headingCaps: false,
    nameSize: 16,
    bodySize: 10.5,
    pdfFont: HELVETICA,
    docxFont: "Calibri",
    cssFont: 'Calibri, Carlito, "Segoe UI", Arial, sans-serif',
    skillsAsTable: true,
  },
  {
    key: "modern",
    name: "Modern",
    description: "Navy accents, left-aligned header, ruled section headings.",
    bestFor: "Technology, analytics and consulting roles",
    accent: "1F4E79",
    text: "1A1A1A",
    headerAlign: "left",
    heading: "rule",
    headingCaps: false,
    nameSize: 20,
    bodySize: 10.5,
    pdfFont: HELVETICA,
    docxFont: "Calibri",
    cssFont: 'Calibri, Carlito, "Segoe UI", Arial, sans-serif',
    skillsAsTable: true,
  },
  {
    key: "executive",
    name: "Executive",
    description: "Serif type, burgundy uppercase headings with a full-width rule.",
    bestFor: "Senior, lead and management positions",
    accent: "7A1F2B",
    text: "1A1A1A",
    headerAlign: "center",
    heading: "caps-rule",
    headingCaps: true,
    nameSize: 20,
    bodySize: 10.5,
    pdfFont: TIMES,
    docxFont: "Georgia",
    cssFont: 'Georgia, "Times New Roman", serif',
    skillsAsTable: true,
  },
  {
    key: "minimal",
    name: "Minimal",
    description: "Generous whitespace, grey small-caps headings, no lines.",
    bestFor: "A clean, understated look",
    accent: "555555",
    text: "222222",
    headerAlign: "left",
    heading: "small-caps",
    headingCaps: true,
    nameSize: 18,
    bodySize: 10.5,
    pdfFont: HELVETICA,
    docxFont: "Arial",
    cssFont: 'Arial, Helvetica, sans-serif',
    skillsAsTable: false,
  },
  {
    key: "bold",
    name: "Bold",
    description: "Teal heading bands with white text and a large name.",
    bestFor: "Standing out while staying ATS-readable",
    accent: "0F6E6E",
    text: "1A1A1A",
    headerAlign: "left",
    heading: "band",
    headingCaps: true,
    nameSize: 22,
    bodySize: 10.5,
    pdfFont: HELVETICA,
    docxFont: "Calibri",
    cssFont: 'Calibri, Carlito, "Segoe UI", Arial, sans-serif',
    skillsAsTable: true,
  },
  {
    key: "elegant",
    name: "Elegant",
    description: "Serif type, forest-green headings between thin rules.",
    bestFor: "Healthcare, pharma and professional services",
    accent: "2E5E3E",
    text: "1A1A1A",
    headerAlign: "center",
    heading: "double-rule",
    headingCaps: true,
    nameSize: 19,
    bodySize: 10.5,
    pdfFont: TIMES,
    docxFont: "Garamond",
    cssFont: 'Garamond, "EB Garamond", Georgia, serif',
    skillsAsTable: false,
  },
  {
    key: "compact",
    name: "Compact",
    description: "Smaller type and tight spacing with a left accent bar on headings.",
    bestFor: "Fitting a lot of experience onto 1–2 pages",
    accent: "3B3B98",
    text: "1A1A1A",
    headerAlign: "left",
    heading: "bar",
    headingCaps: false,
    nameSize: 16,
    bodySize: 9.5,
    pdfFont: HELVETICA,
    docxFont: "Arial",
    cssFont: 'Arial, Helvetica, sans-serif',
    skillsAsTable: false,
  },
];

export function getDesign(key: string | null | undefined): ResumeDesign {
  return DESIGNS.find((d) => d.key === key) ?? DESIGNS[0];
}

export const DESIGN_KEYS = DESIGNS.map((d) => d.key) as [string, ...string[]];
