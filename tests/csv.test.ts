import { describe, expect, it } from "vitest";
import { csvRecords, parseCsv, toCsv } from "@/lib/csv";

describe("csv", () => {
  it("round-trips quotes, commas and newlines", () => {
    const rows = [["name", "note"], ["Acme, Inc.", 'He said "hi"\nbye']];
    expect(parseCsv(toCsv(rows))).toEqual(rows);
  });
  it("neutralizes spreadsheet formulas on export", () => {
    expect(toCsv([["=HYPERLINK(1)"]])).toBe("'=HYPERLINK(1)");
  });
  it("maps headers case-insensitively", () => {
    expect(csvRecords("Name,Domain\r\nX,BANKING\r\n")).toEqual([{ name: "X", domain: "BANKING" }]);
  });
});
