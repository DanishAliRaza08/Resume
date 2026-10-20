// Small fictional resume used only to render design thumbnails.
import type { Bullet, ResumeContent } from "@/lib/resume-schema";

const b = (id: string, text: string, section: "SUMMARY" | "PROJECT" = "PROJECT"): Bullet => ({
  id, section, projectId: section === "PROJECT" ? "p1" : null, type: section === "SUMMARY" ? "PRIMARY" : "PROJECT", text,
  action: null, domainConcept: null, technologyRefs: [], evidenceRefs: [], jdKeywordRefs: [], confidence: "high", requiresConfirmation: false, confirmed: true, source: "CANDIDATE",
});

export const SAMPLE_RESUME: ResumeContent = {
  header: { fullName: "Alex Morgan", title: "Senior Business Analyst", email: "alex@example.com", phone: "(555) 010-0100", location: "Austin, TX", linkedin: null },
  meta: { domainKey: "BANKING", roleKey: "BUSINESS_ANALYST", seniority: "Senior", totalExperienceMonths: 108, projectMode: "STANDARD", pageTarget: 2, templateKey: "classic", isDemo: false, generator: "sample" },
  summary: [
    b("s1", "Business Analyst with 9+ years of experience in Banking & Financial Services.", "SUMMARY"),
    b("s2", "Proficient in requirements elicitation, BRD/FRD documentation and process modeling.", "SUMMARY"),
    b("s3", "Skilled in SQL and Tableau for data validation and reporting.", "SUMMARY"),
  ],
  projects: [
    {
      id: "p1", position: 1, title: "Lending Platform Modernization", client: "Example Bank", clientConfirmed: true, clientVerification: "CANDIDATE_CONFIRMED",
      location: "Austin, TX", role: "Senior Business Analyst", domainKey: "BANKING", subdomain: "Commercial Lending", startDate: "2022-02-01", endDate: null,
      technologies: ["SQL", "JIRA", "Tableau"],
      bullets: [b("p1a", "Led requirements workshops with lending operations."), b("p1b", "Defined data mapping rules for loan portfolio migration."), b("p1c", "Coordinated UAT and defect triage.")],
    },
  ],
  skills: [{ category: "Databases", values: ["SQL"] }, { category: "Reporting & BI", values: ["Tableau"] }],
  education: ["B.S. Information Systems"],
  certifications: [],
  extraSections: [],
};
