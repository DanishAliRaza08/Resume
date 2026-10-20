import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MIGRATIONS } from "../src/lib/server/migrations.generated";
import { splitSql } from "../src/lib/server/setup";

describe("embedded migrations", () => {
  it("match prisma/migrations (run `node scripts/gen-migrations.mjs` if this fails)", () => {
    const dir = path.join(__dirname, "..", "prisma", "migrations");
    const names = readdirSync(dir).filter((n) => existsSync(path.join(dir, n, "migration.sql"))).sort();
    expect(MIGRATIONS.map((m) => m.name)).toEqual(names);
    for (const m of MIGRATIONS) {
      const sql = readFileSync(path.join(dir, m.name, "migration.sql"), "utf8");
      expect(m.checksum).toBe(createHash("sha256").update(sql).digest("hex"));
    }
  });

  it("split into statements without comments", () => {
    expect(splitSql("-- CreateTable\nCREATE TABLE `a` (\n  `x` INT\n);\n\n-- AddKey\nALTER TABLE `a` ADD KEY `k`(`x`);\n")).toEqual([
      "CREATE TABLE `a` (\n  `x` INT\n)",
      "ALTER TABLE `a` ADD KEY `k`(`x`)",
    ]);
  });
});
