import { strs } from "@/lib/json";
import { randomUUID } from "node:crypto";
import Link from "next/link";
import { Flash } from "@/components/Flash";
import { ProjectsEditor, type EditorProject } from "@/components/ProjectsEditor";
import { StatusBadge } from "@/components/Badges";
import { DOMAINS, ROLES, SENIORITY_LEVELS } from "@/data/domains";
import { getDesign } from "@/lib/designs";
import { fmtDate } from "@/lib/format";
import { aiConfigured } from "@/lib/server/ai";
import { requireUser } from "@/lib/server/auth";
import { getSettings } from "@/lib/server/catalog";
import { prisma } from "@/lib/server/db";
import { clientsByDomain, techOptions, templateOptions } from "@/lib/server/lookups";
import { authorizeCandidate, candidateScope } from "@/lib/server/permissions";
import { analyzeTimeline, formatDuration, suggestProjectDates, toDate, totalExperienceMonths } from "@/lib/timeline";
import { createCandidate } from "../../candidates/actions";
import { DesignPicker } from "@/components/DesignPicker";
import { generate } from "./actions";

const STEPS = ["Person", "Role & experience", "Projects", "Design", "Generate"];

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
    years: sp.years ?? "",
    count: sp.count ?? "5",
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
      <div className="pagehead"><div><h1>Create new resume</h1><p>Five quick steps: who it is for, role and experience, projects, design, generate.</p></div></div>
      <ol className="steps" aria-label="Wizard progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={effectiveStep === i + 1 ? "step" : undefined} className={effectiveStep > i + 1 ? "done" : undefined}>{i + 1}. {s}</li>
        ))}
      </ol>
      <Flash searchParams={sp} />
      {effectiveStep === 1 && <StepCandidate userScope={candidateScope(user)} />}
      {candidate && effectiveStep === 2 && (
        <form className="card" action="/resumes/new" method="get">
          <Hidden omit={["domainKey", "roleKey", "seniority", "targetTitle", "years", "count"]} />
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
          <input id="targetTitle" name="targetTitle" type="text" defaultValue={state.targetTitle || candidate.targetTitle || ""} placeholder="e.g. Senior Business Analyst" />
          <div className="row">
            <div>
              <label htmlFor="years">Total years of experience *</label>
              <input id="years" name="years" type="number" min={1} max={45} step={0.5} required defaultValue={state.years} placeholder="e.g. 10" />
            </div>
            <div>
              <label htmlFor="count">How many projects? *</label>
              <select id="count" name="count" defaultValue={state.count}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n} project{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>
          <p className="hint">The project dates on the next screen are filled in from these, so the resume adds up to the years you enter. You can change any date.</p>
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
          <h2>Choose a design</h2>
          <p className="muted small">All designs are single-column and ATS-friendly. You can switch design any time later.</p>
          <DesignPicker value={state.templateKey} />
          <h2>Length and detail</h2>
          <div className="row">
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
      if (!p.templateId && strs(p.responsibilities).length === 0) issues.push({ severity: "warning", message: `Project ${p.position} has no template and no candidate responsibilities — it will be very thin.` });
      const unconfirmed = p.technologies.filter((t) => !t.confirmed);
      if (unconfirmed.length) issues.push({ severity: "warning", message: `Project ${p.position}: ${unconfirmed.length} technologies not confirmed; they will be excluded.` });
      if (p.templateId && p.template && p.domainKey !== state.domainKey) issues.push({ severity: "info", message: `Project ${p.position} is in ${p.domainKey}, different from the target domain.` });
    }
    const statedYears = Number(state.years) || 0;
    const intervals = c.employments.map((e) => ({ start: toDate(e.startDate), end: e.endDate ? toDate(e.endDate) : null, label: e.employer }));
    for (const w of analyzeTimeline(intervals)) issues.push({ severity: w.severity, message: w.message });
    const verifiedYears = totalExperienceMonths(intervals) / 12;
    if (statedYears && Math.abs(verifiedYears - statedYears) >= 1)
      issues.push({ severity: "warning", message: `You said ${statedYears} years of experience, but the project dates add up to ${formatDuration(totalExperienceMonths(intervals))}. The resume uses the project dates — adjust them in step 3 if needed.` });
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
        <p className="small muted">Design {getDesign(state.templateKey).name} · target {state.pageTarget} page(s) · {state.mode.toLowerCase().replace("_", "-")} detail{state.useAi === "on" ? " · AI polish" : ""}</p>
        <h3>Projects to include</h3>
        <ul className="clean stack">
          {c.projects.map((p, i) => (
            <li key={p.id}>
              <label className="check">
                <input type="checkbox" name="projectId" value={p.id} defaultChecked={i < 10} />
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
      {candidates.length === 0 ? (
        <div className="card"><h2>Welcome</h2><p className="muted">Start by entering the person this resume is for. Next you will choose the industry and role, add projects, and pick a design.</p></div>
      ) : (
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
      )}
      <form className="card" action={createCandidate}>
        <input type="hidden" name="next" value="wizard" />
        <h2>Or start a new person</h2>
        <p className="muted small">Who is this resume for? You can add more details later.</p>
        <label htmlFor="q-fullName">Full name *</label><input id="q-fullName" name="fullName" type="text" required maxLength={200} />
        <div className="row">
          <div><label htmlFor="q-email">Email</label><input id="q-email" name="email" type="email" /></div>
          <div><label htmlFor="q-phone">Phone</label><input id="q-phone" name="phone" type="text" /></div>
        </div>
        <label htmlFor="q-location">Location</label><input id="q-location" name="location" type="text" placeholder="City, State" />
        <label htmlFor="q-linkedin">LinkedIn</label><input id="q-linkedin" name="linkedin" type="text" />
        <label className="check"><input type="checkbox" name="consent" defaultChecked /> This person agreed to have their details stored to build the resume</label>
        <div className="actions" style={{ marginTop: 12 }}><button className="btn primary" type="submit">Continue</button></div>
      </form>
    </div>
  );
}

async function StepProjects({ candidateId, state, qs }: { candidateId: string; state: Record<string, string>; qs: (p: Record<string, string | number>) => string }) {
  const [c, techs, templates, clients] = await Promise.all([
    prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, include: { projects: { include: { technologies: true, employment: true }, orderBy: [{ position: "asc" }, { startDate: "desc" }] } } }),
    techOptions(),
    templateOptions(),
    clientsByDomain(candidateId),
  ]);
  const { saveAllProjects } = await import("../../candidates/actions");
  const count = Math.min(10, Math.max(1, Number(state.count) || 5));
  const years = Number(state.years) || 0;
  const dates = years > 0 ? suggestProjectDates(years, Math.max(count, c.projects.length)) : [];
  const role = ROLES.find((r) => r.key === state.roleKey);
  const defaultRole = state.targetTitle || [state.seniority !== "Mid-level" ? state.seniority : "", role?.name ?? ""].filter(Boolean).join(" ");
  const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
  const initial: EditorProject[] = c.projects.map((p) => ({
    id: p.id,
    title: p.title === p.role ? "" : p.title,
    role: p.role,
    client: p.employment?.employer ?? "",
    location: p.employment?.location ?? "",
    startDate: iso(p.startDate),
    endDate: iso(p.endDate),
    domainKey: p.domainKey,
    subdomain: p.subdomain ?? "",
    templateId: p.templateId ?? "",
    responsibilities: strs(p.responsibilities).join("\n"),
    outcomes: strs(p.outcomes).join("\n"),
    techIds: p.technologies.map((t) => t.technologyId),
    confirmed: p.clientConfirmed || p.technologies.some((t) => t.confirmed),
  }));
  for (let i = initial.length; i < count; i++) {
    initial.push({
      title: "", role: defaultRole, client: "", location: "",
      startDate: dates[i]?.start ?? "", endDate: dates[i]?.end ?? "",
      domainKey: state.domainKey || "BANKING", subdomain: "", templateId: "",
      responsibilities: "", outcomes: "", techIds: [], confirmed: true,
    });
  }
  const hidden = Object.fromEntries(Object.entries(state).filter(([k]) => k !== "count"));
  return (
    <>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{initial.length} project{initial.length > 1 ? "s" : ""}{years ? ` · ${years} years of experience` : ""}</h2>
        <p className="muted">Project 1 is the most recent. Pick the client, check the dates, tick the technologies used, then press <strong>Save</strong> at the bottom. Empty cards are skipped.</p>
      </div>
      <ProjectsEditor
        action={saveAllProjects}
        hidden={hidden}
        initial={initial}
        techs={techs}
        templates={templates}
        domains={DOMAINS.map((d) => ({ key: d.key, name: d.name, subdomains: d.subdomains }))}
        clients={clients.byDomain}
        ownClients={clients.own}
        priorityCategories={["Domain Platforms", ...(role?.skillCategories ?? []).filter((x) => x !== "Domain Knowledge")]}
        backHref={qs({ step: 2 })}
      />
    </>
  );
}
