import Link from "next/link";
import { Flash } from "@/components/Flash";
import { DOMAINS, ROLES } from "@/data/domains";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { candidateScope } from "@/lib/server/permissions";
import { startFromResume } from "./actions";

export default async function DiceApplyHome({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser(["ADMIN", "CREATOR"]);
  const people = await prisma.candidate.findMany({
    where: candidateScope(user),
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: { id: true, fullName: true, _count: { select: { applications: true } }, applications: { where: { status: "APPLIED" }, select: { id: true } } },
  });
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Dice Apply</h1>
          <p>Upload a resume, save the answers Dice asks for, paste Dice job links, then apply one after another with a tailored resume for each job.</p>
        </div>
      </div>
      <Flash searchParams={await searchParams} />
      <ol className="steps" aria-label="How it works">
        <li>1. Resume</li><li>2. Answers</li><li>3. Dice job links</li><li>4. Apply &amp; track</li>
      </ol>
      <div className="grid cols-2">
        <form action={startFromResume} className="card">
          <h2>Start with a resume</h2>
          <p className="muted small">The app reads the name, contact details, jobs and skills from the resume.</p>
          <label htmlFor="resume">Candidate resume (.docx, .pdf or .txt) *</label>
          <input id="resume" name="resume" type="file" accept=".docx,.pdf,.txt" required />
          <label htmlFor="fullName">Name <span className="hint">(only if it is not in the resume)</span></label>
          <input id="fullName" name="fullName" type="text" />
          <div className="row">
            <div><label htmlFor="domainKey">Industry</label><select id="domainKey" name="domainKey">{DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}</select></div>
            <div><label htmlFor="roleKey">Role</label><select id="roleKey" name="roleKey">{ROLES.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}</select></div>
          </div>
          <div className="actions" style={{ marginTop: 12 }}><button className="btn primary" type="submit">Read resume &amp; continue</button></div>
        </form>
        <section className="card">
          <h2>Or continue with someone</h2>
          {people.length === 0 && <p className="muted">No people yet.</p>}
          <ul className="clean stack">
            {people.map((p) => (
              <li key={p.id}>
                <Link href={`/apply/${p.id}`}>{p.fullName}</Link>{" "}
                <span className="small muted">{p.applications.length} applied · {p._count.applications} jobs in list</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="hint">You submit each application on Dice yourself, signed in with your own browser. The app never logs into Dice or submits anything for you, which keeps your Dice account within Dice&apos;s rules.</p>
    </>
  );
}
