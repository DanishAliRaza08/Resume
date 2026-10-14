import { DOMAINS, ROLES } from "@/data/domains";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

// Aggregated operational reporting (spec §17) — no candidate personal data is shown here.
export default async function Reports() {
  const user = await requireUser();
  const since = new Date(Date.now() - 30 * 86400000);
  const [byDomainRole, jobs, exportsByFormat, versionsByStatus, clientStats, techCount, denied, deletions, matchStates, missing, firstVersions, exportTimes, editsAfterFirst] = await Promise.all([
    prisma.resume.groupBy({ by: ["domainKey", "roleKey"], _count: { _all: true } }),
    prisma.generationJob.groupBy({ by: ["status", "modelName"], _count: { _all: true }, _avg: { durationMs: true, inputTokens: true, outputTokens: true, costUsd: true } }),
    prisma.exportFile.groupBy({ by: ["format"], _count: { _all: true }, _avg: { pageCount: true } }),
    prisma.resumeVersion.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.client.groupBy({ by: ["verificationStatus"], _count: { _all: true }, _sum: { usageCount: true } }),
    prisma.technology.count(),
    prisma.auditEvent.count({ where: { outcome: "DENIED", createdAt: { gte: since } } }),
    prisma.auditEvent.count({ where: { action: "candidate.delete", createdAt: { gte: since } } }),
    prisma.resumeMatch.groupBy({ by: ["state"], _count: { _all: true } }),
    prisma.resumeMatch.groupBy({ by: ["requirementId"], where: { state: "MISSING" }, _count: { _all: true }, orderBy: { _count: { requirementId: "desc" } }, take: 200 }),
    prisma.resumeVersion.findMany({ where: { version: 1 }, select: { resumeId: true, createdAt: true } }),
    prisma.exportFile.groupBy({ by: ["resumeId"], _min: { createdAt: true } }),
    prisma.resumeVersion.groupBy({ by: ["resumeId"], where: { version: { gt: 1 } }, _count: { _all: true } }),
  ]);
  const missingReqs = missing.length ? await prisma.jDRequirement.findMany({ where: { id: { in: missing.map((m) => m.requirementId) } }, select: { id: true, canonical: true } }) : [];
  const missingByKeyword = new Map<string, number>();
  for (const m of missing) {
    const k = missingReqs.find((r) => r.id === m.requirementId)?.canonical ?? "?";
    missingByKeyword.set(k, (missingByKeyword.get(k) ?? 0) + m._count._all);
  }
  const topMissing = [...missingByKeyword.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  const firstByResume = new Map(firstVersions.map((v) => [v.resumeId, v.createdAt.getTime()]));
  const durations = exportTimes.map((e) => (e._min.createdAt!.getTime() - (firstByResume.get(e.resumeId) ?? e._min.createdAt!.getTime())) / 60000).filter((x) => x >= 0).sort((a, b) => a - b);
  const median = durations.length ? durations[Math.floor(durations.length / 2)] : null;
  const avgEdits = editsAfterFirst.length ? editsAfterFirst.reduce((s, e) => s + e._count._all, 0) / editsAfterFirst.length : 0;
  const totalJobs = jobs.reduce((s, j) => s + j._count._all, 0);
  const okJobs = jobs.filter((j) => j.status === "SUCCEEDED").reduce((s, j) => s + j._count._all, 0);
  const name = (k: string, list: { key: string; name: string }[]) => list.find((x) => x.key === k)?.name ?? k;
  return (
    <>
      <div className="pagehead"><div><h1>Reports</h1><p>Aggregated operational metrics. Targets in the R&amp;D plan are pilot goals, not measured results.</p></div></div>
      <div className="grid cols-4">
        <div className="card"><div className="kpi-label">Generation success</div><div className="kpi">{totalJobs ? Math.round((okJobs / totalJobs) * 100) : 0}%</div><div className="small muted">{okJobs}/{totalJobs} jobs</div></div>
        <div className="card"><div className="kpi-label">Median draft → first export</div><div className="kpi">{median === null ? "—" : median < 120 ? `${Math.round(median)} min` : `${(median / 60).toFixed(1)} h`}</div></div>
        <div className="card"><div className="kpi-label">Avg. revisions per resume</div><div className="kpi">{avgEdits.toFixed(1)}</div></div>
        <div className="card"><div className="kpi-label">Security (30 days)</div><div className="kpi">{denied}</div><div className="small muted">denied attempts · {deletions} deletions</div></div>
      </div>
      <div className="grid cols-2">
        <section className="card">
          <h2>Resumes by domain and role</h2>
          <table><thead><tr><th>Domain</th><th>Role</th><th>Resumes</th></tr></thead><tbody>{byDomainRole.map((r) => <tr key={r.domainKey + r.roleKey}><td>{name(r.domainKey, DOMAINS)}</td><td>{name(r.roleKey, ROLES)}</td><td>{r._count._all}</td></tr>)}</tbody></table>
        </section>
        <section className="card">
          <h2>Versions by status</h2>
          <table><tbody>{versionsByStatus.map((v) => <tr key={v.status}><td>{v.status.toLowerCase().replace("_", " ")}</td><td>{v._count._all}</td></tr>)}</tbody></table>
          <h3>Exports</h3>
          <table><tbody>{exportsByFormat.map((e) => <tr key={e.format}><td>{e.format}</td><td>{e._count._all} files</td><td>avg {e._avg.pageCount?.toFixed(1) ?? "—"} pages</td></tr>)}</tbody></table>
        </section>
        <section className="card">
          <h2>Generation jobs</h2>
          <table><thead><tr><th>Status</th><th>Model</th><th>Jobs</th><th>Avg ms</th><th>Avg tokens in/out</th><th>Avg cost</th></tr></thead>
            <tbody>{jobs.map((j) => <tr key={j.status + j.modelName}><td>{j.status.toLowerCase()}</td><td className="small">{j.modelName ?? "—"}</td><td>{j._count._all}</td><td>{Math.round(j._avg.durationMs ?? 0)}</td><td>{Math.round(j._avg.inputTokens ?? 0)} / {Math.round(j._avg.outputTokens ?? 0)}</td><td>${(j._avg.costUsd ?? 0).toFixed(4)}</td></tr>)}</tbody>
          </table>
        </section>
        <section className="card">
          <h2>JD coverage</h2>
          <table><tbody>{matchStates.map((m) => <tr key={m.state}><td>{m.state.toLowerCase().replace("_", " ")}</td><td>{m._count._all}</td></tr>)}</tbody></table>
          <h3>Most common missing requirements</h3>
          <div className="meta-line">{topMissing.map(([k, n]) => <span key={k} className="badge neutral">{k} · {n}</span>)}{topMissing.length === 0 && <span className="muted small">None yet.</span>}</div>
        </section>
        <section className="card">
          <h2>Client library</h2>
          <table><tbody>{clientStats.map((c) => <tr key={c.verificationStatus}><td>{c.verificationStatus.toLowerCase().replace("_", " ")}</td><td>{c._count._all} clients</td><td>{c._sum.usageCount ?? 0} uses</td></tr>)}</tbody></table>
          <p className="small muted">{techCount} technologies in the catalog.</p>
        </section>
      </div>
      {user.role !== "ADMIN" && <p className="hint">Administrators can see the full audit trail under Administration.</p>}
    </>
  );
}
