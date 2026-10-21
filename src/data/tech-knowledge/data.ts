import type { TechnologySeed } from "../technologies";
import type { TechKnowledge } from "./types";

/** Technologies added in this file (also need a knowledge entry below). */
export const EXTRA_DATA: TechnologySeed[] = [
  { canonicalName: "Alteryx", category: "Reporting & BI", aliases: ["alteryx designer"], roles: ["DATA_ANALYST", "BUSINESS_ANALYST"], domains: [], projectTypes: [] },
  { canonicalName: "Looker Studio", category: "Reporting & BI", aliases: ["google data studio"], roles: ["DATA_ANALYST", "BUSINESS_ANALYST"], domains: [], projectTypes: [], availableFrom: 2016 },
  { canonicalName: "Power Query", category: "Reporting & BI", aliases: ["power query editor"], roles: ["DATA_ANALYST", "BUSINESS_ANALYST"], domains: [], projectTypes: [], availableFrom: 2013 },
  { canonicalName: "Google BigQuery", category: "Databases", aliases: ["bigquery"], roles: ["DATA_ANALYST", "AWS_ENGINEER"], domains: [], projectTypes: [], availableFrom: 2011 },
  { canonicalName: "Azure Synapse Analytics", category: "Databases", aliases: ["azure synapse", "synapse analytics"], roles: ["DATA_ANALYST", "AWS_ENGINEER"], domains: [], projectTypes: [], availableFrom: 2019 },
  { canonicalName: "NumPy", category: "Programming", aliases: [], roles: ["DATA_ANALYST"], domains: [], projectTypes: [] },
  { canonicalName: "Scala", category: "Programming", aliases: ["scala programming"], roles: ["DATA_ANALYST", "AWS_ENGINEER"], domains: [], projectTypes: [] },
  { canonicalName: "SPSS", category: "Programming", aliases: ["ibm spss", "spss statistics"], roles: ["DATA_ANALYST"], domains: [], projectTypes: [] },
  { canonicalName: "Azure Data Factory", category: "Data Engineering", aliases: ["adf pipelines"], roles: ["DATA_ANALYST", "AWS_ENGINEER"], domains: [], projectTypes: [], availableFrom: 2015 },
  { canonicalName: "Apache Hive", category: "Data Engineering", aliases: ["hive", "hiveql"], roles: ["DATA_ANALYST", "AWS_ENGINEER"], domains: [], projectTypes: [] },
  { canonicalName: "Hadoop", category: "Data Engineering", aliases: ["apache hadoop", "hdfs"], roles: ["DATA_ANALYST", "AWS_ENGINEER"], domains: [], projectTypes: [] },
  { canonicalName: "ERwin Data Modeler", category: "Data Engineering", aliases: ["erwin"], roles: ["DATA_ANALYST", "BUSINESS_ANALYST"], domains: [], projectTypes: [] },
];

