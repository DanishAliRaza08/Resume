import { describe, expect, it } from "vitest";
import { rankClients, type RotationClient } from "@/lib/rotation";

const base = (over: Partial<RotationClient>): RotationClient => ({
  id: over.name ?? "x", name: "x", domainKey: "BANKING", subdomain: "Capital Markets", market: "US", verificationStatus: "VERIFIED", active: true, isDemo: false, technologies: [], usageCount: 0, lastUsedAt: null, ...over,
});

describe("client rotation (AT-08)", () => {
  const clients = [
    base({ name: "A", usageCount: 5, lastUsedAt: new Date("2026-10-01") }),
    base({ name: "B", usageCount: 1, lastUsedAt: new Date("2026-01-01") }),
    base({ name: "C", verificationStatus: "UNVERIFIED" }),
    base({ name: "D", domainKey: "RETAIL" }),
    base({ name: "E", subdomain: "Payments" }),
    base({ name: "F", technologies: ["Murex"], lastUsedAt: new Date("2026-10-10") }),
    base({ name: "G", isDemo: true }),
  ];

  it("excludes unverified, other-domain and demo clients", () => {
    const names = rankClients(clients, { domainKey: "BANKING", subdomain: "Capital Markets" }).map((r) => r.client.name);
    expect(names).not.toContain("C");
    expect(names).not.toContain("D");
    expect(names).not.toContain("G");
  });

  it("prefers relevance first, then the least recently used client", () => {
    const ranked = rankClients(clients, { domainKey: "BANKING", subdomain: "Capital Markets", technologies: ["Murex"] }).map((r) => r.client.name);
    expect(ranked[0]).toBe("F"); // verified Murex association outranks recency
    expect(ranked.indexOf("B")).toBeLessThan(ranked.indexOf("A")); // B used longer ago than A
    expect(ranked[ranked.length - 1]).toBe("E"); // different project type
  });

  it("rotates as usage is recorded", () => {
    const pool = [base({ name: "A" }), base({ name: "B" })];
    const first = rankClients(pool, { domainKey: "BANKING" })[0].client;
    first.usageCount++;
    first.lastUsedAt = new Date();
    const second = rankClients(pool, { domainKey: "BANKING" })[0].client;
    expect(second.name).not.toBe(first.name);
  });
});
