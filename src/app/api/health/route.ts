import { NextResponse } from "next/server";
import { diagnoseDatabase } from "@/lib/server/db-status";
import { setupState } from "@/lib/server/setup";

export const dynamic = "force-dynamic";

// GET /api/health — app and database status in plain English (no secrets).
export async function GET() {
  const database = await diagnoseDatabase();
  const setup = setupState();
  const body = {
    status: database.ok ? "ok" : "error",
    app: "Benchsale Dan",
    database,
    setup,
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
  };
  return NextResponse.json(body, { status: database.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
