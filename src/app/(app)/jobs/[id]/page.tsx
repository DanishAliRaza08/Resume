import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/Badges";
import { Denied } from "@/components/Denied";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { retryJob } from "./actions";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const job = await prisma.generationJob.findUnique({ where: { id } });
  if (!job || (job.createdById !== user.id && user.role !== "ADMIN")) return <Denied />;
  if (job.status === "SUCCEEDED" && job.resumeId) redirect(`/resumes/${job.resumeId}?v=${job.outputVersionId}&ok=Draft+generated`);
  const warnings = (job.warnings as { severity: string; message: string }[] | null) ?? [];
  return (
    <>
      {(job.status === "QUEUED" || job.status === "RUNNING") && <meta httpEquiv="refresh" content="2" />}
      <div className="pagehead"><div><h1>Generation job</h1><p>Status is persisted; it is safe to leave this page.</p></div></div>
      <div className="card">
        <p><StatusBadge value={job.status} /> attempt {job.attempts} · config {job.configVersion}</p>
        {(job.status === "QUEUED" || job.status === "RUNNING") && <p>Generating draft… this page refreshes automatically.</p>}
        {job.status === "FAILED" && (
          <>
            <div className="notice bad">The job failed: {job.errorDetails ?? "unknown error"}. No partial version was saved and any previous draft is preserved.</div>
            <form action={retryJob}>
              <input type="hidden" name="jobId" value={job.id} />
              <button className="btn primary" type="submit">Retry (same job, no duplicate output)</button>
            </form>
          </>
        )}
        {warnings.length > 0 && <ul>{warnings.map((w, i) => <li key={i}>{w.message}</li>)}</ul>}
        <p><Link href="/">Back to dashboard</Link></p>
      </div>
    </>
  );
}
