import { randomUUID } from "node:crypto";
import Link from "next/link";
import { Flash } from "@/components/Flash";
import { ProjectForm } from "@/components/ProjectForm";
import { StatusBadge } from "@/components/Badges";
import { DOMAINS, ROLES, SENIORITY_LEVELS } from "@/data/domains";
import { RESUME_TEMPLATES } from "@/lib/export";
import { fmtDate } from "@/lib/format";
import { aiConfigured } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/auth";
import { getSettings } from "@/lib/server/catalog";
import { prisma } from "@/lib/server/db";
import { techOptions, templateOptions } from "@/lib/server/lookups";
import { authorizeCandidate, candidateScope } from "@/lib/server/permissions";
import { analyzeTimeline, formatDuration, toDate, totalExperienceMonths } from "@/lib/timeline";
import { generate } from "./actions";

const STEPS = ["Candidate", "Target role", "Projects", "Format", "Review & generate"];

export default async function NewResumeWizard({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser(["ADMIN", "CREATOR"]);
  const sp = await searchParams;
  const step = Math.min(5, Math.max(1, Number(sp.step ?? "1")));
  const settings = await getSettings();
  const state = {
    candidateId: sp.candidateId ?? "",
    domainKey: sp.domainKey ?? "",
    roleKey: sp.roleKey ?? "",
    seniority: sp.seniority ?? "Senior",
    targetTitle: sp.targetTitle ?? "",
    mode: sp.mode ?? settings.defaultProjectMode,
    pageTarget: sp.pageTarget ?? String(settings.defaultPageTarget),
    templateKey: sp.templateKey ?? "classic",
    includeHighlights: sp.includeHighlights ?? "",
    useAi: sp.useAi ?? "",
  };
  const qs = (patch: Record<string, string | number>) => `/resumes/new?${new URLSearchParams({ ...state, ...Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, String(v)])) }).toString()}`;
  const Hidden = ({ omit = [] }: { omit?: string[] }) => (
    <>{Object.entries(state).filter(([k]) => !omit.includes(k)).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}</>
  );

  const candidate = state.candidateId ? await authorizeCandidate(user, state.candidateId, "write").catch(() => null) : null;
  const effectiveStep = !candidate ? 1 : step;

  return (
    <>
      <div className="pagehead"><div><h1>Create new resume</h1><p>Guided wizard — drafts use only verified candidate facts and confirmed technologies.</p></div></div>
      <ol className="steps" aria-label="Wizard progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={effectiveStep === i + 1 ? "step" : undefined} className={effectiveStep > i + 1 ? "done" : undefined}>{i + 1}. {s}</li>
        ))}
      </ol>
      <Flash searchParams={sp} />
      {effectiveStep === 1 && <StepCandidate userScope={candidateScope(user)} />}
      {candidate && effectiveStep === 2 && (
        <form className="card" action="/resumes/new" method="get">
          <Hidden omit={["domainKey", "roleKey", "seniority", "targetTitle"]} />
          <input type="hidden" name="step" value="3" />
          <h2>Target role for {candidate.fullName}</h2>
          <div className="row">
            <div>
              <label htmlFor="domainKey">Domain *</label>
              <select id="domainKey" name="domainKey" required defaultValue={state.domainKey || candidate.domainKey || ""}>
                <option value="" disabled>Select…</option>
                {DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="roleKey">Role *</label>
              <select id="roleKey" name="roleKey" required defaultValue={state.roleKey || candidate.targetRole || ""}>
                <option value="" disabled>Select…</option>
                {ROLES.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="seniority">Seniority</label>
              <select id="seniority" name="seniority" defaultValue={state.seniority}>{SENIORITY_LEVELS.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
          </div>
          <label htmlFor="targetTitle">Target job title <span className="hint">(shown under the name)</span></label>
          <input id="targetTitle" name="targetTitle" type="text" defaultValue={state.targetTitle || candidate.targetTitle || ""} />
          <div className="actions" style={{ marginTop: 16 }}>
            <Link className="btn" href={qs({ step: 1 })}>Back</Link>
            <button className="btn primary" type="submit">Next: projects</button>
          </div>
        </form>
      )}
      {candidate && effectiveStep === 3 && <StepProjects candidateId={candidate.id} state={state} qs={qs} />}
      {candidate && effectiveStep === 4 && (
        <form className="card" action="/resumes/new" method="get">
          <Hidden omit={["mode", "pageTarget", "templateKey", "includeHighlights", "useAi"]} />
          <input type="hidden" name="step" value="5" />
          <h2>Format</h2>
          <div className="row">
            <div>
              <label htmlFor="templateKey">Resume template</label>
              <select id="templateKey" name="templateKey" defaultValue={state.templateKey}>
                {Object.entries(RESUME_TEMPLATES).map(([k, t]) => <option key={k} value={k}>{t.name} — {t.description}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pageTarget">Requested page count</label>
              <select id="pageTarget" name="pageTarget" defaultValue={state.pageTarget}>
                {Array.from({ length: settings.maxPages }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} page{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="mode">Project detail</label>
              <select id="mode" name="mode" defaultValue={state.mode}>
                <option value="FULL_DETAIL">Full-detail (3 domain · 8 project · 2 tool · 1 QA)</option>
                <option value="STANDARD">Standard (2 · 5 · 1 · 1)</option>
                <option value="CONCISE">Concise (1 · 3 · 1 · 0)</option>
              </select>
            </div>
          </div>
          <p className="hint">Page counts are estimated before export and measured on the rendered file; the system never promises an exact count in advance.</p>
          <label className="check"><input type="checkbox" name="includeHighlights" defaultChecked={state.includeHighlights === "on"} /> Add 6–8 project highlights to the summary (uses only candidate-supplied outcomes)</label>
          <label className="check">
            <input type="checkbox" name="useAi" defaultChecked={state.useAi === "on"} disabled={!aiConfigured() || !settings.aiEnabled} /> Polish template wording with AI{" "}
            <span className="hint">{aiConfigured() && settings.aiEnabled ? "(rewrites are re-checked; no new tools, numbers or employers are allowed)" : "(not configured — set ANTHROPIC_API_KEY and enable in Administration)"}</span>
          </label>
          <div className="actions" style={{ marginTop: 16 }}>
            <Link className="btn" href={qs({ step: 3 })}>Back</Link>
            <button className="btn primary" type="submit">Next: review</button>
          </div>
        </form>
      )}
      {candidate && effectiveStep === 5 && <StepReview candidateId={candidate.id} state={state} qs={qs} />}
    </>
  );

  async function StepReview({ candidateId, state, qs }: { candidateId: string; state: Record<string, string>; qs: (p: Record<string, string | number>) => string }) {
    const c = await prisma.candidate.findUniqueOrThrow({
      where: { id: candidateId },
      include: { employments: true, projects: { include: { technologies: { include: { technology: true } }, employment: true, template: true }, orderBy: { position: "asc" } } },
    });
    const issues: { severity: string; message: string }[] = [];
    if (!state.domainKey || !state.roleKey) issues.push({ severity: "critical", message: "Choose a domain and role (step 2)." });
    if (c.projects.length === 0) issues.push({ severity: "critical", message: "No projects configured (step 3)." });
    for (const p of c.projects.slice(0, 5)) {
      if (!p.employmentId) issues.push({ severity: "critical", message: `Project ${p.position} is not linked to a verified employer.` });
      else if (!p.clientConfirmed) issues.push({ severity: "critical", message: `Project ${p.position}: client relationship not confirmed by the candidate.` });
      if (!p.templateId && p.responsibilities.length === 0) issues.push({ severity: "warning", message: `Project ${p.position} has no template and no candidate responsibilities — it will be very thin.` });
      const unconfirmed = p.technologies.filter((t) => !t.confirmed);
      if (unconfirmed.length) issues.push({ severity: "warning", message: `Project ${p.position}: ${unconfirmed.length} technologies not confirmed; they will be excluded.` });
      if (p.templateId && p.template && p.domainKey !== state.domainKey) issues.push({ severity: "info", message: `Project ${p.position} is in ${p.domainKey}, different from the target domain.` });
    }
    if (c.projects.length > 0 && c.projects.length !== 5) issues.push({ severity: "info", message: `${c.projects.length} project(s) configured; the standard format uses five. Never pad with invented projects.` });
    const intervals = c.employments.map((e) => ({ start: toDate(e.startDate), end: e.endDate ? toDate(e.endDate) : null, label: e.employer }));
    for (const w of analyzeTimeline(intervals)) issues.push({ severity: w.severity, message: w.message });
    const blocking = issues.some((i) => i.severity === "critical" && /domain|No projects/.test(i.message));
    const idempotencyKey = randomUUID();
    return (
      <form className="card" action={generate}>
        <Hidden />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <h2>Review</h2>
        <p>
          <strong>{c.fullName}</strong> · {DOMAINS.find((d) => d.key === state.domainKey)?.name ?? "—"} · {ROLES.find((r) => r.key === state.roleKey)?.name ?? "—"} · {state.seniority} · verified experience {formatDuration(totalExperienceMonths(intervals))}
        </p>
        <p className="small muted">Template {state.templateKey} · target {state.pageTarget} page(s) · {state.mode.toLowerCase().replace("_", "-")} detail{state.useAi === "on" ? " · AI polish" : ""}</p>
        <h3>Projects to include</h3>
        <ul className="clean stack">
          {c.projects.map((p, i) => (
            <li key={p.id}>
              <label className="check">
                <input type="checkbox" name="projectId" value={p.id} defaultChecked={i < 5} />
                <span>
                  <strong>P{p.position}</strong> {p.title} — {p.employment?.employer ?? <em>no employer</em>} ({fmtDate(p.startDate)} → {p.endDate ? fmtDate(p.endDate) : "current"}) · {p.technologies.filter((t) => t.confirmed).length} confirmed tools{p.template ? ` · ${p.template.name}` : ""}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {issues.length > 0 && (
          <>
            <h3>Missing facts and incompatible selections</h3>
            <ul className="issues">{issues.map((i, k) => <li key={k}><StatusBadge value={i.severity} /> {i.message}</li>)}</ul>
            <p className="hint">Critical project issues do not stop drafting, but they block approval until resolved.</p>
          </>
        )}
        <div className="actions" style={{ marginTop: 16 }}>
          <Link className="btn" href={qs({ step: 4 })}>Back</Link>
          <button className="btn primary" type="submit" disabled={blocking}>Generate draft</button>
        </div>
      </form>
    );
  }
}

async function StepCandidate({ userScope }: { userScope: object }) {
  const candidates = await prisma.candidate.findMany({ where: userScope, orderBy: { updatedAt: "desc" }, take: 100, include: { _count: { select: { employments: true, projects: true } } } });
  return (
    <div className="grid cols-2">
      <form className="card" action="/resumes/new" method="get">
        <input type="hidden" name="step" value="2" />
        <h2>Select an existing candidate</h2>
        <label htmlFor="candidateId">Candidate</label>
        <select id="candidateId" name="candidateId" required defaultValue="">
          <option value="" disabled>Select…</option>
          {candidates.map((c) => <option key={c.id} value={c.id}>{c.fullName} ({c._count.employments} jobs, {c._count.projects} projects)</option>)}
        </select>
        <div className="actions" style={{ marginTop: 16 }}><button className="btn primary" type="submit">Next: target role</button></div>
      </form>
      <div className="card">
        <h2>Or create a new candidate</h2>
        <p className="muted">Add the profile and verified employment first, then return here.</p>
        <Link className="btn" href="/candidates/new">New candidate</Link>
      </div>
    </div>
  );
}

async function StepProjects({ candidateId, state, qs }: { candidateId: string; state: Record<string, string>; qs: (p: Record<string, string | number>) => string }) {
  const [c, techs, templates] = await Promise.all([
    prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, include: { employments: { orderBy: { startDate: "desc" } }, projects: { include: { technologies: true }, orderBy: { position: "asc" } } } }),
    techOptions(),
    templateOptions(),
  ]);
  const back = qs({ step: 3 });
  const { proposeProjects } = await import("../../candidates/actions");
  return (
    <>
      <div className="card">
        <h2>Five-project configuration</h2>
        <p className="muted">Each project must sit inside a verified employment record. Templates supply phrasing only; every template bullet must be confirmed before approval. Changes save per project card.</p>
        {c.employments.length === 0 && <div className="notice warn">No verified employment yet. <Link href={`/candidates/${candidateId}`}>Add employment on the candidate profile</Link> first.</div>}
        {c.projects.length === 0 && c.employments.length > 0 && (
          <form action={proposeProjects} className="row">
            <input type="hidden" name="candidateId" value={candidateId} />
            <input type="hidden" name="returnTo" value={back} />
            <input type="hidden" name="domainKey" value={state.domainKey} />
            <div><p>Propose five project shells from the default timeline (P1 2 yrs 3 mos, P2 2 yrs, P5 7 mos; P3/P4 share the rest).</p></div>
            <div className="shrink"><button className="btn" type="submit">Propose five projects</button></div>
          </form>
        )}
      </div>
      {c.projects.map((p) => (
        <ProjectForm key={p.id} candidateId={candidateId} project={p} position={p.position} employments={c.employments} templates={templates} techs={techs} returnTo={`${back}#project-${p.id}`} />
      ))}
      {c.projects.length < 5 && <ProjectForm candidateId={candidateId} position={c.projects.length + 1} employments={c.employments} templates={templates} techs={techs} returnTo={back} defaultDomain={state.domainKey} />}
      <div className="actions">
        <Link className="btn" href={qs({ step: 2 })}>Back</Link>
        <Link className="btn primary" href={qs({ step: 4 })}>Next: format</Link>
      </div>
    </>
  );
}
