import { SAMPLE_RESUME } from "@/data/sample-resume";
import { DESIGNS } from "@/lib/designs";
import { ResumePreview } from "./ResumePreview";

/** Radio-card gallery of resume designs with a live thumbnail of each (no client JS). */
export function DesignPicker({ name = "templateKey", value }: { name?: string; value: string }) {
  return (
    <div className="design-grid" role="radiogroup" aria-label="Resume design">
      {DESIGNS.map((d) => (
        <label key={d.key} className="design-card">
          <input type="radio" name={name} value={d.key} defaultChecked={d.key === value} />
          <div className="design-thumb" aria-hidden="true">
            <ResumePreview content={SAMPLE_RESUME} designKey={d.key} scale={0.42} />
          </div>
          <strong>{d.name}</strong>
          <span className="small muted">{d.description}</span>
          <div className="small muted">Best for: {d.bestFor}</div>
        </label>
      ))}
    </div>
  );
}
