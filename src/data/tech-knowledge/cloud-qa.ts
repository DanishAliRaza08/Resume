import type { TechnologySeed } from "../technologies";
import type { TechKnowledge } from "./types";

const BA = "BUSINESS_ANALYST";
const AWS_ROLE = "AWS_ENGINEER";
const QA = "QA_ENGINEER";
const PM = "PROJECT_MANAGER";

/** Technologies added in this file (also need a knowledge entry below). */
export const EXTRA_CLOUD_QA: TechnologySeed[] = [
  { canonicalName: "AWS Step Functions", category: "Cloud", aliases: ["step functions"], roles: [AWS_ROLE], domains: [], projectTypes: [], availableFrom: 2016 },
  { canonicalName: "Amazon EventBridge", category: "Cloud", aliases: ["eventbridge"], roles: [AWS_ROLE], domains: [], projectTypes: [], availableFrom: 2019 },
  { canonicalName: "AWS CDK", category: "Cloud", aliases: ["cdk", "aws cloud development kit"], roles: [AWS_ROLE], domains: [], projectTypes: [], availableFrom: 2019 },
  { canonicalName: "AWS Secrets Manager", category: "Cloud", aliases: ["secrets manager"], roles: [AWS_ROLE], domains: [], projectTypes: [], availableFrom: 2018 },
  { canonicalName: "GraphQL", category: "Integrations", aliases: [], roles: [AWS_ROLE, QA, BA], domains: [], projectTypes: [], availableFrom: 2015 },
  { canonicalName: "Apigee", category: "Integrations", aliases: ["google apigee", "apigee edge", "apigee x"], roles: [AWS_ROLE, BA, QA], domains: [], projectTypes: [] },
  { canonicalName: "SoapUI", category: "Testing", aliases: ["soap ui", "readyapi"], roles: [QA, BA], domains: [], projectTypes: [] },
  { canonicalName: "Appium", category: "Testing", aliases: [], roles: [QA], domains: [], projectTypes: [], availableFrom: 2013 },
  { canonicalName: "Tricentis Tosca", category: "Testing", aliases: ["tosca"], roles: [QA, BA], domains: [], projectTypes: [] },
  { canonicalName: "Performance Testing", category: "Testing", aliases: ["load testing", "stress testing"], roles: [QA, AWS_ROLE, PM], domains: [], projectTypes: [] },
  { canonicalName: "Smoke Testing", category: "Testing", aliases: ["smoke tests", "smoke test", "sanity testing"], roles: [QA, AWS_ROLE], domains: [], projectTypes: [] },
  { canonicalName: "SonarQube", category: "Deployment", aliases: ["sonarcloud"], roles: [AWS_ROLE, QA], domains: [], projectTypes: [] },
  { canonicalName: "Helm", category: "Deployment", aliases: ["helm charts", "helm chart"], roles: [AWS_ROLE], domains: [], projectTypes: [], availableFrom: 2016 },
  { canonicalName: "Prometheus", category: "Deployment", aliases: [], roles: [AWS_ROLE], domains: [], projectTypes: [], availableFrom: 2015 },
];

