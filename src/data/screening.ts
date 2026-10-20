// Common job-application and screening questions (Dice and most job boards ask some of these).
// Answers belong to the candidate. Nothing is ever defaulted to "Yes": unanswered questions stay
// blank and are flagged so the candidate answers them truthfully.

export type QuestionType = "text" | "yes-no" | "select" | "number";

export interface ScreeningQuestion {
  key: string;
  label: string;
  group: "Contact" | "Eligibility" | "Experience & pay" | "Preferences" | "Checks";
  type: QuestionType;
  options?: string[];
  required: boolean;
  /** Words that typically appear in the application form's question. */
  keywords: string[];
}

export const SCREENING_QUESTIONS: ScreeningQuestion[] = [
  { key: "first_name", label: "First name", group: "Contact", type: "text", required: true, keywords: ["first name"] },
  { key: "last_name", label: "Last name", group: "Contact", type: "text", required: true, keywords: ["last name"] },
  { key: "email", label: "Email", group: "Contact", type: "text", required: true, keywords: ["email"] },
  { key: "phone", label: "Phone", group: "Contact", type: "text", required: true, keywords: ["phone", "mobile"] },
  { key: "linkedin", label: "LinkedIn URL", group: "Contact", type: "text", required: false, keywords: ["linkedin"] },
  { key: "city", label: "City", group: "Contact", type: "text", required: true, keywords: ["city"] },
  { key: "state", label: "State", group: "Contact", type: "text", required: true, keywords: ["state"] },
  { key: "zip", label: "ZIP code", group: "Contact", type: "text", required: false, keywords: ["zip", "postal"] },
  { key: "country", label: "Country", group: "Contact", type: "text", required: true, keywords: ["country"] },

  { key: "work_authorized", label: "Are you legally authorized to work in the United States?", group: "Eligibility", type: "yes-no", required: true, keywords: ["authorized to work", "legally authorized", "eligible to work"] },
  { key: "need_sponsorship", label: "Will you now or in the future require visa sponsorship?", group: "Eligibility", type: "yes-no", required: true, keywords: ["sponsorship", "visa"] },
  { key: "work_authorization_type", label: "Work authorization status", group: "Eligibility", type: "select", options: ["US Citizen", "Green Card", "H-1B", "EAD (OPT / CPT / H4 / L2 / GC-EAD)", "TN", "Other"], required: true, keywords: ["work authorization", "visa status", "citizenship status"] },
  { key: "security_clearance", label: "Active security clearance", group: "Eligibility", type: "select", options: ["None", "Public Trust", "Secret", "Top Secret", "TS/SCI"], required: true, keywords: ["clearance"] },
  { key: "age_18", label: "Are you at least 18 years old?", group: "Eligibility", type: "yes-no", required: true, keywords: ["18 years", "at least 18"] },

  { key: "years_experience", label: "Total years of professional experience", group: "Experience & pay", type: "number", required: true, keywords: ["years of experience", "how many years"] },
  { key: "highest_education", label: "Highest education completed", group: "Experience & pay", type: "select", options: ["High school", "Associate", "Bachelor's", "Master's", "Doctorate"], required: true, keywords: ["education", "degree"] },
  { key: "desired_salary", label: "Desired annual salary (USD)", group: "Experience & pay", type: "text", required: false, keywords: ["salary", "compensation"] },
  { key: "hourly_rate", label: "Desired hourly rate (USD)", group: "Experience & pay", type: "text", required: false, keywords: ["hourly rate", "rate"] },
  { key: "employment_type", label: "Employment type wanted", group: "Experience & pay", type: "select", options: ["Full-time", "Contract (W2)", "Contract (C2C)", "Contract to hire", "Any"], required: true, keywords: ["employment type", "w2", "c2c", "corp to corp"] },

  { key: "work_mode", label: "Work location preference", group: "Preferences", type: "select", options: ["Remote", "Hybrid", "On-site", "Any"], required: true, keywords: ["remote", "hybrid", "on-site", "onsite"] },
  { key: "willing_to_relocate", label: "Are you willing to relocate?", group: "Preferences", type: "yes-no", required: true, keywords: ["relocate"] },
  { key: "start_availability", label: "When can you start? / notice period", group: "Preferences", type: "text", required: true, keywords: ["start", "notice period", "available"] },

  { key: "background_check", label: "Are you willing to undergo a background check?", group: "Checks", type: "yes-no", required: true, keywords: ["background check"] },
  { key: "drug_test", label: "Are you willing to take a drug test?", group: "Checks", type: "yes-no", required: false, keywords: ["drug"] },
];

export function missingRequired(answers: Record<string, string>): ScreeningQuestion[] {
  return SCREENING_QUESTIONS.filter((q) => q.required && !(answers[q.key] ?? "").trim());
}
