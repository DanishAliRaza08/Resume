// Parse an uploaded resume's plain text into candidate facts (spec §5.2). The parser preserves
// section structure where possible; anything it cannot place is returned for manual correction.

import type { Catalog } from "./text";
import { isoDate } from "./timeline";

export interface ParsedExperience {
  employer: string;
  location: string | null;
  title: string;
  startDate: string; // ISO
  endDate: string | null;
  bullets: string[];
}

export interface ParsedResume {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  summary: string[];
  experiences: ParsedExperience[];
  skills: { category: string; values: string[] }[];
  education: string[];
  certifications: string[];
  detectedTechs: string[];
  unplaced: string[];
  warnings: string[];
}

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4, jun: 5, june: 5,
  jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

const MONTH_RX = "(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?";
const POINT_RX = `(?:${MONTH_RX}\\s*,?\\s*(\\d{4})|(\\d{1,2})\\/(\\d{4}))`;
const END_RX = `(present|current|till\\s+date|to\\s+date|now|${POINT_RX})`;
export const DATE_RANGE = new RegExp(`${POINT_RX}\\s*(?:-|–|—|to|until)\\s*${END_RX}`, "i");

function pointToDate(monthName: string | undefined, year: string | undefined, mm: string | undefined, yyyy: string | undefined): Date | null {
  if (monthName && year) {
    const key = monthName.toLowerCase().replace(".", "");
    const m = MONTHS[key] ?? MONTHS[key.slice(0, 3)];
    if (m === undefined) return null;
    return new Date(Date.UTC(Number(year), m, 1));
  }
  if (mm && yyyy) return new Date(Date.UTC(Number(yyyy), Number(mm) - 1, 1));
  return null;
}

export function parseDateRange(line: string): { start: string; end: string | null; matched: string } | null {
  const m = DATE_RANGE.exec(line);
  if (!m) return null;
  const start = pointToDate(m[1], m[2], m[3], m[4]);
  if (!start) return null;
  const endWord = m[5].toLowerCase();
  let end: Date | null = null;
  if (!/present|current|date|now/.test(endWord)) {
    end = pointToDate(m[6], m[7], m[8], m[9]);
    if (end) end = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)); // end of month
  }
  return { start: isoDate(start), end: end ? isoDate(end) : null, matched: m[0] };
}

type Section = "HEADER" | "SUMMARY" | "EXPERIENCE" | "SKILLS" | "EDUCATION" | "CERTIFICATIONS" | "OTHER";

