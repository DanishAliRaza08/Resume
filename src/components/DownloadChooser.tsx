"use client";
import { useEffect, useRef, useState } from "react";

type Design = { key: string; name: string };

/** One "Download resume" button that asks for PDF or Word, with design/spacing tucked under "More options". */
export function DownloadChooser({
  action,
  resumeId,
  versionId,
  designKey,
  designs,
}: {
  action: (form: FormData) => void | Promise<void>;
  resumeId: string;
  versionId: string;
  designKey: string;
  designs: Design[];
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="download-chooser">
      <button className="btn primary" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        ⬇ Download resume
      </button>
      {open && (
        <form action={action} className="card download-panel" onSubmit={() => setBusy(true)}>
          <input type="hidden" name="resumeId" value={resumeId} />
          <input type="hidden" name="versionId" value={versionId} />
          <p style={{ marginTop: 0 }}><strong>Which format do you want?</strong></p>
          <div className="actions">
            <button className="btn primary" type="submit" name="format" value="PDF" disabled={busy}>PDF</button>
            <button className="btn primary" type="submit" name="format" value="DOCX" disabled={busy}>Word (.docx)</button>
          </div>
          {busy && <p className="small muted">Preparing your file…</p>}
          <details style={{ marginTop: 10 }}>
            <summary className="small">More options</summary>
            <label htmlFor="dl-design">Design</label>
            <select id="dl-design" name="design" defaultValue={designKey}>
              {designs.map((d) => <option key={d.key} value={d.key}>{d.name}</option>)}
            </select>
            <label className="check"><input type="radio" name="spacing" value="normal" defaultChecked /> Normal spacing</label>
            <label className="check"><input type="radio" name="spacing" value="compact" /> Compact spacing (fits more per page)</label>
          </details>
        </form>
      )}
    </div>
  );
}

/** Starts the download of a just-exported file once (not again on refresh). */
export function AutoDownload({ exportId }: { exportId: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const key = `downloaded:${exportId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked: download anyway */
    }
    const a = document.createElement("a");
    a.href = `/api/exports/${exportId}`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [exportId]);
  return null;
}
