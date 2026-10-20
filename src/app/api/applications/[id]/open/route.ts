import { NextResponse } from "next/server";
import { normalizeDiceLink } from "@/lib/jobs";
import { withApi } from "@/lib/server/api";
import { authorizeApplication, setStatus } from "@/lib/server/apply-service";

// GET /api/applications/:id/open — marks the job as opened and sends the browser to the Dice page.
// It opens in the user's own browser, where they are already signed in to Dice.
export const GET = withApi<{ params: Promise<{ id: string }> }>(async (_req, user, { params }) => {
  const { id } = await params;
  const app = await authorizeApplication(user, id);
  const link = normalizeDiceLink(app.jobUrl);
  if (!link) return NextResponse.json({ error: { code: "invalid_link", message: "Not a Dice job link." } }, { status: 400 });
  if (app.status === "READY") await setStatus(user, id, "OPENED");
  return NextResponse.redirect(link.url, 302);
});
