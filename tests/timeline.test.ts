import { describe, expect, it } from "vitest";
import { analyzeTimeline, anachronismWarnings, mergeIntervals, outsideEmploymentWarnings, proposeProjectRanges, toDate, totalExperienceMonths } from "@/lib/timeline";

const d = toDate;
const asOf = d("2026-10-01");

describe("timeline engine", () => {
  it("merges overlapping intervals and never double-counts (AT-03)", () => {
    const intervals = [
      { start: d("2017-01-01"), end: d("2021-12-31") },
      { start: d("2020-01-01"), end: d("2023-06-30") }, // overlaps 2 years with the first
      { start: d("2023-07-01"), end: d("2025-12-31") },
    ];
    expect(mergeIntervals(intervals, asOf)).toHaveLength(1);
    const months = totalExperienceMonths(intervals, asOf);
    expect(months).toBe(108); // 9 years, not 11
    const naive = intervals.reduce((s, i) => s + (i.end.getTime() - i.start.getTime()), 0) / (30.44 * 86400000);
    expect(naive).toBeGreaterThan(months + 20);
  });

  it("treats ongoing employment as ending today", () => {
    expect(totalExperienceMonths([{ start: d("2024-10-01"), end: null }], asOf)).toBe(24);
  });

  it("flags overlaps, gaps, invalid and future ranges", () => {
    const w = analyzeTimeline(
      [
        { start: d("2018-01-01"), end: d("2020-06-30"), label: "A" },
        { start: d("2020-01-01"), end: d("2021-01-31"), label: "B" },
        { start: d("2022-01-01"), end: d("2021-06-30"), label: "C" },
        { start: d("2023-01-01"), end: d("2024-01-31"), label: "D" },
        { start: d("2027-01-01"), end: null, label: "E" },
      ],
      asOf,
    );
    const codes = w.map((x) => x.code);
    expect(codes).toContain("OVERLAP");
    expect(codes).toContain("INVALID_RANGE");
    expect(codes).toContain("GAP");
    expect(codes).toContain("FUTURE_DATE");
  });

  it("downgrades overlaps explicitly marked concurrent to info", () => {
    const w = analyzeTimeline(
      [
        { start: d("2018-01-01"), end: d("2020-06-30"), label: "A" },
        { start: d("2019-01-01"), end: d("2019-12-31"), label: "B", concurrent: true },
      ],
      asOf,
    );
    expect(w.find((x) => x.code === "OVERLAP")?.severity).toBe("info");
  });

  it("proposes the default five-project allocation within the verified span", () => {
    const { ranges, warnings } = proposeProjectRanges(d("2016-10-01"), null, { asOf, p1ExtraMonths: 3 });
    expect(warnings).toHaveLength(0);
    expect(ranges.map((r) => r.months)).toEqual([27, 24, ranges[2].months, ranges[3].months, 7]);
    expect(ranges[0].end).toBeNull();
    expect(ranges[4].start >= "2016-10-01").toBe(true);
    const total = ranges.reduce((s, r) => s + r.months, 0);
    expect(total).toBe(120);
  });

  it("scales down instead of extending history when the span is short", () => {
    const { ranges, warnings } = proposeProjectRanges(d("2022-01-01"), d("2025-12-31"), { asOf });
    expect(warnings[0].code).toBe("INSUFFICIENT_HISTORY");
    expect(ranges[4].start >= "2022-01-01").toBe(true);
  });

  it("warns on anachronistic technology and projects outside employment", () => {
    expect(anachronismWarnings("P", d("2012-01-01"), d("2013-12-31"), [{ name: "Power BI", availableFrom: 2015 }])).toHaveLength(1);
    expect(anachronismWarnings("P", d("2016-01-01"), d("2017-12-31"), [{ name: "Power BI", availableFrom: 2015 }])).toHaveLength(0);
    const emp = [{ start: d("2019-01-01"), end: d("2021-12-31") }];
    expect(outsideEmploymentWarnings("P", { start: d("2019-03-01"), end: d("2020-03-01") }, emp, asOf)).toHaveLength(0);
    expect(outsideEmploymentWarnings("P", { start: d("2015-03-01"), end: d("2016-03-01") }, emp, asOf)[0].severity).toBe("critical");
  });
});
