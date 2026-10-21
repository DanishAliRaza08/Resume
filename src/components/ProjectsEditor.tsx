"use client";
import { useMemo, useState } from "react";

export type EditorTech = { id: string; canonicalName: string; category: string; domains?: string[] };
export type EditorTemplate = { id: string; name: string; domainKey: string; subdomain: string };
export type EditorDomain = { key: string; name: string; subdomains: string[] };
export type EditorProject = {
  id?: string;
  title: string;
  role: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  domainKey: string;
  subdomain: string;
  templateId: string;
  responsibilities: string;
  outcomes: string;
  techIds: string[];
  confirmed: boolean;
};

/**
 * All projects on one screen with a single Save button. Each card: client (suggestions for the
 * card's industry only), dates, role, technologies (select all per group, search, and a box for
 * anything not listed) and optional responsibilities. Rarely needed fields sit under "More options".
 */
export function ProjectsEditor({
  action,
  hidden,
  initial,
  techs,
  templates,
  domains,
  clients,
  ownClients,
  priorityCategories,
  backHref,
}: {
  action: (form: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
  initial: EditorProject[];
  techs: EditorTech[];
  templates: EditorTemplate[];
  domains: EditorDomain[];
  clients: Record<string, string[]>;
  ownClients: string[];
  priorityCategories: string[];
  backHref: string;
}) {
  const [cards, setCards] = useState<EditorProject[]>(initial);
  const [saving, setSaving] = useState(false);
  const update = (i: number, patch: Partial<EditorProject>) => setCards((cs) => cs.map((c, k) => (k === i ? { ...c, ...patch } : c)));
  const categories = useMemo(() => {
    const all = [...new Set(techs.map((t) => t.category))];
    const first = priorityCategories.filter((c) => all.includes(c));
    return [...first, ...all.filter((c) => !first.includes(c)).sort()];
  }, [techs, priorityCategories]);

  return (
    <form action={action} onSubmit={() => setSaving(true)}>
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input type="hidden" name="count" value={cards.length} />
      {domains.map((d) => (
        <datalist key={d.key} id={`clients-${d.key}`}>
          {[...ownClients, ...(clients[d.key] ?? [])].map((n, k) => <option key={`${k}-${n}`} value={n} />)}
        </datalist>
      ))}
      {cards.map((c, i) => (
        <ProjectCard key={c.id ?? `new-${i}`} index={i} card={c} onChange={(p) => update(i, p)} techs={techs} categories={categories} templates={templates} domains={domains} />
      ))}
      <div className="card actions sticky-save">
        <a className="btn" href={backHref}>Back</a>
        <button className="btn primary" type="submit" disabled={saving}>{saving ? "Saving…" : `Save ${cards.length === 1 ? "project" : `all ${cards.length} projects`} & continue`}</button>
        <button className="btn" type="button" onClick={() => setCards((cs) => [...cs, blankLike(cs[cs.length - 1])])} disabled={cards.length >= 10}>+ Add another project</button>
      </div>
    </form>
  );
}

function blankLike(prev?: EditorProject): EditorProject {
  return {
    title: "",
    role: prev?.role ?? "",
    client: "",
    location: "",
    startDate: "",
    endDate: prev?.startDate ? dayBefore(prev.startDate) : "",
    domainKey: prev?.domainKey ?? "BANKING",
    subdomain: "",
    templateId: "",
    responsibilities: "",
    outcomes: "",
    techIds: [],
    confirmed: true,
  };
}

function dayBefore(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function ProjectCard({
  index,
  card,
  onChange,
  techs,
  categories,
  templates,
  domains,
}: {
  index: number;
  card: EditorProject;
  onChange: (p: Partial<EditorProject>) => void;
  techs: EditorTech[];
  categories: string[];
  templates: EditorTemplate[];
  domains: EditorDomain[];
}) {
  const f = (name: string) => `p${index}_${name}`;
  const selected = new Set(card.techIds);
  const [filter, setFilter] = useState("");
  const [openCats, setOpenCats] = useState<Set<string>>(() => new Set([...categories.slice(0, 3), ...techs.filter((t) => selected.has(t.id)).map((t) => t.category)]));
  const domain = domains.find((d) => d.key === card.domainKey) ?? domains[0];
  const q = filter.trim().toLowerCase();
  const setTechs = (ids: Set<string>) => onChange({ techIds: [...ids] });
  const toggleCat = (cat: string, open: boolean) => setOpenCats((s) => { const n = new Set(s); if (open) n.add(cat); else n.delete(cat); return n; });

  return (
    <section className="card project-card" aria-labelledby={`${f("h")}`}>
      {card.id && <input type="hidden" name={f("projectId")} value={card.id} />}
      <h2 id={f("h")} style={{ marginTop: 0 }}>Project {index + 1}{index === 0 ? " (most recent)" : ""}</h2>
      <div className="row">
        <div>
          <label htmlFor={f("client")}>Client / company *</label>
          <input id={f("client")} name={f("client")} type="text" list={`clients-${card.domainKey}`} maxLength={150} value={card.client} onChange={(e) => onChange({ client: e.target.value })} placeholder={`Start typing — ${domain.name} companies are suggested`} autoComplete="off" />
        </div>
        <div>
          <label htmlFor={f("location")}>City, State</label>
          <input id={f("location")} name={f("location")} type="text" maxLength={120} value={card.location} onChange={(e) => onChange({ location: e.target.value })} placeholder="e.g. Charlotte, NC" />
        </div>
      </div>
      <div className="row">
        <div>
          <label htmlFor={f("role")}>Job title on this project</label>
          <input id={f("role")} name={f("role")} type="text" maxLength={120} value={card.role} onChange={(e) => onChange({ role: e.target.value })} />
        </div>
        <div>
          <label htmlFor={f("start")}>Start date *</label>
          <input id={f("start")} name={f("startDate")} type="date" value={card.startDate} onChange={(e) => onChange({ startDate: e.target.value })} />
        </div>
        <div>
          <label htmlFor={f("end")}>End date <span className="hint">(empty = current)</span></label>
          <input id={f("end")} name={f("endDate")} type="date" value={card.endDate} onChange={(e) => onChange({ endDate: e.target.value })} />
        </div>
      </div>
      <div className="row">
        <div>
          <label htmlFor={f("domain")}>Industry</label>
          <select id={f("domain")} name={f("domainKey")} value={card.domainKey} onChange={(e) => onChange({ domainKey: e.target.value, subdomain: "", templateId: "" })}>
            {domains.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={f("sub")}>Business area</label>
          <select id={f("sub")} name={f("subdomain")} value={card.subdomain} onChange={(e) => onChange({ subdomain: e.target.value })}>
            <option value="">— choose —</option>
            {domain.subdomains.map((s) => <option key={s} value={s}>{s}</option>)}
            {card.subdomain && !domain.subdomains.includes(card.subdomain) && <option value={card.subdomain}>{card.subdomain}</option>}
          </select>
        </div>
      </div>

      <fieldset className="tech-box">
        <legend>Technologies used on this project <span className="badge info">{selected.size} selected</span></legend>
        <div className="row" style={{ alignItems: "center" }}>
          <div><input type="search" aria-label="Find a technology" placeholder="Find a technology…" value={filter} onChange={(e) => setFilter(e.target.value)} /></div>
          {selected.size > 0 && <div className="shrink"><button type="button" className="btn small" onClick={() => setTechs(new Set())}>Clear all</button></div>}
        </div>
        {categories.map((cat) => {
          // Industry systems are listed for this project's industry only (search still finds all).
          const forIndustry = (t: EditorTech) => q || !t.domains?.length || t.domains.includes(card.domainKey) || selected.has(t.id);
          const list = techs.filter((t) => t.category === cat && forIndustry(t) && (!q || t.canonicalName.toLowerCase().includes(q)));
          if (!list.length) return null;
          const count = list.filter((t) => selected.has(t.id)).length;
          const allOn = count === list.length;
          return (
            <details key={cat} open={Boolean(q) || openCats.has(cat)} onToggle={(e) => toggleCat(cat, (e.target as HTMLDetailsElement).open)}>
              <summary>{cat === "Domain Platforms" ? `${domain.name} systems` : cat} {count > 0 && <span className="badge info">{count}</span>}</summary>
              <div className="tech-actions">
                <button type="button" className="btn small" onClick={() => { const n = new Set(selected); list.forEach((t) => (allOn ? n.delete(t.id) : n.add(t.id))); setTechs(n); }}>
                  {allOn ? "Unselect all" : "Select all"}
                </button>
              </div>
              <div className="tech-grid">
                {list.map((t) => (
                  <label key={t.id} className="check">
                    <input type="checkbox" checked={selected.has(t.id)} onChange={(e) => { const n = new Set(selected); if (e.target.checked) n.add(t.id); else n.delete(t.id); setTechs(n); }} />
                    {t.canonicalName}
                  </label>
                ))}
              </div>
            </details>
          );
        })}
        {[...selected].map((id) => <input key={id} type="hidden" name={f("techId")} value={id} />)}
        <label htmlFor={f("custom")}>Other technologies not in the list <span className="hint">(separate with commas)</span></label>
        <input id={f("custom")} name={f("customTech")} type="text" maxLength={600} placeholder="e.g. Jama Connect, Alteryx, Workday" />
      </fieldset>

      <label htmlFor={f("resp")}>What did they do on this project? <span className="hint">(optional — one point per line; used word for word)</span></label>
      <textarea id={f("resp")} name={f("responsibilities")} value={card.responsibilities} onChange={(e) => onChange({ responsibilities: e.target.value })} />

      <details className="more-options">
        <summary>More options</summary>
        <div className="row">
          <div>
            <label htmlFor={f("title")}>Project name <span className="hint">(optional)</span></label>
            <input id={f("title")} name={f("title")} type="text" maxLength={150} value={card.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="e.g. Loan Origination Modernization" />
          </div>
          <div>
            <label htmlFor={f("tpl")}>Wording template <span className="hint">(picked automatically if empty)</span></label>
            <select id={f("tpl")} name={f("templateId")} value={card.templateId} onChange={(e) => onChange({ templateId: e.target.value })}>
              <option value="">Automatic</option>
              {templates.filter((t) => t.domainKey === card.domainKey).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <label htmlFor={f("out")}>Real results <span className="hint">(optional — only results that really happened; one per line)</span></label>
        <textarea id={f("out")} name={f("outcomes")} style={{ minHeight: 52 }} value={card.outcomes} onChange={(e) => onChange({ outcomes: e.target.value })} />
      </details>

      <label className="check confirm-line">
        <input type="checkbox" name={f("confirmed")} checked={card.confirmed} onChange={(e) => onChange({ confirmed: e.target.checked })} />
        The person really worked with this client on these dates and used these technologies
      </label>
      {card.id && (
        <label className="check small muted">
          <input type="checkbox" name={f("remove")} /> Remove this project when saving
        </label>
      )}
    </section>
  );
}
