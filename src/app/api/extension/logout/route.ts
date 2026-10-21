import { NextResponse } from "next/server";
import { revokeBearerToken } from "@/lib/server/auth";

// POST /api/extension/logout — revoke the extension's token.
export async function POST() {
  await revokeBearerToken();
  return NextResponse.json({ ok: true });
}
