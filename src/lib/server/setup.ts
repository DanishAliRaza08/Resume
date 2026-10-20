// Start-up database setup: create/update tables (prisma migrate deploy) and load reference data
// (prisma/seed.ts). Runs inside the app so it works however the host starts it (npm start,
// next start, or a custom command). Set SKIP_DB_SETUP=1 to disable.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

export interface SetupState {
  migrations: "pending" | "running" | "ok" | "failed" | "skipped";
  seed: "pending" | "running" | "ok" | "failed" | "skipped";
  error?: string;
  finishedAt?: string;
}

const g = globalThis as unknown as { __bdSetup?: SetupState };
export function setupState(): SetupState {
  return (g.__bdSetup ??= { migrations: "pending", seed: "pending" });
}

function run(args: string[], timeoutMs: number): Promise<{ code: number | null; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    const add = (b: Buffer) => {
      out = (out + b.toString()).slice(-6000);
    };
    child.stdout.on("data", add);
    child.stderr.on("data", add);
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, out });
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ code: -1, out: String(e) });
    });
  });
}

/** The last meaningful lines of CLI output, without anything that looks like a connection string. */
function tail(out: string): string {
  return out
    .replace(/mysql:\/\/\S+/gi, "mysql://***")
    .replace(/`[^`\n]*`/g, "`***`")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^prisma schema loaded|^environment variables loaded|^datasource "db"|package\.json#prisma|pris\.ly\/prisma-config/i.test(l))
    .slice(-6)
    .join(" | ")
    .slice(0, 600);
}

export async function runStartupSetup(): Promise<void> {
  const state = setupState();
  if (process.env.SKIP_DB_SETUP === "1") {
    state.migrations = "skipped";
    state.seed = "skipped";
    return;
  }
  const root = process.cwd();
  const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
  const tsxCli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");
  if (!existsSync(prismaCli) || !process.env.DATABASE_URL) {
    state.migrations = "skipped";
    state.seed = "skipped";
    state.error = !process.env.DATABASE_URL ? "DATABASE_URL is not set." : "Prisma CLI not found (node_modules/prisma).";
    console.error(`[setup] ${state.error}`);
    return;
  }
  state.migrations = "running";
  const m = await run([prismaCli, "migrate", "deploy"], 180_000);
  if (m.code !== 0) {
    state.migrations = "failed";
    state.seed = "skipped";
    state.error = tail(m.out);
    console.error(`[setup] prisma migrate deploy failed: ${state.error}`);
    return;
  }
  state.migrations = "ok";
  console.log("[setup] database tables are up to date");
  // Reference data in the background so the site starts answering right away.
  state.seed = "running";
  if (!existsSync(tsxCli)) {
    state.seed = "failed";
    state.error = "tsx not found (node_modules/tsx).";
    return;
  }
  void run([tsxCli, path.join(root, "prisma", "seed.ts")], 600_000).then((s) => {
    state.seed = s.code === 0 ? "ok" : "failed";
    if (s.code !== 0) {
      state.error = tail(s.out);
      console.error(`[setup] seed failed: ${state.error}`);
    } else console.log("[setup] reference data loaded");
    state.finishedAt = new Date().toISOString();
  });
}
