"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/server/audit";
import { requireUser } from "@/lib/server/auth";
import { getSettings } from "@/lib/server/catalog";
import { prisma } from "@/lib/server/db";
import { attempt, lines, optStr, str, withMessage } from "@/lib/server/forms";
import { assertCan, authorizeCandidate } from "@/lib/server/permissions";

function date(form: FormData, key: string): Date | null {
  const v = str(form, key);
  if (!v) return null;
  const d = new Date(v.length === 7 ? `${v}-01` : v);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date for ${key}.`);
  return d;
}

export async function createCandidate(form: FormData) {
  const user = await requireUser();
  let id = "";
  await attempt("/candidates/new", async () => {
    await assertCan(user, "candidate:create");
    const fullName = str(form, "fullName");
    if (!fullName) throw new Error("Full name is required.");
    const settings = await getSettings();
    const consent = form.get("consent") === "on";
    const c = await prisma.candidate.create({
      data: {
        ownerId: user.id,
        fullName,
        email: optStr(form, "email"),
        phone: optStr(form, "phone"),
        location: optStr(form, "location"),
        linkedin: optStr(form, "linkedin"),
        targetRole: optStr(form, "targetRole"),
        targetTitle: optStr(form, "targetTitle"),
        domainKey: optStr(form, "domainKey"),
        team: optStr(form, "team"),
        consentObtainedAt: consent ? new Date() : null,
        retentionUntil: new Date(Date.now() + settings.retentionDays * 86400000),
      },
    });
    await audit(user.id, "candidate.create", "Candidate", c.id);
    id = c.id;
  });
  if (str(form, "next") === "wizard") redirect(`/resumes/new?candidateId=${id}&step=2`);
  redirect(`/candidates/${id}?ok=Candidate+created`);
}

export async function updateCandidate(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  await attempt(`/candidates/${id}`, async () => {
    await authorizeCandidate(user, id, "write");
    await prisma.candidate.update({
      where: { id },
      data: {
        fullName: str(form, "fullName"),
        email: optStr(form, "email"),
        phone: optStr(form, "phone"),
        location: optStr(form, "location"),
        linkedin: optStr(form, "linkedin"),
        targetRole: optStr(form, "targetRole"),
        targetTitle: optStr(form, "targetTitle"),
        domainKey: optStr(form, "domainKey"),
        ...(form.get("consent") === "on" ? { consentObtainedAt: new Date() } : {}),
      },
    });
    await audit(user.id, "candidate.update", "Candidate", id);
  });
  revalidatePath(`/candidates/${id}`);
  redirect(withMessage(`/candidates/${id}`, "ok", "Profile saved."));
}

export async function addEmployment(form: FormData) {
  const user = await requireUser();
  const id = str(form, "candidateId");
  await attempt(`/candidates/${id}`, async () => {
    await authorizeCandidate(user, id, "write");
    const start = date(form, "startDate");
    if (!start || !str(form, "employer") || !str(form, "title")) throw new Error("Employer, title and start date are required.");
    const end = date(form, "endDate");
    if (end && end < start) throw new Error("End date is before start date.");
    if (form.get("confirmed") !== "on") throw new Error("Confirm that the candidate verified this employment.");
    const e = await prisma.employment.create({
      data: { candidateId: id, employer: str(form, "employer"), location: optStr(form, "location"), title: str(form, "title"), startDate: start, endDate: end, engagement: str(form, "engagement") || "FULL_TIME", evidence: optStr(form, "evidence"), status: "CANDIDATE_CONFIRMED" },
    });
    await audit(user.id, "candidate.employment.add", "Employment", e.id);
  });
  redirect(withMessage(`/candidates/${id}`, "ok", "Employment added."));
}

export async function deleteEmployment(form: FormData) {
  const user = await requireUser();
  const id = str(form, "candidateId");
  await attempt(`/candidates/${id}`, async () => {
    await authorizeCandidate(user, id, "write");
    const empId = str(form, "employmentId");
    await prisma.project.updateMany({ where: { employmentId: empId, candidateId: id }, data: { employmentId: null, clientConfirmed: false } });
    await prisma.employment.deleteMany({ where: { id: empId, candidateId: id } });
    await audit(user.id, "candidate.employment.delete", "Employment", empId);
  });
  redirect(withMessage(`/candidates/${id}`, "ok", "Employment removed."));
}

export async function addEducation(form: FormData) {
  const user = await requireUser();
  const id = str(form, "candidateId");
  await attempt(`/candidates/${id}`, async () => {
    await authorizeCandidate(user, id, "write");
    const kind = str(form, "kind");
    if (kind === "cert") {
      await prisma.certification.create({ data: { candidateId: id, name: str(form, "name"), issuer: str(form, "issuer"), issuedAt: date(form, "date") } });
    } else {
      await prisma.education.create({ data: { candidateId: id, qualification: str(form, "name"), institution: str(form, "issuer"), endDate: date(form, "date") } });
    }
    await audit(user.id, `candidate.${kind === "cert" ? "certification" : "education"}.add`, "Candidate", id);
  });
  redirect(withMessage(`/candidates/${id}`, "ok", "Saved."));
}

export async function removeQualification(form: FormData) {
  const user = await requireUser();
  const id = str(form, "candidateId");
  await attempt(`/candidates/${id}`, async () => {
    await authorizeCandidate(user, id, "write");
    const rid = str(form, "recordId");
    if (str(form, "kind") === "cert") await prisma.certification.deleteMany({ where: { id: rid, candidateId: id } });
    else await prisma.education.deleteMany({ where: { id: rid, candidateId: id } });
  });
  redirect(`/candidates/${id}`);
}

export async function setSkills(form: FormData) {
  const user = await requireUser();
  const id = str(form, "candidateId");
  await attempt(`/candidates/${id}`, async () => {
    await authorizeCandidate(user, id, "write");
    const selected = form.getAll("techId").map(String);
    const existing = await prisma.candidateSkill.findMany({ where: { candidateId: id } });
    const keep = new Set(selected);
    await prisma.candidateSkill.deleteMany({ where: { candidateId: id, technologyId: { notIn: selected } } });
    for (const techId of keep) {
      if (!existing.some((e) => e.technologyId === techId)) {
        await prisma.candidateSkill.create({ data: { candidateId: id, technologyId: techId, source: "USER_CONFIRMED" } });
      }
    }
    await audit(user.id, "candidate.skills.update", "Candidate", id, "SUCCESS", { count: keep.size });
  });
  redirect(withMessage(`/candidates/${id}`, "ok", "Confirmed skills updated."));
}

export async function deleteCandidate(form: FormData) {
  const user = await requireUser();
  const id = str(form, "candidateId");
  await attempt(`/candidates/${id}`, async () => {
    await authorizeCandidate(user, id, "write");
    if (str(form, "confirmName") !== (await prisma.candidate.findUniqueOrThrow({ where: { id } })).fullName) {
      throw new Error("Type the candidate's full name exactly to confirm deletion.");
    }
    // Remove stored export files as well as database records (spec §14 retention & deletion).
    const exportsToRemove = await prisma.exportFile.findMany({ where: { resume: { candidateId: id } }, select: { storagePath: true } });
    const { rm } = await import("node:fs/promises");
    for (const e of exportsToRemove) if (e.storagePath) await rm(e.storagePath, { force: true });
    await prisma.candidate.delete({ where: { id } });
    await audit(user.id, "candidate.delete", "Candidate", id, "SUCCESS", { exportsRemoved: exportsToRemove.length });
  });
  redirect(withMessage("/candidates", "ok", "Candidate and all related resumes, versions and export files were deleted. Database backups expire per the backup retention schedule."));
}

/**
 * Find the candidate's employment record for a typed client name (case-insensitive), widening its
 * dates to cover the project, or create one. Lets users enter any client name directly.
 */
async function upsertEmploymentFor(candidateId: string, e: { employer: string; location: string | null; title: string; start: Date; end: Date | null }) {
  const existing = await prisma.employment.findFirst({ where: { candidateId, employer: { equals: e.employer, mode: "insensitive" } } });
  if (!existing) {
    return prisma.employment.create({
      data: { candidateId, employer: e.employer, location: e.location, title: e.title, startDate: e.start, endDate: e.end, evidence: "Entered with project", status: "CANDIDATE_CONFIRMED" },
    });
  }
  const startDate = existing.startDate < e.start ? existing.startDate : e.start;
  const endDate = existing.endDate === null || e.end === null ? null : existing.endDate > e.end ? existing.endDate : e.end;
  return prisma.employment.update({ where: { id: existing.id }, data: { startDate, endDate, location: e.location ?? existing.location } });
}

function returnTo(form: FormData, fallback: string): string {
  const r = str(form, "returnTo");
  return r.startsWith("/") && !r.startsWith("//") ? r : fallback;
}

export async function saveProject(form: FormData) {
  const user = await requireUser();
  const candidateId = str(form, "candidateId");
  const back = returnTo(form, `/candidates/${candidateId}#projects`);
  await attempt(back, async () => {
    await authorizeCandidate(user, candidateId, "write");
    const projectId = optStr(form, "projectId");
    const start = date(form, "startDate");
    if (!start) throw new Error("Project start date is required.");
    const end = date(form, "endDate");
    if (end && end < start) throw new Error("Project end date is before its start date.");
    const clientName = str(form, "clientName").slice(0, 150);
    if (!clientName) throw new Error("Enter the client or company name.");
    const employment = await upsertEmploymentFor(candidateId, {
      employer: clientName,
      location: optStr(form, "clientLocation"),
      title: str(form, "role") || str(form, "title") || "Consultant",
      start,
      end,
    });
    const data = {
      candidateId,
      employmentId: employment?.id ?? null,
      templateId: optStr(form, "templateId"),
      position: Number(str(form, "position") || "1"),
      title: str(form, "title") || "Untitled project",
      role: str(form, "role") || employment?.title || "",
      domainKey: str(form, "domainKey"),
      subdomain: optStr(form, "subdomain"),
      description: optStr(form, "description"),
      responsibilities: lines(form, "responsibilities"),
      outcomes: lines(form, "outcomes"),
      startDate: start,
      endDate: end,
      clientConfirmed: Boolean(employment) && form.get("clientConfirmed") === "on",
    };
    const project = projectId
      ? await prisma.project.update({ where: { id: projectId, candidateId }, data })
      : await prisma.project.create({ data });
    const techIds = form.getAll("techId").map(String);
    const allConfirmed = form.get("techAllConfirmed") === "on";
    await prisma.projectTechnology.deleteMany({ where: { projectId: project.id } });
    if (techIds.length) {
      await prisma.projectTechnology.createMany({ data: techIds.map((technologyId) => ({ projectId: project.id, technologyId, confirmed: allConfirmed, evidence: "Confirmed by user in project editor" })) });
    }
    // Remove auto-created employment records that no project uses any more (e.g. after renaming a client).
    await prisma.employment.deleteMany({ where: { candidateId, evidence: "Entered with project", projects: { none: {} } } });
    await audit(user.id, projectId ? "project.update" : "project.create", "Project", project.id);
  });
  redirect(withMessage(back, "ok", "Project saved."));
}

