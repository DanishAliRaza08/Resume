// Technology catalog (spec §8.3): canonical names, aliases, categories and role/domain mappings.
// `availableFrom` is an approximate first year of general availability, used only for warnings.

export interface TechnologySeed {
  canonicalName: string;
  category: string;
  aliases: string[];
  roles: string[]; // role keys; empty = all roles
  domains: string[]; // domain keys; empty = all domains
  projectTypes: string[];
  availableFrom?: number;
}

const BA = "BUSINESS_ANALYST";
const DA = "DATA_ANALYST";
const AWS = "AWS_ENGINEER";
const QA = "QA_ENGINEER";
const PM = "PROJECT_MANAGER";

function t(
  canonicalName: string,
  category: string,
  aliases: string[] = [],
  opts: { roles?: string[]; domains?: string[]; projectTypes?: string[]; from?: number } = {},
): TechnologySeed {
  return {
    canonicalName,
    category,
    aliases,
    roles: opts.roles ?? [],
    domains: opts.domains ?? [],
    projectTypes: opts.projectTypes ?? [],
    availableFrom: opts.from,
  };
}

export const TECHNOLOGIES: TechnologySeed[] = [
  // Business analysis artefacts and practices
  t("BRD", "Business Analysis", ["business requirement document", "business requirements document", "business requirements documents", "brds"], { roles: [BA, PM] }),
  t("FRD", "Business Analysis", ["functional requirement document", "functional requirements document", "frds", "fsd", "functional specification"], { roles: [BA] }),
  t("SRS", "Business Analysis", ["software requirement specification", "software requirements specification"], { roles: [BA] }),
  t("User Stories", "Business Analysis", ["user story"], { roles: [BA, PM, QA] }),
  t("Use Cases", "Business Analysis", ["use case", "use-case"], { roles: [BA] }),
  t("Gap Analysis", "Business Analysis", ["gap assessment", "gap analyses"], { roles: [BA, DA] }),
  t("Requirements Traceability Matrix", "Business Analysis", ["rtm", "traceability matrix", "requirement traceability"], { roles: [BA, QA] }),
  t("JAD Sessions", "Business Analysis", ["joint application development", "jad"], { roles: [BA] }),
  t("BPMN", "Business Analysis", ["business process model and notation", "process modeling", "process modelling"], { roles: [BA] }),
  t("UML", "Business Analysis", ["unified modeling language"], { roles: [BA] }),
  t("Wireframing", "Business Analysis", ["wireframes", "mockups", "mock-ups"], { roles: [BA] }),
  t("Data Mapping", "Business Analysis", ["source-to-target mapping", "data mappings", "stm"], { roles: [BA, DA] }),
  t("Gherkin", "Business Analysis", ["bdd scenarios", "given/when/then"], { roles: [BA, QA] }),

  // Methodologies
  t("Agile", "Methodologies", ["agile methodology", "agile methodologies"], {}),
  t("Scrum", "Methodologies", ["scrum framework"], {}),
  t("Kanban", "Methodologies", [], {}),
  t("Waterfall", "Methodologies", ["sdlc waterfall"], {}),
  t("SAFe", "Methodologies", ["scaled agile framework", "scaled agile"], { from: 2011 }),
  t("SDLC", "Methodologies", ["software development life cycle", "software development lifecycle"], {}),
  t("Six Sigma", "Methodologies", ["lean six sigma"], {}),
  t("ITIL", "Methodologies", [], {}),

  // Project management & collaboration
  t("JIRA", "Project Management", ["jira software", "atlassian jira"], {}),
  t("Confluence", "Project Management", ["atlassian confluence"], {}),
  t("Azure DevOps", "Project Management", ["ado", "azure boards", "vsts"], { from: 2018 }),
  t("Rally", "Project Management", ["ca agile central", "rally software"], {}),
  t("MS Project", "Project Management", ["microsoft project"], { roles: [PM, BA] }),
  t("SharePoint", "Project Management", ["microsoft sharepoint"], {}),
  t("Microsoft Visio", "Project Management", ["visio", "ms visio"], { roles: [BA, PM, DA] }),
  t("Lucidchart", "Project Management", [], { roles: [BA, PM] }),
  t("Microsoft Excel", "Project Management", ["Excel", "ms excel", "advanced excel"], {}),
  t("Smartsheet", "Project Management", [], { roles: [PM] }),
  t("Trello", "Project Management", [], {}),
  t("ServiceNow", "Project Management", ["service now"], {}),
  t("Figma", "Project Management", [], { roles: [BA], from: 2016 }),
  t("Balsamiq", "Project Management", [], { roles: [BA] }),
  t("Microsoft Teams", "Project Management", ["ms teams"], { from: 2017 }),
  t("Slack", "Project Management", [], { from: 2014 }),

  // Databases
  t("SQL", "Databases", ["structured query language", "t-sql", "pl/sql", "ansi sql"], {}),
  t("Oracle", "Databases", ["oracle database", "oracle db", "oracle 19c"], {}),
  t("SQL Server", "Databases", ["ms sql server", "microsoft sql server", "mssql"], {}),
  t("PostgreSQL", "Databases", ["postgres"], {}),
  t("MySQL", "Databases", [], {}),
  t("DB2", "Databases", ["ibm db2"], {}),
  t("Teradata", "Databases", [], {}),
  t("MongoDB", "Databases", ["mongo"], {}),
  t("Snowflake", "Databases", ["snowflake data cloud"], { from: 2015 }),
  t("Amazon Redshift", "Databases", ["redshift"], { from: 2013 }),
  t("Amazon DynamoDB", "Databases", ["dynamodb"], { from: 2012 }),
  t("Amazon RDS", "Databases", ["rds"], { roles: [AWS, DA] }),

  // Programming
  t("Python", "Programming", ["python3"], { roles: [DA, AWS, QA] }),
  t("R", "Programming", ["r programming", "rstudio"], { roles: [DA] }),
  t("Java", "Programming", ["core java"], { roles: [QA, AWS] }),
  t("JavaScript", "Programming", ["js", "node.js", "nodejs"], { roles: [QA, AWS] }),
  t("TypeScript", "Programming", [], { roles: [QA, AWS], from: 2012 }),
  t("C#", "Programming", ["c sharp", ".net"], { roles: [QA] }),
  t("Bash", "Programming", ["shell scripting", "unix shell"], { roles: [AWS, QA] }),
  t("PowerShell", "Programming", [], { roles: [AWS] }),
  t("SAS", "Programming", ["sas programming", "base sas"], { roles: [DA] }),
  t("Pandas", "Programming", [], { roles: [DA] }),
  t("VBA", "Programming", ["excel macros"], { roles: [DA, BA] }),

  // Cloud
  t("AWS", "Cloud", ["amazon web services"], { from: 2006 }),
  t("Amazon S3", "Cloud", ["s3"], { roles: [AWS, DA] }),
  t("Amazon EC2", "Cloud", ["ec2"], { roles: [AWS] }),
  t("AWS Lambda", "Cloud", ["lambda functions"], { roles: [AWS], from: 2014 }),
  t("AWS Glue", "Cloud", ["Glue"], { roles: [AWS, DA], from: 2017 }),
  t("Amazon EKS", "Cloud", ["eks"], { roles: [AWS], from: 2018 }),
  t("Amazon ECS", "Cloud", ["ecs"], { roles: [AWS] }),
  t("AWS IAM", "Cloud", ["iam"], { roles: [AWS] }),
  t("Amazon VPC", "Cloud", ["vpc"], { roles: [AWS] }),
  t("Amazon CloudWatch", "Cloud", ["cloudwatch"], { roles: [AWS] }),
  t("AWS CloudFormation", "Cloud", ["cloudformation"], { roles: [AWS] }),
  t("Amazon API Gateway", "Cloud", ["api gateway"], { roles: [AWS] }),
  t("Amazon SQS", "Cloud", ["sqs"], { roles: [AWS] }),
  t("Amazon SNS", "Cloud", ["sns"], { roles: [AWS] }),
  t("Amazon Athena", "Cloud", ["athena"], { roles: [AWS, DA], from: 2016 }),
  t("Azure", "Cloud", ["microsoft azure"], { from: 2010 }),
  t("Google Cloud Platform", "Cloud", ["gcp", "google cloud"], {}),
  t("Databricks", "Cloud", [], { roles: [DA, AWS], from: 2015 }),

  // Reporting & BI
  t("Tableau", "Reporting & BI", ["tableau desktop", "tableau server"], {}),
  t("Power BI", "Reporting & BI", ["powerbi", "microsoft power bi"], { from: 2015 }),
  t("Looker", "Reporting & BI", [], {}),
  t("Qlik Sense", "Reporting & BI", ["qlikview", "qlik"], {}),
  t("SSRS", "Reporting & BI", ["sql server reporting services"], {}),
  t("Cognos", "Reporting & BI", ["ibm cognos"], {}),
  t("MicroStrategy", "Reporting & BI", [], {}),
  t("Business Objects", "Reporting & BI", ["sap businessobjects", "sap bo"], {}),
  t("Google Analytics", "Reporting & BI", [], { domains: ["RETAIL"] }),

  // Data engineering & governance
  t("Informatica", "Data Engineering", ["informatica powercenter", "iics"], {}),
  t("SSIS", "Data Engineering", ["sql server integration services"], {}),
  t("Talend", "Data Engineering", [], {}),
  t("Collibra", "Data Engineering", ["collibra data governance"], { from: 2008 }),
  t("Alation", "Data Engineering", [], { from: 2012 }),
  t("ETL", "Data Engineering", ["extract transform load", "elt"], {}),
  t("Apache Spark", "Data Engineering", ["spark", "pyspark"], { roles: [DA, AWS], from: 2014 }),
  t("Apache Airflow", "Data Engineering", ["airflow"], { roles: [DA, AWS], from: 2015 }),
  t("Apache Kafka", "Data Engineering", ["kafka"], { from: 2011 }),
  t("dbt", "Data Engineering", ["data build tool"], { roles: [DA], from: 2016 }),
  t("Data Lineage", "Data Engineering", ["lineage"], { roles: [DA, BA] }),
  t("Master Data Management", "Data Engineering", ["mdm"], {}),

  // Integrations
  t("REST APIs", "Integrations", ["restful", "rest api", "restful apis", "api"], {}),
  t("SOAP", "Integrations", ["soap web services", "wsdl"], {}),
  t("XML", "Integrations", [], {}),
  t("JSON", "Integrations", [], {}),
  t("MuleSoft", "Integrations", ["mule esb", "anypoint"], {}),
  t("Swagger", "Integrations", ["openapi"], {}),
  t("Postman", "Integrations", [], { roles: [QA, BA, AWS], from: 2012 }),
  t("EDI", "Integrations", ["electronic data interchange", "edi x12"], {}),
  t("SFTP", "Integrations", [], {}),

  // Testing
  t("UAT", "Testing", ["user acceptance testing"], {}),
  t("SIT", "Testing", ["system integration testing"], {}),
  t("Regression Testing", "Testing", ["regression"], {}),
  t("Functional Testing", "Testing", [], {}),
  t("Black-box Testing", "Testing", ["black box testing"], {}),
  t("Selenium", "Testing", ["selenium webdriver"], { roles: [QA] }),
  t("Cucumber", "Testing", [], { roles: [QA], from: 2008 }),
  t("TestNG", "Testing", [], { roles: [QA] }),
  t("JUnit", "Testing", [], { roles: [QA] }),
  t("Cypress", "Testing", [], { roles: [QA], from: 2017 }),
  t("Playwright", "Testing", [], { roles: [QA], from: 2020 }),
  t("HP ALM", "Testing", ["alm", "quality center", "hp quality center", "micro focus alm"], { roles: [QA, BA] }),
  t("qTest", "Testing", [], { roles: [QA] }),
  t("Zephyr", "Testing", [], { roles: [QA, BA] }),
  t("TestRail", "Testing", [], { roles: [QA] }),
  t("JMeter", "Testing", ["apache jmeter"], { roles: [QA] }),
  t("LoadRunner", "Testing", [], { roles: [QA] }),
  t("API Testing", "Testing", [], { roles: [QA] }),
  t("Defect Triage", "Testing", ["defect management", "defect tracking"], {}),

  // Deployment & DevOps
  t("Jenkins", "Deployment", [], { roles: [AWS, QA] }),
  t("Git", "Deployment", ["github", "gitlab", "bitbucket"], { roles: [AWS, QA, DA] }),
  t("Docker", "Deployment", [], { roles: [AWS, QA], from: 2013 }),
  t("Kubernetes", "Deployment", ["k8s"], { roles: [AWS], from: 2015 }),
  t("Terraform", "Deployment", [], { roles: [AWS], from: 2014 }),
  t("Ansible", "Deployment", [], { roles: [AWS] }),
  t("GitHub Actions", "Deployment", [], { roles: [AWS, QA], from: 2019 }),
  t("CI/CD", "Deployment", ["continuous integration", "continuous delivery", "continuous deployment"], { roles: [AWS, QA] }),

  // Domain platforms — Banking
  t("Loan IQ", "Domain Platforms", ["finastra loan iq", "loaniq"], { domains: ["BANKING"] }),
  t("AFS Vision", "Domain Platforms", ["afsvision"], { domains: ["BANKING"] }),
  t("Calypso", "Domain Platforms", [], { domains: ["BANKING"] }),
  t("Murex", "Domain Platforms", [], { domains: ["BANKING"] }),
  t("Fidessa", "Domain Platforms", [], { domains: ["BANKING"] }),
  t("Temenos T24", "Domain Platforms", ["t24", "temenos transact"], { domains: ["BANKING"] }),
  t("Finacle", "Domain Platforms", [], { domains: ["BANKING"] }),
  t("Oracle Flexcube", "Domain Platforms", ["flexcube"], { domains: ["BANKING"] }),
  t("FIS Systematics", "Domain Platforms", ["systematics"], { domains: ["BANKING"] }),
  t("Fiserv", "Domain Platforms", ["fiserv dna"], { domains: ["BANKING"] }),
  t("NICE Actimize", "Domain Platforms", ["actimize"], { domains: ["BANKING"] }),
  t("Oracle Mantas", "Domain Platforms", ["mantas", "oracle fccm"], { domains: ["BANKING"] }),
  t("SWIFT", "Domain Platforms", ["swift mt", "swift mx", "swift messages"], { domains: ["BANKING"] }),
  t("Bloomberg Terminal", "Domain Platforms", ["bloomberg"], { domains: ["BANKING"] }),
  t("Moody's Analytics", "Domain Platforms", ["moodys"], { domains: ["BANKING"] }),
  t("nCino", "Domain Platforms", [], { domains: ["BANKING"], from: 2012 }),

  // Domain platforms — Retail
  t("SAP ERP", "Domain Platforms", ["sap", "sap ecc", "sap s/4hana", "s/4hana"], { domains: ["RETAIL", "PHARMA"] }),
  t("Oracle Retail", "Domain Platforms", ["oracle rms", "retek"], { domains: ["RETAIL"] }),
  t("Salesforce", "Domain Platforms", ["salesforce crm", "sfdc"], {}),
  t("Salesforce Commerce Cloud", "Domain Platforms", ["demandware", "sfcc"], { domains: ["RETAIL"] }),
  t("Shopify", "Domain Platforms", [], { domains: ["RETAIL"] }),
  t("Manhattan WMS", "Domain Platforms", ["manhattan associates", "manhattan scale"], { domains: ["RETAIL"] }),
  t("Blue Yonder", "Domain Platforms", ["jda"], { domains: ["RETAIL"] }),
  t("Microsoft Dynamics 365", "Domain Platforms", ["dynamics 365", "dynamics ax"], { domains: ["RETAIL"] }),
  t("Adobe Analytics", "Domain Platforms", ["omniture"], { domains: ["RETAIL"] }),
  t("NCR POS", "Domain Platforms", ["ncr"], { domains: ["RETAIL"] }),

  // Domain platforms — Healthcare
  t("Epic", "Domain Platforms", ["epic systems", "epic ehr"], { domains: ["HEALTHCARE"] }),
  t("Cerner", "Domain Platforms", ["oracle cerner", "cerner millennium"], { domains: ["HEALTHCARE"] }),
  t("Facets", "Domain Platforms", ["trizetto facets"], { domains: ["HEALTHCARE"] }),
  t("QNXT", "Domain Platforms", [], { domains: ["HEALTHCARE"] }),
  t("HL7", "Domain Platforms", ["hl7 v2"], { domains: ["HEALTHCARE"] }),
  t("FHIR", "Domain Platforms", ["hl7 fhir"], { domains: ["HEALTHCARE"], from: 2014 }),
  t("Allscripts", "Domain Platforms", [], { domains: ["HEALTHCARE"] }),
  t("athenahealth", "Domain Platforms", ["athenanet"], { domains: ["HEALTHCARE"] }),
  t("Meditech", "Domain Platforms", [], { domains: ["HEALTHCARE"] }),
  t("ICD-10", "Domain Platforms", ["icd10"], { domains: ["HEALTHCARE"], from: 2015 }),

  // Domain platforms — Pharma
  t("Veeva Vault", "Domain Platforms", ["veeva", "veeva crm"], { domains: ["PHARMA"], from: 2011 }),
  t("LabWare LIMS", "Domain Platforms", ["labware"], { domains: ["PHARMA"] }),
  t("LIMS", "Domain Platforms", ["laboratory information management system"], { domains: ["PHARMA"] }),
  t("Medidata Rave", "Domain Platforms", ["medidata", "rave edc"], { domains: ["PHARMA"] }),
  t("Oracle Argus", "Domain Platforms", ["argus safety"], { domains: ["PHARMA"] }),
  t("TrackWise", "Domain Platforms", [], { domains: ["PHARMA"] }),
  t("MasterControl", "Domain Platforms", [], { domains: ["PHARMA"] }),
  t("CDISC SDTM", "Domain Platforms", ["sdtm", "cdisc"], { domains: ["PHARMA"] }),
  t("Empower CDS", "Domain Platforms", ["waters empower"], { domains: ["PHARMA"] }),

  // Domain platforms — P&C Insurance
  t("Guidewire PolicyCenter", "Domain Platforms", ["policycenter", "guidewire policy center"], { domains: ["PC_INSURANCE"] }),
  t("Guidewire ClaimCenter", "Domain Platforms", ["claimcenter", "guidewire claim center"], { domains: ["PC_INSURANCE"] }),
  t("Guidewire BillingCenter", "Domain Platforms", ["billingcenter", "guidewire billing center"], { domains: ["PC_INSURANCE"] }),
  t("Duck Creek", "Domain Platforms", ["duck creek policy", "duck creek claims"], { domains: ["PC_INSURANCE"] }),
  t("Majesco", "Domain Platforms", [], { domains: ["PC_INSURANCE"] }),
  t("Sapiens", "Domain Platforms", [], { domains: ["PC_INSURANCE"] }),
  t("ACORD Standards", "Domain Platforms", ["acord", "acord forms"], { domains: ["PC_INSURANCE"] }),
  t("ISO ERC", "Domain Platforms", ["iso electronic rating content", "iso rating"], { domains: ["PC_INSURANCE"] }),
  t("Insurity", "Domain Platforms", [], { domains: ["PC_INSURANCE"] }),
];
