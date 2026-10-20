// Plain-English database diagnosis for /api/health and friendly error messages.
// Never includes the connection string or password.
import { prisma } from "./db";

export interface DbDiagnosis {
  ok: boolean;
  code: string;
  problem?: string;
  fix?: string;
  detail?: string;
}

export function explainDbError(err: unknown): DbDiagnosis {
  const e = err as { errorCode?: string; code?: string; name?: string; message?: string };
  const code = e?.errorCode ?? e?.code ?? "";
  const msg = String(e?.message ?? "");
  const platform = /"((?:debian|rhel|linux-musl|linux-arm64)[a-z0-9.\-]*)"/i.exec(msg)?.[1];
  if (code === "P1000" || /authentication failed/i.test(msg))
    return { ok: false, code: "AUTH_FAILED", problem: "The database user name or password in DATABASE_URL is wrong.", fix: "Check the user name and password in DATABASE_URL (hPanel → Databases). If the password has symbols like @ : / # ? &, change it to letters and numbers only, update DATABASE_URL and redeploy." };
  if (code === "P1001" || code === "P1002" || /can't reach database server|timed out/i.test(msg))
    return { ok: false, code: "UNREACHABLE", problem: "The app cannot reach the database server.", fix: "In DATABASE_URL use the host shown in hPanel → Databases (usually localhost). If it is localhost, try 127.0.0.1 instead, then redeploy." };
  if (code === "P1003" || /database .* does not exist/i.test(msg))
    return { ok: false, code: "DATABASE_NOT_FOUND", problem: "The database name at the end of DATABASE_URL does not exist.", fix: "Copy the exact database name from hPanel → Databases (e.g. u123456789_name) into DATABASE_URL and redeploy." };
  if (code === "P1013" || /invalid database string|invalid port|url/i.test(msg) && /prisma|database/i.test(msg))
    return { ok: false, code: "BAD_DATABASE_URL", problem: "DATABASE_URL is not written correctly.", fix: "Use the format mysql://USER:PASSWORD@localhost:3306/DATABASE. Symbols in the password must be encoded (@ = %40, # = %23, : = %3A) — or use a letters-and-numbers password." };
  if (code === "P2021" || code === "P2022" || /table .* does not exist/i.test(msg))
    return { ok: false, code: "TABLES_MISSING", problem: "The database is reachable but its tables have not been created yet.", fix: "Restart/redeploy the app: tables are created automatically on start-up. If this stays, check /api/health → setup for the error." };
  if (/query engine|could not locate|libquery_engine|binaryTargets/i.test(msg))
    return { ok: false, code: "ENGINE_MISSING", problem: "The database library does not support this server type.", fix: "Send this message to the developer.", detail: platform ? `server platform: ${platform}` : e?.name };
  return { ok: false, code: "DATABASE_ERROR", problem: "The database returned an unexpected error.", fix: "Send the code and detail to the developer.", detail: [e?.name, code].filter(Boolean).join(" ") || undefined };
}

export async function diagnoseDatabase(): Promise<DbDiagnosis> {
  const url = process.env.DATABASE_URL;
  if (!url) return { ok: false, code: "NO_DATABASE_URL", problem: "DATABASE_URL is not set.", fix: "Add DATABASE_URL in your hosting environment variables and redeploy." };
  if (!/^mysql:\/\/[^:/@]+(:[^@]*)?@[^/:]+(:\d+)?\/[^/?#]+/.test(url))
    return { ok: false, code: "BAD_DATABASE_URL", problem: "DATABASE_URL does not look like mysql://USER:PASSWORD@HOST:3306/DATABASE.", fix: "Fix the format. Symbols in the password must be encoded (@ = %40, # = %23, : = %3A, / = %2F) — or use a letters-and-numbers password." };
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    return explainDbError(err);
  }
  try {
    await prisma.user.count();
  } catch (err) {
    return explainDbError(err);
  }
  return { ok: true, code: "OK" };
}
