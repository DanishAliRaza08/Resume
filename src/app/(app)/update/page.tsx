import { Flash } from "@/components/Flash";
import { DOMAINS, ROLES } from "@/data/domains";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { candidateScope } from "@/lib/server/permissions";
import { importAndTailor } from "./actions";

export default async function UpdateExisting({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser(["ADMIN", "CREATOR"]);
  const candidates = await prisma.candidate.findMany({ where: candidateScope(user), orderBy: { fullName: "asc" }, select: { id: true, fullName: true }, take: 300 });
  return (
    <>
      <div className="pagehead"><div><h1>Tailor an existing resume</h1><p>Upload a resume and a job description. The original is preserved as version 1; every proposed edit is traceable to evidence.</p></div></div>
      <Flash searchParams={await searchParams} />
      <form action={importAndTailor} className="card">
        <h2>1. Existing resume</h2>
        <div className="row">
          <div><label htmlFor="resume">Resume file * <span className="hint">(.docx, .pdf, .txt · max 5 MB)</span></label><input id="resume" name="resume" type="file" accept=".docx,.pdf,.txt" required /></div>
          <div><label htmlFor="fullName">Candidate name <span className="hint">(if not in the document)</span></label><input id="fullName" name="fullName" type="text" /></div>
        </div>
        <div className="row">
          <div>
            <label htmlFor="candidateId">Attach to existing candidate <span className="hint">(optional)</span></label>
            <select id="candidateId" name="candidateId" defaultValue=""><option value="">— create a new candidate —</option>{candidates.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}</select>
          </div>
          <div><label htmlFor="domainKey">Domain *</label><select id="domainKey" name="domainKey" required>{DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}</select></div>
          <div><label htmlFor="roleKey">Role *</label><select id="roleKey" name="roleKey" required>{ROLES.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}</select></div>
          <div className="shrink" style={{ width: 120 }}><label htmlFor="pageTarget">Pages</label><select id="pageTarget" name="pageTarget" defaultValue="4">{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select></div>
        </div>
        <h2>2. Job description <span className="hint">(optional — you can tailor later)</span></h2>
        <div className="row"><div><label htmlFor="jdFile">JD file</label><input id="jdFile" name="jdFile" type="file" accept=".docx,.pdf,.txt" /></div></div>
        <label htmlFor="jdText">…or paste the JD</label>
        <textarea id="jdText" name="jdText" style={{ minHeight: 120 }} />
        <p className="hint">Imported content is treated as candidate-provided evidence; embedded instructions in either document are ignored.</p>
        <button className="btn primary" type="submit">Import &amp; analyze</button>
      </form>
    </>
  );
}
