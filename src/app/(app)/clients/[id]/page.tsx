import { Denied } from "@/components/Denied";
import { Flash } from "@/components/Flash";
import { TechPicker } from "@/components/TechPicker";
import { DOMAINS } from "@/data/domains";
import { fmtDateTime } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { techOptions } from "@/lib/server/lookups";
import { can } from "@/lib/server/permissions";
import { saveClient } from "../actions";

export default async function ClientPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const { id } = await params;
  const isNew = id === "new";
  if (isNew && !can(user, "library:edit")) return <Denied />;
  const [client, techs] = await Promise.all([
    isNew ? null : prisma.client.findUnique({ where: { id }, include: { domain: true, technologies: { include: { technology: true } }, usages: { orderBy: { createdAt: "desc" }, take: 20 } } }),
    techOptions(),
  ]);
  if (!isNew && !client) return <div className="card">Client not found.</div>;
  const editable = can(user, "library:edit");
  return (
    <>
      <div className="pagehead"><div><h1>{client?.name ?? "New client"}</h1><p>Technology associations must be backed by evidence; they describe the organization, not any candidate.</p></div></div>
      <Flash searchParams={await searchParams} />
      <form action={saveClient} className="card">
        {client && <input type="hidden" name="id" value={client.id} />}
        <fieldset disabled={!editable} style={{ border: 0, padding: 0, margin: 0 }}>
          <div className="row">
            <div><label>Name *</label><input name="name" type="text" required defaultValue={client?.name ?? ""} /></div>
            <div><label>Domain *</label><select name="domainKey" defaultValue={client?.domain.key ?? "BANKING"}>{DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}</select></div>
            <div><label>Subdomain</label><input name="subdomain" type="text" defaultValue={client?.subdomain ?? ""} /></div>
            <div><label>Market</label><input name="market" type="text" defaultValue={client?.market ?? ""} /></div>
          </div>
          <div className="row">
            <div>
              <label>Verification status</label>
              <select name="verificationStatus" defaultValue={client?.verificationStatus ?? "UNVERIFIED"}>
                <option value="UNVERIFIED">Unverified (blocked from approved exports)</option>
                <option value="CANDIDATE_CONFIRMED">Candidate confirmed</option>
                <option value="VERIFIED">Verified</option>
              </select>
            </div>
            <div><label>Evidence / source</label><input name="evidence" type="text" defaultValue={client?.evidence ?? ""} placeholder="Required for Verified" /></div>
          </div>
          <label className="check"><input type="checkbox" name="active" defaultChecked={client?.active ?? true} /> Active</label>
          <label className="check"><input type="checkbox" name="isDemo" defaultChecked={client?.isDemo ?? false} /> Fictional/demo organization (only for clearly marked sample outputs)</label>
          <label>Verified technology associations</label>
          <TechPicker techs={techs} selected={new Set(client?.technologies.map((t) => t.technologyId) ?? [])} />
          {editable && <button className="btn primary" type="submit" style={{ marginTop: 12 }}>Save client</button>}
        </fieldset>
      </form>
      {client && (
        <section className="card">
          <h2>Usage history</h2>
          <p className="small">Used in {client.usageCount} generated resume(s){client.verifiedAt ? ` · verified ${fmtDateTime(client.verifiedAt)}` : ""}.</p>
          <ul className="small">{client.usages.map((u) => <li key={u.id}>{fmtDateTime(u.createdAt)} · resume {u.resumeId.slice(-8)}</li>)}</ul>
        </section>
      )}
    </>
  );
}
