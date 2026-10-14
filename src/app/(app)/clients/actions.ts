"use server";
import { redirect } from "next/navigation";
import { csvRecords } from "@/lib/csv";
import { audit } from "@/lib/server/audit";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { attempt, optStr, str, withMessage } from "@/lib/server/forms";
import { assertCan } from "@/lib/server/permissions";
import { normalizeClientName } from "@/lib/server/resume-service";

const STATUSES = ["UNVERIFIED", "CANDIDATE_CONFIRMED", "VERIFIED"] as const;

export async function saveClient(form: FormData) {
  const user = await requireUser();
  const id = optStr(form, "id");
  let savedId = id ?? "";
  await attempt(id ? `/clients/${id}` : "/clients", async () => {
    await assertCan(user, "library:edit", "Client", id);
    const name = str(form, "name");
    if (!name) throw new Error("Name is required.");
    const domain = await prisma.domain.findUniqueOrThrow({ where: { key: str(form, "domainKey") } });
    const status = STATUSES.find((s) => s === str(form, "verificationStatus")) ?? "UNVERIFIED";
    const evidence = optStr(form, "evidence");
    if (status === "VERIFIED" && !evidence) throw new Error("Record the evidence/source before marking a client verified.");
    const normalizedName = normalizeClientName(name);
    const dupe = await prisma.client.findUnique({ where: { normalizedName } });
    if (dupe && dupe.id !== id) throw new Error(`A client with the same normalized name already exists (${dupe.name}).`);
    const data = {
      name,
      normalizedName,
      domainId: domain.id,
      subdomain: optStr(form, "subdomain"),
      market: optStr(form, "market"),
      verificationStatus: status,
      evidence,
      verifiedAt: status === "VERIFIED" ? new Date() : null,
      active: form.get("active") === "on",
      isDemo: form.get("isDemo") === "on",
    };
    const c = id ? await prisma.client.update({ where: { id }, data }) : await prisma.client.create({ data });
    const techIds = form.getAll("techId").map(String);
    await prisma.clientTechnology.deleteMany({ where: { clientId: c.id, technologyId: { notIn: techIds } } });
    for (const technologyId of techIds) {
      await prisma.clientTechnology.upsert({ where: { clientId_technologyId: { clientId: c.id, technologyId } }, create: { clientId: c.id, technologyId, evidence, verifiedAt: new Date() }, update: {} });
    }
    await audit(user.id, id ? "client.update" : "client.create", "Client", c.id, "SUCCESS", { status });
    savedId = c.id;
  });
  redirect(withMessage(`/clients/${savedId}`, "ok", "Client saved."));
}

export async function importClients(form: FormData) {
  const user = await requireUser();
  let summary = "";
  await attempt("/clients", async () => {
    await assertCan(user, "library:edit", "Client");
    const file = form.get("file");
    if (!file || typeof file !== "object" || !("text" in file) || file.size === 0) throw new Error("Choose a CSV file.");
    if (file.size > 2 * 1024 * 1024) throw new Error("CSV must be under 2 MB.");
    const records = csvRecords(await file.text());
    const domains = new Map((await prisma.domain.findMany()).map((d) => [d.key, d.id]));
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];
    for (const [i, r] of records.entries()) {
      const name = r.name?.trim();
      const domainId = domains.get((r.domain ?? "").toUpperCase());
      if (!name || !domainId) {
        errors.push(`row ${i + 2}: name and a valid domain key are required`);
        continue;
      }
      const normalizedName = normalizeClientName(name);
      if (await prisma.client.findUnique({ where: { normalizedName } })) {
        skipped++;
        continue;
      }
      // Imported records always start unverified; verification is an explicit administrative step.
      await prisma.client.create({ data: { name, normalizedName, domainId, subdomain: r.subdomain || null, market: r.market || null, verificationStatus: "UNVERIFIED", evidence: r.evidence || null } });
      created++;
    }
    await audit(user.id, "client.import", "Client", null, "SUCCESS", { created, skipped, errors: errors.length });
    summary = `Imported ${created}, skipped ${skipped} duplicate(s)${errors.length ? `, ${errors.length} invalid row(s): ${errors.slice(0, 3).join("; ")}` : ""}.`;
  });
  redirect(withMessage("/clients", "ok", summary));
}
