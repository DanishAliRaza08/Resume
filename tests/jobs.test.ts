import { describe, expect, it } from "vitest";
import { missingRequired } from "@/data/screening";
import { htmlToText, normalizeDiceLink, parseJobLinks, parseJobPostingHtml } from "@/lib/jobs";

const ID = "edbc9d45-2e3a-4c13-967a-b5f4b636ca35";

describe("Dice job links", () => {
  it("normalizes Dice job links and rejects everything else", () => {
    expect(normalizeDiceLink(`https://www.dice.com/job-detail/${ID}?searchlink=x`)).toEqual({ url: `https://www.dice.com/job-detail/${ID}`, key: `dice:${ID}` });
    expect(normalizeDiceLink(`https://dice.com/job-detail/${ID.toUpperCase()}`)?.key).toBe(`dice:${ID}`);
    expect(normalizeDiceLink("http://www.dice.com/job-detail/" + ID)).toBeNull(); // https only
    expect(normalizeDiceLink("https://evil.example.com/job-detail/" + ID)).toBeNull();
    expect(normalizeDiceLink("https://www.dice.com.evil.com/job-detail/" + ID)).toBeNull();
    expect(normalizeDiceLink("https://www.dice.com/jobs?q=ba")).toBeNull();
  });

  it("extracts many links from pasted text, de-duplicated", () => {
    const text = `https://www.dice.com/job-detail/${ID}\nhttps://www.dice.com/job-detail/${ID}?x=1, https://www.dice.com/job-detail/11111111-2222-3333-4444-555555555555 notes https://indeed.com/viewjob?jk=1`;
    const r = parseJobLinks(text);
    expect(r.links).toHaveLength(2);
    expect(r.invalid).toEqual(["https://indeed.com/viewjob?jk=1"]);
  });
});

describe("job posting extraction", () => {
  it("reads schema.org JobPosting JSON-LD", () => {
    const html = `<html><head><title>x</title><script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Senior Business Analyst",
      hiringOrganization: { "@type": "Organization", name: "Acme Bank" },
      jobLocation: { address: { addressLocality: "Dallas", addressRegion: "TX" } },
      description: "<p>Must have <b>SQL</b> &amp; JIRA.</p><ul><li>Loan IQ</li></ul>",
    })}</script></head></html>`;
    expect(parseJobPostingHtml(html)).toEqual({ title: "Senior Business Analyst", company: "Acme Bank", location: "Dallas, TX", description: "Must have SQL & JIRA.\n\n- Loan IQ" });
  });

  it("falls back to title/meta description", () => {
    const p = parseJobPostingHtml(`<title>Data Analyst - Dice</title><meta name="description" content="Python and SQL">`);
    expect(p.title).toBe("Data Analyst - Dice");
    expect(p.description).toBe("Python and SQL");
  });

  it("strips scripts and decodes entities", () => {
    expect(htmlToText("<script>alert(1)</script>A&#39;s &lt;b&gt;")).toBe("A's <b>");
  });
});

describe("screening answers", () => {
  it("flags unanswered required questions instead of assuming Yes", () => {
    const missing = missingRequired({ first_name: "Sam" }).map((q) => q.key);
    expect(missing).toContain("work_authorized");
    expect(missing).toContain("need_sponsorship");
    expect(missing).not.toContain("first_name");
  });
});
