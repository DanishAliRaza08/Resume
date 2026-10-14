import { Denied } from "@/components/Denied";
import { Flash } from "@/components/Flash";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { AccessDenied, candidateScope } from "@/lib/server/permissions";
import { authorizeJd } from "@/lib/server/jd-service";
import { runMatch } from "../actions";

const LABEL: Record<string, string> = { MUST_HAVE: "Must-have", PREFERRED: "Preferred", DOMAIN: "Domain", RESPONSIBILITY: "Responsibility", QUALIFICATION: "Qualification", METHODOLOGY: "Methodology" };

export default async function JdDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const { id } = await params;
  let jd;
  try {
    jd = await authorizeJd(user, id);
  } catch (e) {
    if (e instanceof AccessDenied) return <Denied />;
    throw e;
  }
  const [reqs, resumes] = await Promise.all([
    prisma.jDRequirement.findMany({ where: { jobDescriptionId: id }, orderBy: [{ weight: "desc" }, { keyword: "asc" }] }),
    prisma.resume.findMany({ where: { candidate: candidateScope(user) }, include: { versions: { orderBy: { version: "desc" }, take: 1 }, candidate: { select: { fullName: true } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
  ]);
  const grouped = Object.keys(LABEL).map((k) => [k, reqs.filter((r) => r.category === k)] as const).filter(([, l]) => l.length);
  return (
    <>
      <div className="pagehead"><div><h1>{jd.title}</h1><p>{reqs.length} requirements extracted and normalized against the technology catalog.</p></div></div>
      <Flash searchParams={await searchParams} />
      <div className="split">
        <div>
          {grouped.map(([cat, list]) => (
            <section className="card" key={cat}>
              <h2>{LABEL[cat]} <span className="muted small">weight {list[0].weight}</span></h2>
              <div className="meta-line">{list.map((r) => <span key={r.id} className="badge neutral" title={r.sourceLine ?? ""}>{r.keyword}{r.keyword.toLowerCase() !== r.canonical.toLowerCase() && !r.canonical.startsWith("min-years") ? ` → ${r.canonical}` : ""}</span>)}</div>
            </section>
          ))}
          <details className="card"><summary>Extracted text</summary><pre style={{ whiteSpace: "pre-wrap" }} className="small">{jd.extractedText}</pre></details>
        </div>
        <aside className="card">
          <h2>Match against a resume</h2>
          <form action={runMatch}>
            <input type="hidden" name="jdId" value={id} />
            <label htmlFor="versionId">Resume (latest version)</label>
            <select id="versionId" name="versionId" required>
              {resumes.filter((r) => r.versions[0]).map((r) => <option key={r.id} value={r.versions[0].id}>{r.candidate.fullName} — {r.title} (v{r.versions[0].version})</option>)}
            </select>
            <button className="btn primary" type="submit" style={{ marginTop: 12 }}>Match &amp; suggest edits</button>
          </form>
        </aside>
      </div>
    </>
  );
}
