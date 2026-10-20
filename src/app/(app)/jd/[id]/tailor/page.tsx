import { strs } from "@/lib/json";
import Link from "next/link";
import { StatusBadge } from "@/components/Badges";
import { Denied } from "@/components/Denied";
import { Flash } from "@/components/Flash";
import { coverageScore, type ExtractedRequirement, type RequirementMatch } from "@/lib/jd";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { authorizeJd } from "@/lib/server/jd-service";
import { AccessDenied, authorizeResume, candidateWritable } from "@/lib/server/permissions";
import { ResumeContent } from "@/lib/resume-schema";
import { applyTailoring, decide, runMatch } from "../../actions";

const ORDER = ["MUST_HAVE", "DOMAIN", "RESPONSIBILITY", "PREFERRED", "METHODOLOGY", "QUALIFICATION"];

export default async function Tailor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  let jd, version, resume;
  try {
    jd = await authorizeJd(user, id);
    version = await prisma.resumeVersion.findUniqueOrThrow({ where: { id: sp.v } });
    resume = await authorizeResume(user, version.resumeId, "read");
  } catch (e) {
    if (e instanceof AccessDenied) return <Denied />;
    throw e;
  }
  const candidate = await prisma.candidate.findUniqueOrThrow({ where: { id: resume.candidateId } });
  const writable = candidateWritable(user, candidate);
  const [matches, suggestions] = await Promise.all([
    prisma.resumeMatch.findMany({ where: { resumeVersionId: version.id, requirement: { jobDescriptionId: id } }, include: { requirement: true } }),
    prisma.editSuggestion.findMany({ where: { resumeVersionId: version.id, jobDescriptionId: id }, orderBy: [{ section: "asc" }, { createdAt: "asc" }] }),
  ]);
  const content = ResumeContent.parse(version.content);
  const projectName = (pid: string | null) => content.projects.find((p) => p.id === pid)?.client ?? "";

  if (!matches.length) {
    return (
      <div className="card">
        <h1>Tailor “{resume.title}” to “{jd.title}”</h1>
        <Flash searchParams={sp} />
        <form action={runMatch}>
          <input type="hidden" name="jdId" value={id} /><input type="hidden" name="versionId" value={version.id} />
          <button className="btn primary" type="submit">Run match</button>
        </form>
      </div>
    );
  }
  const reqs: ExtractedRequirement[] = matches.map((m) => ({ keyword: m.requirement.keyword, canonical: m.requirement.canonical, technologyName: m.requirement.technologyId ? m.requirement.canonical : null, techCategory: null, category: m.requirement.category, weight: m.requirement.weight, required: m.requirement.required, sourceLine: "" }));
  const ms: RequirementMatch[] = matches.map((m) => ({ requirementKey: m.requirement.canonical, state: m.state, evidenceRefs: m.evidenceRefs as string[], explanation: m.explanation ?? "" }));
  const score = coverageScore(reqs, ms);
  const sorted = [...matches].sort((a, b) => ORDER.indexOf(a.requirement.category) - ORDER.indexOf(b.requirement.category) || b.requirement.weight - a.requirement.weight);
  const accepted = suggestions.filter((s) => s.decision === "ACCEPTED").length;
  const gaps = matches.filter((m) => m.state === "MISSING");

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Tailor to JD</h1>
          <p><Link href={`/resumes/${resume.id}?v=${version.id}`}>{resume.title} v{version.version}</Link> ↔ <Link href={`/jd/${id}`}>{jd.title}</Link></p>
        </div>
        <form action={runMatch}><input type="hidden" name="jdId" value={id} /><input type="hidden" name="versionId" value={version.id} /><button className="btn" type="submit">Re-run match</button></form>
      </div>
      <Flash searchParams={sp} />
      <div className="grid cols-4">
        <div className="card"><div className="kpi-label">Coverage score</div><div className="kpi">{score.score}%</div><div className="score-bar" aria-hidden="true"><span style={{ width: `${score.score}%` }} /></div></div>
        <div className="card"><div className="kpi-label">Supported</div><div className="kpi">{score.supported}</div><div className="small muted">{score.userConfirmed} user-confirmed</div></div>
        <div className="card"><div className="kpi-label">Partial / confirm</div><div className="kpi">{score.partial} / {score.needsConfirmation}</div></div>
        <div className="card"><div className="kpi-label">Missing</div><div className="kpi">{score.missing}</div></div>
      </div>
      <p className="hint">The score is a transparent, weighted diagnostic of requirement coverage (must-have 3, domain 2, responsibility 2, preferred 1.5, methodology/qualification 1; supported = full credit, partial = half, needs confirmation = quarter). It does not predict ATS ranking or hiring outcomes.</p>

      <div className="split">
        <div>
          <section className="card">
            <h2>Proposed edits ({suggestions.length})</h2>
            {suggestions.length === 0 && <p className="muted">No edits proposed — supported requirements are already reflected.</p>}
            {suggestions.map((s) => {
              const rationale = strs(s.evidenceRefs).find((e) => e.startsWith("rationale:"))?.slice(10);
              const evidence = strs(s.evidenceRefs).filter((e) => !e.startsWith("rationale:"));
              return (
                <div key={s.id} id={`s-${s.id}`} className={`bullet-row${s.requiresConfirmation && s.decision === "PROPOSED" ? " needs" : ""}`} style={{ gridTemplateColumns: "1fr" }}>
                  <div className="meta-line small">
                    <StatusBadge value={s.decision} />
                    <span className="badge neutral">{s.section.startsWith("SKILLS:") ? `skills · ${s.section.slice(7)}` : s.section.toLowerCase()}{s.projectRef ? ` · ${projectName(s.projectRef)}` : ""}</span>
                    {strs(s.jdKeywordRefs).map((k) => <span key={k} className="badge info">JD: {k}</span>)}
                    {s.requiresConfirmation && <span className="badge warn">needs candidate confirmation</span>}
                  </div>
                  {s.originalText && <p className="small"><span className="diff-del">{s.originalText}</span></p>}
                  <p className="small"><span className="diff-add">{s.originalText ? s.proposedText : `+ ${s.proposedText}`}</span></p>
                  {rationale && <p className="small muted">{rationale}</p>}
                  <p className="small muted mono">evidence: {evidence.join(", ") || "none"}</p>
                  {writable && s.decision === "PROPOSED" && (
                    <form action={decide} className="stack">
                      <input type="hidden" name="jdId" value={id} /><input type="hidden" name="versionId" value={version.id} /><input type="hidden" name="suggestionId" value={s.id} />
                      {!s.section.startsWith("SKILLS") && (
                        <details><summary className="small">Edit wording before accepting</summary><textarea name="editedText" defaultValue={s.proposedText} /></details>
                      )}
                      {s.requiresConfirmation && <label className="check small"><input type="checkbox" name="confirmed" /> The candidate confirmed this is accurate (provenance is recorded)</label>}
                      <div className="actions">
                        <button className="btn small primary" type="submit" name="decision" value="ACCEPTED">Accept</button>
                        <button className="btn small" type="submit" name="decision" value="REJECTED">Reject</button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
            {writable && (
              <form action={applyTailoring} style={{ marginTop: 12 }}>
                <input type="hidden" name="jdId" value={id} /><input type="hidden" name="versionId" value={version.id} />
                <button className="btn primary" type="submit" disabled={accepted === 0}>Create tailored version ({accepted} accepted)</button>
                <span className="hint"> The current version is preserved; checks re-run on the new version.</span>
              </form>
            )}
          </section>
        </div>
        <aside>
          <section className="card">
            <h2>Requirement matches</h2>
            <table className="small">
              <tbody>
                {sorted.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.requirement.keyword}</strong><div className="muted">{m.requirement.category.toLowerCase().replace("_", "-")} · {m.explanation}</div></td>
                    <td><StatusBadge value={m.state} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {gaps.length > 0 && (
            <section className="card">
              <h2>Development gaps</h2>
              <p className="small muted">Not supported by any evidence and never inserted as experience.</p>
              <div className="meta-line">{gaps.map((g) => <span key={g.id} className="badge bad">{g.requirement.keyword}</span>)}</div>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