export async function deleteProject(form: FormData) {
  const user = await requireUser();
  const candidateId = str(form, "candidateId");
  const back = returnTo(form, `/candidates/${candidateId}#projects`);
  await attempt(back, async () => {
    await authorizeCandidate(user, candidateId, "write");
    await prisma.project.deleteMany({ where: { id: str(form, "projectId"), candidateId } });
    await audit(user.id, "project.delete", "Project", str(form, "projectId"));
  });
  redirect(withMessage(back, "ok", "Project removed."));
}

/** Create five project shells from verified employment using the default timeline allocation (spec §6.3). */
export async function proposeProjects(form: FormData) {
  const user = await requireUser();
  const candidateId = str(form, "candidateId");
  const back = returnTo(form, `/candidates/${candidateId}#projects`);
  let message = "";
  await attempt(back, async () => {
    await authorizeCandidate(user, candidateId, "write");
    const { proposeProjectRanges, toDate } = await import("@/lib/timeline");
    const employments = await prisma.employment.findMany({ where: { candidateId }, orderBy: { startDate: "desc" } });
    if (!employments.length) throw new Error("Add verified employment first; projects must sit inside real work history.");
    const existing = await prisma.project.count({ where: { candidateId } });
    if (existing > 0) throw new Error("This candidate already has projects. Edit them directly.");
    const careerStart = toDate(employments[employments.length - 1].startDate);
    const latest = employments[0];
    const { ranges, warnings } = proposeProjectRanges(careerStart, latest.endDate ? toDate(latest.endDate) : null);
    const domainKey = str(form, "domainKey") || "BANKING";
    for (const r of ranges) {
      // Attach each proposed range to the employment that contains its midpoint; never invent an employer.
      const mid = (toDate(r.start).getTime() + (r.end ? toDate(r.end).getTime() : Date.now())) / 2;
      const emp = employments.find((e) => e.startDate.getTime() <= mid && (e.endDate ? e.endDate.getTime() : Date.now()) >= mid) ?? null;
      await prisma.project.create({
        data: {
          candidateId,
          employmentId: emp?.id ?? null,
          position: r.position,
          title: emp ? `${emp.title} — ${emp.employer}` : `Project ${r.position}`,
          role: emp?.title ?? "",
          domainKey,
          startDate: toDate(r.start),
          endDate: r.end ? toDate(r.end) : null,
          clientConfirmed: false,
        },
      });
    }
    message = `Five project shells created from the default timeline. Review each project's dates against the real engagement, choose a template, confirm technologies and the client relationship.${warnings.length ? " " + warnings.map((w) => w.message).join(" ") : ""}`;
    await audit(user.id, "project.propose", "Candidate", candidateId);
  });
  redirect(withMessage(back, "ok", message));
}
