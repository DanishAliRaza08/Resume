import type { ResumeContent } from "@/lib/resume-schema";
import { formatRange } from "@/lib/timeline";

/** HTML preview mirroring the exported layout. Text-only, readable without colour or icons. */
export function ResumePreview({ content, draftLabel }: { content: ResumeContent; draftLabel?: string | null }) {
  return (
    <article className="preview" aria-label="Resume preview">
      {content.meta.isDemo && <div className="draftmark">SAMPLE / DEMO OUTPUT — not for submission to employers</div>}
      {draftLabel && <div className="draftmark">{draftLabel}</div>}
      <h1>{content.header.fullName}</h1>
      <div className="title">{content.header.title}</div>
      <div className="contact">{[content.header.email, content.header.phone, content.header.location, content.header.linkedin].filter(Boolean).join("  |  ")}</div>
      <h2>Professional Summary</h2>
      <ul>{content.summary.map((b) => <li key={b.id}>{b.text}</li>)}</ul>
      <h2>Professional Experience</h2>
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
          <h2>Technical Skills</h2>
          <table><tbody>{content.skills.map((r) => <tr key={r.category}><td><strong>{r.category}</strong></td><td>{r.values.join(", ")}</td></tr>)}</tbody></table>
        </>
      )}
      {content.education.length > 0 && (<><h2>Education</h2>{content.education.map((e) => <div key={e}>{e}</div>)}</>)}
      {content.certifications.length > 0 && (<><h2>Certifications</h2><ul>{content.certifications.map((c) => <li key={c}>{c}</li>)}</ul></>)}
      {content.extraSections.map((s) => (<div key={s.heading}><h2>{s.heading}</h2><ul>{s.lines.map((l) => <li key={l}>{l}</li>)}</ul></div>))}
    </article>
  );
}
