// Structured resume content (spec §10.2). A ResumeVersion stores one immutable snapshot of this shape.
import { z } from "zod";

export const BulletSource = z.enum([
  "CANDIDATE", // supplied by the candidate / profile (evidence-backed)
  "RESUME_IMPORT", // extracted from an uploaded resume (evidence = the source document)
  "TEMPLATE", // phrasing pattern from a project template — needs confirmation
  "TOOL", // generated from confirmed project technologies
  "AI", // reworded by the AI layer from evidence-backed input
  "JD_SUGGESTION", // accepted JD tailoring suggestion
  "USER_EDIT", // typed directly by a user in the editor
]);
export type BulletSource = z.infer<typeof BulletSource>;

export const Bullet = z.object({
  id: z.string(),
  section: z.enum(["SUMMARY", "PROJECT"]),
  projectId: z.string().nullable(),
  type: z.enum(["PRIMARY", "HIGHLIGHT", "QA", "PROFESSIONALISM", "DOMAIN", "PROJECT", "SUPPORTING_TOOL"]),
  text: z.string().min(1),
  action: z.string().nullable(),
  domainConcept: z.string().nullable(),
  technologyRefs: z.array(z.string()),
  evidenceRefs: z.array(z.string()),
  jdKeywordRefs: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
  requiresConfirmation: z.boolean(),
  confirmed: z.boolean(),
  source: BulletSource,
});
export type Bullet = z.infer<typeof Bullet>;

export const ProjectSection = z.object({
  id: z.string(),
  position: z.number().int(),
  title: z.string(),
  client: z.string(),
  clientConfirmed: z.boolean(),
  clientVerification: z.enum(["UNVERIFIED", "CANDIDATE_CONFIRMED", "VERIFIED"]),
  location: z.string().nullable(),
  role: z.string(),
  domainKey: z.string(),
  subdomain: z.string().nullable(),
  startDate: z.string(), // ISO yyyy-mm-dd
  endDate: z.string().nullable(), // null = present
  technologies: z.array(z.string()),
  bullets: z.array(Bullet),
});
export type ProjectSection = z.infer<typeof ProjectSection>;

export const SkillRow = z.object({ category: z.string(), values: z.array(z.string()) });
export type SkillRow = z.infer<typeof SkillRow>;

export const ExtraSection = z.object({ heading: z.string(), lines: z.array(z.string()) });

export const ResumeContent = z.object({
  header: z.object({
    fullName: z.string(),
    title: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    linkedin: z.string().nullable(),
  }),
  meta: z.object({
    domainKey: z.string(),
    roleKey: z.string(),
    seniority: z.string().nullable(),
    totalExperienceMonths: z.number().int(),
    projectMode: z.enum(["FULL_DETAIL", "STANDARD", "CONCISE"]),
    pageTarget: z.number().int().min(1).max(6),
    templateKey: z.string(),
    isDemo: z.boolean(),
    generator: z.string(),
  }),
  summary: z.array(Bullet),
  projects: z.array(ProjectSection),
  skills: z.array(SkillRow),
  education: z.array(z.string()),
  certifications: z.array(z.string()),
  extraSections: z.array(ExtraSection),
});
export type ResumeContent = z.infer<typeof ResumeContent>;

export function allBullets(content: ResumeContent): Bullet[] {
  return [...content.summary, ...content.projects.flatMap((p) => p.bullets)];
}
