import Link from "next/link";
import { Flash } from "@/components/Flash";
import { fmtDate } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { can } from "@/lib/server/permissions";
import { createJd } from "./actions";

export default async function JdList({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const jds = await prisma.jobDescription.findMany({
    where: user.role === "ADMIN" || user.role === "REVIEWER" ? {} : { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { requirements: true } }, owner: { select: { name: true } } },
  });
  return (
    <>
      <div className="pagehead"><div><h1>JD Analyzer</h1><p>Extract requirements, match them to candidate evidence and review proposed edits.</p></div></div>
      <Flash searchParams={sp} />
      {can(user, "resume:generate") && (
        <form action={createJd} className="card">
          {sp.resumeVersion && <input type="hidden" name="resumeVersion" value={sp.resumeVersion} />}
          <h2>Add a job description</h2>
          <div className="row">
            <div><label htmlFor="title">Title <span className="hint">(optional)</span></label><input id="title" name="title" type="text" /></div>
            <div><label htmlFor="file">Upload (.docx, .pdf, .txt — max 5 MB)</label><input id="file" name="file" type="file" accept=".docx,.pdf,.txt" /></div>
          </div>
          <label htmlFor="text">…or paste the JD text</label>
          <textarea id="text" name="text" style={{ minHeight: 140 }} />
          <p className="hint">JD content is treated as data; any instructions inside it are ignored.</p>
          <button className="btn primary" type="submit">Analyze</button>
        </form>
      )}
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Job description</th><th>Requirements</th><th>Owner</th><th>Added</th></tr></thead>
          <tbody>
            {jds.map((j) => (
              <tr key={j.id}>
                <td><Link href={sp.resumeVersion ? `/jd/${j.id}/tailor?v=${sp.resumeVersion}` : `/jd/${j.id}`}>{j.title}</Link>{j.sourceFileName && <div className="small muted">{j.sourceFileName}</div>}</td>
                <td>{j._count.requirements}</td>
                <td className="small">{j.owner.name}</td>
                <td className="small muted">{fmtDate(j.createdAt)}</td>
              </tr>
            ))}
            {jds.length === 0 && <tr><td colSpan={4} className="muted">No job descriptions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
