import type { CSSProperties } from "react";
import { getDesign } from "@/lib/designs";
import type { ResumeContent } from "@/lib/resume-schema";
import { formatRange } from "@/lib/timeline";

/** HTML preview mirroring the exported layout for the chosen design. Readable without colour or icons. */
export function ResumePreview({ content, draftLabel, designKey, scale }: { content: ResumeContent; draftLabel?: string | null; designKey?: string; scale?: number }) {
  const d = getDesign(designKey ?? content.meta.templateKey);
  const accent = `#${d.accent}`;
  const heading = (text: string) => {
    const t = d.headingCaps ? text.toUpperCase() : text;
    const base: CSSProperties = { color: accent, fontSize: `${d.bodySize + 3}px`, margin: "16px 0 6px", letterSpacing: d.headingCaps ? "0.06em" : undefined, border: "none", padding: 0 };
    const style: CSSProperties =
      d.heading === "rule" || d.heading === "caps-rule"
        ? { ...base, borderBottom: `${d.heading === "caps-rule" ? 2 : 1}px solid ${accent}`, paddingBottom: 2 }
        : d.heading === "double-rule"
          ? { ...base, borderTop: `1px solid ${accent}`, borderBottom: `1px solid ${accent}`, padding: "2px 0" }
          : d.heading === "band"
            ? { ...base, background: accent, color: "#fff", padding: "3px 8px" }
            : d.heading === "bar"
              ? { ...base, borderLeft: `4px solid ${accent}`, paddingLeft: 8 }
              : d.heading === "small-caps"
                ? { ...base, fontWeight: 400, fontVariant: "small-caps" }
                : { ...base, color: `#${d.text}` };
    return <h2 style={style}>{t}</h2>;
  };
  const tight = d.key === "compact";
  return (
    <article
      className="preview"
      aria-label={`Resume preview — ${d.name} design`}
      style={{ fontFamily: d.cssFont, color: `#${d.text}`, fontSize: `${d.bodySize + 2.5}px`, lineHeight: tight ? 1.3 : 1.45, padding: tight ? "24px 28px" : undefined, zoom: scale }}
    >
      {content.meta.isDemo && <div className="draftmark">SAMPLE / DEMO OUTPUT — not for submission to employers</div>}
      {draftLabel && <div className="draftmark">{draftLabel}</div>}
      <h1 style={{ textAlign: d.headerAlign, fontSize: `${d.nameSize + 4}px`, color: d.heading === "plain" ? undefined : accent }}>{content.header.fullName}</h1>
      <div className="title" style={{ textAlign: d.headerAlign }}>{content.header.title}</div>
      <div className="contact" style={{ textAlign: d.headerAlign }}>{[content.header.email, content.header.phone, content.header.location, content.header.linkedin].filter(Boolean).join("  |  ")}</div>
      {heading("Professional Summary")}
      <ul>{content.summary.map((b) => <li key={b.id}>{b.text}</li>)}</ul>
      {heading("Professional Experience")}
      {content.projects.map((p) => (
        <div className="job" key={p.id}>
          <div><strong>{[p.client, p.location].filter(Boolean).join(", ")}</strong></div>
          <div>{formatRange(p.startDate, p.endDate)}</div>
          <div><strong>{p.role}</strong></div>
          {p.title !== p.role && <div><em>Project: {p.title}</em></div>}
          <ul>{p.bullets.map((b) => <li key={b.id}>{b.text}</li>)}</ul>
          {p.technologies.length > 0 && <div className="env">Environment: {p.technologies.join(", ")}</div>}
        </div>
      ))}
      {content.skills.length > 0 && (
        <>
          {heading("Technical Skills")}
          {d.skillsAsTable ? (
            <table><tbody>{content.skills.map((r, i) => <tr key={i}><td><strong>{r.category}</strong></td><td>{r.values.join(", ")}</td></tr>)}</tbody></table>
          ) : (
            content.skills.map((r, i) => <div key={i}><strong>{r.category}:</strong> {r.values.join(", ")}</div>)
          )}
        </>
      )}
      {content.education.length > 0 && (<>{heading("Education")}{content.education.map((e) => <div key={e}>{e}</div>)}</>)}
      {content.certifications.length > 0 && (<>{heading("Certifications")}<ul>{content.certifications.map((c) => <li key={c}>{c}</li>)}</ul></>)}
      {content.extraSections.map((s) => (<div key={s.heading}>{heading(s.heading)}<ul>{s.lines.map((l) => <li key={l}>{l}</li>)}</ul></div>))}
    </article>
  );
}
