// Text utilities: keyword normalization against the technology catalog and near-duplicate detection.

export interface CatalogEntry {
  id?: string;
  canonicalName: string;
  aliases: string[];
  category: string;
  availableFrom?: number | null;
}

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#./ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Build a word-boundary-aware matcher for a term (handles symbols such as C#, CI/CD, P&C). */
export function termRegex(term: string): RegExp {
  const body = escapeRegex(term.toLowerCase()).replace(/\s+/g, "\\s+");
  return new RegExp(`(?:^|[^a-z0-9])(${body})(?=$|[^a-z0-9])`, "i");
}

// Very short or ambiguous aliases that should only match with exact casing.
const CASE_SENSITIVE_ALIASES = new Set(["R", "SAS", "ADO", "IAM", "VPC", "SNS", "SQS", "EC2", "ECS", "EKS", "S3", "ALM", "PM", "BA", "DA", "JS", "SAP", "CSV", "SIT", "UAT", "RDS", "MDM", "Epic", "Rally", "Slack", "Excel", "SWIFT", "SAFe", "Facets", "Looker", "Glue", "Git", "NCR", "ETL", "dbt"]);

export class Catalog {
  private matchers: { entry: CatalogEntry; term: string; regex: RegExp; caseSensitive: boolean }[] = [];
  private byCanonical = new Map<string, CatalogEntry>();

  constructor(entries: CatalogEntry[]) {
    for (const entry of entries) {
      this.byCanonical.set(normalizeName(entry.canonicalName), entry);
      for (const term of [entry.canonicalName, ...entry.aliases]) {
        if (term.length < 2) continue; // single letters (e.g. "R") only resolve by exact name, never by text search
        const caseSensitive = CASE_SENSITIVE_ALIASES.has(term) || term.length <= 2;
        const regex = caseSensitive
          ? new RegExp(`(?:^|[^A-Za-z0-9])(${escapeRegex(term)})(?=$|[^A-Za-z0-9])`)
          : termRegex(term);
        this.matchers.push({ entry, term, regex, caseSensitive });
      }
    }
    // Longest terms first so "SQL Server" wins over "SQL".
    this.matchers.sort((a, b) => b.term.length - a.term.length);
  }

  get entries(): CatalogEntry[] {
    return [...this.byCanonical.values()];
  }

  resolve(name: string): CatalogEntry | undefined {
    const n = normalizeName(name);
    const direct = this.byCanonical.get(n);
    if (direct) return direct;
    for (const m of this.matchers) if (normalizeName(m.term) === n) return m.entry;
    return undefined;
  }

  /** Find catalog technologies mentioned in text. Returns canonical entries with the matched surface form. */
  find(text: string): { entry: CatalogEntry; matched: string }[] {
    const found = new Map<string, { entry: CatalogEntry; matched: string }>();
    let masked = text;
    for (const m of this.matchers) {
      const r = m.regex.exec(masked);
      if (r) {
        if (!found.has(m.entry.canonicalName)) found.set(m.entry.canonicalName, { entry: m.entry, matched: r[1] });
        // Mask the matched span so shorter aliases inside it ("SQL" in "SQL Server") do not double-match.
        const idx = r.index + r[0].indexOf(r[1]);
        masked = masked.slice(0, idx) + " ".repeat(r[1].length) + masked.slice(idx + r[1].length);
      }
    }
    return [...found.values()];
  }

  mentions(text: string, canonicalName: string): boolean {
    return this.find(text).some((f) => f.entry.canonicalName === canonicalName);
  }
}

const STOPWORDS = new Set(
  "a an and the of for to in on with by as at from into across using via or that this these those their its was were is are be been including such".split(" "),
);

export function tokens(s: string): string[] {
  return normalizeName(s)
    .split(" ")
    .filter((w) => w && !STOPWORDS.has(w));
}

function shingles(s: string, n = 2): Set<string> {
  const t = tokens(s);
  const out = new Set<string>();
  if (t.length < n) {
    t.forEach((w) => out.add(w));
    return out;
  }
  for (let i = 0; i <= t.length - n; i++) out.add(t.slice(i, i + n).join(" "));
  return out;
}

export function similarity(a: string, b: string): number {
  const sa = shingles(a);
  const sb = shingles(b);
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  return inter / (sa.size + sb.size - inter);
}

export interface DuplicatePair {
  a: string; // bullet id
  b: string;
  score: number;
}

/** Near-duplicate detection across the whole resume (spec §10.1, AT-12). */
export function findNearDuplicates(items: { id: string; text: string }[], threshold = 0.55): DuplicatePair[] {
  const pairs: DuplicatePair[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const score = similarity(items[i].text, items[j].text);
      if (score >= threshold) pairs.push({ a: items[i].id, b: items[j].id, score: Math.round(score * 100) / 100 });
    }
  }
  return pairs;
}

export function firstWord(s: string): string {
  return (s.trim().split(/\s+/)[0] ?? "").replace(/[^A-Za-z-]/g, "");
}

export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function shortId(prefix: string, seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return `${prefix}_${(h >>> 0).toString(36)}`;
}
