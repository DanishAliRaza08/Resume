import Link from "next/link";
import { StatusBadge } from "@/components/Badges";
import { Denied } from "@/components/Denied";
import { Flash } from "@/components/Flash";
import { SCREENING_QUESTIONS, missingRequired } from "@/data/screening";
import { fmtDateTime } from "@/lib/format";
import { answerCode, getProfile, pendingQuestions, report } from "@/lib/server/apply-service";
import { CopyButton } from "@/components/CopyButton";
import { bookmarkletHref } from "@/lib/server/bookmarklet";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { AccessDenied, candidateWritable } from "@/lib/server/permissions";
import { addDiceJobs, answerPendingQuestions, saveAnswers, updateStatus } from "../actions";

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
  const [stats, resumes, jobs, pending] = await Promise.all([
    report(user, candidateId),
    prisma.resume.findMany({ where: { candidateId }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true } }),
    prisma.jobApplication.findMany({ where: { candidateId, ...(sp.status ? { status: sp.status as "READY" } : {}) }, orderBy: [{ updatedAt: "desc" }], take: 500 }),
    pendingQuestions(user, candidateId),
  ]);
  const missing = missingRequired(profile.answers);
  const code = answerCode(profile.candidate.fullName, profile.answers, profile.custom);
  const custom = [...profile.custom, { question: "", answer: "" }, { question: "", answer: "" }];

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Dice Apply — {profile.candidate.fullName}</h1>
          <p>Save the answers once, then let the Dice Helper extension apply to matching Easy Apply jobs — or work through job links yourself.</p>
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

      {writable && pending.length > 0 && (
        <form action={answerPendingQuestions} className="card" id="pending">
          <input type="hidden" name="candidateId" value={candidateId} />
          <h2>Questions auto-apply could not answer</h2>
          <p className="muted small">These required questions stopped some applications (they were skipped, never guessed). Answer them once; the next run retries those jobs. Leave a box empty to skip it.</p>
          {pending.map((p, i) => (
            <div className="row" key={i}>
              <div style={{ flex: "2 1 320px" }}><label htmlFor={`pa${i}`}>{p.question} <span className="hint">({p.count} job{p.count > 1 ? "s" : ""})</span></label><input type="hidden" name="pq" value={p.question} /><input id={`pa${i}`} name="pa" type="text" placeholder="Your answer, e.g. Yes / No / 5" /></div>
            </div>
          ))}
          <div className="actions" style={{ marginTop: 10 }}><button className="btn primary" type="submit">Save these answers</button></div>
        </form>
      )}

      {writable && (
        <section className="card" id="auto">
          <h2>Auto-apply with the Dice Helper extension</h2>
          <ol className="stack">
            <li><a className="btn small" href="/api/extension">Download Dice Helper (.zip)</a> and unzip it. In Chrome open <code>chrome://extensions</code>, turn on <strong>Developer mode</strong>, click <strong>Load unpacked</strong> and choose the <code>dice-helper</code> folder. (Once.)</li>
            <li>Log in to <a href="https://www.dice.com" target="_blank" rel="noopener noreferrer">dice.com</a> in the same Chrome. Make sure the resume on your Dice profile is the one to send.</li>
            <li>Click the extension, <strong>sign in with your Benchsale Dan email and password</strong>, choose <strong>{profile.candidate.fullName}</strong>, check the search (their role is filled in) and press <strong>Start auto-apply</strong>.</li>
          </ol>
          <p className="small muted">It searches Dice for Easy Apply jobs, skips “Apply Now” (company website) jobs and jobs already done, fills each step with the answers below and presses Next / Submit. Results appear here as they happen. A required question with no saved answer is never guessed: that job is skipped and the question appears above for you to answer. Start with a small limit (e.g. 5) to check everything looks right. Applying in bulk may be limited by Dice&apos;s terms — use it responsibly and only for jobs that fit.</p>
        </section>
      )}

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
          <h2>2. Or: the “Fill Dice” button (nothing to install)</h2>
          <p>This yellow button fills Dice application forms with the answers above, and collects job links from Dice search pages.</p>
          <div className="bookmark-steps">
            <div className="bstep"><span className="bnum">1</span><div><strong>Show the bookmarks bar</strong><br />Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> (on a Mac: <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>).</div></div>
            <div className="bstep"><span className="bnum">2</span><div><strong>Drag this yellow button up onto the bookmarks bar</strong> (hold the mouse button, move up, let go):
              <div style={{ margin: "12px 0" }} dangerouslySetInnerHTML={{ __html: `<a class="bookmarklet" href="${bookmarkletHref(code)}" title="Drag me to your bookmarks bar" onclick="alert('Drag this button up to your bookmarks bar — don\\'t click it here.'); return false;">⭐ Fill Dice — ${escapeHtml(profile.candidate.fullName)}</a>` }} />
            </div></div>
            <div className="bstep"><span className="bnum">3</span><div><strong>On Dice, click the bookmark</strong>. A box appears:
              <ul className="small">
                <li>On an application: <b>✍ Fill my answers</b> — then check and click Next / Submit on Dice.</li>
                <li>On search results: <b>➕ Save job links</b> on each page, then <b>📋 Copy</b> and paste them in step 4 below.</li>
              </ul>
            </div></div>
          </div>
          <p className="hint">If you change any answers above, save them and drag the new button again (you can delete the old bookmark). Questions the button doesn&apos;t know get an orange box: answer those yourself.</p>
          <details style={{ marginTop: 8 }}>
            <summary className="small">Answer code (for older copies of the extension)</summary>
            <textarea id="answerCode" readOnly value={code} aria-label="Answer code" style={{ minHeight: 50, fontFamily: "ui-monospace, monospace", fontSize: 11 }} />
            <div className="actions" style={{ marginTop: 6 }}><CopyButton text={code} label="Copy answer code" /></div>
          </details>
        </section>
      )}

      {writable && (
        <form action="https://www.dice.com/jobs" method="get" className="card" id="find" target="_blank" rel="noopener noreferrer">
          <h2>3. Find jobs on Dice</h2>
          <p className="muted small">Opens the Dice search in a new tab. On each results page click your <strong>⭐ Fill Dice</strong> bookmark → <strong>Save job links</strong>; at the end click <strong>Copy</strong> and paste them below.</p>
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
                    {j.notes && j.status !== "READY" && <div className="muted small">{j.notes}</div>}
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
