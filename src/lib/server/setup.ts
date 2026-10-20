// Start-up database setup: create/update the tables and load reference data. Runs inside the app
// (no Prisma CLI needed), so it works however the host starts it. Set SKIP_DB_SETUP=1 to disable.
// Applied migrations are recorded in Prisma's own _prisma_migrations table, so `prisma migrate deploy`
// stays compatible.
import { randomUUID } from "node:crypto";
import { prisma } from "./db";
import { MIGRATIONS } from "./migrations.generated";
import { seedDatabase } from "./seed";

export interface SetupState {
  migrations: "pending" | "running" | "ok" | "failed" | "skipped";
  seed: "pending" | "running" | "ok" | "failed" | "skipped";
  applied?: string[];
  error?: string;
  finishedAt?: string;
}

const g = globalThis as unknown as { __bdSetup?: SetupState };
export function setupState(): SetupState {
  return (g.__bdSetup ??= { migrations: "pending", seed: "pending" });
}

/** Error text safe to show publicly (no connection strings or quoted names). */
function clean(err: unknown): string {
  return String((err as Error)?.message ?? err)
    .replace(/mysql:\/\/\S+/gi, "mysql://***")
    .replace(/`[^`\n]*`/g, "`***`")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(-4)
    .join(" | ")
    .slice(0, 600);
}

/** Split a Prisma-generated MySQL migration into statements. */
export function splitSql(sql: string): string[] {
  return sql
    .split("\n")
    .filter((l) => !/^\s*--/.test(l))
    .join("\n")
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// MySQL errors meaning "this part already exists" (e.g. another worker got there first).
const ALREADY_DONE = /\b(1050|1060|1061|1826|1022)\b|already exists|Duplicate (key name|column name|foreign key)/i;

async function applyMigrations(): Promise<string[]> {
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS _prisma_migrations (
    id VARCHAR(36) PRIMARY KEY NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    finished_at DATETIME(3),
    migration_name VARCHAR(255) NOT NULL,
    logs TEXT,
    rolled_back_at DATETIME(3),
    started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    applied_steps_count INTEGER UNSIGNED NOT NULL DEFAULT 0
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  const done = new Set(
    (await prisma.$queryRawUnsafe<{ migration_name: string }[]>(
      "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL",
    )).map((r) => r.migration_name),
  );
  const applied: string[] = [];
  for (const m of MIGRATIONS) {
    if (done.has(m.name)) continue;
    const statements = splitSql(m.sql);
    for (const s of statements) {
      try {
        await prisma.$executeRawUnsafe(s);
      } catch (err) {
        if (!ALREADY_DONE.test(String((err as Error)?.message ?? err))) throw new Error(`${m.name}: ${clean(err)}`);
      }
    }
    await prisma.$executeRawUnsafe(
      "INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count) VALUES (?, ?, CURRENT_TIMESTAMP(3), ?, ?)",
      randomUUID(),
      m.checksum,
      m.name,
      statements.length,
    );
    applied.push(m.name);
  }
  return applied;
}

export async function runStartupSetup(): Promise<void> {
  const state = setupState();
  if (process.env.SKIP_DB_SETUP === "1" || !process.env.DATABASE_URL) {
    state.migrations = "skipped";
    state.seed = "skipped";
    if (!process.env.DATABASE_URL) state.error = "DATABASE_URL is not set.";
    return;
  }
  state.migrations = "running";
  try {
    state.applied = await applyMigrations();
    state.migrations = "ok";
    console.log(`[setup] database tables are up to date${state.applied.length ? ` (applied ${state.applied.join(", ")})` : ""}`);
  } catch (err) {
    state.migrations = "failed";
    state.seed = "skipped";
    state.error = clean(err);
    console.error("[setup] creating tables failed:", err);
    return;
  }
  // Reference data in the background so the site starts answering right away.
  state.seed = "running";
  void seedDatabase(prisma)
    .then(() => {
      state.seed = "ok";
      console.log("[setup] reference data loaded");
    })
    .catch((err) => {
      state.seed = "failed";
      state.error = clean(err);
      console.error("[setup] loading reference data failed:", err);
    })
    .finally(() => {
      state.finishedAt = new Date().toISOString();
    });
}
