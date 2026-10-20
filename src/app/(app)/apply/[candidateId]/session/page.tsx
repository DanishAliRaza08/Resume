import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { Denied } from "@/components/Denied";
import { Flash } from "@/components/Flash";
import { missingRequired } from "@/data/screening";
import { answerSheet, getProfile, prepareJob, report } from "@/lib/server/apply-service";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { AccessDenied } from "@/lib/server/permissions";
import { provideDescription, updateStatus } from "../../actions";

export default async function ApplySession({ params, searchParams }: { params: Promise<{ candidateId: string }>; searchParams: Promise<Record<string, string>> }) {
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
  const stats = await report(user, candidateId);
  // A specific job (from the list) unless it is already finished; otherwise the next open job.
  const requested = sp.id ? await prisma.jobApplication.findFirst({ where: { id: sp.id, candidateId, status: { in: ["OPENED", "READY"] } } }) : null;
  let job = requested ?? (await prisma.jobApplication.findFirst({ where: { candidateId, status: { in: ["OPENED", "READY"] } }, orderBy: [{ status: "desc" }, { createdAt: "asc" }] }));

  if (!job) {
    return (
      <div className="card">
        <h1>All done 🎉</h1>
        <p style={{ fontSize: 18 }}><strong>{stats.applied}</strong> application(s) submitted for {profile.candidate.fullName}{stats.today ? ` — ${stats.today} today` : ""}.</p>
        <p className="muted">{stats.skipped} skipped or closed · average resume match {stats.avgCoverage === null ? "—" : `${stats.avgCoverage}%`}</p>
        <div className="actions">
          <Link className="btn primary" href={`/apply/${candidateId}#jobs`}>Add more Dice jobs</Link>
          <a className="btn" href={`/api/applications/export?candidateId=${candidateId}`}>Download report (CSV)</a>
        </div>
      </div>
    );
  }

  // Read the job description the first time this job is shown (one page request to dice.com).
  if (!job.jobDescriptionId && !job.fetchError) job = await prepareJob(user, job.id);
  const missing = missingRequired(profile.answers);
  const sheet = answerSheet(profile.answers, profile.custom);
  const done = stats.applied;
  const total = stats.total;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const hidden = (status: string) => (
    <>
      <input type="hidden" name="candidateId" value={candidateId} />
      <input type="hidden" name="applicationId" value={job!.id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="back" value="session" />
    </>
  );

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>{job.title ?? "Dice job"}</h1>
          <p>{[job.company, job.location].filter(Boolean).join(" · ") || "Details will appear once the job page is read"}{job.coverage !== null ? ` · resume match ${job.coverage}%` : ""}</p>
        </div>
        <Link className="btn" href={`/apply/${candidateId}#queue`}>Back to list</Link>
      </div>
      <Flash searchParams={sp} />
      <div className="card">
        <div className="small muted">{done} of {total} submitted · {stats.remaining} left</div>
        <div className="score-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
      </div>
      {missing.length > 0 && (
        <div className="notice warn">Some answers are missing ({missing.map((q) => q.label).join(", ")}). <Link href={`/apply/${candidateId}#answers`}>Fill them in</Link> so you have them ready.</div>
      )}
      {job.fetchError && (
        <form action={provideDescription} className="card">
          <input type="hidden" name="candidateId" value={candidateId} /><input type="hidden" name="applicationId" value={job.id} />
          <div className="notice info">Couldn&apos;t read this job automatically ({job.fetchError}). Paste the job description to tailor the resume, or just continue with the standard resume.</div>
          <textarea name="description" placeholder="Paste the job description from Dice" style={{ minHeight: 120 }} />
          <button className="btn" type="submit" style={{ marginTop: 8 }}>Tailor to this description</button>
        </form>
      )}

      <div className="split">
        <section className="card">
          <h2>Apply in 3 steps</h2>
          <ol className="stack">
            <li>
              <strong>Download the resume for this job</strong>{job.jobDescriptionId ? " (tailored with your real experience)" : ""}
              <div className="actions" style={{ marginTop: 6 }}>
                <a className="btn" href={`/api/applications/${job.id}/resume?format=pdf`}>PDF</a>
                <a className="btn" href={`/api/applications/${job.id}/resume?format=docx`}>Word</a>
              </div>
            </li>
            <li>
              <strong>Open the job on Dice</strong> — it opens in this browser, where you&apos;re signed in to Dice. Click <em>Easy apply</em>, attach the resume and use the answers on the right.
              <div className="actions" style={{ marginTop: 6 }}>
                <a className="btn primary" href={`/api/applications/${job.id}/open`} target="_blank" rel="noopener noreferrer">Open on Dice ↗</a>
              </div>
            </li>
            <li>
              <strong>After you click Submit on Dice</strong>, record it here:
              <div className="actions" style={{ marginTop: 6 }}>
                <form action={updateStatus}>{hidden("APPLIED")}<button className="btn primary" type="submit">✔ I submitted it — next job</button></form>
                <form action={updateStatus}>{hidden("SKIPPED")}<button className="btn" type="submit">Skip</button></form>
                <form action={updateStatus}>{hidden("NOT_AVAILABLE")}<button className="btn" type="submit">No Easy Apply / closed</button></form>
              </div>
            </li>
          </ol>
        </section>

        <aside className="card">
          <h2>Your answers</h2>
          <p className="small muted">Click Copy, then paste into Dice. ✔ / ✘ show which box to tick.</p>
          <table className="small">
            <tbody>
              {sheet.filter((r) => r.answer).map((r) => (
                <tr key={r.question}>
                  <td>{r.question}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {r.type === "yes-no" ? (
                      <strong style={{ color: r.answer === "Yes" ? "var(--ok)" : "var(--bad)" }}>{r.answer === "Yes" ? "✔ Yes" : "✘ No"}</strong>
                    ) : (
                      <>{r.answer} <CopyButton text={r.answer} /></>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link className="small" href={`/apply/${candidateId}#answers`}>Edit answers</Link>
        </aside>
      </div>
    </>
  );
}
