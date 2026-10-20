import Link from "next/link";
import { StatusBadge } from "@/components/Badges";
import { Denied } from "@/components/Denied";
import { Flash } from "@/components/Flash";
import { SCREENING_QUESTIONS, missingRequired } from "@/data/screening";
import { fmtDateTime } from "@/lib/format";
import { answerCode, getProfile, report } from "@/lib/server/apply-service";
import { CopyButton } from "@/components/CopyButton";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { AccessDenied, candidateWritable } from "@/lib/server/permissions";
import { addDiceJobs, saveAnswers, updateStatus } from "../actions";

const GROUPS = ["Contact", "Eligibility", "Experience & pay", "Preferences", "Checks"] as const;

export default async function ApplyCandidate({ params, searchParams }: { params: Promise<{ candidateId: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const { candidateId } = await params;
  const sp = await searchParams;
  let profile;
  try {
    profile = await getProfile(user, candidateId);
  } catch (e) {
    if (e instanceof AccessDenied) return <Denied />;
    throw e;
  }
  const writable = candidateWritable(user, profile.candidate);
  const [stats, resumes, jobs] = await Promise.all([
    report(user, candidateId),
    prisma.resume.findMany({ where: { candidateId }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true } }),
    prisma.jobApplication.findMany({ where: { candidateId, ...(sp.status ? { status: sp.status as "READY" } : {}) }, orderBy: [{ createdAt: "desc" }], take: 500 }),
  ]);
  const missing = missingRequired(profile.answers);
  const custom = [...profile.custom, { question: "", answer: "" }, { question: "", answer: "" }];

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Dice Apply — {profile.candidate.fullName}</h1>
          <p>Answers are saved for every application. Paste Dice job links, then work through them one by one.</p>
        </div>
        <div className="actions">
          <Link className="btn primary" href={`/apply/${candidateId}/session`} aria-disabled={stats.remaining === 0}>Start applying ({stats.remaining} left)</Link>
          <a className="btn" href={`/api/applications/export?candidateId=${candidateId}`}>Download report (CSV)</a>
        </div>
      </div>
      <Flash searchParams={sp} />

      <div className="grid cols-4">
        <div className="card"><div className="kpi-label">Applications submitted</div><div className="kpi">{stats.applied}</div><div className="small muted">{stats.today} today · {stats.week} this week</div></div>
        <div className="card"><div className="kpi-label">Left to do</div><div className="kpi">{stats.remaining}</div><div className="small muted">{stats.opened} opened, not yet confirmed</div></div>
        <div className="card"><div className="kpi-label">Skipped / closed</div><div className="kpi">{stats.skipped}</div></div>
        <div className="card"><div className="kpi-label">Avg. resume match</div><div className="kpi">{stats.avgCoverage === null ? "—" : `${stats.avgCoverage}%`}</div><div className="small muted">for submitted jobs</div></div>
      </div>

      {writable && (
        <form action={saveAnswers} className="card" id="answers">
          <input type="hidden" name="candidateId" value={candidateId} />
          <h2>1. Answers for application questions</h2>
          {missing.length > 0 ? (
            <div className="notice warn">Please answer {missing.length} question(s) before applying: {missing.map((q) => q.label).join(" · ")}</div>
          ) : (
            <div className="notice ok">All required answers are filled in.</div>
          )}
          <p className="muted small">Answer truthfully: these go to employers. Nothing is ever answered “Yes” for you.</p>
          <label htmlFor="baseResumeId">Resume to send (tailored per job automatically)</label>
          <select id="baseResumeId" name="baseResumeId" defaultValue={profile.baseResumeId ?? resumes[0]?.id ?? ""}>
            {resumes.length === 0 && <option value="">No resume yet — create one first</option>}
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          {GROUPS.map((g) => (
            <fieldset key={g} style={{ border: "1px solid var(--border)", borderRadius: 6, marginTop: 12, padding: "4px 12px 12px" }}>
              <legend className="small" style={{ fontWeight: 600 }}>{g}</legend>
              <div className="row">
                {SCREENING_QUESTIONS.filter((q) => q.group === g).map((q) => {
                  const value = profile.answers[q.key] ?? "";
                  const empty = q.required && !value.trim();
                  const id = `a_${q.key}`;
                  return (
                    <div key={q.key} style={{ flex: q.type === "yes-no" || q.label.length > 40 ? "1 1 320px" : "1 1 180px" }}>
                      <label htmlFor={id} style={{ color: empty ? "var(--warn)" : undefined }}>{q.label}{q.required ? " *" : ""}</label>
                      {q.type === "yes-no" ? (
                        <div className="actions" role="radiogroup" aria-labelledby={id}>
                          {["Yes", "No"].map((o) => (
                            <label key={o} className="check" style={{ margin: 0 }}><input type="radio" name={id} value={o} defaultChecked={value === o} /> {o}</label>
                          ))}
                          <span id={id} hidden>{q.label}</span>
                        </div>
                      ) : q.type === "select" ? (
                        <select id={id} name={id} defaultValue={value}>
                          <option value="">Choose…</option>
                          {q.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input id={id} name={id} type={q.type === "number" ? "number" : "text"} min={0} defaultValue={value} />
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <fieldset style={{ border: "1px solid var(--border)", borderRadius: 6, marginTop: 12, padding: "4px 12px 12px" }}>
            <legend className="small" style={{ fontWeight: 600 }}>Other questions you often see</legend>
            {custom.map((c, i) => (
              <div className="row" key={i}>
                <div><label htmlFor={`cq${i}`}>Question</label><input id={`cq${i}`} name="custom_q" type="text" defaultValue={c.question} placeholder="e.g. Years of experience with Jira" /></div>
                <div><label htmlFor={`ca${i}`}>Answer</label><input id={`ca${i}`} name="custom_a" type="text" defaultValue={c.answer} /></div>
              </div>
            ))}
          </fieldset>
          <div className="actions" style={{ marginTop: 12 }}><button className="btn primary" type="submit">Save answers</button></div>
        </form>
      )}

      {writable && (
        <section className="card" id="helper">
          <h2>2. Browser helper (fills Dice forms for you)</h2>
          <p className="muted small">The Dice Helper runs in your own Chrome while you&apos;re on Dice. On search results it collects every job link; on an application it fills text boxes, dropdowns, yes/no buttons and tick boxes from the answers above. Questions it doesn&apos;t know are outlined in orange. You review and click Next / Submit.</p>
          <ol className="small stack">
            <li><a className="btn small" href="/api/extension">Download Dice Helper (.zip)</a> and unzip it.</li>
            <li>In Chrome open <code>chrome://extensions</code>, turn on <strong>Developer mode</strong> (top right), click <strong>Load unpacked</strong> and choose the unzipped <code>dice-helper</code> folder.</li>
            <li>Click the puzzle-piece icon → <strong>Dice Helper</strong>, paste this person&apos;s answer code and click <strong>Save answers</strong>. Paste a new code whenever the answers change.</li>
          </ol>
          <label htmlFor="answerCode">Answer code for {profile.candidate.fullName}</label>
          <textarea id="answerCode" readOnly value={answerCode(profile.candidate.fullName, profile.answers, profile.custom)} style={{ minHeight: 60, fontFamily: "ui-monospace, monospace", fontSize: 11 }} />
          <div className="actions" style={{ marginTop: 6 }}><CopyButton text={answerCode(profile.candidate.fullName, profile.answers, profile.custom)} label="Copy answer code" /></div>
        </section>
      )}

      {writable && (
        <form action="https://www.dice.com/jobs" method="get" className="card" id="find" target="_blank" rel="noopener noreferrer">
          <h2>3. Find jobs on Dice</h2>
          <p className="muted small">Opens the Dice search in a new tab. With the helper installed, click <strong>Add job links on this page</strong> on each results page, then <strong>Copy collected links</strong> and paste them below.</p>
          <div className="row">
            <div><label htmlFor="keyword">Job title or keywords</label><input id="keyword" name="q" type="text" required defaultValue={profile.candidate.targetTitle ?? ""} placeholder="Business Analyst" /></div>
            <div><label htmlFor="location">Location <span className="hint">(blank = anywhere)</span></label><input id="location" name="location" type="text" /></div>
          </div>
          <label className="check"><input type="checkbox" name="filters.easyApply" value="true" defaultChecked /> Easy Apply jobs only</label>
          <label className="check"><input type="checkbox" name="filters.isRemote" value="true" /> Remote only</label>
          <div className="actions" style={{ marginTop: 8 }}><button className="btn" type="submit">Search Dice ↗</button></div>
        </form>
      )}

      {writable && (
        <form action={addDiceJobs} className="card" id="jobs">
          <input type="hidden" name="candidateId" value={candidateId} />
          <h2>4. Add Dice jobs</h2>
          <p className="muted small">Search on Dice, then paste the job links here — as many as you like, one per line (up to 500 at a time). Jobs already in the list are skipped, so nobody applies twice.</p>
          <textarea name="links" style={{ minHeight: 120 }} placeholder={"https://www.dice.com/job-detail/…\nhttps://www.dice.com/job-detail/…"} required />
          <div className="actions" style={{ marginTop: 8 }}><button className="btn" type="submit">Add jobs</button></div>
        </form>
      )}

      <section className="card" id="queue">
        <div className="pagehead" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>5. Jobs ({stats.total})</h2>
          <div className="actions small">
            {["", "READY", "OPENED", "APPLIED", "SKIPPED", "NOT_AVAILABLE"].map((s) => (
              <Link key={s} href={`/apply/${candidateId}${s ? `?status=${s}` : ""}#queue`} className={`badge ${sp.status === s || (!sp.status && !s) ? "info" : "neutral"}`}>{s ? s.toLowerCase().replace("_", " ") : "all"}</Link>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table className="small">
            <thead><tr><th>Job</th><th>Match</th><th>Status</th><th>Updated</th><th /></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <a href={j.jobUrl} target="_blank" rel="noopener noreferrer">{j.title ?? "Dice job"}</a>
                    <div className="muted">{[j.company, j.location].filter(Boolean).join(" · ") || j.jobUrl.replace("https://www.dice.com/job-detail/", "…/")}</div>
                  </td>
                  <td>{j.coverage === null ? "—" : `${j.coverage}%`}</td>
                  <td><StatusBadge value={j.status === "APPLIED" ? "SUCCEEDED" : j.status === "SKIPPED" || j.status === "NOT_AVAILABLE" ? "PROPOSED" : "IN_REVIEW"} /> {j.status.toLowerCase().replace("_", " ")}</td>
                  <td className="muted">{fmtDateTime(j.appliedAt ?? j.updatedAt)}</td>
                  <td className="actions">
                    {j.status !== "APPLIED" && <Link className="btn small" href={`/apply/${candidateId}/session?id=${j.id}`}>Apply</Link>}
                    {writable && j.status !== "READY" && (
                      <form action={updateStatus}>
                        <input type="hidden" name="candidateId" value={candidateId} /><input type="hidden" name="applicationId" value={j.id} /><input type="hidden" name="status" value="READY" />
                        <button className="btn small" type="submit">Reset</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && <tr><td colSpan={5} className="muted">No jobs yet. Paste Dice links above.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
