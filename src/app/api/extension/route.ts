import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { getSessionUser } from "@/lib/server/auth";
import { apiError } from "@/lib/server/api";

// GET /api/extension — the Dice Helper browser extension as a ZIP (load it via chrome://extensions).
export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError(401, "unauthorized", "Sign in required.");
  const dir = path.join(process.cwd(), "extension");
  const zip = new JSZip();
  const folder = zip.folder("dice-helper")!;
  for (const name of await readdir(dir)) {
    if (!/\.(json|js|html|png)$/.test(name)) continue;
    folder.file(name, await readFile(path.join(dir, name)));
  }
  const buffer = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/zip", "Content-Disposition": 'attachment; filename="dice-helper.zip"', "Cache-Control": "no-store" },
  });
}
