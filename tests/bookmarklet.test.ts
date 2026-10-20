import { describe, expect, it } from "vitest";
import { bookmarkletHref } from "@/lib/server/bookmarklet";

describe("Fill Dice bookmark", () => {
  it("is a valid javascript: URL carrying the person's answers", () => {
    const profile = { v: 1, candidate: `O'Brien "Q" </script>`, answers: [{ key: "phone", label: "Phone", type: "text", keywords: ["phone"], answer: "555 & co" }], custom: [] };
    const href = bookmarkletHref(Buffer.from(JSON.stringify(profile)).toString("base64"));
    expect(href.startsWith("javascript:")).toBe(true);
    expect(href).not.toMatch(/["<>\s]/); // safe inside an HTML attribute
    const code = decodeURIComponent(href.slice("javascript:".length));
    expect(() => new Function(code)).not.toThrow(); // parses as JavaScript
    expect(code).toContain("DiceFiller");
    expect(code).toContain("555 & co");
    expect(href.length).toBeLessThan(60_000); // comfortably within browser bookmark limits
  });
});