export const CLOUD_QA_KNOWLEDGE: Record<string, TechKnowledge> = {
  // ---------------------------------------------------------------- Cloud
  AWS: {
    description: "Amazon's public cloud platform providing on-demand compute, storage, networking, database and managed services.",
    bullets: {
      AWS_ENGINEER: [
        "Architected multi-account AWS landing zones with segregated environments, centralized logging and guardrails that let delivery teams provision resources safely and independently.",
        "Led the migration of {client} workloads from on-premises data centers to AWS, defining the target architecture, cutover runbooks and rollback strategy.",
        "Established AWS cost governance through tagging standards, rightsizing reviews and reserved capacity planning, partnering with finance and application owners on accountability.",
      ],
      DATA_ANALYST: [
        "Partnered with platform engineers to define analytics workloads on AWS, shaping storage layout, access patterns and governance for {subdomain} reporting.",
      ],
    },
  },
  "Amazon S3": {
    description: "Object storage service used for data lakes, backups, static assets and durable file exchange.",
    bullets: {
      AWS_ENGINEER: [
        "Designed Amazon S3 bucket strategy with lifecycle tiering, versioning, encryption at rest and cross-region replication to meet retention and recovery requirements.",
        "Hardened Amazon S3 access by enforcing bucket policies, blocking public access and auditing object permissions across every application account.",
        "Architected a raw, curated and published zone layout on Amazon S3 that became the foundation of the {client} data lake.",
      ],
      DATA_ANALYST: [
        "Organized partitioned datasets in Amazon S3 so analysts could query {subdomain} history efficiently without duplicating extracts across teams.",
        "Defined naming, partitioning and retention conventions for Amazon S3 analytics zones, keeping curated datasets discoverable and audit-ready.",
      ],
    },
  },
  "Amazon EC2": {
    description: "Virtual server service providing resizable compute capacity in the cloud.",
    bullets: {
      AWS_ENGINEER: [
        "Engineered Amazon EC2 auto scaling groups behind load balancers with health checks and launch templates, delivering self-healing capacity for customer-facing services.",
        "Standardized hardened Amazon EC2 images with patching baselines and configuration drift detection, reducing manual server maintenance across environments.",
        "Rightsized Amazon EC2 fleets for {client} by analyzing utilization trends and shifting suitable workloads to spot and reserved capacity.",
      ],
    },
  },
  "AWS Lambda": {
    description: "Serverless compute service that runs code in response to events without managing servers.",
    bullets: {
      AWS_ENGINEER: [
        "Architected event-driven processing on AWS Lambda with idempotent handlers, dead-letter handling and retries, replacing brittle scheduled batch jobs for {subdomain}.",
        "Tuned AWS Lambda memory, concurrency limits and provisioned concurrency to balance latency and cost for spiky, customer-facing workloads.",
        "Established AWS Lambda packaging, layering and versioning standards with aliases for safe staged rollouts and instant rollback.",
      ],
    },
  },
  "AWS Glue": {
    description: "Serverless data integration service for cataloging, transforming and moving data between stores.",
    bullets: {
      AWS_ENGINEER: [
        "Built AWS Glue jobs and crawlers to ingest, cleanse and catalog source data, with job bookmarks preventing duplicate processing across reruns.",
        "Designed the AWS Glue Data Catalog structure and table permissions so downstream query engines shared a single governed metadata layer.",
        "Optimized AWS Glue job performance through partition pruning, worker sizing and pushdown predicates for high-volume {subdomain} feeds.",
      ],
      DATA_ANALYST: [
        "Specified transformation rules implemented in AWS Glue and validated outputs against source systems before releasing curated datasets to reporting.",
        "Maintained AWS Glue catalog definitions and column descriptions so analysts could locate trusted {subdomain} tables quickly.",
      ],
    },
  },
  "Amazon EKS": {
    description: "Managed Kubernetes control plane service for running containerized applications on AWS.",
    bullets: {
      AWS_ENGINEER: [
        "Architected Amazon EKS clusters with managed node groups, cluster autoscaling and network policies to host containerized microservices for {client}.",
        "Hardened Amazon EKS workloads using pod-level role mapping, private endpoints and admission controls that enforced security baselines before deployment.",
        "Led Amazon EKS version upgrades with blue-green node rotation and compatibility testing, keeping clusters supported without service interruption.",
      ],
    },
  },
  "Amazon ECS": {
    description: "Fully managed container orchestration service for running containers on AWS.",
    bullets: {
      AWS_ENGINEER: [
        "Migrated legacy services onto Amazon ECS with Fargate, removing server management and standardizing task definitions across application teams.",
        "Designed Amazon ECS service autoscaling, rolling deployments and circuit breakers that automatically reverted failed releases.",
        "Defined Amazon ECS task roles, secrets injection and logging conventions so every containerized {subdomain} service met operational standards.",
      ],
    },
  },
  "AWS IAM": {
    description: "Identity and access management service controlling who can access which cloud resources.",
    bullets: {
      AWS_ENGINEER: [
        "Designed an AWS IAM least-privilege model with role-based access, permission boundaries and federated single sign-on across all accounts.",
        "Audited AWS IAM policies and removed unused credentials and wildcard permissions, closing findings raised by {client} security reviews.",
        "Automated AWS IAM role provisioning for application teams through reviewed templates, removing manual access requests and inconsistent policies.",
      ],
    },
  },
  "Amazon VPC": {
    description: "Logically isolated virtual network for launching cloud resources with controlled routing and security.",
    bullets: {
      AWS_ENGINEER: [
        "Architected Amazon VPC topology with public, private and isolated subnets, route tables and endpoints that kept sensitive traffic off the internet.",
        "Implemented Amazon VPC peering, transit routing and hybrid connectivity linking cloud workloads with {client} on-premises networks.",
        "Hardened Amazon VPC security with layered security groups, network ACLs and flow logs reviewed during incident investigations.",
      ],
    },
  },
  "Amazon CloudWatch": {
    description: "Monitoring and observability service for metrics, logs, alarms and dashboards on AWS.",
    bullets: {
      AWS_ENGINEER: [
        "Built Amazon CloudWatch dashboards, composite alarms and log metric filters that gave on-call engineers clear signals for {subdomain} services.",
        "Defined Amazon CloudWatch alerting standards tied to service-level objectives, cutting noisy alerts and focusing response on customer impact.",
        "Centralized Amazon CloudWatch logs with retention policies and insights queries, accelerating root-cause analysis during production incidents.",
      ],
    },
  },
  "AWS CloudFormation": {
    description: "Infrastructure-as-code service that provisions cloud resources from declarative templates.",
    bullets: {
      AWS_ENGINEER: [
        "Authored modular AWS CloudFormation templates and nested stacks that provisioned consistent networking, compute and storage across every environment.",
        "Introduced AWS CloudFormation change sets, drift detection and stack policies to make infrastructure changes reviewable and protect critical resources.",
        "Rolled out AWS CloudFormation StackSets to apply baseline security controls across {client} accounts and regions from a single source.",
      ],
    },
  },
  "Amazon API Gateway": {
    description: "Managed service for creating, securing, throttling and monitoring APIs at scale.",
    bullets: {
      AWS_ENGINEER: [
        "Designed Amazon API Gateway endpoints with request validation, throttling, usage plans and custom authorizers protecting {subdomain} backend services.",
        "Configured Amazon API Gateway stages, canary releases and custom domains to support safe versioned rollouts for partner integrations.",
        "Secured Amazon API Gateway traffic with token-based authorization, resource policies and web application firewall rules.",
      ],
      QA_ENGINEER: [
        "Validated Amazon API Gateway throttling, authorization and error mappings, confirming consumers received consistent responses under failure conditions.",
      ],
    },
  },
  "Amazon SQS": {
    description: "Fully managed message queuing service for decoupling and buffering distributed application components.",
    bullets: {
      AWS_ENGINEER: [
        "Decoupled {subdomain} processing with Amazon SQS queues, dead-letter queues and visibility timeouts, absorbing traffic spikes without dropping messages.",
        "Implemented Amazon SQS FIFO queues with deduplication and message grouping where strict ordering was required by downstream consumers.",
        "Established Amazon SQS backlog monitoring and redrive procedures so operations teams could recover poisoned messages safely.",
      ],
    },
  },
  "Amazon SNS": {
    description: "Managed publish-subscribe messaging service for fan-out events and notifications.",
    bullets: {
      AWS_ENGINEER: [
        "Designed Amazon SNS topics with fan-out to multiple subscribers, decoupling event producers from downstream consumers across {client} applications.",
        "Applied Amazon SNS message filtering policies so each consumer received only relevant events, simplifying subscriber logic.",
        "Configured encrypted Amazon SNS topics and delivery retry policies to meet security and reliability requirements for operational alerts.",
      ],
    },
  },
  "Amazon Athena": {
    description: "Serverless interactive query service for analyzing data directly in object storage.",
    bullets: {
      AWS_ENGINEER: [
        "Configured Amazon Athena workgroups with query limits, result encryption and cost controls for shared analytics use across teams.",
        "Optimized Amazon Athena performance by converting raw files to columnar formats with partition projection, sharply reducing scanned data.",
        "Enabled self-service Amazon Athena access governed by catalog-level permissions, removing ad hoc extract requests to engineering.",
      ],
      DATA_ANALYST: [
        "Queried {subdomain} history in Amazon Athena to answer ad hoc business questions without waiting for warehouse loads.",
        "Built reusable Amazon Athena views that standardized business definitions, giving downstream dashboards and finance reconciliations a single consistent source.",
        "Profiled raw datasets with Amazon Athena to detect anomalies, duplicates and missing values before curated tables were published.",
      ],
    },
  },
  Azure: {
    description: "Microsoft's public cloud platform for compute, storage, networking, identity and managed services.",
    bullets: {
      AWS_ENGINEER: [
        "Architected Azure landing zones with management groups, policy assignments and hub-and-spoke networking for governed workload onboarding.",
        "Led migration of {client} applications to Azure, defining target architecture, identity integration and disaster recovery strategy.",
        "Enforced Azure governance through role-based access, resource tagging standards and policy-driven compliance checks applied consistently across every subscription.",
      ],
      DATA_ANALYST: [
        "Consolidated departmental reporting data on Azure storage, defining access controls and refresh schedules for {subdomain} analytics.",
      ],
      PROJECT_MANAGER: [
        "Directed an Azure migration program, coordinating application owners, infrastructure teams and security reviewers through phased cutovers.",
      ],
    },
  },
  "Google Cloud Platform": {
    description: "Google's public cloud platform offering compute, storage, analytics and machine learning services.",
    bullets: {
      AWS_ENGINEER: [
        "Designed Google Cloud Platform project hierarchy, shared networking and organization policies that standardized security across teams.",
        "Deployed containerized services on Google Cloud Platform with managed autoscaling, service accounts and private connectivity.",
        "Implemented Google Cloud Platform monitoring, logging sinks and budget alerts to give {client} visibility into reliability and spend.",
      ],
      DATA_ANALYST: [
        "Analyzed {subdomain} datasets in Google Cloud Platform warehouses, building governed views consumed by business reporting.",
      ],
    },
  },
  Databricks: {
    description: "Unified lakehouse platform for data engineering, analytics and machine learning on cloud storage.",
    bullets: {
      DATA_ANALYST: [
        "Developed Databricks notebooks that cleansed, joined and aggregated {subdomain} data into curated tables for business reporting.",
        "Documented Databricks table definitions, business rules and quality checks, giving stakeholders confidence in the shared lakehouse metrics they reported upward.",
        "Collaborated with engineers on Databricks Delta table design, aligning granularity and history tracking with analytical needs.",
      ],
      AWS_ENGINEER: [
        "Administered Databricks workspaces with cluster policies, autoscaling and job clusters that controlled compute cost across teams.",
        "Implemented Databricks Unity Catalog permissions, column masking and data access controls to govern sensitive {client} datasets across workspaces.",
        "Orchestrated Databricks jobs with retries, failure alerting and dependency management, keeping production data workflows reliable and easy to support.",
      ],
    },
  },

  // ---------------------------------------------------------------- Integrations
  "REST APIs": {
    description: "Web service style that exposes resources over HTTP using standard methods and stateless requests.",
    bullets: {
      BUSINESS_ANALYST: [
        "Defined REST APIs integration requirements with partner teams, specifying endpoints, payload fields, error handling and service expectations for {subdomain}.",
        "Facilitated contract reviews for REST APIs between business and engineering, resolving field definitions and ownership before build started.",
      ],
      QA_ENGINEER: [
        "Validated REST APIs for status codes, schema conformance, authorization and boundary conditions across positive and negative scenarios.",
        "Built a reusable test harness for REST APIs with environment-driven data setup, enabling repeatable verification on every build.",
        "Verified REST APIs error handling, pagination and idempotency behavior to protect downstream consumers from inconsistent responses.",
      ],
      AWS_ENGINEER: [
        "Designed versioned REST APIs with consistent resource naming, pagination and error contracts consumed by internal and partner applications.",
        "Implemented authentication, rate limiting and caching for REST APIs, protecting backend services from abuse and traffic spikes.",
        "Instrumented REST APIs with structured logging and tracing that shortened troubleshooting across distributed {client} services.",
      ],
    },
  },
  SOAP: {
    description: "XML-based messaging protocol for structured web service communication with formal service contracts.",
    bullets: {
      QA_ENGINEER: [
        "Validated SOAP web services against service contracts, verifying envelopes, faults and mandatory elements for {subdomain} transactions.",
        "Automated SOAP request suites with data-driven inputs, covering positive, negative and boundary scenarios for legacy integrations.",
        "Investigated SOAP fault responses with developers to isolate defects between consuming applications and backend services.",
      ],
      BUSINESS_ANALYST: [
        "Documented SOAP service operations and element-level mappings between legacy and modern systems during {client} integration projects.",
        "Analyzed existing SOAP interfaces to define modernization scope, identifying every consumer, upstream dependency and a safe retirement sequence for legacy services.",
      ],
      AWS_ENGINEER: [
        "Wrapped legacy SOAP services behind modern integration layers, translating messages and preserving contracts for existing consumers.",
      ],
    },
  },
  XML: {
    description: "Markup format for structured data exchange, commonly validated against schemas in enterprise integrations.",
    bullets: {
      BUSINESS_ANALYST: [
        "Defined XML message layouts and element-level business rules for {subdomain} interfaces, aligning sending and receiving systems.",
        "Reviewed XML schema changes with partners, assessing downstream impact and documenting required updates before release.",
      ],
      QA_ENGINEER: [
        "Validated XML payloads against schemas and business rules, catching malformed messages before they reached downstream systems.",
        "Built XML test data sets covering optional elements, namespaces and edge cases to strengthen interface verification.",
      ],
      AWS_ENGINEER: [
        "Engineered XML parsing and transformation services with schema validation, converting legacy messages into modern event formats.",
      ],
    },
  },
  JSON: {
    description: "Lightweight text format for structured data exchange, widely used in web services and configuration.",
    bullets: {
      BUSINESS_ANALYST: [
        "Specified JSON payload structures and field definitions for {subdomain} integrations, clarifying required, optional and derived attributes.",
      ],
      QA_ENGINEER: [
        "Validated JSON responses against schemas and expected values, flagging contract drift between producing and consuming services.",
        "Designed JSON test fixtures representing complex nested scenarios to exercise boundary conditions in service logic.",
      ],
      AWS_ENGINEER: [
        "Defined JSON schema standards and versioning rules for event payloads, keeping producers and consumers compatible as contracts evolved.",
        "Implemented JSON validation at service boundaries, rejecting malformed messages early and improving downstream data integrity.",
      ],
      DATA_ANALYST: [
        "Flattened nested JSON records into analysis-ready tables, preserving business meaning and history so {subdomain} reporting stayed accurate and explainable.",
      ],
    },
  },
  MuleSoft: {
    description: "Integration platform for building, managing and connecting enterprise services and applications.",
    bullets: {
      AWS_ENGINEER: [
        "Architected MuleSoft integration layers separating system, process and experience services, enabling reuse across {client} applications.",
        "Developed MuleSoft flows with error handling, retries and transformation logic that reliably synchronized records between enterprise systems.",
        "Established MuleSoft deployment, logging and security policy standards that improved the consistency and long-term supportability of enterprise integrations.",
      ],
      BUSINESS_ANALYST: [
        "Gathered integration requirements for MuleSoft flows, documenting source and target fields, transformation rules and exception handling.",
        "Facilitated design reviews for MuleSoft services with application owners, confirming {subdomain} business rules before development.",
      ],
      QA_ENGINEER: [
        "Validated MuleSoft integration flows end to end, verifying transformations, error routing and message delivery between systems.",
      ],
      PROJECT_MANAGER: [
        "Led a MuleSoft integration program, sequencing interface delivery, managing cross-team dependencies and reporting risks to sponsors.",
      ],
    },
  },
  Swagger: {
    description: "Specification and tooling for describing, documenting and testing HTTP service contracts.",
    bullets: {
      AWS_ENGINEER: [
        "Adopted a contract-first approach with Swagger specifications, generating documentation and client stubs before service implementation began.",
        "Published Swagger documentation for internal services, giving consuming teams self-service visibility into endpoints and payloads.",
      ],
      QA_ENGINEER: [
        "Derived service test scenarios from Swagger contracts, ensuring coverage of every endpoint, parameter and documented response.",
        "Flagged discrepancies between Swagger definitions and actual service behavior, driving contract or code corrections with developers before partner onboarding.",
      ],
      BUSINESS_ANALYST: [
        "Reviewed Swagger contracts with business stakeholders and engineers to confirm fields, validations and responses satisfied {subdomain} business requirements.",
        "Maintained Swagger-based interface documentation as the single trusted reference for integration scope, field definitions and agreed business validations.",
      ],
    },
  },
  Postman: {
    description: "Collaboration platform for designing, exploring and testing HTTP services and web service collections.",
    bullets: {
      QA_ENGINEER: [
        "Built Postman collections with environment variables, pre-request scripts and assertions to validate {subdomain} services across environments.",
        "Automated Postman collection runs from the command line within the build pipeline, surfacing service defects before deployment.",
        "Standardized Postman workspace conventions, shared collections and environment files, enabling consistent and repeatable service verification across QA teams.",
      ],
      BUSINESS_ANALYST: [
        "Verified service responses in Postman against documented requirements, confirming business rules were implemented correctly before stakeholder demonstrations.",
      ],
      AWS_ENGINEER: [
        "Maintained Postman collections as living service documentation, giving internal consumers and on-call engineers ready examples for troubleshooting production issues.",
      ],
    },
  },
  EDI: {
    description: "Standardized electronic exchange of business documents such as orders, invoices and claims between trading partners.",
    bullets: {
      BUSINESS_ANALYST: [
        "Analyzed EDI transaction sets and partner implementation guides, documenting segment-level mapping rules for {subdomain} exchanges.",
        "Led trading partner onboarding for EDI, coordinating specifications, test exchanges and certification with external partners.",
        "Defined EDI exception handling and acknowledgment workflows, clarifying operational ownership and escalation paths when partner transactions failed validation.",
      ],
      QA_ENGINEER: [
        "Validated inbound and outbound EDI transactions against partner specifications, verifying segments, qualifiers, control envelopes and functional acknowledgments.",
        "Designed EDI test files covering rejections, duplicates and unusual edge cases, strengthening partner certification and reducing surprises after go-live.",
      ],
      PROJECT_MANAGER: [
        "Managed EDI partner onboarding schedules for {client}, tracking certification milestones, coordinating cutover dates and escalating partner-side blockers promptly.",
      ],
    },
  },
  SFTP: {
    description: "Secure file transfer protocol for encrypted exchange of files between systems and partners.",
    bullets: {
      AWS_ENGINEER: [
        "Implemented managed SFTP endpoints with key-based authentication and per-partner isolation for secure {client} file exchanges.",
        "Automated SFTP file pickup, validation and archiving with proactive alerting on late, missing or malformed partner deliveries.",
      ],
      BUSINESS_ANALYST: [
        "Documented SFTP file exchange requirements with partners, including naming, schedules, layouts and failure notification rules.",
      ],
      QA_ENGINEER: [
        "Validated SFTP file transfers end to end, confirming delivery, file integrity and correct downstream processing.",
      ],
      DATA_ANALYST: [
        "Reconciled partner files received over SFTP against control totals, flagging gaps before {subdomain} data was loaded.",
      ],
    },
  },

  // ---------------------------------------------------------------- Testing
  UAT: {
    description: "User acceptance testing, where business users confirm a solution meets requirements before release.",
    bullets: {
      BUSINESS_ANALYST: [
        "Planned and facilitated UAT with business users, preparing scenarios from acceptance criteria and capturing sign-off for {subdomain} releases.",
        "Authored UAT scripts reflecting real business workflows and exceptions, ensuring testers validated business outcomes rather than individual screens.",
        "Triaged UAT feedback with product owners, separating defects from change requests and protecting release scope.",
      ],
      QA_ENGINEER: [
        "Prepared UAT environments and production-like test data, enabling business testers to execute scenarios without technical blockers.",
        "Supported UAT execution by reproducing reported issues, logging defects with evidence and confirming fixes with users.",
        "Defined UAT entry and exit criteria aligned with the quality strategy, giving stakeholders a clear basis for go-live decisions.",
      ],
      PROJECT_MANAGER: [
        "Directed UAT for {client}, scheduling business testers, tracking progress and driving go or no-go decisions with sponsors.",
        "Managed UAT risks and open issues with business leads, negotiating workarounds and deferrals to protect the release date.",
        "Secured formal UAT sign-off from accountable business stakeholders, documenting accepted risks and outstanding items before production deployment.",
      ],
    },
  },
  SIT: {
    description: "System integration testing that verifies interfaces and data flow across connected systems.",
    bullets: {
      QA_ENGINEER: [
        "Led SIT across connected applications, validating interfaces, data handoffs and error handling for end-to-end {subdomain} flows.",
        "Designed SIT scenarios from integration specifications, covering upstream and downstream dependencies, timing issues and failure recovery paths.",
        "Coordinated SIT environments and test data with multiple application teams, resolving integration defects before business testing.",
      ],
      BUSINESS_ANALYST: [
        "Supported SIT by clarifying interface rules and expected outcomes, resolving ambiguities between integrating teams before they became late defects.",
      ],
      PROJECT_MANAGER: [
        "Managed SIT readiness across vendor and internal teams, tracking environment availability, defects and exit criteria for {client}.",
      ],
    },
  },
  "Regression Testing": {
    description: "Retesting existing functionality after changes to confirm nothing previously working has broken.",
    bullets: {
      QA_ENGINEER: [
        "Defined a risk-based regression testing strategy prioritizing critical {subdomain} journeys, balancing coverage with release timelines.",
        "Automated the core regression testing suite and scheduled nightly runs, giving teams early warning of unintended side effects.",
        "Maintained regression testing assets by retiring obsolete cases and adding coverage for every production defect.",
      ],
      PROJECT_MANAGER: [
        "Planned regression testing windows into release schedules, aligning teams on scope and readiness before each deployment.",
      ],
      BUSINESS_ANALYST: [
        "Identified business-critical scenarios for regression testing with product owners, ensuring key {subdomain} workflows stayed protected during ongoing enhancements.",
      ],
    },
  },
  "Functional Testing": {
    description: "Testing that verifies software behavior against specified business and functional requirements.",
    bullets: {
      QA_ENGINEER: [
        "Led functional testing for {subdomain} features, deriving test cases from requirements and acceptance criteria to confirm expected behavior.",
        "Designed functional testing coverage using equivalence partitioning and boundary analysis, improving defect detection early in delivery.",
        "Reviewed requirements with analysts before functional testing began, resolving ambiguities that would otherwise surface as late defects.",
      ],
      BUSINESS_ANALYST: [
        "Partnered with QA on functional testing scope, confirming test conditions reflected agreed business rules and exceptions.",
      ],
    },
  },
  "Black-box Testing": {
    description: "Testing based on inputs and outputs against requirements, without knowledge of internal implementation.",
    bullets: {
      QA_ENGINEER: [
        "Applied black-box testing techniques such as decision tables and state transitions to validate complex {subdomain} rules.",
        "Designed black-box testing scenarios from user-facing requirements, uncovering gaps between specified and delivered behavior before business review.",
        "Coached testers on black-box testing design methods, improving the consistency and depth of team test coverage.",
      ],
    },
  },
  Selenium: {
    description: "Open-source framework for automating web browsers to test web applications.",
    bullets: {
      QA_ENGINEER: [
        "Architected a Selenium automation framework using page object design, reusable utilities and data-driven execution for {client} web applications.",
        "Stabilized flaky Selenium suites by introducing explicit waits, resilient locator strategies and isolated test data, restoring team trust in automated results.",
        "Scaled Selenium execution across parallel browsers and grid nodes, shortening feedback time for every build.",
      ],
    },
  },
  Cucumber: {
    description: "Behavior-driven development tool that runs plain-language specifications as automated tests.",
    bullets: {
      QA_ENGINEER: [
        "Implemented Cucumber feature files and step definitions that turned agreed acceptance criteria into executable specifications.",
        "Designed reusable Cucumber step libraries and tagging strategies, enabling targeted execution by feature and priority.",
        "Partnered with analysts and developers to write Cucumber scenarios before development, aligning teams on {subdomain} behavior.",
      ],
      BUSINESS_ANALYST: [
        "Authored business-readable Cucumber scenarios alongside QA engineers, turning acceptance criteria into shared executable examples the whole team understood.",
      ],
    },
  },
  TestNG: {
    description: "Java testing framework supporting annotations, grouping, parameterization and parallel execution.",
    bullets: {
      QA_ENGINEER: [
        "Structured TestNG suites with groups, dependencies and data providers that supported targeted and full test runs.",
        "Configured TestNG parallel execution and listeners for retries and reporting, improving reliability of automated runs.",
        "Integrated TestNG results with build reporting so teams saw failures and trends for {subdomain} features immediately.",
      ],
    },
  },
  JUnit: {
    description: "Unit testing framework for Java applications.",
    bullets: {
      QA_ENGINEER: [
        "Championed JUnit coverage standards with developers, reviewing tests for meaningful assertions rather than superficial coverage.",
        "Built JUnit integration tests with mocked dependencies to verify service logic independently of external systems.",
        "Organized JUnit suites into fast and slow tiers, keeping developer feedback quick while preserving deeper validation.",
      ],
      AWS_ENGINEER: [
        "Wrote JUnit tests for backend service logic, enforcing them as a merge gate for {client} application code.",
      ],
    },
  },
  Cypress: {
    description: "Front-end testing tool for end-to-end and component tests of modern web applications.",
    bullets: {
      QA_ENGINEER: [
        "Built a Cypress end-to-end suite with custom commands and network stubbing, giving fast, reliable coverage of {subdomain} journeys.",
        "Introduced Cypress component testing alongside end-to-end runs, catching interface defects earlier in development when they were cheapest to fix.",
        "Reduced Cypress test flakiness through deterministic fixtures, controlled network responses and isolated sessions, making failures meaningful signals.",
      ],
    },
  },
  Playwright: {
    description: "Cross-browser automation framework for reliable end-to-end testing of web applications.",
    bullets: {
      QA_ENGINEER: [
        "Architected a Playwright automation framework with fixtures, auto-waiting and parallel workers covering multiple browser engines.",
        "Migrated legacy browser suites to Playwright, improving stability and debugging through trace capture and screenshots.",
        "Implemented Playwright authentication state reuse and network interception, accelerating test runs for {client} web applications.",
      ],
    },
  },
  "HP ALM": {
    description: "Test management suite for requirements, test planning, execution and defect tracking.",
    bullets: {
      QA_ENGINEER: [
        "Administered HP ALM projects, configuring test plans, workflows and custom fields to support {subdomain} release testing.",
        "Linked requirements, test cases and defects in HP ALM, giving stakeholders end-to-end coverage visibility for every release scope item.",
        "Produced HP ALM execution and defect status reports that informed go-live readiness decisions and risk discussions with leadership.",
      ],
      BUSINESS_ANALYST: [
        "Maintained requirements in HP ALM and mapped them to test cases, confirming every business rule had planned coverage.",
      ],
      PROJECT_MANAGER: [
        "Monitored HP ALM test progress and defect aging to steer release readiness discussions with {client} sponsors.",
      ],
    },
  },
  qTest: {
    description: "Test management platform for organizing test cases, executions and quality reporting.",
    bullets: {
      QA_ENGINEER: [
        "Structured qTest repositories by release and module, enabling reusable test cases and traceable execution cycles.",
        "Integrated automated run results into qTest, combining manual and automated evidence in a single quality view.",
        "Built qTest dashboards for {subdomain} releases that gave leads real-time insight into coverage and blockers.",
      ],
    },
  },
  Zephyr: {
    description: "Test management add-on for planning, executing and tracking tests within issue-tracking workflows.",
    bullets: {
      QA_ENGINEER: [
        "Organized Zephyr test cycles by sprint and release, linking executions to stories for clear quality traceability.",
        "Established Zephyr test case writing standards and folder conventions that improved reuse and consistency across {subdomain} teams.",
        "Reported Zephyr execution status during release reviews, highlighting blocked coverage, failing areas and open quality risks for decision makers.",
      ],
      BUSINESS_ANALYST: [
        "Reviewed Zephyr test cases against acceptance criteria, ensuring business scenarios and exception paths were fully covered before release.",
      ],
    },
  },
  TestRail: {
    description: "Web-based test case management tool for organizing test suites, runs and results.",
    bullets: {
      QA_ENGINEER: [
        "Designed TestRail suite structure, case templates and milestones that standardized test documentation and reporting across {client} products.",
        "Connected automated frameworks to TestRail, publishing run results automatically alongside manual execution for a unified view of release quality.",
        "Drove test readiness reviews from TestRail reports, surfacing coverage gaps and failing areas early enough for teams to respond.",
      ],
      PROJECT_MANAGER: [
        "Tracked release quality through TestRail milestones, using execution status to inform go-live decisions with stakeholders.",
      ],
    },
  },
  JMeter: {
    description: "Open-source tool for load and performance testing of web applications and services.",
    bullets: {
      QA_ENGINEER: [
        "Designed JMeter test plans modeling realistic user journeys, think times and data variation for {subdomain} services.",
        "Executed distributed JMeter runs to identify throughput limits, bottlenecks and resource contention before major releases.",
        "Analyzed JMeter results with developers and infrastructure teams, driving tuning of slow queries and connection pools.",
      ],
    },
  },
  LoadRunner: {
    description: "Enterprise performance engineering tool for simulating user load and analyzing system behavior.",
    bullets: {
      QA_ENGINEER: [
        "Developed LoadRunner scripts with correlation and parameterization to simulate realistic concurrent usage of {client} applications.",
        "Planned LoadRunner scenarios for peak, endurance and spike conditions, validating capacity ahead of business-critical events.",
        "Interpreted LoadRunner analysis reports with architects, pinpointing response-time degradation under concurrency and recommending application and infrastructure tuning.",
      ],
    },
  },
  "API Testing": {
    description: "Testing service interfaces directly for correctness, security, reliability and contract compliance.",
    bullets: {
      QA_ENGINEER: [
        "Defined the API testing strategy covering contracts, authorization, negative paths and data integrity for {subdomain} services.",
        "Automated API testing in the build pipeline so service defects were caught before user interface testing began.",
        "Expanded API testing with contract checks between producers and consumers, preventing breaking changes from reaching shared environments.",
      ],
      AWS_ENGINEER: [
        "Embedded API testing into service delivery, requiring passing contract and integration checks before any build was promoted to shared environments.",
      ],
    },
  },
  "Defect Triage": {
    description: "Structured review of reported defects to assess severity, priority, ownership and resolution path.",
    bullets: {
      QA_ENGINEER: [
        "Facilitated daily defect triage with developers and product owners, aligning severity, priority and fix targets.",
        "Analyzed defect triage trends to identify recurring root causes, feeding improvements back into requirements and design.",
        "Established defect triage criteria, severity definitions and response expectations, creating consistency across {client} delivery teams and vendors.",
      ],
      PROJECT_MANAGER: [
        "Chaired defect triage during critical release windows, driving decisions on fixes, deferrals and accepted risks.",
        "Translated defect triage outcomes into adjusted release plans, communicating quality risk and trade-offs clearly to {client} sponsors.",
      ],
      BUSINESS_ANALYST: [
        "Represented business impact in defect triage sessions, helping engineering prioritize issues affecting critical {subdomain} workflows and customers.",
        "Clarified expected behavior during defect triage, distinguishing true defects from new requirements and routing enhancements to the backlog.",
      ],
    },
  },

  // ---------------------------------------------------------------- Deployment
  Jenkins: {
    description: "Open-source automation server for building, testing and deploying software.",
    bullets: {
      AWS_ENGINEER: [
        "Designed declarative Jenkins pipelines with shared libraries, standardizing build, test and deployment stages across {client} services.",
        "Scaled Jenkins with ephemeral build agents and credential isolation, improving throughput and reducing security exposure.",
        "Hardened Jenkins administration with role-based access, plugin governance, credential vaulting and backups for reliable, secure delivery operations.",
      ],
      QA_ENGINEER: [
        "Integrated automated suites into Jenkins jobs with quality gates, blocking promotion when critical tests failed.",
        "Configured Jenkins test reporting, trend charts and notifications, giving teams immediate visibility into failing builds and unstable tests.",
      ],
    },
  },
  Git: {
    description: "Distributed version control system for tracking code changes and collaborating on software.",
    bullets: {
      AWS_ENGINEER: [
        "Defined Git branching, pull request and code review standards that improved release predictability across engineering teams.",
        "Enforced protected branches, signed commits and required reviews in Git repositories hosting infrastructure and application code.",
        "Structured Git repositories, release tagging and versioning conventions to support traceable, repeatable releases for {client} services.",
      ],
      QA_ENGINEER: [
        "Managed test automation code in Git with mandatory peer reviews and a branching model aligned to application release cycles.",
      ],
      DATA_ANALYST: [
        "Versioned analytical queries and transformation logic in Git, enabling peer review and reproducible {subdomain} reporting.",
      ],
    },
  },
  Docker: {
    description: "Containerization platform for packaging applications and dependencies into portable images.",
    bullets: {
      AWS_ENGINEER: [
        "Containerized legacy applications with Docker using multi-stage builds and minimal base images, improving portability and security.",
        "Established Docker image standards with vulnerability scanning and version pinning before images reached shared registries.",
        "Built Docker-based local environments that closely mirrored production, reducing environment-specific defects and onboarding effort for {client} teams.",
      ],
      QA_ENGINEER: [
        "Ran test suites in Docker containers to provide consistent, disposable test environments for every execution.",
      ],
    },
  },
  Kubernetes: {
    description: "Container orchestration platform for deploying, scaling and managing containerized applications.",
    bullets: {
      AWS_ENGINEER: [
        "Architected Kubernetes workloads with resource limits, autoscaling, readiness probes and disruption budgets for resilient services.",
        "Implemented Kubernetes namespaces, role-based access and network policies that isolated teams and enforced security boundaries.",
        "Led Kubernetes rollout strategies using rolling and canary deployments, enabling safe releases for {subdomain} services.",
      ],
    },
  },
  Terraform: {
    description: "Infrastructure-as-code tool for provisioning cloud and on-premises resources from declarative configuration.",
    bullets: {
      AWS_ENGINEER: [
        "Authored reusable Terraform modules for networking, compute and storage that standardized infrastructure across {client} environments.",
        "Implemented Terraform remote state with locking, workspaces and peer-reviewed plans, making infrastructure changes safe and auditable.",
        "Introduced Terraform policy checks and drift detection, catching non-compliant or manual changes before they reached production.",
      ],
    },
  },
  Ansible: {
    description: "Agentless automation tool for configuration management, provisioning and application deployment.",
    bullets: {
      AWS_ENGINEER: [
        "Automated server configuration with idempotent Ansible roles and playbooks, eliminating manual setup steps and long-standing configuration drift.",
        "Orchestrated rolling application deployments with Ansible, sequencing node restarts and health checks so releases completed without customer downtime.",
        "Codified security hardening baselines in Ansible, applying consistent, auditable operating system controls across {client} server fleets.",
      ],
    },
  },
  "GitHub Actions": {
    description: "Workflow automation service for building, testing and deploying code directly from repositories.",
    bullets: {
      AWS_ENGINEER: [
        "Designed GitHub Actions workflows with reusable templates, environment approvals and short-lived cloud credentials for secure deployments.",
        "Standardized GitHub Actions build and release workflows across repositories, reducing duplicated pipeline logic for {client} teams.",
        "Hardened GitHub Actions usage by pinning third-party actions, restricting token permissions and protecting deployment environments.",
      ],
      QA_ENGINEER: [
        "Integrated automated test suites into GitHub Actions, running fast targeted checks on every pull request and fuller suites before merge.",
        "Configured GitHub Actions matrix runs across browsers and runtimes, broadening test coverage without slowing reviews.",
      ],
    },
  },
  "CI/CD": {
    description: "Practice of automatically building, testing and releasing code changes through repeatable pipelines.",
    bullets: {
      AWS_ENGINEER: [
        "Architected CI/CD pipelines with automated testing, security scanning and staged approvals for reliable releases of {client} services.",
        "Introduced CI/CD deployment strategies with progressive rollout and automated rollback, allowing teams to release frequently with confidence.",
        "Standardized CI/CD templates across teams, embedding quality gates and audit trails into every production release.",
      ],
      QA_ENGINEER: [
        "Embedded automated quality gates into CI/CD stages, preventing builds with failing critical tests from progressing.",
        "Optimized test execution within CI/CD by parallelizing suites and running targeted checks on each change.",
      ],
      PROJECT_MANAGER: [
        "Sponsored CI/CD adoption across delivery teams, aligning change and release governance with faster, smaller and lower-risk deployments.",
      ],
    },
  },

  // ---------------------------------------------------------------- Added technologies
  "AWS Step Functions": {
    description: "Serverless workflow service that orchestrates distributed tasks as visual state machines.",
    bullets: {
      AWS_ENGINEER: [
        "Orchestrated multi-step {subdomain} workflows with AWS Step Functions, adding retries, timeouts and compensation paths for failed tasks.",
        "Replaced fragile chained jobs with AWS Step Functions state machines, giving operations clear visibility into every execution.",
        "Designed AWS Step Functions workflows with human approval steps and parallel branches for complex business processes.",
      ],
    },
  },
  "Amazon EventBridge": {
    description: "Serverless event bus for routing events between applications, managed services and partners.",
    bullets: {
      AWS_ENGINEER: [
        "Designed an Amazon EventBridge event bus with schema conventions and routing rules that decoupled producers from consumers.",
        "Implemented Amazon EventBridge scheduled rules, event archives and replay, simplifying recovery for consumers after downstream outages.",
        "Integrated partner and internal events through Amazon EventBridge, enabling new {subdomain} consumers without changing producers.",
      ],
    },
  },
  "AWS CDK": {
    description: "Framework for defining cloud infrastructure in familiar programming languages and synthesizing deployable templates.",
    bullets: {
      AWS_ENGINEER: [
        "Built reusable AWS CDK constructs that encoded security and tagging standards for application teams to adopt by default.",
        "Migrated hand-written templates to AWS CDK, adding unit tests and type safety to infrastructure definitions.",
        "Structured AWS CDK applications into environment-aware stacks with shared configuration, enabling consistent promotion across {client} accounts.",
      ],
    },
  },
  "AWS Secrets Manager": {
    description: "Managed service for storing, rotating and controlling access to credentials and secrets.",
    bullets: {
      AWS_ENGINEER: [
        "Centralized application credentials in AWS Secrets Manager with automatic rotation, removing hard-coded secrets from code and configuration.",
        "Restricted AWS Secrets Manager access with fine-grained resource policies and encryption keys scoped per application.",
        "Led remediation of exposed credentials by migrating {client} services to AWS Secrets Manager retrieval at runtime.",
      ],
    },
  },
  GraphQL: {
    description: "Query language and runtime for services that let clients request exactly the data they need.",
    bullets: {
      AWS_ENGINEER: [
        "Designed a GraphQL schema unifying multiple backend services, giving front-end teams a single, flexible data access layer.",
        "Implemented GraphQL query depth limits, batching and caching to protect backend systems from expensive requests.",
        "Established GraphQL schema governance, review and deprecation practices that allowed the schema to evolve without breaking existing clients.",
      ],
      QA_ENGINEER: [
        "Validated GraphQL queries and mutations for authorization, field-level errors and edge cases across {subdomain} features.",
        "Automated GraphQL contract tests that detected breaking schema changes and missing fields before they reached shared environments.",
      ],
      BUSINESS_ANALYST: [
        "Mapped business data needs to GraphQL schema fields with engineers, clarifying definitions for {subdomain} screens.",
      ],
    },
  },
  Apigee: {
    description: "Google's platform for designing, securing, publishing and analyzing managed service interfaces.",
    bullets: {
      AWS_ENGINEER: [
        "Configured Apigee proxies with quota, spike arrest and token validation policies protecting {client} backend services.",
        "Established Apigee environment, product and developer portal standards that streamlined partner onboarding and self-service credential requests.",
        "Implemented Apigee analytics and alerting to monitor consumer usage, latency and error trends, informing capacity and partner support decisions.",
      ],
      BUSINESS_ANALYST: [
        "Defined Apigee product bundles and access tiers with business stakeholders, aligning partner offerings with commercial goals.",
      ],
    },
  },
  SoapUI: {
    description: "Testing tool for functional, security and load testing of web services.",
    bullets: {
      QA_ENGINEER: [
        "Built data-driven SoapUI projects with property transfers and assertions validating {subdomain} service workflows end to end.",
        "Automated SoapUI suite execution from the command line within build jobs, catching service defects early.",
        "Designed SoapUI mock services that simulated dependent systems, unblocking test execution whenever upstream environments were unavailable or unstable.",
      ],
      BUSINESS_ANALYST: [
        "Confirmed in SoapUI that service responses matched documented business rules, resolving discrepancies with developers during integration reviews.",
      ],
    },
  },
  Appium: {
    description: "Open-source framework for automating native, hybrid and mobile web applications.",
    bullets: {
      QA_ENGINEER: [
        "Architected an Appium automation framework supporting both major mobile platforms with shared page objects and utilities.",
        "Executed Appium suites on device farms across screen sizes and operating system versions for {client} mobile apps.",
        "Stabilized Appium tests through resilient locators, explicit synchronization strategies and isolated test accounts, making mobile results dependable.",
      ],
    },
  },
  "Tricentis Tosca": {
    description: "Model-based test automation platform for enterprise applications with minimal scripting.",
    bullets: {
      QA_ENGINEER: [
        "Built Tricentis Tosca modules and reusable test case templates that automated end-to-end {subdomain} business processes.",
        "Applied Tricentis Tosca risk-based test design to prioritize automation coverage of the most business-critical requirements and workflows.",
        "Managed Tricentis Tosca test data services and execution lists, enabling repeatable, independent runs across shared test environments.",
      ],
      BUSINESS_ANALYST: [
        "Partnered with automation engineers to model business workflows in Tricentis Tosca, validating scenarios reflected real operations.",
      ],
    },
  },
  "Performance Testing": {
    description: "Testing how a system behaves under expected and peak load, measuring responsiveness, stability and capacity.",
    bullets: {
      QA_ENGINEER: [
        "Defined the performance testing strategy, workload models and acceptance thresholds with architects and business owners.",
        "Led performance testing ahead of peak {subdomain} periods, identifying bottlenecks and validating fixes before launch.",
        "Established baseline performance testing within the release cycle, detecting response-time degradations long before they reached production users.",
      ],
      AWS_ENGINEER: [
        "Supported performance testing by instrumenting services, analyzing resource saturation and tuning autoscaling policies based on observed behavior.",
      ],
      PROJECT_MANAGER: [
        "Scheduled performance testing milestones into the delivery plan, tracking remediation and escalating capacity risks to {client} leadership.",
      ],
    },
  },
  "Smoke Testing": {
    description: "Quick checks of critical functionality after a build or deployment to confirm basic stability.",
    bullets: {
      QA_ENGINEER: [
        "Designed automated smoke tests covering critical {subdomain} journeys, run after every deployment to confirm environment health.",
        "Defined smoke testing as an entry gate for deeper test cycles, preventing wasted effort on unstable builds.",
        "Maintained smoke testing suites alongside production releases, giving leadership quick, evidence-based confidence immediately after each cutover.",
      ],
      AWS_ENGINEER: [
        "Wired post-deployment smoke tests into release automation, triggering automatic rollback whenever critical health or business checks failed.",
      ],
    },
  },
  SonarQube: {
    description: "Code quality platform for static analysis of bugs, vulnerabilities, code smells and coverage.",
    bullets: {
      AWS_ENGINEER: [
        "Enforced SonarQube quality gates on every merge, blocking code with new vulnerabilities or insufficient coverage.",
        "Standardized SonarQube rule profiles across languages and teams, aligning code quality expectations for {client} services.",
      ],
      QA_ENGINEER: [
        "Introduced SonarQube analysis for automation code, keeping test frameworks maintainable and free of duplicated logic.",
        "Reviewed SonarQube findings with developers, prioritizing security hotspots and reliability issues for remediation before each release.",
        "Reported SonarQube quality trends to engineering leads, highlighting risky, complex modules that warranted deeper exploratory and automated testing.",
      ],
    },
  },
  Helm: {
    description: "Package manager for templating, versioning and deploying applications onto container clusters.",
    bullets: {
      AWS_ENGINEER: [
        "Authored Helm charts with parameterized values for each environment, standardizing deployment of containerized {subdomain} services.",
        "Established Helm chart versioning, linting and shared repository practices that made every cluster release reproducible and reversible.",
        "Leveraged Helm release history and rollback to recover quickly from faulty deployments without lengthy manual intervention.",
      ],
    },
  },
  Prometheus: {
    description: "Open-source monitoring system and time-series database for collecting metrics and alerting.",
    bullets: {
      AWS_ENGINEER: [
        "Deployed Prometheus monitoring with service discovery and recording rules, giving teams consistent metrics for containerized services.",
        "Defined Prometheus alerting rules tied to service-level objectives, reducing noise and focusing on customer-impacting issues.",
        "Instrumented {client} applications with Prometheus metrics for latency, errors and saturation, enabling faster incident diagnosis.",
      ],
    },
  },
};
