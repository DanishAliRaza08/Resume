"use server";
import { redirect } from "next/navigation";
import { csvRecords } from "@/lib/csv";
import { audit } from "@/lib/server/audit";
import { requireUser } from "@/lib/server/auth";
import { invalidateCatalog } from "@/lib/server/catalog";
import { prisma } from "@/lib/server/db";
import { attempt, str, withMessage } from "@/lib/server/forms";
import { assertCan } from "@/lib/server/permissions";

const list = (s: string) => s.split(/[;,]/).map((x) => x.trim()).filter(Boolean);

export async function saveTechnology(form: FormData) {
  const user = await requireUser();
  await attempt("/technologies", async () => {
    await assertCan(user, "library:edit", "Technology");
    const canonicalName = str(form, "canonicalName");
    if (!canonicalName || !str(form, "category")) throw new Error("Name and category are required.");
    const data = { aliases: list(str(form, "aliases")), category: str(form, "category"), roles: list(str(form, "roles")), domains: list(str(form, "domains")), availableFrom: str(form, "availableFrom") ? Number(str(form, "availableFrom")) : null, lifecycle: str(form, "lifecycle") || "ACTIVE" };
    const t = await prisma.technology.upsert({ where: { canonicalName }, create: { canonicalName, ...data }, update: data });
    invalidateCatalog();
    await audit(user.id, "technology.save", "Technology", t.id);
  });
  redirect(withMessage("/technologies", "ok", "Technology saved."));
}

export async function importTechnologies(form: FormData) {
  const user = await requireUser();
  let summary = "";
  await attempt("/technologies", async () => {
    await assertCan(user, "library:edit", "Technology");
    const file = form.get("file");
    if (!file || typeof file !== "object" || !("text" in file) || file.size === 0) throw new Error("Choose a CSV file.");
    const records = csvRecords(await file.text());
    let created = 0;
    let updated = 0;
    for (const r of records) {
      const canonicalName = r.canonical_name || r.name;
      if (!canonicalName || !r.category) continue;
      const data = { aliases: list(r.aliases ?? ""), category: r.category, roles: list(r.roles ?? ""), domains: list(r.domains ?? ""), availableFrom: r.available_from ? Number(r.available_from) || null : null };
      const exists = await prisma.technology.findUnique({ where: { canonicalName } });
      await prisma.technology.upsert({ where: { canonicalName }, create: { canonicalName, ...data }, update: data });
      if (exists) updated++;
      else created++;
    }
    invalidateCatalog();
    await audit(user.id, "technology.import", "Technology", null, "SUCCESS", { created, updated });
    summary = `Imported: ${created} new, ${updated} updated.`;
  });
  redirect(withMessage("/technologies", "ok", summary));
}
