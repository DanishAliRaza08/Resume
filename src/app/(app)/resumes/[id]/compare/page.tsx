import Link from "next/link";
import { Denied } from "@/components/Denied";
import { ResumeContent } from "@/lib/resume-schema";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { AccessDenied, authorizeResume } from "@/lib/server/permissions";

function sectionLines(c: ResumeContent): { key: string; heading: string; lines: string[] }[] {
  return [
    { key: "header", heading: "Header", lines: [c.header.fullName, c.header.title, [c.header.email, c.header.phone, c.header.location].filter(Boolean).join(" | ")] },
    { key: "summary", heading: "Professional Summary", lines: c.summary.map((b) => b.text) },
    ...c.projects.map((p) => ({ key: p.id, heading: `${p.client} — ${p.title}`, lines: [...p.bullets.map((b) => b.text), `Environment: ${p.technologies.join(", ")}`] })),
    { key: "skills", heading: "Technical Skills", lines: c.skills.map((r) => `${r.category}: ${r.values.join(", ")}`) },
  ];
}

export default async function Compare({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  try {
    await authorizeResume(user, id, "read");
  } catch (e) {
    if (e instanceof AccessDenied) return <Denied />;
    throw e;
  }
  const [a, b] = await Promise.all([
    prisma.resumeVersion.findFirstOrThrow({ where: { id: sp.a, resumeId: id } }),
    prisma.resumeVersion.findFirstOrThrow({ where: { id: sp.b, resumeId: id } }),
  ]);
  const left = sectionLines(ResumeContent.parse(a.content));
  const right = sectionLines(ResumeContent.parse(b.content));
  const keys = [...new Set([...left.map((s) => s.key), ...right.map((s) => s.key)])];
  let changes = 0;
  return (
    <>
      <div className="pagehead">
        <div><h1>Compare v{a.version} → v{b.version}</h1><p>Removed lines are struck through; added lines are highlighted.</p></div>
        <Link className="btn" href={`/resumes/${id}?v=${b.id}`}>Back to v{b.version}</Link>
      </div>
      {keys.map((k) => {
        const l = left.find((s) => s.key === k);
        const r = right.find((s) => s.key === k);
        const lset = new Set(l?.lines ?? []);
        const rset = new Set(r?.lines ?? []);
        const removed = (l?.lines ?? []).filter((x) => !rset.has(x));
        const added = (r?.lines ?? []).filter((x) => !lset.has(x));
        changes += removed.length + added.length;
        if (!removed.length && !added.length) return null;
        return (
          <section className="card" key={k}>
            <h3>{(r ?? l)!.heading}</h3>
            <div className="compare">
              <div><div className="small muted">v{a.version}</div>{removed.map((x, i) => <p key={i}><span className="diff-del">{x}</span></p>)}</div>
              <div><div className="small muted">v{b.version}</div>{added.map((x, i) => <p key={i}><span className="diff-add">{x}</span></p>)}</div>
            </div>
          </section>
        );
      })}
      {changes === 0 && <div className="card muted">No content differences.</div>}
    </>
  );
}
