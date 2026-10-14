"use client";
// Section editor for a resume version. Edits are local until "Save as new version", which creates a
// new immutable version (the version being edited — even an approved one — is never overwritten).
import { useMemo, useState } from "react";
import type { Bullet, ResumeContent } from "@/lib/resume-schema";

type Issue = { code: string; severity: "critical" | "warning" | "info"; message: string; ref?: string };

let counter = 0;
const newId = () => `b_new_${Date.now().toString(36)}_${(counter++).toString(36)}`;

function blankBullet(section: "SUMMARY" | "PROJECT", projectId: string | null): Bullet {
  return {
    id: newId(),
    section,
    projectId,
    type: section === "SUMMARY" ? "PRIMARY" : "PROJECT",
    text: "",
    action: null,
    domainConcept: null,
    technologyRefs: [],
    evidenceRefs: ["user-entered"],
    jdKeywordRefs: [],
    confidence: "medium",
    requiresConfirmation: true,
    confirmed: false,
    source: "USER_EDIT",
  };
}

export function ResumeEditor({
  initial,
  issues,
  saveAction,
  resumeId,
  versionId,
  readOnly,
}: {
  initial: ResumeContent;
  issues: Issue[];
  saveAction: (form: FormData) => void | Promise<void>;
  resumeId: string;
  versionId: string;
  readOnly: boolean;
}) {
  const [content, setContent] = useState<ResumeContent>(initial);
  const [dirty, setDirty] = useState(false);
  const byRef = useMemo(() => {
    const m = new Map<string, Issue[]>();
    for (const i of issues) if (i.ref) m.set(i.ref, [...(m.get(i.ref) ?? []), i]);
    return m;
  }, [issues]);

  const update = (fn: (c: ResumeContent) => void) => {
    setContent((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
  };

  const listFor = (c: ResumeContent, projectId: string | null): Bullet[] => (projectId ? c.projects.find((p) => p.id === projectId)!.bullets : c.summary);

  // Rendered via a plain function call (not a nested component) so inputs keep focus while typing.
  const renderBulletList = (projectId: string | null) => {
    const list = listFor(content, projectId);
    return (
      <div>
        {list.map((b, idx) => {
          const own = byRef.get(b.id) ?? [];
          const flagged = own.some((i) => i.severity === "critical" && i.code !== "NEEDS_CONFIRMATION");
          const needs = b.requiresConfirmation && !b.confirmed;
          return (
            <div key={b.id} className={`bullet-row${flagged ? " flagged" : needs ? " needs" : ""}`}>
              <div>
                <textarea
                  aria-label="Bullet text"
                  value={b.text}
                  readOnly={readOnly}
                  onChange={(e) => update((c) => { listFor(c, projectId)[idx].text = e.target.value; })}
                />
                <div className="meta-line small">
                  <span className="badge neutral" title="Where this wording came from">{b.source.replace("_", " ").toLowerCase()}</span>
                  <span className="badge neutral">{b.type.replace("_", " ").toLowerCase()}</span>
                  {b.technologyRefs.length > 0 && <span className="muted">tools: {b.technologyRefs.join(", ")}</span>}
                  {b.jdKeywordRefs.length > 0 && <span className="badge info">JD: {b.jdKeywordRefs.join(", ")}</span>}
                  {b.evidenceRefs.length > 0 && <span className="muted mono" title={b.evidenceRefs.join("\n")}>evidence: {b.evidenceRefs.length}</span>}
                  {b.requiresConfirmation && (
                    <label className="check" style={{ margin: 0 }}>
                      <input type="checkbox" checked={b.confirmed} disabled={readOnly} onChange={(e) => update((c) => { listFor(c, projectId)[idx].confirmed = e.target.checked; })} />
                      candidate confirms this is accurate
                    </label>
                  )}
                </div>
                {own.map((i, k) => (
                  <div key={k} className={`small ${i.severity === "critical" ? "" : "muted"}`} style={{ color: i.severity === "critical" ? "var(--bad)" : undefined }}>
                    {i.severity}: {i.message}
                  </div>
                ))}
              </div>
              {!readOnly && (
                <div className="actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
                  <button type="button" className="btn small" aria-label="Move up" disabled={idx === 0} onClick={() => update((c) => { const l = listFor(c, projectId); [l[idx - 1], l[idx]] = [l[idx], l[idx - 1]]; })}>↑</button>
                  <button type="button" className="btn small" aria-label="Move down" disabled={idx === list.length - 1} onClick={() => update((c) => { const l = listFor(c, projectId); [l[idx + 1], l[idx]] = [l[idx], l[idx + 1]]; })}>↓</button>
                  <button type="button" className="btn small danger" aria-label="Delete bullet" onClick={() => update((c) => { listFor(c, projectId).splice(idx, 1); })}>✕</button>
                </div>
              )}
            </div>
          );
        })}
        {!readOnly && (
          <div className="actions">
            <button type="button" className="btn small" onClick={() => update((c) => { listFor(c, projectId).push(blankBullet(projectId ? "PROJECT" : "SUMMARY", projectId)); })}>+ Add bullet</button>
            {list.some((b) => b.requiresConfirmation && !b.confirmed) && (
              <button type="button" className="btn small" onClick={() => update((c) => { for (const b of listFor(c, projectId)) if (b.requiresConfirmation) b.confirmed = true; })}>
                Confirm all in this section
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const empties = [...content.summary, ...content.projects.flatMap((p) => p.bullets)].filter((b) => !b.text.trim()).length;

  return (
    <form action={saveAction}>
      <input type="hidden" name="resumeId" value={resumeId} />
      <input type="hidden" name="parentVersionId" value={versionId} />
      <input type="hidden" name="content" value={JSON.stringify({ ...content, summary: content.summary.filter((b) => b.text.trim()), projects: content.projects.map((p) => ({ ...p, bullets: p.bullets.filter((b) => b.text.trim()) })) })} />

      <section className="card">
        <h2>Header</h2>
        <div className="row">
          {(["fullName", "title", "email", "phone", "location", "linkedin"] as const).map((k) => (
            <div key={k}>
              <label htmlFor={`h-${k}`}>{k === "fullName" ? "Name" : k[0].toUpperCase() + k.slice(1)}</label>
              <input id={`h-${k}`} type="text" readOnly={readOnly} value={content.header[k] ?? ""} onChange={(e) => update((c) => { (c.header as Record<string, string | null>)[k] = e.target.value || (k === "fullName" || k === "title" ? "" : null); })} />
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Professional Summary</h2>
        {renderBulletList(null)}
      </section>

      {content.projects.map((p) => (
        <section className="card" key={p.id}>
          <h2>{p.client}{p.location ? `, ${p.location}` : ""}</h2>
          <p className="small muted">
            {p.title} · {p.role} · {p.startDate} → {p.endDate ?? "current"} · client{" "}
            <span className={`badge ${p.clientVerification === "VERIFIED" ? "ok" : p.clientVerification === "UNVERIFIED" ? "warn" : "info"}`}>{p.clientVerification.replace("_", " ").toLowerCase()}</span>
            {!p.clientConfirmed && <span className="badge bad"> relationship not confirmed</span>}
          </p>
          {(byRef.get(p.id) ?? []).map((i, k) => <div key={k} className="small" style={{ color: i.severity === "critical" ? "var(--bad)" : "var(--muted)" }}>{i.severity}: {i.message}</div>)}
          {renderBulletList(p.id)}
          <p className="small muted">Environment: {p.technologies.join(", ") || "—"} <span className="hint">(edit technologies on the candidate profile, then regenerate)</span></p>
        </section>
      ))}

      <section className="card">
        <h2>Technical Skills</h2>
        {content.skills.map((row, idx) => (
          <div className="row" key={idx}>
            <div className="shrink" style={{ width: 220 }}>
              <input type="text" aria-label="Skill category" readOnly={readOnly} value={row.category} onChange={(e) => update((c) => { c.skills[idx].category = e.target.value; })} />
            </div>
            <div>
              <input type="text" aria-label={`${row.category} values`} readOnly={readOnly} value={row.values.join(", ")} onChange={(e) => update((c) => { c.skills[idx].values = e.target.value.split(",").map((v) => v.trim()).filter(Boolean); })} />
              {(byRef.get(row.category) ?? []).map((i, k) => <div key={k} className="small" style={{ color: "var(--bad)" }}>{i.message}</div>)}
            </div>
            {!readOnly && <div className="shrink"><button type="button" className="btn small danger" onClick={() => update((c) => { c.skills.splice(idx, 1); })}>Remove</button></div>}
          </div>
        ))}
        {!readOnly && <button type="button" className="btn small" style={{ marginTop: 8 }} onClick={() => update((c) => { c.skills.push({ category: "New category", values: [] }); })}>+ Add row</button>}
      </section>

      {!readOnly && (
        <div className="card" style={{ position: "sticky", bottom: 0, zIndex: 2 }}>
          <div className="row">
            <div><label htmlFor="changeNote">Change note</label><input id="changeNote" name="changeNote" type="text" placeholder="What changed and why" /></div>
            <div className="shrink"><button className="btn primary" type="submit" disabled={!dirty}>Save as new version</button></div>
          </div>
          {empties > 0 && <p className="hint">{empties} empty bullet(s) will be dropped on save.</p>}
          {dirty && <p className="hint">Unsaved changes. Saving creates a new draft version and re-runs all checks; earlier versions stay recoverable.</p>}
        </div>
      )}
    </form>
  );
}
