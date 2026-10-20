import Link from "next/link";
import { Flash } from "@/components/Flash";
import { fmtDate } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { can, candidateScope } from "@/lib/server/permissions";

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = sp.q ?? "";
  const candidates = await prisma.candidate.findMany({
    where: { ...candidateScope(user), ...(q ? { fullName: { contains: q } } : {}) },
    orderBy: { updatedAt: "desc" },
    include: { owner: { select: { name: true } }, _count: { select: { resumes: true, employments: true, projects: true } } },
    take: 200,
  });
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Candidates</h1>
          <p>Verified career history is the source of truth for every resume.</p>
        </div>
        {can(user, "candidate:create") && <Link className="btn primary" href="/candidates/new">New candidate</Link>}
      </div>
      <Flash searchParams={sp} />
      <form className="row card" style={{ padding: 12 }}>
        <div><label htmlFor="q">Search by name</label><input id="q" name="q" type="search" defaultValue={q} /></div>
        <div className="shrink"><button className="btn" type="submit">Search</button></div>
      </form>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Target</th><th>Owner</th><th>Employment</th><th>Projects</th><th>Resumes</th><th>Updated</th></tr></thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id}>
                <td><Link href={`/candidates/${c.id}`}>{c.fullName}</Link></td>
                <td className="small">{[c.targetTitle, c.domainKey].filter(Boolean).join(" · ") || "—"}</td>
                <td className="small">{c.owner.name}</td>
                <td>{c._count.employments}</td>
                <td>{c._count.projects}</td>
                <td>{c._count.resumes}</td>
                <td className="small muted">{fmtDate(c.updatedAt)}</td>
              </tr>
            ))}
            {candidates.length === 0 && <tr><td colSpan={7} className="muted">No candidates found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
