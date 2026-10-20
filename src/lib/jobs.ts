// Job link parsing and job-posting extraction (pure functions; no network).
import { createHash } from "node:crypto";

export interface JobLink {
  url: string;
  key: string; // stable id used to prevent applying to the same job twice
}

const DICE_HOSTS = new Set(["www.dice.com", "dice.com"]);
const DICE_JOB_ID = /\/job-detail\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

/** Accepts Dice job links only (https://www.dice.com/job-detail/<id>). */
export function normalizeDiceLink(raw: string): JobLink | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || !DICE_HOSTS.has(u.hostname.toLowerCase())) return null;
  const m = DICE_JOB_ID.exec(u.pathname);
  if (m) return { url: `https://www.dice.com/job-detail/${m[1].toLowerCase()}`, key: `dice:${m[1].toLowerCase()}` };
  if (!u.pathname.startsWith("/job-detail/")) return null;
  const clean = `https://www.dice.com${u.pathname.replace(/\/+$/, "")}`;
  return { url: clean, key: `dice:${createHash("sha256").update(clean).digest("hex").slice(0, 32)}` };
}

/** Pull Dice job links out of pasted text (one per line, or mixed with other text). */
export function parseJobLinks(text: string, max = 500): { links: JobLink[]; invalid: string[]; truncated: boolean } {
  const tokens = text.split(/[\s,;]+/).map((t) => t.trim()).filter(Boolean);
  const links: JobLink[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  for (const t of tokens) {
    if (!/^https?:\/\//i.test(t)) {
      if (/dice\.com/i.test(t)) invalid.push(t);
      continue;
    }
    const link = normalizeDiceLink(t.replace(/[)\].,'"]+$/, ""));
    if (!link) {
      invalid.push(t);
      continue;
    }
    if (seen.has(link.key)) continue;
    seen.add(link.key);
    links.push(link);
  }
  return { links: links.slice(0, max), invalid, truncated: links.length > max };
}

export interface JobPosting {
  title: string | null;
  company: string | null;
  location: string | null;
  description: string | null;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };

export function htmlToText(html: string): string {
  return html
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, " ")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|h[1-6]|tr)\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
      const k = e.toLowerCase();
      if (k in ENTITIES) return ENTITIES[k];
      if (k.startsWith("#x")) return String.fromCodePoint(parseInt(k.slice(2), 16));
      if (k.startsWith("#")) return String.fromCodePoint(Number(k.slice(1)));
      return m;
    })
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findJobPosting(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const f = findJobPosting(n);
      if (f) return f;
    }
    return null;
  }
  const o = node as Record<string, unknown>;
  const type = o["@type"];
  if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) return o;
  if (o["@graph"]) return findJobPosting(o["@graph"]);
  return null;
}

/**
 * Extract a job posting from a page using schema.org JobPosting JSON-LD (used by Dice and most
 * job boards), falling back to the page title and meta description.
 */
export function parseJobPostingHtml(html: string): JobPosting {
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let data: unknown;
    try {
      data = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    const jp = findJobPosting(data);
    if (!jp) continue;
    const org = jp.hiringOrganization as { name?: string } | string | undefined;
    const loc = (Array.isArray(jp.jobLocation) ? jp.jobLocation[0] : jp.jobLocation) as { address?: { addressLocality?: string; addressRegion?: string } } | undefined;
    const remote = jp.jobLocationType === "TELECOMMUTE" ? "Remote" : null;
    return {
      title: typeof jp.title === "string" ? htmlToText(jp.title) : null,
      company: typeof org === "string" ? org : org?.name ?? null,
      location: [loc?.address?.addressLocality, loc?.address?.addressRegion].filter(Boolean).join(", ") || remote,
      description: typeof jp.description === "string" ? htmlToText(jp.description) : null,
    };
  }
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const meta = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i.exec(html)?.[1];
  return { title: title ? htmlToText(title) : null, company: null, location: null, description: meta ? htmlToText(meta) : null };
}
