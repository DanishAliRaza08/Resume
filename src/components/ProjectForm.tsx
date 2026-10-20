import { DOMAINS } from "@/data/domains";
import { TechPicker } from "./TechPicker";
import { deleteProject, saveProject } from "@/app/(app)/candidates/actions";

type Tech = { id: string; canonicalName: string; category: string };
type Template = { id: string; name: string; domainKey: string; subdomain: string };
type Employment = { id: string; employer: string; location?: string | null; title: string; startDate: Date; endDate: Date | null };
type Project = {
  id: string;
  position: number;
  title: string;
  role: string;
  domainKey: string;
  subdomain: string | null;
  employmentId: string | null;
  templateId: string | null;
  responsibilities: string[];
  outcomes: string[];
  startDate: Date;
  endDate: Date | null;
  clientConfirmed: boolean;
  technologies: { technologyId: string; confirmed: boolean }[];
};

const d = (x: Date | null) => (x ? x.toISOString().slice(0, 10) : "");

export function ProjectForm({
  candidateId,
  project,
  position,
  employments,
  templates,
  techs,
  returnTo,
  defaultDomain,
}: {
  candidateId: string;
  project?: Project;
  position: number;
  employments: Employment[];
  templates: Template[];
  techs: Tech[];
  returnTo: string;
  defaultDomain?: string | null;
}) {
  const selected = new Set(project?.technologies.map((t) => t.technologyId) ?? []);
  const currentEmployment = employments.find((e) => e.id === project?.employmentId) ?? null;
  const fid = project?.id ?? "new";
  const allConfirmed = project ? project.technologies.length > 0 && project.technologies.every((t) => t.confirmed) : false;
  const domainKey = project?.domainKey ?? defaultDomain ?? "BANKING";
  const subdomains = DOMAINS.find((x) => x.key === domainKey)?.subdomains ?? [];
  return (
    <form action={saveProject} className="card" id={project ? `project-${project.id}` : undefined}>
      <input type="hidden" name="candidateId" value={candidateId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      {project && <input type="hidden" name="projectId" value={project.id} />}
      <h3>{project ? `Project ${project.position}: ${project.title}` : "Add project"}</h3>
      <div className="row">
        <div className="shrink" style={{ width: 90 }}><label>Position</label><input name="position" type="number" min={1} max={10} defaultValue={project?.position ?? position} /></div>
        <div><label>Project title *</label><input name="title" type="text" required defaultValue={project?.title ?? ""} /></div>
        <div><label>Role on project</label><input name="role" type="text" defaultValue={project?.role ?? ""} /></div>
      </div>
      <div className="row">
        <div>
          <label htmlFor={`client-${fid}`}>Client / company name * <span className="hint">(type any name)</span></label>
          <input id={`client-${fid}`} name="clientName" type="text" required maxLength={150} list="client-suggestions" defaultValue={currentEmployment?.employer ?? ""} placeholder="e.g. Acme Bank" />
        </div>
        <div>
          <label htmlFor={`loc-${fid}`}>Client location</label>
          <input id={`loc-${fid}`} name="clientLocation" type="text" maxLength={120} defaultValue={currentEmployment?.location ?? ""} placeholder="City, State" />
        </div>
      </div>
      <div className="row">
        <div><label>Start date *</label><input name="startDate" type="date" required defaultValue={d(project?.startDate ?? null)} /></div>
        <div><label>End date <span className="hint">(blank = current)</span></label><input name="endDate" type="date" defaultValue={d(project?.endDate ?? null)} /></div>
      </div>
      <div className="row">
        <div>
          <label>Domain</label>
          <select name="domainKey" defaultValue={domainKey}>
            {DOMAINS.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}
          </select>
        </div>
        <div>
          <label>Subdomain</label>
          <input name="subdomain" type="text" list={`subdomains-${project?.id ?? "new"}`} defaultValue={project?.subdomain ?? ""} />
          <datalist id={`subdomains-${project?.id ?? "new"}`}>{subdomains.map((s) => <option key={s} value={s} />)}</datalist>
        </div>
        <div>
          <label>Project template <span className="hint">(phrasing only)</span></label>
          <select name="templateId" defaultValue={project?.templateId ?? ""}>
            <option value="">— none —</option>
            {DOMAINS.map((dm) => (
              <optgroup key={dm.key} label={dm.name}>
                {templates.filter((t) => t.domainKey === dm.key).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
      <label>Candidate-supplied responsibilities <span className="hint">(one per line — used verbatim as evidence-backed bullets)</span></label>
      <textarea name="responsibilities" defaultValue={project?.responsibilities.join("\n") ?? ""} />
      <label>Candidate-supplied outcomes <span className="hint">(only real, verifiable results; one per line)</span></label>
      <textarea name="outcomes" style={{ minHeight: 52 }} defaultValue={project?.outcomes.join("\n") ?? ""} />
      <label>Technologies used on this project</label>
      <TechPicker techs={techs} selected={selected} />
      <label className="check"><input type="checkbox" name="techAllConfirmed" defaultChecked={allConfirmed} /> The candidate confirmed they used every selected technology on this project</label>
      <label className="check"><input type="checkbox" name="clientConfirmed" defaultChecked={project?.clientConfirmed ?? true} /> I confirm the candidate really worked with this client on these dates</label>
      <div className="actions" style={{ marginTop: 12 }}>
        <button className="btn primary" type="submit">{project ? "Save project" : "Add project"}</button>
        {project && (
          <button className="btn danger" type="submit" formAction={deleteProject} name="projectId" value={project.id} formNoValidate>
            Remove
          </button>
        )}
      </div>
    </form>
  );
}

/** Datalist of client name suggestions shared by every ProjectForm on a page. */
export function ClientSuggestions({ names }: { names: string[] }) {
  return (
    <datalist id="client-suggestions">
      {[...new Set(names)].map((n) => <option key={n} value={n} />)}
    </datalist>
  );
}
