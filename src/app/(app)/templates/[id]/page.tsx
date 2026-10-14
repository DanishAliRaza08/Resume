import { Flash } from "@/components/Flash";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { can } from "@/lib/server/permissions";
import { saveTemplate } from "../actions";

export default async function TemplatePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const { id } = await params;
  const t = await prisma.projectTemplate.findUnique({ where: { id }, include: { domain: true } });
  if (!t) return <div className="card">Template not found.</div>;
  const editable = can(user, "library:edit") && t.status === "ACTIVE";
  return (
    <>
      <div className="pagehead"><div><h1>{t.name} <span className="muted">v{t.version}</span></h1><p>{t.domain.name} · {t.subdomain} · used {t.usageCount}×</p></div></div>
      <Flash searchParams={await searchParams} />
      <div className="notice info small">Placeholders: <code>{"{client}"}</code>, <code>{"{subdomain}"}</code>, <code>{"{tech:Category}"}</code> (confirmed project technologies in that catalog category), <code>{"{any:Tool A|Tool B}"}</code>. A bullet whose placeholder cannot be filled from confirmed technologies is skipped, and every template bullet must be confirmed by the candidate before approval.</div>
      <form action={saveTemplate} className="card">
        <input type="hidden" name="id" value={t.id} />
        <fieldset disabled={!editable} style={{ border: 0, padding: 0, margin: 0 }}>
          <label>Subdomain</label><input name="subdomain" type="text" defaultValue={t.subdomain} />
          <label>Project pattern</label><textarea name="projectPattern" defaultValue={t.projectPattern} style={{ minHeight: 50 }} />
          <label>Domain bullets <span className="hint">(one per line)</span></label><textarea name="domainBullets" defaultValue={t.domainBullets.join("\n")} style={{ minHeight: 100 }} />
          <label>Project bullets</label><textarea name="projectBullets" defaultValue={t.projectBullets.join("\n")} style={{ minHeight: 200 }} />
          <label>QA / validation bullets</label><textarea name="qaBullets" defaultValue={t.qaBullets.join("\n")} />
          <label>Excluded claims</label><textarea name="excludedClaims" defaultValue={t.excludedClaims.join("\n")} />
          <label>Approved terminology <span className="hint">(comma-separated)</span></label><input name="terminology" type="text" defaultValue={t.terminology.join(", ")} />
          <label>Typical technologies <span className="hint">(suggestions only — validate per candidate)</span></label><input name="suggestedTech" type="text" defaultValue={t.suggestedTech.join(", ")} />
          {editable && <button className="btn primary" type="submit" style={{ marginTop: 12 }}>Save as new version</button>}
        </fieldset>
      </form>
    </>
  );
}
