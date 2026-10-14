import { CandidateFields } from "@/components/CandidateFields";
import { Flash } from "@/components/Flash";
import { requireUser } from "@/lib/server/auth";
import { createCandidate } from "../actions";

export default async function NewCandidate({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireUser(["ADMIN", "CREATOR"]);
  return (
    <>
      <div className="pagehead"><div><h1>New candidate</h1><p>Start with contact details; add verified employment next.</p></div></div>
      <Flash searchParams={await searchParams} />
      <form action={createCandidate} className="card">
        <CandidateFields />
        <div className="actions" style={{ marginTop: 16 }}><button className="btn primary" type="submit">Create candidate</button></div>
      </form>
    </>
  );
}
