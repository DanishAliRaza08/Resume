import { StatusBadge } from "@/components/Badges";
import { Flash } from "@/components/Flash";
import { fmtDateTime } from "@/lib/format";
import { aiConfigured, AI_MODEL } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/auth";
import { getSettings } from "@/lib/server/catalog";
import { prisma } from "@/lib/server/db";
import { createUser, saveSettings, updateUser } from "./actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const admin = await requireUser(["ADMIN"]);
  const sp = await searchParams;
  const [users, settings, events, dueForRetention] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getSettings(),
    prisma.auditEvent.findMany({
      where: {
        ...(sp.action ? { action: { contains: sp.action } } : {}),
        ...(sp.outcome ? { outcome: sp.outcome } : {}),
        ...(sp.record ? { recordType: sp.record } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { actor: { select: { email: true } } },
    }),
    prisma.candidate.count({ where: { retentionUntil: { lt: new Date() } } }),
  ]);
  return (
    <>
      <div className="pagehead"><div><h1>Administration</h1><p>Users, roles, settings and the audit trail.</p></div></div>
      <Flash searchParams={sp} />
      <section className="card">
        <h2>Users</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}<div className="small muted">{u.email}</div></td>
                  <td>
                    <form action={updateUser} className="actions">
                      <input type="hidden" name="userId" value={u.id} /><input type="hidden" name="op" value="role" />
                      <select name="role" defaultValue={u.role} aria-label={`Role for ${u.email}`} disabled={u.id === admin.id}>{["ADMIN", "CREATOR", "REVIEWER", "READONLY"].map((r) => <option key={r} value={r}>{r.toLowerCase()}</option>)}</select>
                      {u.id !== admin.id && <button className="btn small" type="submit">Set</button>}
                    </form>
                  </td>
                  <td><StatusBadge value={u.status === "ACTIVE" ? "SUCCEEDED" : "FAILED"} /> <span className="small">{u.status.toLowerCase()}</span></td>
                  <td className="actions">
                    {u.id !== admin.id && (
                      <form action={updateUser}><input type="hidden" name="userId" value={u.id} /><input type="hidden" name="op" value="toggle" /><button className="btn small" type="submit">{u.status === "ACTIVE" ? "Disable" : "Enable"}</button></form>
                    )}
                    <form action={updateUser}><input type="hidden" name="userId" value={u.id} /><input type="hidden" name="op" value="reset" /><button className="btn small" type="submit">Reset link</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form action={createUser} className="row" style={{ marginTop: 12 }}>
          <div><label>Email</label><input name="email" type="email" required /></div>
          <div><label>Name</label><input name="name" type="text" /></div>
          <div><label>Role</label><select name="role" defaultValue="CREATOR"><option value="CREATOR">creator</option><option value="REVIEWER">reviewer</option><option value="READONLY">read-only</option><option value="ADMIN">admin</option></select></div>
          <div className="shrink"><button className="btn primary" type="submit">Invite user</button></div>
        </form>
      </section>

      <section className="card">
        <h2>Settings</h2>
        <form action={saveSettings}>
          <div className="row">
            <div><label>Retention period (days)</label><input name="retentionDays" type="number" min={30} defaultValue={settings.retentionDays} /></div>
            <div><label>Maximum page preset</label><input name="maxPages" type="number" min={1} max={6} defaultValue={settings.maxPages} /></div>
            <div><label>Default page target</label><input name="defaultPageTarget" type="number" min={1} max={6} defaultValue={settings.defaultPageTarget} /></div>
            <div><label>Default project mode</label><select name="defaultProjectMode" defaultValue={settings.defaultProjectMode}><option value="FULL_DETAIL">Full-detail</option><option value="STANDARD">Standard</option><option value="CONCISE">Concise</option></select></div>
          </div>
          <label className="check"><input type="checkbox" name="blockUnverifiedClientsOnApproval" defaultChecked={settings.blockUnverifiedClientsOnApproval} /> Block approval when a project client is unverified in the library</label>
          <label className="check"><input type="checkbox" name="aiEnabled" defaultChecked={settings.aiEnabled} /> Enable AI wording polish ({aiConfigured() ? `model ${AI_MODEL}` : "ANTHROPIC_API_KEY not set — deterministic generation only"})</label>
          <button className="btn primary" type="submit">Save settings</button>
        </form>
        <p className="small muted">{dueForRetention} candidate record(s) are past their retention review date. Review them from the Candidates list; deletion removes exports and is audited.</p>
      </section>

      <section className="card">
        <h2>Audit trail</h2>
        <form className="row" style={{ marginBottom: 8 }}>
          <div><label>Action contains</label><input name="action" type="text" defaultValue={sp.action ?? ""} /></div>
          <div><label>Record type</label><input name="record" type="text" defaultValue={sp.record ?? ""} placeholder="Candidate, ResumeVersion…" /></div>
          <div><label>Outcome</label><select name="outcome" defaultValue={sp.outcome ?? ""}><option value="">Any</option><option>SUCCESS</option><option>DENIED</option><option>FAILURE</option></select></div>
          <div className="shrink"><button className="btn" type="submit">Search</button></div>
        </form>
        <div className="table-wrap">
          <table className="small">
            <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Record</th><th>Outcome</th></tr></thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="muted">{fmtDateTime(e.createdAt)}</td>
                  <td>{e.actor?.email ?? "—"}</td>
                  <td className="mono">{e.action}</td>
                  <td className="mono">{e.recordType}{e.recordId ? `:${e.recordId.slice(-8)}` : ""}</td>
                  <td><StatusBadge value={e.outcome} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
