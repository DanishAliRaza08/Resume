"use client";
// Friendly page for unexpected server errors (instead of Next.js's generic message).
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="login-wrap">
      <div className="card login-card">
        <h1>Something went wrong</h1>
        <p>The page could not load. This is usually a database setting on the server.</p>
        <p>
          Open <a href="/api/health" target="_blank" rel="noreferrer"><strong>/api/health</strong></a> — it says in plain words what is wrong and how to fix it.
        </p>
        {error.digest && <p className="muted">Error code: {error.digest}</p>}
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn primary" type="button" onClick={() => reset()}>Try again</button>
          <a href="/login">Back to sign in</a>
        </div>
      </div>
    </div>
  );
}
