import Link from "next/link";
import { Flash } from "@/components/Flash";
import { DOMAINS, ROLES } from "@/data/domains";
import { fmtDateTime } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { deleteSample } from "./actions";

export const metadata = { title: "Resume library" };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const samples = await prisma.resumeSample.findMany({ orderBy: { createdAt: "desc" }, take: 200, select: { id: true, domainKey: true, roleKey: true, sourceName: true, bulletCount: true, createdAt: true, createdById: true } });
  const name = (list: { key: string; name: string }[], key: string) => list.find((x) => x.key === key)?.name ?? key;
  const total = samples.reduce((n, s) => n + s.bulletCount, 0);
  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Resume library</h1>
          <p>Wording saved from resumes uploaded in “Tailor Existing Resume”. New resumes for the same industry and role can suggest these lines when they mention the tools you picked.</p>
        </div>
        <Link className="btn primary" href="/update">Upload a resume</Link>
      </div>
      <Flash searchParams={await searchParams} />
      <div className="card">
        <p><strong>{samples.length}</strong> resume(s) · <strong>{total}</strong> saved line(s)</p>
        <p className="hint">Names, contact details, company names and any line with numbers are removed before saving. Suggested lines always need your confirmation before a resume can be finalized.</p>
      </div>
      {samples.length > 0 && (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>File</th><th>Industry</th><th>Role</th><th>Lines</th><th>Saved</th><th /></tr></thead>
            <tbody>
              {samples.map((s) => (
                <tr key={s.id}>
                  <td>{s.sourceName}</td>
                  <td>{name(DOMAINS, s.domainKey)}</td>
                  <td>{name(ROLES, s.roleKey)}</td>
                  <td>{s.bulletCount}</td>
                  <td className="small">{fmtDateTime(s.createdAt)}</td>
                  <td>
                    {(user.role === "ADMIN" || s.createdById === user.id) && (
                      <form action={deleteSample}><input type="hidden" name="sampleId" value={s.id} /><button className="btn small danger" type="submit">Remove</button></form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
