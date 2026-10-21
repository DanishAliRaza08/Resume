// Turns an uploaded resume into an anonymous "library sample": bullet phrasing that later resumes
// for the same industry and role can offer as suggestions. Anything that could identify the person
// or a specific employer is removed, and bullets with numbers are dropped (another person's metrics
// must never appear on someone else's resume).
import type { ParsedResume } from "./resume-parser";

const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/g;
const URL = /\b(?:https?:\/\/|www\.)\S+|\blinkedin\.com\/\S+/gi;

export interface LibrarySample {
  text: string;
  bullets: string[];
}

/** Remove contact details and the person's/employers' names from free text. */
export function scrub(text: string, names: string[]): string {
  let out = text.replace(EMAIL, "[email]").replace(URL, "[link]").replace(PHONE, "[phone]");
  for (const n of names.filter((x) => x && x.trim().length >= 3)) {
    const escaped = n.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    out = out.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "[name]");
  }
  return out;
}

export function buildLibrarySample(parsed: ParsedResume, opts: { fullName: string; knownClientNames: string[] }): LibrarySample {
  const nameParts = opts.fullName.split(/\s+/).filter((p) => p.length >= 3);
  const employers = parsed.experiences.map((e) => e.employer).filter(Boolean);
  const sensitive = [opts.fullName, ...nameParts, ...employers];
  const lowerClients = opts.knownClientNames.map((c) => c.toLowerCase()).filter((c) => c.length >= 4);
  const candidates = [...parsed.summary, ...parsed.experiences.flatMap((e) => e.bullets)];
  const bullets: string[] = [];
  for (const raw of candidates) {
    const b = raw.replace(/\s+/g, " ").trim().replace(/^[•\-*–]\s*/, "");
    const words = b.split(" ").length;
    if (words < 8 || words > 45) continue;
    if (/\d/.test(b)) continue; // metrics, dates, counts belong to that person only
    if (EMAIL.test(b) || URL.test(b)) continue;
    EMAIL.lastIndex = 0;
    URL.lastIndex = 0;
    const lower = b.toLowerCase();
    if (sensitive.some((s) => s && s.length >= 3 && lower.includes(s.toLowerCase()))) continue;
    if (lowerClients.some((c) => new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower))) continue;
    if (/\b(I|my|me|we|our)\b/i.test(b)) continue;
    const sentence = /[.!?]$/.test(b) ? b : `${b}.`;
    if (!bullets.includes(sentence)) bullets.push(sentence);
  }
  const text = scrub(
    [
      ...parsed.summary,
      ...parsed.experiences.flatMap((e) => [`${e.title}`, ...e.bullets]),
      ...parsed.skills.map((s) => `${s.category}: ${s.values.join(", ")}`),
    ].join("\n"),
    sensitive,
  );
  return { text, bullets: bullets.slice(0, 120) };
}
