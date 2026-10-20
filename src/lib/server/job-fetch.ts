// Fetch a Dice job page to read its title/company/description. Only dice.com is contacted
// (prevents the server being used to reach arbitrary or internal addresses).
import { normalizeDiceLink, parseJobPostingHtml, type JobPosting } from "../jobs";

const MAX_BYTES = 3 * 1024 * 1024;

export async function fetchDiceJob(url: string): Promise<JobPosting> {
  let current = url;
  for (let hop = 0; hop < 4; hop++) {
    const link = normalizeDiceLink(current) ?? (/^https:\/\/(www\.)?dice\.com\//i.test(current) ? { url: current, key: "" } : null);
    if (!link) throw new Error("Only dice.com job pages can be read.");
    const res = await fetch(link.url, {
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BenchsaleDan/1.0; job description reader)", Accept: "text/html" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      current = new URL(res.headers.get("location")!, link.url).toString();
      continue;
    }
    if (!res.ok) throw new Error(`Dice returned ${res.status}.`);
    const reader = res.body?.getReader();
    if (!reader) throw new Error("Empty response.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const html = Buffer.concat(chunks).toString("utf8");
    const posting = parseJobPostingHtml(html);
    if (!posting.description || posting.description.length < 80) throw new Error("The job description could not be read from the page.");
    return posting;
  }
  throw new Error("Too many redirects.");
}
