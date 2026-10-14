import { DOMAINS, ROLES } from "@/data/domains";

type C = { fullName?: string; email?: string | null; phone?: string | null; location?: string | null; linkedin?: string | null; targetRole?: string | null; targetTitle?: string | null; domainKey?: string | null; consentObtainedAt?: Date | null };

export function CandidateFields({ c = {} }: { c?: C }) {
  return (
    <>
      <div className="row">
        <div><label htmlFor="fullName">Full name *</label><input id="fullName" name="fullName" type="text" required defaultValue={c.fullName ?? ""} /></div>
        <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={c.email ?? ""} /></div>
        <div><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="text" defaultValue={c.phone ?? ""} /></div>
      </div>
      <div className="row">
        <div><label htmlFor="location">Location</label><input id="location" name="location" type="text" defaultValue={c.location ?? ""} /></div>
        <div><label htmlFor="linkedin">LinkedIn</label><input id="linkedin" name="linkedin" type="text" defaultValue={c.linkedin ?? ""} /></div>
      </div>
      <div className="row">
        <div>
          <label htmlFor="domainKey">Primary domain</label>
          <select id="domainKey" name="domainKey" defaultValue={c.domainKey ?? ""}>
            <option value="">—</option>
            {DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="targetRole">Target role</label>
          <select id="targetRole" name="targetRole" defaultValue={c.targetRole ?? ""}>
            <option value="">—</option>
            {ROLES.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
          </select>
        </div>
        <div><label htmlFor="targetTitle">Target job title</label><input id="targetTitle" name="targetTitle" type="text" defaultValue={c.targetTitle ?? ""} /></div>
      </div>
      <label className="check">
        <input type="checkbox" name="consent" defaultChecked={Boolean(c.consentObtainedAt)} />
        Candidate has been informed and consented to processing of their data{c.consentObtainedAt ? ` (recorded ${c.consentObtainedAt.toISOString().slice(0, 10)})` : ""}
      </label>
    </>
  );
}
