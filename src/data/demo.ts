// Synthetic demo candidate used for seeding, tests and pilots (spec §16 release gate: pilot with
// synthetic/sample data first). All organizations are fictional and clearly marked as demo.

export const DEMO_CLIENTS = [
  { name: "Northwind Bank (Demo)", domain: "BANKING" as const, subdomain: "Commercial Lending" },
  { name: "Contoso Capital (Demo)", domain: "BANKING" as const, subdomain: "Capital Markets" },
  { name: "Fabrikam Financial (Demo)", domain: "BANKING" as const, subdomain: "Digital Banking" },
  { name: "Tailspin Trust (Demo)", domain: "BANKING" as const, subdomain: "Regulatory Reporting" },
  { name: "Woodgrove Savings (Demo)", domain: "BANKING" as const, subdomain: "AML/KYC" },
];

export interface DemoProject {
  employer: string;
  location: string;
  title: string; // job title
  projectTitle: string;
  templateName: string;
  subdomain: string;
  start: string;
  end: string | null;
  responsibilities: string[];
  technologies: string[];
}

export const DEMO_CANDIDATE = {
  fullName: "Jordan Avery (Demo)",
  email: "jordan.avery@example.com",
  phone: "(555) 010-0199",
  location: "Charlotte, NC",
  linkedin: null as string | null,
  targetTitle: "Senior Business Analyst",
  domainKey: "BANKING",
  roleKey: "BUSINESS_ANALYST",
  education: ["Bachelor of Science in Information Systems — Example State University"],
  certifications: ["Certified Business Analysis Professional (CBAP) — IIBA"],
  skills: ["SQL", "JIRA", "Confluence", "Microsoft Visio", "Microsoft Excel", "Agile", "Scrum", "Waterfall", "BRD", "FRD", "User Stories", "Use Cases", "Gap Analysis", "BPMN", "UAT", "SIT", "Tableau", "Data Mapping", "Requirements Traceability Matrix", "Defect Triage"],
  projects: [
    {
      employer: "Northwind Bank (Demo)",
      location: "Charlotte, NC",
      title: "Senior Business Analyst",
      projectTitle: "Commercial Lending Platform Modernization",
      templateName: "Commercial Lending Platform Modernization (Loan IQ)",
      subdomain: "Commercial Lending",
      start: "2023-02-01",
      end: null,
      responsibilities: [
        "Led requirements workshops with lending operations to define syndicated loan servicing rules in Loan IQ",
        "Defined data cleansing and transformation rules for migrating commercial loan portfolios from a legacy platform",
      ],
      technologies: ["Loan IQ", "SQL", "JIRA", "Confluence", "BPMN", "Tableau", "UAT", "User Stories"],
    },
    {
      employer: "Contoso Capital (Demo)",
      location: "New York, NY",
      title: "Senior Business Analyst",
      projectTitle: "Capital Markets Trade Processing and Reconciliation",
      templateName: "Capital Markets Trade Processing and Reconciliation",
      subdomain: "Capital Markets",
      start: "2021-01-01",
      end: "2023-01-31",
      responsibilities: ["Documented reconciliation break categories between the trade capture system and the settlement ledger"],
      technologies: ["SQL", "JIRA", "Confluence", "Microsoft Excel", "SIT", "UAT"],
    },
    {
      employer: "Fabrikam Financial (Demo)",
      location: "Dallas, TX",
      title: "Business Systems Analyst",
      projectTitle: "Digital Banking and P2P Payments",
      templateName: "Digital Banking and P2P Payments",
      subdomain: "Digital Banking",
      start: "2019-06-01",
      end: "2020-12-31",
      responsibilities: ["Wrote Gherkin-style acceptance criteria for P2P transfer and wallet top-up user stories"],
      technologies: ["JIRA", "Confluence", "REST APIs", "SQL", "User Stories"],
    },
    {
      employer: "Tailspin Trust (Demo)",
      location: "Boston, MA",
      title: "Business Analyst",
      projectTitle: "Regulatory Reporting Implementation",
      templateName: "Regulatory Reporting Implementation",
      subdomain: "Regulatory Reporting",
      start: "2017-11-01",
      end: "2019-05-31",
      responsibilities: [],
      technologies: ["SQL", "Microsoft Excel", "Microsoft Visio", "JIRA", "Data Mapping"],
    },
    {
      employer: "Woodgrove Savings (Demo)",
      location: "Columbus, OH",
      title: "Business Analyst",
      projectTitle: "AML/KYC Transaction Monitoring Enhancement",
      templateName: "AML/KYC Transaction Monitoring Enhancement",
      subdomain: "AML/KYC",
      start: "2017-03-01",
      end: "2017-10-31",
      responsibilities: [],
      technologies: ["SQL", "Confluence", "Gap Analysis", "UAT"],
    },
  ] satisfies DemoProject[],
};

export const SAMPLE_JD = `Senior Business Analyst — Commercial Lending

Responsibilities
- Lead requirements gathering and gap analysis for loan origination and loan servicing processes.
- Write user stories and acceptance criteria; maintain requirements traceability.
- Perform data mapping and data validation using SQL for data migration.
- Coordinate UAT and defect triage with business users.

Required Qualifications
- 7+ years of experience as a Business Analyst in banking.
- Hands-on experience with Loan IQ and SQL Server.
- Experience with JIRA and Confluence in an Agile/Scrum environment.
- Bachelor's degree in Business, Finance or Information Systems.

Preferred
- Power BI dashboards.
- Experience with nCino is a plus.
- CBAP certification preferred.
`;