export const DATA_KNOWLEDGE: Record<string, TechKnowledge> = {
  // ---------------------------------------------------------------- Databases
  "SQL": {
    description: "Standard query language for retrieving, transforming and validating data in relational databases.",
    bullets: {
      DATA_ANALYST: [
        "Authored complex SQL queries with window functions and common table expressions to reconcile {subdomain} metrics across source systems and the data warehouse.",
        "Optimized long-running SQL against large fact tables by restructuring joins, pruning predicates and partnering with database administrators on indexing strategy.",
        "Standardized a library of peer-reviewed SQL views that gave analysts a single trusted definition for core business measures and dimensions.",
      ],
      BUSINESS_ANALYST: [
        "Wrote exploratory SQL to profile source data, confirm business rules and ground requirements in evidence before committing scope with stakeholders.",
        "Validated delivered reports for {client} by tracing figures back to source tables with SQL and documenting discrepancies for the development team.",
      ],
      QA_ENGINEER: [
        "Designed SQL validation suites comparing source and target record counts, aggregates and field-level values to certify data loads before release.",
        "Authored SQL checks for referential integrity, duplicates and null handling that became standard exit criteria for data-centric test cycles.",
      ],
      AWS_ENGINEER: [
        "Reviewed and tuned SQL for data platform workloads, analyzing query plans and access patterns to keep downstream analytics responsive and predictable.",
      ],
    },
  },
  "Oracle": {
    description: "Enterprise relational database platform widely used for transactional systems and data warehouses.",
    bullets: {
      DATA_ANALYST: [
        "Developed Oracle stored procedures, packages and materialized views that consolidated {subdomain} data into governed reporting structures for downstream analysis.",
        "Tuned Oracle queries using execution plans, partitioning and indexing recommendations to stabilize month-end reporting workloads for finance and operations teams.",
        "Reconciled extracts from the Oracle operational database against warehouse totals and led root-cause analysis with application owners on recurring variances.",
      ],
      BUSINESS_ANALYST: [
        "Queried Oracle application schemas to confirm current-state business rules and data definitions, grounding functional requirements in how the system actually behaved.",
      ],
      QA_ENGINEER: [
        "Validated back-end Oracle data after each build, verifying that transactions, status changes and audit columns persisted exactly as the business rules required.",
      ],
      AWS_ENGINEER: [
        "Planned the migration of Oracle schemas to managed cloud databases, assessing compatibility of procedural code, data types and cutover sequencing with application teams.",
      ],
    },
  },
  "SQL Server": {
    description: "Microsoft relational database engine used for transactional applications, reporting databases and data marts.",
    bullets: {
      DATA_ANALYST: [
        "Designed SQL Server schemas, indexed views and stored procedures supporting {subdomain} reporting, with naming and documentation standards adopted across the analytics team.",
        "Diagnosed performance bottlenecks in SQL Server using execution plans and wait statistics, rewriting critical procedures to keep scheduled reports within service windows.",
        "Built reconciliation procedures in SQL Server that flagged out-of-balance records daily and routed exceptions to data owners for resolution.",
      ],
      BUSINESS_ANALYST: [
        "Analyzed SQL Server transaction tables to document current-state data flows and validate assumptions behind proposed process changes for {client}.",
      ],
      QA_ENGINEER: [
        "Verified application persistence in SQL Server through targeted queries against transactional tables, confirming inserts, updates and audit trails matched expected outcomes.",
      ],
      AWS_ENGINEER: [
        "Led the rehosting of SQL Server databases to managed cloud instances, defining backup, high-availability and cutover procedures with application and infrastructure teams.",
      ],
    },
  },
  "PostgreSQL": {
    description: "Open-source relational database known for standards compliance, extensibility and strong analytical features.",
    bullets: {
      DATA_ANALYST: [
        "Modeled PostgreSQL schemas for analytical workloads, applying partitioning, constraints and indexing choices that balanced query speed with long-term maintainability.",
        "Authored PostgreSQL views and functions that centralized business logic for {subdomain} reporting and removed conflicting calculations from downstream dashboards.",
        "Profiled PostgreSQL source tables to surface anomalies, orphaned records and inconsistent codes, then agreed remediation rules with application owners.",
      ],
      AWS_ENGINEER: [
        "Administered PostgreSQL instances for application workloads, owning parameter tuning, replication setup, backup verification and controlled version upgrades.",
        "Migrated legacy schemas to PostgreSQL, validating data type conversions, sequences and permissions before coordinating a low-risk production cutover.",
      ],
      QA_ENGINEER: [
        "Built PostgreSQL validation queries that confirmed application writes, constraint enforcement and rollback behavior across end-to-end test scenarios.",
      ],
    },
  },
  "MySQL": {
    description: "Widely used open-source relational database for web applications and operational data stores.",
    bullets: {
      DATA_ANALYST: [
        "Wrote analytical MySQL queries against operational replicas to deliver {subdomain} insights without adding load to production transaction processing.",
        "Documented MySQL table structures, keys and business definitions, creating a shared reference that eased onboarding for new analysts and engineers.",
      ],
      AWS_ENGINEER: [
        "Managed MySQL databases supporting customer-facing applications, owning replication, backup restores, user privileges and schema change reviews.",
        "Tuned MySQL performance by analyzing slow query logs, adding targeted indexes and coordinating schema changes with development teams.",
      ],
      QA_ENGINEER: [
        "Seeded and reset MySQL test data through repeatable scripts, keeping shared test environments consistent and isolating genuine defects from data drift.",
      ],
    },
  },
  "DB2": {
    description: "IBM relational database commonly running core mainframe and midrange business systems.",
    bullets: {
      DATA_ANALYST: [
        "Extracted and reconciled DB2 mainframe data for {subdomain} reporting, translating legacy codes and packed fields into analyst-ready structures.",
        "Wrote optimized DB2 queries against high-volume transactional tables, coordinating with database administrators to respect batch windows and locking constraints.",
        "Documented DB2 table relationships and field semantics that previously lived only in tribal knowledge, supporting modernization and reporting initiatives.",
      ],
      BUSINESS_ANALYST: [
        "Analyzed DB2 legacy data structures to define requirements for modernizing core processing, clarifying field meanings and edge cases with subject matter experts.",
      ],
      QA_ENGINEER: [
        "Validated DB2 records after batch cycles, confirming that posted transactions, balances and status flags matched expected results for each test scenario.",
      ],
    },
  },
  "Teradata": {
    description: "Massively parallel enterprise data warehouse platform for large-scale analytical workloads.",
    bullets: {
      DATA_ANALYST: [
        "Developed Teradata queries and volatile table workflows to analyze {subdomain} performance across large historical datasets in the enterprise warehouse.",
        "Optimized Teradata workloads by reviewing explain plans, primary index choices and collected statistics to reduce data skew and resource contention.",
        "Led the rationalization of redundant Teradata reporting tables, consolidating overlapping logic into governed views owned by the analytics team.",
      ],
      BUSINESS_ANALYST: [
        "Queried Teradata warehouse tables to validate business definitions and confirm that proposed reports could be sourced from existing structures.",
      ],
    },
  },
  "MongoDB": {
    description: "Document-oriented NoSQL database that stores flexible, JSON-like records for application workloads.",
    bullets: {
      AWS_ENGINEER: [
        "Designed MongoDB document models and indexes aligned to application access patterns, balancing embedding and referencing for performance and maintainability.",
        "Operated MongoDB replica sets in production, owning backup strategy, monitoring, user roles and controlled version upgrades for dependent services.",
      ],
      DATA_ANALYST: [
        "Built MongoDB aggregation pipelines to flatten nested documents into analysis-ready datasets for {subdomain} reporting and ad hoc investigation.",
      ],
      QA_ENGINEER: [
        "Verified MongoDB document contents after service calls, checking nested fields, defaults and schema evolution against expected business behavior.",
      ],
    },
  },
  "Snowflake": {
    description: "Cloud data warehouse that separates storage and compute for scalable, governed analytics.",
    bullets: {
      DATA_ANALYST: [
        "Modeled Snowflake warehouse layers with clear staging, integration and presentation schemas, establishing conventions adopted across the analytics team.",
        "Designed Snowflake role hierarchies and secure views that gave business users governed access to sensitive {subdomain} data.",
        "Managed Snowflake cost and performance by right-sizing virtual warehouses, applying clustering where justified and retiring unused objects.",
      ],
      AWS_ENGINEER: [
        "Engineered Snowflake ingestion using external stages, file formats and scheduled tasks, with monitoring that surfaced failed loads before business users noticed.",
        "Implemented Snowflake resource monitors, network policies and access controls in partnership with security teams to meet enterprise governance standards.",
      ],
      BUSINESS_ANALYST: [
        "Partnered with data engineers to define Snowflake reporting marts for {client}, translating stakeholder questions into documented dimensions, measures and grain.",
      ],
    },
  },
  "Amazon Redshift": {
    description: "Managed columnar data warehouse service for large-scale analytical querying.",
    bullets: {
      AWS_ENGINEER: [
        "Architected Amazon Redshift clusters for analytical workloads, selecting distribution and sort keys based on join patterns and query profiles.",
        "Automated Amazon Redshift maintenance, workload management queues and snapshot policies, keeping the warehouse stable as usage expanded across teams.",
        "Led the migration of legacy warehouse tables into Amazon Redshift, validating data parity and coordinating report cutover with business owners.",
      ],
      DATA_ANALYST: [
        "Built Redshift reporting views and summary tables that consolidated {subdomain} metrics and became the trusted source for executive dashboards.",
        "Diagnosed slow Redshift queries by reviewing query plans, restructuring joins and recommending key changes to the platform team.",
      ],
    },
  },
  "Amazon DynamoDB": {
    description: "Fully managed key-value and document database built for low-latency access at any scale.",
    bullets: {
      AWS_ENGINEER: [
        "Designed Amazon DynamoDB tables around access patterns, defining partition keys, sort keys and secondary indexes for predictable low-latency reads.",
        "Configured DynamoDB capacity modes, time-to-live policies and point-in-time recovery, balancing cost, durability and operational simplicity.",
        "Implemented DynamoDB streams to propagate item changes to downstream consumers, documenting idempotency and retry expectations for each integration.",
      ],
      QA_ENGINEER: [
        "Validated DynamoDB item state after service operations, verifying attributes, conditional writes and expiry behavior against acceptance criteria.",
      ],
    },
  },
  "Amazon RDS": {
    description: "Managed relational database service that automates provisioning, patching, backups and failover.",
    bullets: {
      AWS_ENGINEER: [
        "Provisioned and hardened Amazon RDS instances with encryption, parameter groups, automated backups and multi-zone failover aligned to recovery objectives.",
        "Planned Amazon RDS engine upgrades and maintenance windows, rehearsing rollback steps and coordinating schedules with application owners.",
        "Monitored Amazon RDS performance insights to identify expensive queries and capacity constraints, partnering with developers on remediation.",
      ],
      DATA_ANALYST: [
        "Sourced analytical extracts from Amazon RDS read replicas, protecting production workloads while delivering timely {subdomain} reporting.",
      ],
    },
  },
  "Google BigQuery": {
    description: "Serverless cloud data warehouse for running fast analytical queries over large datasets.",
    bullets: {
      DATA_ANALYST: [
        "Developed Google BigQuery analytical datasets with partitioned and clustered tables, controlling scan costs while supporting {subdomain} reporting.",
        "Authored BigQuery views and scheduled queries that centralized business logic for dashboards and ad hoc analysis.",
        "Governed BigQuery dataset permissions and documentation, aligning access with data ownership and sensitivity classifications.",
      ],
      AWS_ENGINEER: [
        "Engineered ingestion into Google BigQuery with schema management, load monitoring and cost controls for analytics workloads.",
      ],
    },
  },
  "Azure Synapse Analytics": {
    description: "Microsoft cloud analytics service combining enterprise data warehousing with on-demand query over files.",
    bullets: {
      DATA_ANALYST: [
        "Modeled Azure Synapse Analytics dedicated pool tables with distribution and indexing choices suited to large {subdomain} reporting workloads.",
        "Built Azure Synapse views and serverless queries over raw files in cloud storage, giving analysts governed access without duplicating data.",
        "Tuned Azure Synapse workloads through statistics maintenance, workload classification and materialized views for consistent dashboard performance.",
      ],
      AWS_ENGINEER: [
        "Provisioned Azure Synapse Analytics workspaces with access controls, private networking and monitoring aligned to enterprise security standards.",
      ],
    },
  },

  // ---------------------------------------------------------------- Programming
  "Python": {
    description: "General-purpose programming language used for data analysis, automation, testing and cloud services.",
    bullets: {
      DATA_ANALYST: [
        "Developed Python scripts to automate recurring data extraction, cleansing and reconciliation, replacing manual spreadsheet steps with reviewed, version-controlled code.",
        "Built Python analysis notebooks that profiled {subdomain} datasets, documented assumptions and produced reproducible findings for business stakeholders.",
        "Established Python coding standards, shared utility modules and peer review practices that raised the reliability of analytics code across the team.",
      ],
      AWS_ENGINEER: [
        "Engineered Python automation for infrastructure operations, including resource inventory, tagging compliance and scheduled cleanup of unused cloud assets.",
        "Wrote Python serverless functions for event-driven processing, with structured logging, error handling and retry behavior designed for production support.",
      ],
      QA_ENGINEER: [
        "Built Python test utilities for data comparison and service validation, integrating them into the team's automated test suites.",
        "Authored Python data generators that produced realistic, privacy-safe test records covering boundary conditions and negative scenarios.",
      ],
    },
  },
  "R": {
    description: "Statistical programming language for data analysis, modeling and reproducible reporting.",
    bullets: {
      DATA_ANALYST: [
        "Developed statistical models in R programming to analyze {subdomain} trends, documenting methodology and assumptions for review by business stakeholders.",
        "Built reproducible RStudio projects with parameterized reports that replaced manual analysis packs and gave leadership consistent periodic insight.",
        "Applied hypothesis testing and forecasting techniques in R programming to evaluate business initiatives and communicate uncertainty to decision makers.",
      ],
    },
  },
  "Java": {
    description: "Object-oriented programming language used for enterprise services and test automation frameworks.",
    bullets: {
      QA_ENGINEER: [
        "Architected a maintainable Java test automation framework using page objects, reusable utilities and clear reporting adopted across multiple delivery teams.",
        "Wrote Java service-level tests validating business rules and error handling, reducing reliance on slow, brittle end-to-end checks.",
        "Mentored testers on Java coding practices, leading code reviews that improved readability, stability and reuse of automated tests.",
      ],
      AWS_ENGINEER: [
        "Developed Java microservices for cloud deployment, owning configuration management, health checks and structured logging for production supportability.",
      ],
    },
  },
  "JavaScript": {
    description: "Programming language of the web, used for front-end behavior, server-side services and browser test automation.",
    bullets: {
      QA_ENGINEER: [
        "Built JavaScript end-to-end test suites with resilient selectors, shared fixtures and clear failure diagnostics for web application releases.",
        "Authored JavaScript utilities for test data setup and teardown, keeping automated suites independent and repeatable across environments.",
      ],
      AWS_ENGINEER: [
        "Developed Node.js serverless handlers for event processing, implementing input validation, error handling and structured logging for operational visibility.",
        "Wrote JavaScript automation for deployment checks and environment validation, reducing manual verification effort during releases.",
      ],
    },
  },
  "TypeScript": {
    description: "Typed superset of JavaScript that adds static types for safer, more maintainable code.",
    bullets: {
      QA_ENGINEER: [
        "Designed a TypeScript test automation framework with typed page models, reusable fixtures and linting standards enforced through code review.",
        "Migrated existing test suites to TypeScript, introducing strict typing that caught brittle assumptions before tests reached the build pipeline.",
      ],
      AWS_ENGINEER: [
        "Defined cloud infrastructure components in TypeScript, packaging reusable, reviewed patterns for networking, storage and compute that application teams adopted safely.",
        "Built TypeScript services for event-driven workloads with typed contracts, input validation and consistent error handling across teams.",
      ],
    },
  },
  "C#": {
    description: "Microsoft object-oriented language for enterprise applications and test automation on the .NET platform.",
    bullets: {
      QA_ENGINEER: [
        "Developed a C# automation framework with layered page and service abstractions, configuration management and reporting used by several product teams.",
        "Wrote C# integration tests validating business logic and data persistence, partnering with developers to embed them in the build process.",
        "Reviewed C# test code for maintainability and flakiness, setting conventions for waits, assertions and test data isolation.",
      ],
    },
  },
  "Bash": {
    description: "Unix shell and scripting language for automating server, file and deployment tasks.",
    bullets: {
      AWS_ENGINEER: [
        "Wrote Bash scripts to automate server provisioning, log rotation, health checks and deployment steps, standardizing operations across environments.",
        "Hardened shell scripting practices with strict error handling, idempotent steps and peer review, reducing risk in scheduled operational jobs.",
        "Automated file transfers, archive housekeeping and environment checks with Bash, documenting each job's purpose, schedule and recovery steps.",
      ],
      QA_ENGINEER: [
        "Built Bash utilities to provision test environments, load seed data and collect logs, making test runs repeatable and failures easier to diagnose.",
      ],
    },
  },
  "PowerShell": {
    description: "Microsoft task automation shell and scripting language for system and cloud administration.",
    bullets: {
      AWS_ENGINEER: [
        "Automated server configuration, user provisioning and patch verification with PowerShell scripts, replacing error-prone manual procedures.",
        "Developed PowerShell modules for cloud resource administration, with parameter validation, logging and documentation for operations staff.",
        "Built PowerShell health-check and reporting scripts that surfaced configuration drift and failed services to the operations team each day.",
      ],
    },
  },
  "SAS": {
    description: "Statistical software suite for data management, advanced analytics and regulatory reporting.",
    bullets: {
      DATA_ANALYST: [
        "Developed SAS programs for {subdomain} data preparation and statistical analysis, applying documented, auditable logic suitable for regulatory review.",
        "Modernized legacy SAS macros by consolidating duplicated steps, adding validation checks and documenting inputs, outputs and business rules.",
        "Produced recurring SAS reports and analytic datasets for risk and finance partners, reconciling outputs against source totals before release.",
      ],
    },
  },
  "Pandas": {
    description: "Data analysis library providing DataFrames for cleaning, transforming and analyzing tabular data.",
    bullets: {
      DATA_ANALYST: [
        "Built Pandas transformation routines for cleansing, merging and reshaping {subdomain} datasets, with validation checks at each stage.",
        "Replaced manual spreadsheet reconciliations with reviewed Pandas workflows that compared source extracts and flagged exceptions for business owners.",
        "Profiled large datasets with Pandas to identify missing values, outliers and inconsistent codes, documenting findings for data owners.",
      ],
    },
  },
  "VBA": {
    description: "Visual Basic for Applications, the macro language for automating Microsoft Office workbooks and documents.",
    bullets: {
      DATA_ANALYST: [
        "Developed VBA macros to automate recurring workbook reporting, including data refresh, formatting and distribution steps previously handled manually.",
        "Rebuilt fragile VBA tools with structured modules, error handling and documentation so business teams could maintain them confidently.",
      ],
      BUSINESS_ANALYST: [
        "Automated requirements tracking and status packs with VBA, giving {client} stakeholders consistent weekly views without manual consolidation.",
      ],
    },
  },
  "NumPy": {
    description: "Numerical computing library providing fast multi-dimensional arrays and mathematical functions.",
    bullets: {
      DATA_ANALYST: [
        "Implemented NumPy vectorized calculations for statistical analysis and simulations, replacing slow iterative logic in analytical scripts.",
        "Applied NumPy array operations to clean and transform numeric datasets, validating results against independent reference calculations.",
        "Built reusable NumPy utilities for sampling, weighting and outlier treatment shared across {subdomain} analysis projects.",
      ],
    },
  },
  "Scala": {
    description: "JVM programming language combining functional and object-oriented styles, common in distributed data processing.",
    bullets: {
      AWS_ENGINEER: [
        "Developed Scala data processing jobs with strong typing, functional patterns and unit tests for reliable distributed batch workloads.",
        "Refactored Scala transformation code into shared libraries with clear interfaces, simplifying maintenance across data engineering teams.",
      ],
      DATA_ANALYST: [
        "Wrote Scala transformations for large {subdomain} datasets, partnering with engineers on performance tuning and code review standards.",
      ],
    },
  },
  "SPSS": {
    description: "IBM statistical analysis software for survey analysis, significance testing and predictive modeling.",
    bullets: {
      DATA_ANALYST: [
        "Conducted statistical analysis in SPSS, including significance testing and segmentation, to inform {subdomain} decisions with documented methodology.",
        "Built SPSS syntax files that made survey and operational analyses reproducible, reviewable and straightforward to rerun.",
        "Presented SPSS findings to business stakeholders, translating statistical results into clear recommendations with appropriate caveats.",
      ],
    },
  },

  // ---------------------------------------------------------------- Reporting & BI
  "Tableau": {
    description: "Visual analytics platform for building interactive dashboards and reports.",
    bullets: {
      DATA_ANALYST: [
        "Designed Tableau dashboards for {subdomain} leadership with drill-down navigation, consistent visual standards and clearly documented metric definitions.",
        "Built governed Tableau data sources with certified calculations and row-level security, eliminating conflicting versions of key measures.",
        "Optimized Tableau workbook performance by simplifying calculations, using extracts appropriately and pushing aggregation down to the source layer.",
      ],
      BUSINESS_ANALYST: [
        "Gathered dashboard requirements and produced Tableau prototypes with business users, iterating on layout and metrics before development commitments.",
        "Validated Tableau reports against source figures and business rules, documenting variances and sign-off decisions for {client} stakeholders.",
      ],
      PROJECT_MANAGER: [
        "Established Tableau delivery dashboards tracking milestones, risks and resource allocation for steering committee reviews.",
      ],
    },
  },
  "Power BI": {
    description: "Microsoft business intelligence platform for data modeling, interactive reports and dashboards.",
    bullets: {
      DATA_ANALYST: [
        "Developed Power BI data models with star schemas, DAX measures and row-level security serving {subdomain} reporting across business units.",
        "Administered Power BI workspaces, deployment practices and dataset refresh schedules, establishing governance standards for self-service report authors.",
        "Optimized Power BI report performance by reducing model cardinality, rewriting DAX measures and aggregating data upstream.",
      ],
      BUSINESS_ANALYST: [
        "Translated stakeholder reporting needs into Power BI report specifications covering measures, filters, drill paths and access rules.",
        "Coordinated Power BI acceptance reviews with business owners, tracing each visual to agreed definitions before production release.",
      ],
      PROJECT_MANAGER: [
        "Built Power BI portfolio dashboards consolidating schedule, budget and risk status, giving sponsors a consistent view for governance decisions.",
      ],
    },
  },
  "Looker": {
    description: "Semantic-layer BI platform that models data in LookML for governed self-service exploration.",
    bullets: {
      DATA_ANALYST: [
        "Developed LookML models with reusable dimensions, measures and explores in Looker, giving business users governed self-service access to {subdomain} data.",
        "Standardized Looker metric definitions and naming conventions, retiring duplicate explores that produced conflicting figures across teams.",
        "Implemented Looker access filters and content folders aligned to data sensitivity, partnering with governance owners on permission reviews.",
      ],
      BUSINESS_ANALYST: [
        "Partnered with analysts to define Looker dashboards and alerts that answered prioritized stakeholder questions and replaced recurring manual reports.",
      ],
    },
  },
  "Qlik Sense": {
    description: "Associative analytics platform for interactive dashboards and guided data discovery.",
    bullets: {
      DATA_ANALYST: [
        "Built Qlik Sense applications with associative data models, master measures and section access for secure {subdomain} analysis.",
        "Optimized Qlik Sense load scripts and data models, removing synthetic keys and circular references that undermined report accuracy.",
        "Led the migration of legacy QlikView documents to Qlik Sense, rationalizing duplicate content and validating outputs with business owners.",
      ],
      BUSINESS_ANALYST: [
        "Elicited dashboard requirements and validated Qlik Sense prototypes with stakeholders, documenting agreed metric definitions and filters.",
      ],
    },
  },
  "SSRS": {
    description: "SQL Server Reporting Services, a platform for paginated, parameterized and scheduled operational reports.",
    bullets: {
      DATA_ANALYST: [
        "Developed SSRS paginated reports with parameters, subscriptions and drill-through navigation for operational and regulatory {subdomain} reporting.",
        "Consolidated overlapping SSRS reports into parameterized templates, reducing maintenance effort and inconsistencies across business units.",
        "Managed SSRS report deployment, folder security and subscription schedules, documenting a named owner for each production report.",
      ],
      BUSINESS_ANALYST: [
        "Defined SSRS report specifications including layouts, parameters, calculations and distribution rules, and validated outputs with business owners.",
      ],
    },
  },
  "Cognos": {
    description: "IBM enterprise reporting and analytics suite for governed reports, dashboards and packaged data models.",
    bullets: {
      DATA_ANALYST: [
        "Developed Cognos reports and active dashboards for {subdomain} teams, applying prompts, drill-throughs and consistent formatting standards.",
        "Maintained Cognos Framework Manager packages, aligning query subjects and relationships with warehouse changes to keep reports accurate.",
        "Led the rationalization of the Cognos report inventory, retiring unused content and consolidating duplicates with business owners.",
      ],
      BUSINESS_ANALYST: [
        "Gathered reporting requirements and authored Cognos report specifications, tracing each field to its source definition for sign-off.",
      ],
    },
  },
  "MicroStrategy": {
    description: "Enterprise BI platform for governed metrics, dossiers and large-scale report distribution.",
    bullets: {
      DATA_ANALYST: [
        "Built MicroStrategy schema objects, metrics and dossiers supporting {subdomain} reporting, with reusable attributes governed across projects.",
        "Optimized MicroStrategy report performance through intelligent cubes, aggregate tables and simplified metric definitions.",
        "Administered MicroStrategy security filters and user groups, aligning data access with ownership and confidentiality requirements.",
      ],
      BUSINESS_ANALYST: [
        "Defined MicroStrategy dashboard requirements with business stakeholders and validated delivered metrics against agreed definitions.",
      ],
    },
  },
  "Business Objects": {
    description: "SAP enterprise reporting suite built on semantic universes and Web Intelligence reports.",
    bullets: {
      DATA_ANALYST: [
        "Designed Business Objects universes with clear joins, contexts and business-friendly object names that enabled governed self-service reporting.",
        "Developed Web Intelligence reports in Business Objects for {subdomain} operations, including scheduled publications and parameterized prompts.",
        "Led the cleanup of Business Objects content, retiring obsolete reports and consolidating duplicate universes with stakeholder agreement.",
      ],
      BUSINESS_ANALYST: [
        "Documented reporting requirements and validated Business Objects outputs with users, resolving definition conflicts before production release.",
      ],
    },
  },
  "Google Analytics": {
    description: "Web and app analytics service for measuring traffic, user journeys and conversions.",
    bullets: {
      DATA_ANALYST: [
        "Analyzed Google Analytics traffic, funnel and conversion data to identify friction points in digital journeys and recommend prioritized improvements.",
        "Defined Google Analytics event tracking and campaign tagging standards, ensuring consistent measurement across sites and marketing teams.",
        "Reconciled Google Analytics data with order and transaction records, explaining discrepancies and documenting known measurement limitations.",
      ],
      BUSINESS_ANALYST: [
        "Specified Google Analytics tracking requirements for new {subdomain} features, aligning events and parameters with business success measures.",
      ],
      PROJECT_MANAGER: [
        "Reviewed Google Analytics adoption trends with product stakeholders to inform release priorities and post-launch evaluation.",
      ],
    },
  },
  "Alteryx": {
    description: "Self-service analytics platform for blending, preparing and automating data workflows without heavy coding.",
    bullets: {
      DATA_ANALYST: [
        "Built Alteryx workflows to blend, cleanse and reconcile {subdomain} data from multiple sources, replacing manual spreadsheet consolidation.",
        "Standardized Alteryx workflow design with documented inputs, validation tools and reusable macros reviewed before production scheduling.",
        "Migrated recurring analyst processes into scheduled Alteryx workflows with clear ownership, audit outputs and exception reporting.",
      ],
      BUSINESS_ANALYST: [
        "Prototyped Alteryx workflows to test business rules against real data before formalizing requirements with the development team.",
      ],
    },
  },
  "Looker Studio": {
    description: "Free Google reporting tool, formerly Data Studio, for building shareable dashboards from connected data sources.",
    bullets: {
      DATA_ANALYST: [
        "Built Looker Studio dashboards for {subdomain} teams with consistent layouts, interactive filters and documented metric definitions.",
        "Standardized Looker Studio data source connections and calculated fields, removing conflicting figures across shared reports.",
      ],
      BUSINESS_ANALYST: [
        "Prototyped Looker Studio reports with stakeholders to confirm metrics and layout before investing in enterprise dashboard development.",
      ],
    },
  },
  "Power Query": {
    description: "Microsoft data preparation engine for connecting to, cleansing and reshaping data before analysis.",
    bullets: {
      DATA_ANALYST: [
        "Built Power Query transformations to combine, cleanse and reshape source files, documenting each step for transparent, repeatable refreshes.",
        "Replaced manual data preparation with parameterized Power Query routines that standardized {subdomain} inputs before reporting.",
      ],
      BUSINESS_ANALYST: [
        "Shaped stakeholder-provided source files with Power Query to validate requirements and business rules against real data early.",
      ],
    },
  },

  // ---------------------------------------------------------------- Data Engineering & governance
  "Informatica": {
    description: "Enterprise data integration platform for building governed batch data pipelines between systems.",
    bullets: {
      DATA_ANALYST: [
        "Developed Informatica PowerCenter mappings and workflows to integrate {subdomain} source data into the warehouse with reusable transformations and error handling.",
        "Optimized Informatica sessions through pushdown logic, partitioning and lookup tuning to keep nightly loads inside agreed batch windows.",
        "Established Informatica development standards covering naming, parameterization, restartability and promotion between environments.",
      ],
      BUSINESS_ANALYST: [
        "Authored transformation rules and field-level specifications for Informatica developers, clarifying ambiguous business logic with data owners.",
      ],
      QA_ENGINEER: [
        "Validated Informatica load outputs against source records, verifying transformation rules, rejected rows and audit totals before promotion.",
      ],
    },
  },
  "SSIS": {
    description: "SQL Server Integration Services, Microsoft's tool for building data integration and workflow packages.",
    bullets: {
      DATA_ANALYST: [
        "Built SSIS packages to extract, cleanse and load {subdomain} data, with configurable connections, logging and restart checkpoints.",
        "Refactored legacy SSIS packages into modular, parameterized designs that simplified deployment and production support.",
        "Implemented SSIS error-row handling and alerting so data issues were routed to owners rather than silently dropped.",
      ],
      QA_ENGINEER: [
        "Tested SSIS package outputs against source extracts, validating transformations, rejected rows and audit logging across load scenarios.",
      ],
    },
  },
  "Talend": {
    description: "Data integration platform for designing batch and real-time data pipelines with reusable components.",
    bullets: {
      DATA_ANALYST: [
        "Developed Talend jobs to integrate application and file-based sources into the warehouse, applying reusable components and context variables.",
        "Implemented Talend rejection flows that captured bad records with clear reasons, routing them to business teams for correction.",
        "Standardized Talend job design, versioning and promotion practices across the integration team, improving long-term supportability.",
      ],
      BUSINESS_ANALYST: [
        "Documented business transformation rules for Talend integrations and validated delivered outputs with {client} data owners.",
      ],
    },
  },
  "Collibra": {
    description: "Data governance and catalog platform for business glossaries, stewardship workflows and data ownership.",
    bullets: {
      DATA_ANALYST: [
        "Configured Collibra business glossary and stewardship workflows, assigning accountable owners for critical {subdomain} data elements.",
        "Curated Collibra asset metadata and certification status, linking reports and datasets to the governed business terms they relied on.",
        "Led Collibra onboarding for new data domains, training stewards on approval workflows and term definition standards.",
      ],
      BUSINESS_ANALYST: [
        "Captured business term definitions and ownership in Collibra, facilitating stakeholder agreement on contested metrics before reporting changes.",
      ],
    },
  },
  "Alation": {
    description: "Data catalog platform that helps people find, understand and trust governed data assets.",
    bullets: {
      DATA_ANALYST: [
        "Curated the Alation data catalog with endorsed tables, documented columns and stewardship assignments for {subdomain} data assets.",
        "Promoted Alation adoption by publishing trusted query examples, deprecation flags and usage guidance for analysts.",
        "Partnered with data owners in Alation to resolve conflicting definitions and certify authoritative sources for key business metrics.",
      ],
      BUSINESS_ANALYST: [
        "Researched source definitions and ownership in Alation to ground requirements in governed data rather than undocumented assumptions.",
      ],
    },
  },
  "ETL": {
    description: "Extract, transform and load: the practice of moving data from source systems into a target warehouse or data store.",
    bullets: {
      DATA_ANALYST: [
        "Designed ETL processes for {subdomain} data with staged loads, change detection and audit controls supporting reliable downstream reporting.",
        "Led ETL defect root-cause analysis with source system owners, implementing preventive controls rather than one-off corrections.",
        "Defined ETL design standards for restartability, error handling and reconciliation adopted across the data integration team.",
      ],
      BUSINESS_ANALYST: [
        "Authored ETL transformation requirements and business rules, walking developers and data owners through edge cases before build.",
      ],
      QA_ENGINEER: [
        "Developed ETL test strategies covering completeness, transformation accuracy, duplicates and reject handling for each data load.",
        "Validated ETL outputs against source systems using reconciliation checks, documenting variances and tracking resolution with developers.",
      ],
      AWS_ENGINEER: [
        "Engineered cloud-native ETL workflows with partitioned storage, incremental loads and monitoring that alerted on late or failed runs.",
      ],
    },
  },
  "Apache Spark": {
    description: "Distributed processing engine for large-scale batch and streaming data transformation.",
    bullets: {
      AWS_ENGINEER: [
        "Engineered Apache Spark jobs for distributed batch processing, tuning partitions, joins and memory settings for stable production runs.",
        "Optimized Spark workloads by addressing data skew, eliminating unnecessary shuffles and right-sizing cluster resources.",
        "Established Spark job conventions for configuration, logging and testing, simplifying code review and production support.",
      ],
      DATA_ANALYST: [
        "Developed PySpark transformations to process large {subdomain} datasets, applying partitioning and caching choices that kept workloads efficient.",
        "Built reusable Spark validation routines that checked schemas, nulls and duplicates before data was published to analysts.",
      ],
    },
  },
  "Apache Airflow": {
    description: "Workflow orchestration platform for scheduling and monitoring data pipelines defined as code.",
    bullets: {
      AWS_ENGINEER: [
        "Orchestrated data pipelines with Apache Airflow DAGs, defining dependencies, retries, service-level alerts and backfill procedures.",
        "Standardized Airflow deployment practices, connection management and DAG review guidelines across data engineering teams.",
        "Monitored Airflow scheduler health and task failures, building runbooks that shortened recovery for on-call engineers.",
      ],
      DATA_ANALYST: [
        "Scheduled recurring {subdomain} reporting workloads in Airflow, adding data checks so dashboards refreshed only after upstream loads succeeded.",
      ],
    },
  },
  "Apache Kafka": {
    description: "Distributed event streaming platform for publishing, storing and processing real-time data feeds.",
    bullets: {
      AWS_ENGINEER: [
        "Designed Apache Kafka topics, partitioning and retention policies for event streaming between core services, documenting ownership and schemas.",
        "Implemented Kafka consumer groups with idempotent processing and dead-letter handling to keep downstream systems consistent.",
        "Monitored Kafka consumer lag and broker health, partnering with application teams to resolve throughput bottlenecks.",
      ],
      DATA_ANALYST: [
        "Partnered with engineers to land Kafka event streams into analytical tables, defining event contracts that supported {subdomain} reporting.",
      ],
      QA_ENGINEER: [
        "Validated Kafka message publishing and consumption, verifying payload structure, ordering and error handling across event-driven flows.",
      ],
    },
  },
  "dbt": {
    description: "Data build tool for transforming warehouse data with version-controlled, tested and documented models.",
    bullets: {
      DATA_ANALYST: [
        "Developed dbt models with layered staging, intermediate and mart structures, documenting each model's grain and ownership.",
        "Implemented dbt tests for uniqueness, relationships and accepted values, making data checks part of every deployment.",
        "Established dbt project conventions, code review practices and documentation sites that gave {client} analysts a trusted modeling standard.",
      ],
    },
  },
  "Data Lineage": {
    description: "Documentation of how data flows from source systems through transformations to reports, used for impact analysis and audit.",
    bullets: {
      DATA_ANALYST: [
        "Documented end-to-end data lineage for critical {subdomain} metrics, tracing each figure from source system through transformations to reports.",
        "Applied lineage analysis to assess the downstream impact of source changes before approving schema or logic modifications.",
        "Partnered with governance teams to maintain data lineage records for regulatory reporting, supporting audit inquiries with clear evidence.",
      ],
      BUSINESS_ANALYST: [
        "Traced data lineage for disputed report figures, facilitating resolution between business owners and technical teams with documented evidence.",
      ],
    },
  },
  "Master Data Management": {
    description: "Discipline and tooling for creating a single, governed golden record for core entities such as customers and products.",
    bullets: {
      DATA_ANALYST: [
        "Defined Master Data Management match, merge and survivorship rules for customer and product records in partnership with data stewards.",
        "Monitored MDM exception queues and duplicate resolution, partnering with stewards to correct root causes in source systems.",
        "Designed Master Data Management hierarchies and reference code standards that unified {subdomain} reporting across systems.",
      ],
      BUSINESS_ANALYST: [
        "Gathered Master Data Management requirements for golden record attributes, ownership and stewardship workflows across business units.",
      ],
      PROJECT_MANAGER: [
        "Led a Master Data Management program across business and technology teams, managing scope, steward onboarding and phased rollout.",
      ],
    },
  },
  "Azure Data Factory": {
    description: "Microsoft cloud data integration service for orchestrating and automating data movement pipelines.",
    bullets: {
      DATA_ANALYST: [
        "Developed Azure Data Factory pipelines with parameterized datasets and activities to load {subdomain} data into the analytics platform.",
        "Implemented Azure Data Factory monitoring, alerting and rerun procedures so failed loads were identified and recovered quickly.",
      ],
      AWS_ENGINEER: [
        "Engineered Azure Data Factory pipelines with integration runtimes, managed secrets and controlled promotion from development to production.",
        "Designed reusable Azure Data Factory templates for incremental loads, standardizing integration patterns across delivery projects.",
      ],
    },
  },
  "Apache Hive": {
    description: "Data warehouse layer over distributed storage that lets teams query large datasets with a familiar query language.",
    bullets: {
      DATA_ANALYST: [
        "Developed HiveQL queries over partitioned Apache Hive tables to analyze large historical {subdomain} datasets efficiently.",
        "Documented Hive table definitions, partitions and business meaning, creating a reference that reduced ad hoc support requests.",
      ],
      AWS_ENGINEER: [
        "Designed Apache Hive table layouts with partitioning, bucketing and columnar formats aligned to downstream query patterns.",
        "Managed Hive metastore schema changes and access controls in coordination with data platform and security teams.",
      ],
    },
  },
  "Hadoop": {
    description: "Open-source framework for distributed storage and batch processing of very large datasets across clusters.",
    bullets: {
      AWS_ENGINEER: [
        "Administered Hadoop cluster capacity, storage quotas and job scheduling, coordinating upgrades and maintenance with dependent data teams.",
        "Led the migration of Hadoop workloads to cloud storage and managed processing services, validating data parity and job outputs.",
      ],
      DATA_ANALYST: [
        "Processed large {subdomain} datasets stored on Hadoop, partnering with engineers to structure data for efficient analytical access.",
      ],
    },
  },
  "ERwin Data Modeler": {
    description: "Data modeling tool for designing conceptual, logical and physical database models.",
    bullets: {
      DATA_ANALYST: [
        "Designed conceptual, logical and physical models in ERwin Data Modeler, applying naming standards and normalization rules across subject areas.",
        "Maintained ERwin models as the authoritative design record, reviewing every change with database administrators before deployment.",
        "Built dimensional models in ERwin for {subdomain} reporting, defining facts, dimensions, grain and slowly changing attribute handling.",
      ],
      BUSINESS_ANALYST: [
        "Reviewed ERwin logical models with business stakeholders, confirming entity definitions, relationships and business keys before physical design.",
      ],
    },
  },
};
