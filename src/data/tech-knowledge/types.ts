// Technology knowledge base: what each tool is, plus senior-level bullet phrasing per role.
// Bullets are phrasing ideas only: the generator uses them only for technologies the user selected
// on that project, always marks them "needs confirmation", and drops any bullet that mentions a
// different tool the candidate did not select.

export type RoleKey = "BUSINESS_ANALYST" | "DATA_ANALYST" | "AWS_ENGINEER" | "QA_ENGINEER" | "PROJECT_MANAGER";

export interface TechKnowledge {
  /** One plain sentence: what the technology is and what it is used for. */
  description: string;
  /** Senior-level, past-tense bullet phrasing per role. May use {client} and {subdomain}. */
  bullets: Partial<Record<RoleKey, string[]>>;
}
