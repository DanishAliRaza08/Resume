import Link from "next/link";
import { Denied } from "@/components/Denied";
import { CandidateFields } from "@/components/CandidateFields";
import { Flash } from "@/components/Flash";
import { ProjectForm } from "@/components/ProjectForm";
import { StatusBadge } from "@/components/Badges";
import { TechPicker } from "@/components/TechPicker";
import { DOMAINS } from "@/data/domains";
import { fmtDate } from "@/lib/format";
import { analyzeTimeline, formatDuration, toDate, totalExperienceMonths } from "@/lib/timeline";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { techOptions, templateOptions } from "@/lib/server/lookups";
import { AccessDenied, authorizeCandidate, candidateWritable } from "@/lib/server/permissions";
import { addEducation, addEmployment, deleteCandidate, deleteEmployment, proposeProjects, removeQualification, setSkills, updateCandidate } from "../actions";

export default async function CandidatePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const { id } = await params;
  let canWrite = false;
  try {
    canWrite = candidateWritable(user, await authorizeCandidate(user, id, "read"));
  } catch (e) {
    if (e instanceof AccessDenied) return <Denied />;
    throw e;
  }
  const [c, techs, templates] = await Promise.all([
    prisma.candidate.findUniqueOrThrow({
      where: { id },
      include: {
        owner: { select: { name: true } },
        employments: { orderBy: { startDate: "desc" } },
        education: true,
        certifications: true,
        skills: { include: { technology: true } },
        projects: { include: { technologies: true, employment: true }, orderBy: { position: "asc" } },
        resumes: { include: { versions: { orderBy: { version: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } },
      },
    }),
    techOptions(),
    templateOptions(),
  ]);
  const intervals = c.employments.map((e) => ({ start: toDate(e.startDate), end: e.endDate ? toDate(e.endDate) : null, label: e.employer, concurrent: e.engagement !== "FULL_TIME" }));
  const months = totalExperienceMonths(intervals);
  const warnings = analyzeTimeline(intervals);
  const back = `/candidates/${id}`;
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{c.fullName}</h1>
          <p>Owner: {c.owner.name} · Verified experience: <strong>{formatDuration(months)}</strong> (unique intervals, overlaps counted once)</p>
        </div>
        {canWrite && (
          <div className="actions">
            <Link className="btn primary" href={`/resumes/new?candidateId=${id}&step=2`}>Create resume</Link>
          </div>
        )}
      </div>
      <Flash searchParams={await searchParams} />
      {!c.consentObtainedAt && <div className="notice warn">No consent/notice is recorded for this candidate.</div>}

      <section className="card">
        <h2>Profile</h2>
        {canWrite ? (
          <form action={updateCandidate}>
            <input type="hidden" name="id" value={id} />
            <CandidateFields c={c} />
            <div className="actions" style={{ marginTop: 12 }}><button className="btn primary" type="submit">Save profile</button></div>
          </form>
        ) : (
          <p>{[c.email, c.phone, c.location].filter(Boolean).join(" · ")}</p>
        )}
      </section>

      <section className="card">
        <h2>Verified employment history</h2>
        {warnings.length > 0 && (
          <ul className="issues">
            {warnings.map((w, i) => <li key={i}><StatusBadge value={w.severity} /> {w.message}</li>)}
          </ul>
        )}
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employer</th><th>Title</th><th>Dates</th><th>Type</th><th>Evidence</th><th /></tr></thead>
            <tbody>
              {c.employments.map((e) => (
                <tr key={e.id}>
                  <td>{e.employer}<div className="small muted">{e.location}</div></td>
                  <td>{e.title}</td>
                  <td className="small">{fmtDate(e.startDate)} → {e.endDate ? fmtDate(e.endDate) : "current"}</td>
                  <td className="small">{e.engagement.replace("_", " ").toLowerCase()}</td>
                  <td className="small muted">{e.evidence ?? "—"} <StatusBadge value={e.status} /></td>
                  <td>
                    {canWrite && (
                      <form action={deleteEmployment}>
                        <input type="hidden" name="candidateId" value={id} />
                        <input type="hidden" name="employmentId" value={e.id} />
                        <button className="btn small danger" type="submit">Remove</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {c.employments.length === 0 && <tr><td colSpan={6} className="muted">No employment recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
        {canWrite && (
          <form action={addEmployment} style={{ marginTop: 12 }}>
            <input type="hidden" name="candidateId" value={id} />
            <h3>Add employment</h3>
            <div className="row">
              <div><label>Employer *</label><input name="employer" type="text" required /></div>
              <div><label>Location</label><input name="location" type="text" /></div>
              <div><label>Title *</label><input name="title" type="text" required /></div>
            </div>
            <div className="row">
              <div><label>Start *</label><input name="startDate" type="date" required /></div>
              <div><label>End <span className="hint">(blank = current)</span></label><input name="endDate" type="date" /></div>
              <div>
                <label>Engagement</label>
                <select name="engagement"><option value="FULL_TIME">Full-time</option><option value="CONTRACT">Contract</option><option value="PART_TIME">Part-time / concurrent</option></select>
              </div>
              <div><label>Evidence / source</label><input name="evidence" type="text" placeholder="e.g. offer letter, candidate statement" /></div>
            </div>
            <label className="check"><input type="checkbox" name="confirmed" /> The candidate confirmed this employer, title and dates</label>
            <button className="btn" type="submit">Add employment</button>
          </form>
        )}
      </section>

      <div className="grid cols-2">
        <section className="card">
          <h2>Education &amp; certifications</h2>
          <ul>
            {c.education.map((e) => (
              <li key={e.id}>
                {e.qualification}{e.institution ? ` — ${e.institution}` : ""}{" "}
                {canWrite && (
                  <form action={removeQualification} style={{ display: "inline" }}>
                    <input type="hidden" name="candidateId" value={id} /><input type="hidden" name="recordId" value={e.id} /><input type="hidden" name="kind" value="edu" />
                    <button className="btn small" type="submit" aria-label={`Remove ${e.qualification}`}>×</button>
                  </form>
                )}
              </li>
            ))}
            {c.certifications.map((x) => (
              <li key={x.id}>
                <strong>Cert:</strong> {x.name}{x.issuer ? ` — ${x.issuer}` : ""}{" "}
                {canWrite && (
                  <form action={removeQualification} style={{ display: "inline" }}>
                    <input type="hidden" name="candidateId" value={id} /><input type="hidden" name="recordId" value={x.id} /><input type="hidden" name="kind" value="cert" />
                    <button className="btn small" type="submit" aria-label={`Remove ${x.name}`}>×</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          {canWrite && (
            <form action={addEducation}>
              <input type="hidden" name="candidateId" value={id} />
              <div className="row">
                <div><label>Type</label><select name="kind"><option value="edu">Education</option><option value="cert">Certification</option></select></div>
                <div><label>Qualification / certification</label><input name="name" type="text" required /></div>
              </div>
              <div className="row">
                <div><label>Institution / issuer</label><input name="issuer" type="text" /></div>
                <div><label>Date</label><input name="date" type="date" /></div>
              </div>
              <button className="btn" type="submit" style={{ marginTop: 8 }}>Add</button>
            </form>
          )}
        </section>
        <section className="card">
          <h2>Resumes</h2>
          <ul className="clean stack">
            {c.resumes.map((r) => (
              <li key={r.id}>
                <Link href={`/resumes/${r.id}`}>{r.title}</Link> {r.versions[0] && <><span className="muted small">v{r.versions[0].version}</span> <StatusBadge value={r.versions[0].status} /></>}
              </li>
            ))}
            {c.resumes.length === 0 && <li className="muted">No resumes yet.</li>}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2>Confirmed skills</h2>
        <p className="muted small">Only skills the candidate has confirmed may appear in a Technical Skills table. Imported and JD-confirmed skills keep their provenance.</p>
        <div className="meta-line" style={{ marginBottom: 8 }}>
          {c.skills.map((s) => <span key={s.id} className="badge neutral" title={`Source: ${s.source}`}>{s.technology.canonicalName}{s.source !== "USER_CONFIRMED" ? ` · ${s.source.replace("_", " ").toLowerCase()}` : ""}</span>)}
        </div>
        {canWrite && (
          <details>
            <summary>Edit confirmed skills</summary>
            <form action={setSkills}>
              <input type="hidden" name="candidateId" value={id} />
              <TechPicker techs={techs} selected={new Set(c.skills.map((s) => s.technologyId))} />
              <button className="btn primary" type="submit">Save skills</button>
            </form>
          </details>
        )}
      </section>

      <section id="projects">
        <h2>Project experience</h2>
        {c.projects.length === 0 && canWrite && (
          <form action={proposeProjects} className="card">
            <input type="hidden" name="candidateId" value={id} />
            <input type="hidden" name="returnTo" value={`${back}#projects`} />
            <p>Create five project shells using the default timeline (P1 ≈ 2 yrs 3 mos, P2 2 yrs, P5 7 mos, remainder split across P3–P4), bounded by verified employment.</p>
            <div className="row">
              <div><label>Domain</label><select name="domainKey" defaultValue={c.domainKey ?? "BANKING"}>{DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}</select></div>
              <div className="shrink"><button className="btn" type="submit">Propose five projects</button></div>
            </div>
          </form>
        )}
        {canWrite
          ? c.projects.map((p) => (
              <ProjectForm key={p.id} candidateId={id} project={p} position={p.position} employments={c.employments} templates={templates} techs={techs} returnTo={`${back}#project-${p.id}`} />
            ))
          : c.projects.map((p) => (
              <div className="card" key={p.id}><h3>{p.title}</h3><p className="small muted">{p.employment?.employer} · {fmtDate(p.startDate)} → {p.endDate ? fmtDate(p.endDate) : "current"}</p></div>
            ))}
        {canWrite && <ProjectForm candidateId={id} position={c.projects.length + 1} employments={c.employments} templates={templates} techs={techs} returnTo={`${back}#projects`} defaultDomain={c.domainKey} />}
      </section>

      {canWrite && (
        <section className="card" style={{ borderColor: "var(--bad)" }}>
          <h2>Delete candidate</h2>
          <p className="small">Permanently deletes the profile, employment, projects, all resume versions and stored export files. The deletion is recorded in the audit log; database backups expire according to the backup retention schedule.</p>
          {c.retentionUntil && <p className="small muted">Retention review date: {fmtDate(c.retentionUntil)}</p>}
          <form action={deleteCandidate} className="row">
            <input type="hidden" name="candidateId" value={id} />
            <div><label>Type the full name to confirm</label><input name="confirmName" type="text" required /></div>
            <div className="shrink"><button className="btn danger" type="submit">Delete permanently</button></div>
          </form>
        </section>
      )}
    </>
  );
}
