import Link from "next/link";
import { StatusBadge } from "@/components/Badges";
import { Flash } from "@/components/Flash";
import { fmtDateTime } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { candidateScope } from "@/lib/server/permissions";

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const scope = { resume: { candidate: candidateScope(user) } };
  const [resumes, drafts, inReview, approved, exportsCount, recentDrafts, reviewQueue, recentExports, failedJobs] = await Promise.all([
    prisma.resume.count({ where: { candidate: candidateScope(user) } }),
    prisma.resumeVersion.count({ where: { ...scope, status: "DRAFT" } }),
    prisma.resumeVersion.count({ where: { ...scope, status: "IN_REVIEW" } }),
    prisma.resumeVersion.count({ where: { ...scope, status: { in: ["APPROVED", "EXPORTED"] } } }),
    prisma.exportFile.count({ where: { resume: { candidate: candidateScope(user) } } }),
    prisma.resumeVersion.findMany({ where: { ...scope, status: "DRAFT" }, orderBy: { createdAt: "desc" }, take: 6, include: { resume: true } }),
    prisma.resumeVersion.findMany({ where: { ...scope, status: "IN_REVIEW" }, orderBy: { createdAt: "asc" }, take: 6, include: { resume: true, createdBy: true } }),
    prisma.exportFile.findMany({ where: { resume: { candidate: candidateScope(user) } }, orderBy: { createdAt: "desc" }, take: 6, include: { resume: true } }),
    prisma.generationJob.findMany({ where: { createdById: user.id, status: "FAILED" }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user.name}.</p>
        </div>
        {(user.role === "ADMIN" || user.role === "CREATOR") && (
          <div className="actions">
            <Link className="btn primary" href="/resumes/new">Create New Resume</Link>
            <Link className="btn" href="/update">Update Existing Resume</Link>
          </div>
        )}
      </div>
      <Flash searchParams={await searchParams} />
      {failedJobs.length > 0 && (
        <div className="notice warn">
          {failedJobs.length} recent generation job(s) failed. Your last saved drafts are preserved.{" "}
          {failedJobs.map((j) => (
            <Link key={j.id} href={`/jobs/${j.id}`} style={{ marginRight: 8 }}>Open job</Link>
          ))}
        </div>
      )}
      <div className="grid cols-4">
        {[
          ["Resumes", resumes],
          ["Drafts", drafts],
          ["Awaiting review", inReview],
          ["Approved / exported", approved],
        ].map(([label, n]) => (
          <div className="card" key={label as string}>
            <div className="kpi-label">{label}</div>
            <div className="kpi">{n}</div>
          </div>
        ))}
      </div>
      <div className="grid cols-2">
        <section className="card">
          <h2>Tasks needing review</h2>
          {reviewQueue.length === 0 ? (
            <p className="muted">Nothing is waiting for review.</p>
          ) : (
            <table>
              <tbody>
                {reviewQueue.map((v) => (
                  <tr key={v.id}>
                    <td><Link href={`/resumes/${v.resumeId}?v=${v.id}`}>{v.resume.title}</Link><div className="small muted">v{v.version} by {v.createdBy.name}</div></td>
                    <td className="small muted">{fmtDateTime(v.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <section className="card">
          <h2>Recent drafts</h2>
          {recentDrafts.length === 0 ? (
            <p className="muted">No drafts yet.</p>
          ) : (
            <table>
              <tbody>
                {recentDrafts.map((v) => (
                  <tr key={v.id}>
                    <td><Link href={`/resumes/${v.resumeId}?v=${v.id}`}>{v.resume.title}</Link><div className="small muted">v{v.version}</div></td>
                    <td><StatusBadge value={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
      <section className="card">
        <h2>Recent exports <span className="muted small">({exportsCount} total)</span></h2>
        {recentExports.length === 0 ? (
          <p className="muted">No exports yet.</p>
        ) : (
          <table>
            <thead><tr><th>File</th><th>Format</th><th>Pages</th><th>When</th></tr></thead>
            <tbody>
              {recentExports.map((e) => (
                <tr key={e.id}>
                  <td><a href={`/api/exports/${e.id}`}>{e.fileName}</a></td>
                  <td>{e.format}</td>
                  <td>{e.pageCount ?? "—"}</td>
                  <td className="small muted">{fmtDateTime(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
