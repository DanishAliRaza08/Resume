import Link from "next/link";
import { StatusBadge } from "@/components/Badges";
import { Denied } from "@/components/Denied";
import { Flash } from "@/components/Flash";
import { ResumeEditor } from "@/components/ResumeEditor";
import { ResumePreview } from "@/components/ResumePreview";
import { fmtDateTime } from "@/lib/format";
import { ResumeContent } from "@/lib/resume-schema";
import type { ValidationReport } from "@/lib/validation";
import { formatDuration } from "@/lib/timeline";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { AccessDenied, authorizeResume, can, candidateWritable } from "@/lib/server/permissions";
import { validateForCandidate } from "@/lib/server/resume-service";
import { DESIGNS, getDesign } from "@/lib/designs";
import { applyCompression, changeStatus, exportFile, restoreVersion, saveEdits, setDesign } from "./actions";

const LAYERS = ["SCHEMA", "FACTUAL", "CONSISTENCY", "QUALITY", "LAYOUT"] as const;

export default async function ResumePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  let resume;
  try {
    resume = await authorizeResume(user, id, "read");
  } catch (e) {
    if (e instanceof AccessDenied) return <Denied />;
    throw e;
  }
  const [candidate, versions, exportsList, jds] = await Promise.all([
    prisma.candidate.findUniqueOrThrow({ where: { id: resume.candidateId } }),
    prisma.resumeVersion.findMany({ where: { resumeId: id }, orderBy: { version: "desc" }, include: { createdBy: { select: { name: true } } } }),
    prisma.exportFile.findMany({ where: { resumeId: id }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.jobDescription.findMany({ where: user.role === "ADMIN" || user.role === "REVIEWER" ? {} : { ownerId: user.id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, title: true } }),
  ]);
  if (user.role === "READONLY") {
    // Read-only users see approved versions only.
    for (let i = versions.length - 1; i >= 0; i--) if (!["APPROVED", "EXPORTED"].includes(versions[i].status)) versions.splice(i, 1);
  }
  const current = versions.find((v) => v.id === sp.v) ?? versions[0];
  if (!current) return <div className="card">No versions available.</div>;
  const content = ResumeContent.parse(current.content);
  // Re-run checks on view so the report reflects the latest candidate evidence.
  const report: ValidationReport = await validateForCandidate(resume.candidateId, content);
  const writable = candidateWritable(user, candidate);
  const reviewer = can(user, "resume:review");
  const design = getDesign(content.meta.templateKey);
  const approved = current.status === "APPROVED" || current.status === "EXPORTED";
  const issuesByLayer = LAYERS.map((l) => [l, report.issues.filter((i) => i.layer === l)] as const);
  const parent = current.parentVersionId ? versions.find((v) => v.id === current.parentVersionId) : null;

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{resume.title}</h1>
          <p>
            <Link href={`/candidates/${candidate.id}`}>{candidate.fullName}</Link> · v{current.version} <StatusBadge value={current.status} /> · {formatDuration(content.meta.totalExperienceMonths)} verified · {content.meta.projectMode.toLowerCase().replace("_", "-")} · target {current.pageTarget} pages · est. {report.estimatedPages}
          </p>
        </div>
        <div className="actions">
          {versions.length > 1 && <Link className="btn" href={`/resumes/${id}/compare?a=${parent?.id ?? versions[1].id}&b=${current.id}`}>Compare</Link>}
          {writable && jds.length > 0 && <Link className="btn" href={`/jd?resumeVersion=${current.id}`}>Tailor to a JD</Link>}
          {writable && <Link className="btn" href={`/resumes/new?candidateId=${candidate.id}&domainKey=${resume.domainKey}&roleKey=${resume.roleKey}&step=3`}>Regenerate</Link>}
        </div>
      </div>
      <Flash searchParams={sp} />
      {sp.download && <div className="notice info">Your file is ready: <a href={`/api/exports/${sp.download}`}>download</a>.</div>}
      {current.status === "REJECTED" && current.reviewNote && <div className="notice bad">Rejected: {current.reviewNote}. Edit and save to create a new draft.</div>}
      {approved && writable && <div className="notice info">This version is final. Saving edits creates a new draft version; this one stays recoverable.</div>}

      <div className="split">
        <div>
          <ResumeEditor
            key={current.id}
            initial={content}
            issues={report.issues}
            saveAction={saveEdits}
            resumeId={id}
            versionId={current.id}
            readOnly={!writable}
          />
          <h2>Preview</h2>
          <ResumePreview content={content} />
        </div>

        <aside>
          {can(user, "resume:export") && (
            <section className="card">
              <h2>Download</h2>
              <form action={exportFile} className="stack">
                <input type="hidden" name="resumeId" value={id} /><input type="hidden" name="versionId" value={current.id} />
                <label htmlFor="exportDesign">Design</label>
                <select id="exportDesign" name="design" defaultValue={design.key}>
                  {DESIGNS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}
                </select>
                <label className="check"><input type="radio" name="spacing" value="normal" defaultChecked /> Normal spacing</label>
                <label className="check"><input type="radio" name="spacing" value="compact" /> Compact spacing (fits more per page)</label>
                <div className="actions">
                  <button className="btn primary" type="submit" name="format" value="PDF">Download PDF</button>
                  <button className="btn" type="submit" name="format" value="DOCX">Download Word</button>
                </div>
              </form>
              {report.counts.critical > 0 && <p className="hint">Tip: {report.counts.critical} item(s) under Checks still need attention before this resume is final.</p>}
              {exportsList.length > 0 && (
                <ul className="small clean stack" style={{ marginTop: 10 }}>
                  {exportsList.map((e) => <li key={e.id}><a href={`/api/exports/${e.id}`}>{e.fileName}</a> · {e.pageCount ?? "?"} pp · {fmtDateTime(e.createdAt)}</li>)}
                </ul>
              )}
            </section>
          )}

          <section className="card">
            <h2>Status</h2>
            <p className="small"><StatusBadge value={current.status} /> {approved ? "This version is final. Editing creates a new draft." : "Draft — edit freely, then finalize."}</p>
            {current.status === "DRAFT" && writable && (
              <form action={changeStatus} className="actions">
                <input type="hidden" name="resumeId" value={id} /><input type="hidden" name="versionId" value={current.id} />
                <button className="btn primary" type="submit" name="to" value="APPROVED" disabled={report.blocking}>Finalize resume</button>
                <button className="btn small" type="submit" name="to" value="IN_REVIEW">Ask someone to review</button>
              </form>
            )}
            {current.status === "DRAFT" && writable && report.blocking && <p className="hint">Finalize unlocks when the critical items under Checks are resolved (most are fixed with “Confirm all” in the editor).</p>}
            {current.status === "IN_REVIEW" && (writable || reviewer) && (
              <form action={changeStatus} className="stack">
                <input type="hidden" name="resumeId" value={id} /><input type="hidden" name="versionId" value={current.id} />
                <label htmlFor="note">Note <span className="hint">(required to send back)</span></label>
                <textarea id="note" name="note" style={{ minHeight: 50 }} />
                <div className="actions">
                  <button className="btn primary" type="submit" name="to" value="APPROVED" disabled={report.blocking}>Approve</button>
                  <button className="btn danger" type="submit" name="to" value="REJECTED">Send back</button>
                </div>
              </form>
            )}
            {current.reviewedAt && <p className="small muted">Updated {fmtDateTime(current.reviewedAt)}{current.reviewNote ? ` — “${current.reviewNote}”` : ""}</p>}
          </section>

          <section className="card">
            <h2>Design</h2>
            <p className="small muted">Current: <strong>{design.name}</strong>. Changing the design does not change any wording.</p>
            {writable ? (
              <form action={setDesign} className="stack">
                <input type="hidden" name="resumeId" value={id} /><input type="hidden" name="versionId" value={current.id} />
                <select name="design" defaultValue={design.key} aria-label="Design">
                  {DESIGNS.map((d) => <option key={d.key} value={d.key}>{d.name} — {d.description}</option>)}
                </select>
                <button className="btn small" type="submit">Apply design</button>
              </form>
            ) : null}
          </section>

          <section className="card">
            <h2>Checks</h2>
            <p>
              <span className="badge bad">{report.counts.critical} critical</span> <span className="badge warn">{report.counts.warning} warnings</span> <span className="badge info">{report.counts.info} info</span>
            </p>
            {issuesByLayer.map(([layer, list]) =>
              list.length ? (
                <details key={layer} open={list.some((i) => i.severity === "critical")}>
                  <summary>{layer.toLowerCase()} ({list.length})</summary>
                  <ul className="issues small">{list.slice(0, 40).map((i, k) => <li key={k}><StatusBadge value={i.severity} /> {i.message}</li>)}</ul>
                  {list.length > 40 && <p className="small muted">…and {list.length - 40} more.</p>}
                </details>
              ) : null,
            )}
          </section>

          <section className="card">
            <h2>Page count</h2>
            <p className="small">Estimated {report.estimatedPages} page(s) for a target of {current.pageTarget}. The export reports the actual rendered count.</p>
            {report.compression.length > 0 && (
              <>
                <p className="small"><strong>Compression proposal</strong> (approve each step):</p>
                <ol className="small">
                  {report.compression.map((s, k) => (
                    <li key={k} style={{ marginBottom: 6 }}>
                      {s.description} → est. {s.estimatedPages} page(s)
                      {writable && s.kind !== "SPACING" && (
                        <form action={applyCompression}>
                          <input type="hidden" name="resumeId" value={id} /><input type="hidden" name="versionId" value={current.id} />
                          <input type="hidden" name="kind" value={s.kind} /><input type="hidden" name="mode" value={s.mode ?? ""} />
                          <input type="hidden" name="bulletIds" value={(s.bulletIds ?? []).join(",")} /><input type="hidden" name="description" value={s.description} />
                          <button className="btn small" type="submit">Approve &amp; apply</button>
                        </form>
                      )}
                      {s.kind === "SPACING" && <div className="hint">Choose “compact spacing” when exporting.</div>}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

          <section className="card">
            <h2>Version history</h2>
            <ul className="clean stack small">
              {versions.map((v) => (
                <li key={v.id}>
                  <Link href={`/resumes/${id}?v=${v.id}`} aria-current={v.id === current.id ? "true" : undefined}>v{v.version}</Link> <StatusBadge value={v.status} />
                  <div className="muted">{v.changeNote ?? ""} · {v.createdBy.name} · {fmtDateTime(v.createdAt)}</div>
                  {writable && v.id !== versions[0].id && v.id === current.id && (
                    <form action={restoreVersion}><input type="hidden" name="resumeId" value={id} /><input type="hidden" name="versionId" value={v.id} /><button className="btn small" type="submit">Restore as new draft</button></form>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
