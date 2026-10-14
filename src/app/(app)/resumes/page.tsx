import Link from "next/link";
import { StatusBadge } from "@/components/Badges";
import { DOMAINS, ROLES } from "@/data/domains";
import { fmtDate } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { candidateScope } from "@/lib/server/permissions";

export default async function ResumeLibrary({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const resumes = await prisma.resume.findMany({
    where: {
      candidate: candidateScope(user),
      ...(sp.domain ? { domainKey: sp.domain } : {}),
      ...(sp.role ? { roleKey: sp.role } : {}),
      ...(sp.q ? { title: { contains: sp.q, mode: "insensitive" as const } } : {}),
      ...(sp.status ? { versions: { some: { status: sp.status as "DRAFT" } } } : {}),
    },
    include: { versions: { orderBy: { version: "desc" }, take: 1 }, candidate: { select: { fullName: true } }, _count: { select: { versions: true, exports: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return (
    <>
      <div className="pagehead"><div><h1>Resume library</h1><p>Every resume keeps its full version history.</p></div></div>
      <form className="card row" style={{ padding: 12 }}>
        <div><label htmlFor="q">Search</label><input id="q" name="q" type="search" defaultValue={sp.q ?? ""} /></div>
        <div><label htmlFor="domain">Domain</label><select id="domain" name="domain" defaultValue={sp.domain ?? ""}><option value="">All</option>{DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}</select></div>
        <div><label htmlFor="role">Role</label><select id="role" name="role" defaultValue={sp.role ?? ""}><option value="">All</option>{ROLES.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}</select></div>
        <div><label htmlFor="status">Has status</label><select id="status" name="status" defaultValue={sp.status ?? ""}><option value="">Any</option>{["DRAFT", "IN_REVIEW", "APPROVED", "REJECTED", "EXPORTED"].map((s) => <option key={s} value={s}>{s.toLowerCase().replace("_", " ")}</option>)}</select></div>
        <div className="shrink"><button className="btn" type="submit">Filter</button></div>
      </form>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Resume</th><th>Candidate</th><th>Latest</th><th>Versions</th><th>Exports</th><th>Updated</th></tr></thead>
          <tbody>
            {resumes.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/resumes/${r.id}`}>{r.title}</Link></td>
                <td>{r.candidate.fullName}</td>
                <td>{r.versions[0] ? <>v{r.versions[0].version} <StatusBadge value={r.versions[0].status} /></> : "—"}</td>
                <td>{r._count.versions}</td>
                <td>{r._count.exports}</td>
                <td className="small muted">{fmtDate(r.updatedAt)}</td>
              </tr>
            ))}
            {resumes.length === 0 && <tr><td colSpan={6} className="muted">No resumes match.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
