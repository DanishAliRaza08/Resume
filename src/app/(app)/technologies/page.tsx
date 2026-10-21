import { strs } from "@/lib/json";
import { Flash } from "@/components/Flash";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { can } from "@/lib/server/permissions";
import { importTechnologies, saveTechnology } from "./actions";

export default async function TechnologiesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const techs = (
    await prisma.technology.findMany({
      where: sp.category ? { category: sp.category } : {},
      orderBy: [{ category: "asc" }, { canonicalName: "asc" }],
      include: { _count: { select: { projectLinks: true, candidateSkills: true } } },
    })
  ).filter((t) => !q || t.canonicalName.toLowerCase().includes(q) || strs(t.aliases).some((a) => a.toLowerCase().includes(q)));
  const categories = (await prisma.technology.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } })).map((c) => c.category);
  return (
    <>
      <div className="pagehead">
        <div><h1>Technology catalog</h1><p>Canonical names and aliases normalize JD and resume wording. {techs.length} shown.</p></div>
        <a className="btn" href="/api/technologies/export">Export CSV</a>
      </div>
      <Flash searchParams={sp} />
      <form className="card row" style={{ padding: 12 }}>
        <div><label htmlFor="q">Search name or alias</label><input id="q" name="q" type="search" defaultValue={sp.q ?? ""} /></div>
        <div><label htmlFor="category">Category</label><select id="category" name="category" defaultValue={sp.category ?? ""}><option value="">All</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="shrink"><button className="btn" type="submit">Filter</button></div>
      </form>
      <div className="split">
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Technology</th><th>Category</th><th>Aliases</th><th>Since</th><th>Used</th></tr></thead>
            <tbody>
              {techs.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.canonicalName}</strong>{t.lifecycle !== "ACTIVE" && <span className="badge neutral"> {t.lifecycle.toLowerCase()}</span>}
                    {t.description && <div className="small muted">{t.description}</div>}
                    {t.knowledge && <div className="small">{Object.values(t.knowledge as Record<string, string[]>).reduce((n, l) => n + l.length, 0)} expert phrasings</div>}
                  </td>
                  <td className="small">{t.category}</td>
                  <td className="small muted">{strs(t.aliases).join(", ") || "—"}</td>
                  <td className="small">{t.availableFrom ?? "—"}</td>
                  <td className="small">{t._count.projectLinks} proj · {t._count.candidateSkills} cand</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {can(user, "library:edit") && (
          <aside>
            <form action={saveTechnology} className="card">
              <h2>Add / update</h2>
              <label>Canonical name *</label><input name="canonicalName" type="text" required />
              <label>Category *</label><input name="category" type="text" list="cats" required /><datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
              <label>Aliases <span className="hint">(comma-separated)</span></label><input name="aliases" type="text" />
              <label>Roles <span className="hint">(role keys, optional)</span></label><input name="roles" type="text" />
              <label>Domains <span className="hint">(domain keys, optional)</span></label><input name="domains" type="text" />
              <div className="row">
                <div><label>Available from (year)</label><input name="availableFrom" type="number" min={1950} max={2100} /></div>
                <div><label>Lifecycle</label><select name="lifecycle"><option>ACTIVE</option><option>LEGACY</option><option>RETIRED</option></select></div>
              </div>
              <button className="btn primary" type="submit" style={{ marginTop: 12 }}>Save</button>
            </form>
            <form action={importTechnologies} className="card">
              <h2>Import CSV</h2>
              <p className="small muted">Columns: canonical_name, category, aliases, roles, domains, available_from.</p>
              <input name="file" type="file" accept=".csv,text/csv" aria-label="CSV file" />
              <button className="btn small" type="submit" style={{ marginTop: 8 }}>Import</button>
            </form>
          </aside>
        )}
      </div>
    </>
  );
}
