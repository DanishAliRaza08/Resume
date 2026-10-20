import { strs } from "@/lib/json";
import Link from "next/link";
import { DOMAINS } from "@/data/domains";
import { fmtDate } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const sp = await searchParams;
  const templates = await prisma.projectTemplate.findMany({
    where: { status: sp.all ? undefined : "ACTIVE", ...(sp.domain ? { domain: { key: sp.domain } } : {}) },
    include: { domain: true },
    orderBy: [{ domainId: "asc" }, { name: "asc" }, { version: "desc" }],
  });
  return (
    <>
      <div className="pagehead"><div><h1>Project templates</h1><p>Starter phrasing patterns per domain — not proof of a candidate&apos;s experience.</p></div></div>
      <form className="card row" style={{ padding: 12 }}>
        <div><label htmlFor="domain">Domain</label><select id="domain" name="domain" defaultValue={sp.domain ?? ""}><option value="">All</option>{DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}</select></div>
        <label className="check shrink"><input type="checkbox" name="all" value="1" defaultChecked={Boolean(sp.all)} /> include retired versions</label>
        <div className="shrink"><button className="btn" type="submit">Filter</button></div>
      </form>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Template</th><th>Domain</th><th>Version</th><th>Bullets (domain/project/QA)</th><th>Uses</th><th>Last reviewed</th></tr></thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id}>
                <td><Link href={`/templates/${t.id}`}>{t.name}</Link>{t.status !== "ACTIVE" && <span className="badge neutral"> retired</span>}</td>
                <td className="small">{t.domain.name} · {t.subdomain}</td>
                <td>v{t.version}</td>
                <td>{strs(t.domainBullets).length} / {strs(t.projectBullets).length} / {strs(t.qaBullets).length}</td>
                <td>{t.usageCount}</td>
                <td className="small muted">{fmtDate(t.lastReviewedAt)} {t.reviewer ? `· ${t.reviewer}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
