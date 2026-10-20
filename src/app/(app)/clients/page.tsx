import Link from "next/link";
import { StatusBadge } from "@/components/Badges";
import { Flash } from "@/components/Flash";
import { DOMAINS } from "@/data/domains";
import { fmtDate } from "@/lib/format";
import { rankClients } from "@/lib/rotation";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { can } from "@/lib/server/permissions";
import { importClients } from "./actions";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const where = {
    ...(sp.q ? { name: { contains: sp.q } } : {}),
    ...(sp.domain ? { domain: { key: sp.domain } } : {}),
    ...(sp.status ? { verificationStatus: sp.status as "VERIFIED" } : {}),
  };
  const [clients, total, all] = await Promise.all([
    prisma.client.findMany({ where, include: { domain: true, _count: { select: { technologies: true } } }, orderBy: { name: "asc" }, take: 300 }),
    prisma.client.count(),
    sp.rotate ? prisma.client.findMany({ include: { domain: true, technologies: { include: { technology: true } } } }) : Promise.resolve([]),
  ]);
  const ranked = sp.rotate
    ? rankClients(
        all.map((c) => ({ id: c.id, name: c.name, domainKey: c.domain.key, subdomain: c.subdomain, market: c.market, verificationStatus: c.verificationStatus, active: c.active, isDemo: c.isDemo, technologies: c.technologies.map((t) => t.technology.canonicalName), usageCount: c.usageCount, lastUsedAt: c.lastUsedAt })),
        { domainKey: sp.rotate, subdomain: sp.subdomain || null, technologies: (sp.techs ?? "").split(",").map((s) => s.trim()).filter(Boolean), includeDemo: sp.demo === "1" },
      )
    : [];
  return (
    <>
      <div className="pagehead">
        <div><h1>Client library</h1><p>{total} records. The library is a reference list — never evidence that a candidate worked for a client.</p></div>
        <div className="actions">
          {can(user, "library:edit") && <Link className="btn primary" href="/clients/new">Add client</Link>}
          <a className="btn" href="/api/clients/export">Export CSV</a>
        </div>
      </div>
      <Flash searchParams={sp} />
      <form className="card row" style={{ padding: 12 }}>
        <div><label htmlFor="q">Search</label><input id="q" name="q" type="search" defaultValue={sp.q ?? ""} /></div>
        <div><label htmlFor="domain">Domain</label><select id="domain" name="domain" defaultValue={sp.domain ?? ""}><option value="">All</option>{DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}</select></div>
        <div><label htmlFor="status">Verification</label><select id="status" name="status" defaultValue={sp.status ?? ""}><option value="">All</option><option value="VERIFIED">Verified</option><option value="CANDIDATE_CONFIRMED">Candidate confirmed</option><option value="UNVERIFIED">Unverified</option></select></div>
        <div className="shrink"><button className="btn" type="submit">Filter</button></div>
      </form>
      <div className="split">
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Client</th><th>Domain</th><th>Status</th><th>Tech links</th><th>Uses</th><th>Last used</th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td><Link href={`/clients/${c.id}`}>{c.name}</Link>{c.isDemo && <span className="badge info"> demo</span>}{!c.active && <span className="badge neutral"> inactive</span>}</td>
                  <td className="small">{c.domain.name}{c.subdomain ? ` · ${c.subdomain}` : ""}</td>
                  <td><StatusBadge value={c.verificationStatus} /></td>
                  <td>{c._count.technologies}</td>
                  <td>{c.usageCount}</td>
                  <td className="small muted">{fmtDate(c.lastUsedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside>
          <section className="card">
            <h2>Rotation preview</h2>
            <p className="small muted">Ranks eligible (verified or candidate-confirmed) clients by relevance, then least recently used.</p>
            <form className="stack">
              <select name="rotate" defaultValue={sp.rotate ?? "BANKING"} aria-label="Domain">{DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}</select>
              <input name="subdomain" type="text" placeholder="Subdomain (optional)" defaultValue={sp.subdomain ?? ""} aria-label="Subdomain" />
              <input name="techs" type="text" placeholder="Technologies, comma-separated" defaultValue={sp.techs ?? ""} aria-label="Technologies" />
              <label className="check small"><input type="checkbox" name="demo" value="1" defaultChecked={sp.demo === "1"} /> include demo organizations</label>
              <button className="btn small" type="submit">Rank</button>
            </form>
            {sp.rotate && (
              <ol className="small">
                {ranked.map((r) => <li key={r.client.id}><Link href={`/clients/${r.client.id}`}>{r.client.name}</Link> <span className="muted">— {r.reasons.join("; ")}; used {r.client.usageCount}×</span></li>)}
                {ranked.length === 0 && <li className="muted">No eligible clients. Verify clients first.</li>}
              </ol>
            )}
          </section>
          {can(user, "library:edit") && (
            <section className="card">
              <h2>Import CSV</h2>
              <p className="small muted">Columns: name, domain (key), subdomain, market, evidence. Duplicates are skipped; imports start unverified.</p>
              <form action={importClients} className="stack">
                <input name="file" type="file" accept=".csv,text/csv" aria-label="CSV file" />
                <button className="btn small" type="submit">Import</button>
              </form>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
