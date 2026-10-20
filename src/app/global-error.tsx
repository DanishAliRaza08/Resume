"use client";
// Last-resort error page when even the root layout fails.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, Arial, sans-serif", padding: 32, maxWidth: 560, margin: "0 auto" }}>
        <h1>Benchsale Dan — something went wrong</h1>
        <p>Open <a href="/api/health">/api/health</a> to see what is wrong with the server setup and how to fix it.</p>
        {error.digest && <p style={{ color: "#5d6878" }}>Error code: {error.digest}</p>}
      </body>
    </html>
  );
}
