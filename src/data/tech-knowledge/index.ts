import { BA_PM_KNOWLEDGE } from "./ba-pm";
import { CLOUD_QA_KNOWLEDGE } from "./cloud-qa";
import { DATA_KNOWLEDGE } from "./data";
import { PLATFORM_KNOWLEDGE } from "./platforms";
import type { TechKnowledge } from "./types";

export type { RoleKey, TechKnowledge } from "./types";

export const TECH_KNOWLEDGE: Record<string, TechKnowledge> = {
  ...BA_PM_KNOWLEDGE,
  ...DATA_KNOWLEDGE,
  ...CLOUD_QA_KNOWLEDGE,
  ...PLATFORM_KNOWLEDGE,
};