function headingOf(line: string): Section | null {
  const l = line.toLowerCase().replace(/[:•\-–_*#]+/g, " ").trim();
  if (l.length > 45 || l.split(/\s+/).length > 5) return null;
  if (/^(professional\s+)?(summary|profile|overview)|^summary of qualifications|^career summary/.test(l)) return "SUMMARY";
  if (/^(professional|work|employment|relevant)?\s*(experience|history)$|^projects?$|^project experience$/.test(l)) return "EXPERIENCE";
  if (/^(technical\s+)?skills|^technical (skills|expertise|proficiency)|^core competencies|^tools/.test(l)) return "SKILLS";
  if (/^education/.test(l)) return "EDUCATION";
  if (/^certifications?|^licenses/.test(l)) return "CERTIFICATIONS";
  if (/^responsibilities$|^environment$/.test(l)) return null;
  return null;
}

const TITLE_HINT = /(analyst|engineer|manager|developer|consultant|lead|architect|specialist|scrum master|tester|administrator|owner|associate|director|coordinator)/i;

function isLikelyTitle(line: string): boolean {
  return line.split(/\s+/).length <= 8 && TITLE_HINT.test(line) && !/[.;]$/.test(line);
}

function splitEmployerLocation(raw: string): { employer: string; location: string | null } {
  const cleaned = raw.replace(/[|()]+/g, " ").replace(/\s+/g, " ").trim().replace(/[,\-–]+$/, "").trim();
  const parts = cleaned.split(/\s*,\s*/);
  if (parts.length >= 2) return { employer: parts[0], location: parts.slice(1).join(", ") };
  return { employer: cleaned, location: null };
}

export function parseResumeText(text: string, catalog: Catalog): ParsedResume {
  const lines = text
    .replace(/\r/g, "")
    .replace(/\s*Responsibilities\s*:\s*$/gim, "\nResponsibilities:")
    .split("\n")
    .map((l) => l.replace(/^[\s•\-*–·▪●]+/, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const result: ParsedResume = {
    fullName: null, email: null, phone: null, linkedin: null, summary: [], experiences: [], skills: [],
    education: [], certifications: [], detectedTechs: [], unplaced: [], warnings: [],
  };
  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/.exec(text);
  if (email) result.email = email[0];
  const phone = /(\+?\d[\d\s().-]{8,}\d)/.exec(text);
  if (phone) result.phone = phone[1].trim();
  const li = /linkedin\.com\/[\w/-]+/i.exec(text);
  if (li) result.linkedin = li[0];

  let section: Section = "HEADER";
  let current: ParsedExperience | null = null;
  let pendingEmployer: string | null = null;

  const pushBullet = (target: string[], line: string) => {
    // Re-join bullets that were broken across paragraphs (continuations start lower-case or with "(").
    if (target.length && /^[a-z(]/.test(line)) target[target.length - 1] = `${target[target.length - 1]} ${line}`;
    else target.push(line);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const heading = headingOf(line);
    if (heading) {
      section = heading;
      continue;
    }
    if (/^responsibilities\s*:?$/i.test(line)) continue;

    if (section === "HEADER") {
      if (!result.fullName && !email?.[0].includes(line) && line.split(/\s+/).length <= 5 && !/\d/.test(line)) {
        result.fullName = line;
        continue;
      }
      // Some resumes start directly with summary bullets.
      if (line.length > 60) {
        section = "SUMMARY";
      } else continue;
    }

    const range = parseDateRange(line);
    if (range && (section === "EXPERIENCE" || section === "SUMMARY" || section === "OTHER")) {
      section = "EXPERIENCE";
      const before = line.slice(0, line.indexOf(range.matched)).trim();
      let employerRaw = before.replace(/[(|]+$/, "").trim() || pendingEmployer || "";
      if (!employerRaw && current === null && i > 0) employerRaw = lines[i - 1];
      // If the previous line was taken as the last bullet of the prior job, reclaim it as employer.
      if (!before && !pendingEmployer && current && current.bullets.length && current.bullets[current.bullets.length - 1] === lines[i - 1]) {
        employerRaw = current.bullets.pop()!;
      }
      const { employer, location } = splitEmployerLocation(employerRaw);
      let title = "";
      const after = line.slice(line.indexOf(range.matched) + range.matched.length).replace(/^[\s)|,\-–]+/, "").trim();
      if (after && isLikelyTitle(after)) title = after;
      else if (lines[i + 1] && isLikelyTitle(lines[i + 1]) && !parseDateRange(lines[i + 1])) {
        title = lines[i + 1];
        i++;
      }
      current = { employer: employer || "Unknown employer", location, title: title || "Unknown title", startDate: range.start, endDate: range.end, bullets: [] };
      if (!employer) result.warnings.push(`Could not identify the employer for the role starting ${range.start}; please correct it.`);
      result.experiences.push(current);
      pendingEmployer = null;
      continue;
    }

    switch (section) {
      case "SUMMARY":
        pushBullet(result.summary, line);
        break;
      case "EXPERIENCE": {
        const next = lines[i + 1];
        const nextIsDateOnly = next ? !!parseDateRange(next) && parseDateRange(next)!.matched.length >= next.length - 3 : false;
        if (nextIsDateOnly && line.length < 80) {
          pendingEmployer = line;
          break;
        }
        if (current) pushBullet(current.bullets, line);
        else result.unplaced.push(line);
        break;
      }
      case "SKILLS": {
        const m = /^([^:]{2,40}):\s*(.+)$/.exec(line);
        if (m) result.skills.push({ category: m[1].trim(), values: m[2].split(/\s*[,;|]\s*/).filter(Boolean) });
        else result.skills.push({ category: "Skills", values: line.split(/\s*[,;|]\s*/).filter(Boolean) });
        break;
      }
      case "EDUCATION":
        result.education.push(line);
        break;
      case "CERTIFICATIONS":
        result.certifications.push(line);
        break;
      default:
        result.unplaced.push(line);
    }
  }

  // Drop experience lines that are only "Environment:" lists but record their technologies.
  for (const e of result.experiences) {
    e.bullets = e.bullets.filter((b) => !/^environment\s*:/i.test(b) || (result.detectedTechs.push(...catalog.find(b).map((f) => f.entry.canonicalName)), false));
  }
  const fullText = [...result.summary, ...result.experiences.flatMap((e) => e.bullets), ...result.skills.flatMap((s) => s.values)].join("\n");
  result.detectedTechs = [...new Set([...result.detectedTechs, ...catalog.find(fullText).map((f) => f.entry.canonicalName)])];
  if (!result.experiences.length) result.warnings.push("No dated work experience was detected. Check the document structure or enter experience manually.");
  if (!result.summary.length) result.warnings.push("No Professional Summary section was detected.");
  return result;
}
