"use server";
import { strs } from "@/lib/json";
import { redirect } from "next/navigation";
import { audit } from "@/lib/server/audit";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { attempt, lines, str, withMessage } from "@/lib/server/forms";
import { assertCan } from "@/lib/server/permissions";

/** Templates are versioned: saving creates a new version and retires the previous one (spec §19 template drift). */
export async function saveTemplate(form: FormData) {
  const user = await requireUser();
  const id = str(form, "id");
  let newId = id;
  await attempt(`/templates/${id}`, async () => {
    await assertCan(user, "library:edit", "ProjectTemplate", id);
    const current = await prisma.projectTemplate.findUniqueOrThrow({ where: { id } });
    const latest = await prisma.projectTemplate.findFirst({ where: { name: current.name }, orderBy: { version: "desc" } });
    const created = await prisma.$transaction(async (tx) => {
      const t = await tx.projectTemplate.create({
        data: {
          name: current.name,
          version: (latest?.version ?? current.version) + 1,
          domainId: current.domainId,
          subdomain: str(form, "subdomain") || current.subdomain,
          roleId: current.roleId,
          seniority: current.seniority,
          projectPattern: str(form, "projectPattern"),
          requiredInputs: strs(current.requiredInputs),
          optionalInputs: strs(current.optionalInputs),
          domainBullets: lines(form, "domainBullets"),
          projectBullets: lines(form, "projectBullets"),
          supportingBullets: strs(current.supportingBullets),
          qaBullets: lines(form, "qaBullets"),
          excludedClaims: lines(form, "excludedClaims"),
          terminology: str(form, "terminology").split(",").map((s) => s.trim()).filter(Boolean),
          suggestedTech: str(form, "suggestedTech").split(",").map((s) => s.trim()).filter(Boolean),
          status: "ACTIVE",
          lastReviewedAt: new Date(),
          reviewer: user.name,
        },
      });
      await tx.projectTemplate.updateMany({ where: { name: current.name, id: { not: t.id } }, data: { status: "RETIRED" } });
      // Existing project links move to the new version only when the user re-selects it; history is kept.
      return t;
    });
    await audit(user.id, "template.version", "ProjectTemplate", created.id, "SUCCESS", { from: id, version: created.version });
    newId = created.id;
  });
  redirect(withMessage(`/templates/${newId}`, "ok", "Saved as a new template version; the previous version was retired."));
}
