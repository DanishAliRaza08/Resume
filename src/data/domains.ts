// Starter domain and role library (spec §3, §7). Administrators can extend these records.

export type DomainKey = "BANKING" | "RETAIL" | "HEALTHCARE" | "PHARMA" | "PC_INSURANCE";

export interface DomainSeed {
  key: DomainKey;
  name: string;
  industryPhrase: string;
  aliases: string[];
  subdomains: string[];
  terminology: string[];
}

export const DOMAINS: DomainSeed[] = [
  {
    key: "BANKING",
    name: "Banking",
    industryPhrase: "Banking & Financial Services",
    aliases: ["banking", "financial services", "bfsi", "finance", "fintech"],
    subdomains: [
      "Capital Markets",
      "Commercial Lending",
      "Digital Banking",
      "Payments",
      "Regulatory Reporting",
      "AML/KYC",
      "Wealth Management",
      "Production Support",
    ],
    terminology: [
      "trade lifecycle", "clearing and settlement", "reconciliation", "loan origination", "loan servicing",
      "syndicated loans", "payments", "ach", "wire transfers", "swift", "iso 20022", "kyc", "aml",
      "know your customer", "anti-money laundering", "fraud detection", "basel", "dodd-frank", "mifid",
      "ccar", "credit risk", "market risk", "collateral management", "derivatives", "fixed income",
      "equities", "core banking", "general ledger", "regulatory reporting", "sanctions screening",
    ],
  },
  {
    key: "RETAIL",
    name: "Retail",
    industryPhrase: "Retail & E-commerce",
    aliases: ["retail", "e-commerce", "ecommerce", "consumer goods", "cpg"],
    subdomains: ["Point of Sale", "E-commerce", "Inventory Management", "Merchandising", "Customer Analytics", "Supply Chain"],
    terminology: [
      "point of sale", "pos", "omnichannel", "order management", "pricing", "promotions", "inventory",
      "replenishment", "returns", "customer journey", "loyalty", "merchandising", "assortment planning",
      "supply chain", "fulfillment", "warehouse management", "demand forecasting", "store operations",
      "category management", "product information management", "checkout",
    ],
  },
  {
    key: "HEALTHCARE",
    name: "Healthcare",
    industryPhrase: "Healthcare",
    aliases: ["healthcare", "health care", "payer", "provider", "clinical"],
    subdomains: ["EHR/EMR", "Claims", "Patient Access", "Interoperability", "Population Health", "Revenue Cycle", "Reporting"],
    terminology: [
      "ehr", "emr", "electronic health records", "claims", "claims adjudication", "patient access",
      "revenue cycle", "hl7", "fhir", "hipaa", "phi", "icd-10", "cpt", "edi 837", "edi 835",
      "eligibility", "prior authorization", "care management", "population health", "clinical workflows",
      "medicaid", "medicare", "value-based care", "interoperability", "data quality",
    ],
  },
  {
    key: "PHARMA",
    name: "Pharma",
    industryPhrase: "Pharmaceutical & Life Sciences",
    aliases: ["pharma", "pharmaceutical", "life sciences", "biotech"],
    subdomains: ["Clinical Trials", "Regulatory Submissions", "Laboratory (LIMS)", "Computer System Validation", "Pharmacovigilance", "Commercial"],
    terminology: [
      "gxp", "gmp", "glp", "gcp", "21 cfr part 11", "computer system validation", "csv", "audit trail",
      "clinical trials", "edc", "ctms", "pharmacovigilance", "adverse events", "regulatory submissions",
      "ectd", "lims", "validation", "iq/oq/pq", "capa", "deviation management", "change control",
      "sdtm", "cdisc", "controlled records",
    ],
  },
  {
    key: "PC_INSURANCE",
    name: "P&C Insurance",
    industryPhrase: "Property & Casualty Insurance",
    aliases: ["p&c", "property and casualty", "property & casualty", "insurance", "p&c insurance"],
    subdomains: ["Policy Administration", "Claims", "Underwriting", "Billing", "Broker Portals", "Rating"],
    terminology: [
      "policy administration", "policy lifecycle", "underwriting", "rating", "quote", "bind", "issuance",
      "endorsements", "renewals", "fnol", "first notice of loss", "claims adjudication", "subrogation",
      "reinsurance", "billing", "premium", "loss runs", "broker portal", "acord", "commercial lines",
      "personal lines", "workers compensation", "actuarial",
    ],
  },
];

export interface RoleSeed {
  key: string;
  name: string;
  aliases: string[];
  skillCategories: string[];
  summaryFocus: string[];
  includeQaBullets: boolean;
}

// Technical Skills categories are conditional on role (spec §6.4).
export const ROLES: RoleSeed[] = [
  {
    key: "BUSINESS_ANALYST",
    name: "Business Analyst",
    aliases: ["ba", "business analyst", "business systems analyst", "business system analyst", "functional analyst"],
    skillCategories: ["Domain Knowledge", "Business Analysis", "Methodologies", "Databases", "Reporting & BI", "Project Management", "Testing", "Integrations"],
    summaryFocus: ["requirements elicitation", "BRD/FRD documentation", "process modeling", "stakeholder management", "UAT coordination"],
    includeQaBullets: true,
  },
  {
    key: "DATA_ANALYST",
    name: "Data Analyst",
    aliases: ["da", "data analyst", "business data analyst", "reporting analyst", "bi analyst"],
    skillCategories: ["Domain Knowledge", "Databases", "Programming", "Reporting & BI", "Data Engineering", "Cloud", "Project Management", "Testing"],
    summaryFocus: ["data analysis", "data mapping and lineage", "SQL querying", "dashboards and reporting", "data quality"],
    includeQaBullets: true,
  },
  {
    key: "AWS_ENGINEER",
    name: "AWS Engineer",
    aliases: ["aws engineer", "cloud engineer", "devops engineer", "aws developer"],
    skillCategories: ["Domain Knowledge", "Cloud", "Programming", "Databases", "Integrations", "Deployment", "Testing", "Project Management"],
    summaryFocus: ["cloud architecture", "infrastructure as code", "CI/CD", "monitoring", "security controls"],
    includeQaBullets: true,
  },
  {
    key: "QA_ENGINEER",
    name: "QA Engineer",
    aliases: ["qa engineer", "qa analyst", "test engineer", "sdet", "quality assurance"],
    skillCategories: ["Domain Knowledge", "Testing", "Programming", "Databases", "Integrations", "Deployment", "Project Management"],
    summaryFocus: ["test planning", "test automation", "regression testing", "defect management", "API testing"],
    includeQaBullets: true,
  },
  {
    key: "PROJECT_MANAGER",
    name: "Project Manager",
    aliases: ["pm", "project manager", "program manager", "delivery manager", "scrum master"],
    skillCategories: ["Domain Knowledge", "Methodologies", "Project Management", "Reporting & BI", "Business Analysis"],
    summaryFocus: ["delivery planning", "risk and issue management", "stakeholder communication", "budget tracking", "Agile delivery"],
    includeQaBullets: false,
  },
];

export const SENIORITY_LEVELS = ["Junior", "Mid-level", "Senior", "Lead", "Principal"] as const;
