// Checks the technology knowledge base: every key is a catalog technology, every bullet mentions
// its own technology and no other catalog technology, and style rules hold.
//   npx tsx scripts/check-knowledge.ts
import { TECH_KNOWLEDGE } from "../src/data/tech-knowledge";
import { TECHNOLOGIES } from "../src/data/technologies";
import { Catalog } from "../src/lib/text";

const catalog = new Catalog(TECHNOLOGIES.map((t) => ({ canonicalName: t.canonicalName, aliases: t.aliases, category: t.category })));
const names = new Set(TECHNOLOGIES.map((t) => t.canonicalName));
const problems: string[] = [];
const missing: string[] = [];
let bullets = 0;
const terms = new Map<string, string>();
for (const t of TECHNOLOGIES) {
  for (const term of [t.canonicalName, ...t.aliases]) {
    const key = term.toLowerCase().trim();
    const owner = terms.get(key);
    if (owner && owner !== t.canonicalName) problems.push(`"${term}" is used by both ${owner} and ${t.canonicalName}`);
    terms.set(key, t.canonicalName);
  }
  if (!TECH_KNOWLEDGE[t.canonicalName]) missing.push(t.canonicalName);
}
for (const [name, k] of Object.entries(TECH_KNOWLEDGE)) {
  if (!names.has(name)) problems.push(`${name}: not a catalog technology`);
  if (!k.description || k.description.length < 20) problems.push(`${name}: description missing/short`);
  for (const [role, list] of Object.entries(k.bullets)) {
    for (const b of list ?? []) {
      bullets++;
      const found = catalog.find(b.replace(/\{client\}|\{subdomain\}/g, "X")).map((f) => f.entry.canonicalName);
      const others = found.filter((f) => f !== name);
      if (!found.includes(name)) problems.push(`${name}/${role}: bullet does not mention ${name}: "${b}"`);
      if (others.length) problems.push(`${name}/${role}: mentions other catalog tech [${others.join(", ")}]: "${b}"`);
      let digits = b;
      for (const f of catalog.find(b)) digits = digits.split(f.matched).join("");
      if (/\d/.test(digits)) problems.push(`${name}/${role}: contains a number (metrics are never invented): "${b}"`);
      if (/\b(I|my|we|our)\b/.test(b)) problems.push(`${name}/${role}: first person: "${b}"`);
      const words = b.split(/\s+/).length;
      if (words < 12 || words > 40) problems.push(`${name}/${role}: ${words} words (want 12-40): "${b}"`);
      if (!/\.$/.test(b)) problems.push(`${name}/${role}: should end with a period: "${b}"`);
    }
  }
}
if (missing.length) console.log(`No knowledge entry yet (${missing.length}): ${missing.join(", ")}`);
console.log(`${Object.keys(TECH_KNOWLEDGE).length} technologies, ${bullets} bullets, ${problems.length} problem(s)`);
for (const p of problems) console.log(" - " + p);
process.exit(problems.length ? 1 : 0);
