import type { TechnologySeed } from "../technologies";
import type { TechKnowledge } from "./types";

/** Technologies added in this file (also need a knowledge entry below). */
export const EXTRA_BA_PM: TechnologySeed[] = [
  { canonicalName: "Miro", category: "Project Management", aliases: ["miro board", "miro boards", "realtimeboard"], roles: [], domains: [], projectTypes: [] },
  { canonicalName: "Asana", category: "Project Management", aliases: ["asana project management"], roles: [], domains: [], projectTypes: [] },
  { canonicalName: "Monday.com", category: "Project Management", aliases: ["monday work management"], roles: [], domains: [], projectTypes: [] },
  { canonicalName: "Microsoft Planner", category: "Project Management", aliases: ["ms planner"], roles: [], domains: [], projectTypes: [] },
  { canonicalName: "Clarity PPM", category: "Project Management", aliases: ["ca clarity", "ca ppm", "broadcom clarity"], roles: ["PROJECT_MANAGER"], domains: [], projectTypes: [] },
  { canonicalName: "Microsoft Power Automate", category: "Project Management", aliases: ["power automate", "microsoft flow"], roles: ["BUSINESS_ANALYST", "PROJECT_MANAGER", "DATA_ANALYST"], domains: [], projectTypes: [] },
  { canonicalName: "Celonis", category: "Business Analysis", aliases: ["celonis process mining", "celonis ems"], roles: ["BUSINESS_ANALYST", "DATA_ANALYST"], domains: [], projectTypes: [] },
  { canonicalName: "Jama Connect", category: "Business Analysis", aliases: ["jama software"], roles: ["BUSINESS_ANALYST", "QA_ENGINEER"], domains: [], projectTypes: [] },
  { canonicalName: "IBM DOORS", category: "Business Analysis", aliases: ["doors next", "rational doors", "ibm doors next generation"], roles: ["BUSINESS_ANALYST", "QA_ENGINEER"], domains: [], projectTypes: [] },
  { canonicalName: "OKRs", category: "Methodologies", aliases: ["objectives and key results", "okr"], roles: ["PROJECT_MANAGER", "BUSINESS_ANALYST"], domains: [], projectTypes: [] },
  { canonicalName: "PRINCE2", category: "Methodologies", aliases: ["prince2 methodology", "prince2 practitioner"], roles: ["PROJECT_MANAGER"], domains: [], projectTypes: [] },
];

export const BA_PM_KNOWLEDGE: Record<string, TechKnowledge> = {
  // ---------------------------------------------------------------- Business Analysis
  "BRD": {
    description: "Business Requirements Document that captures the business need, scope, objectives and high-level requirements for an initiative.",
    bullets: {
      BUSINESS_ANALYST: [
        "Authored and owned the BRD for {subdomain} initiatives, translating executive objectives into scoped, prioritized business requirements approved by business and technology leadership.",
        "Facilitated structured review cycles to drive BRD sign-off, reconciling conflicting stakeholder priorities and documenting decisions, assumptions and open risks for governance.",
        "Established a reusable BRD template and quality checklist adopted by the analysis team, standardizing how scope, business rules and success criteria were captured.",
      ],
      PROJECT_MANAGER: [
        "Used the approved BRD as the scope baseline for {client}, governing change requests and keeping delivery commitments aligned with the agreed business objectives.",
        "Partnered with business sponsors to validate BRD scope against budget and timeline constraints before committing the delivery plan to the steering committee.",
      ],
    },
  },
  "FRD": {
    description: "Functional Requirements Document that details system behavior, business rules, interfaces and data needed to deliver the business requirements.",
    bullets: {
      BUSINESS_ANALYST: [
        "Translated approved business requirements into a detailed FRD covering system behavior, business rules, validations and exception handling for {subdomain} workflows.",
        "Led walkthroughs of the FRD with architects, developers and testers, resolving ambiguities early and securing a shared understanding before build began.",
        "Maintained version control and change history on the functional specification, assessing downstream impact of each change and communicating it to delivery leads.",
      ],
      QA_ENGINEER: [
        "Derived test conditions and expected results directly from the FRD, flagging untestable or ambiguous requirements back to analysts before test execution.",
      ],
    },
  },
  "SRS": {
    description: "Software Requirements Specification that defines functional and non-functional requirements, constraints and interfaces for a software system.",
    bullets: {
      BUSINESS_ANALYST: [
        "Authored the SRS for {client} platform enhancements, defining functional behavior, non-functional requirements, interfaces and constraints in a form engineering teams could build against.",
        "Coordinated SRS reviews across security, architecture and operations stakeholders, ensuring performance, availability and compliance requirements were explicit and verifiable.",
        "Governed changes to the software requirements specification through a formal review process, documenting rationale and impact so delivery teams worked from a single approved baseline.",
      ],
      QA_ENGINEER: [
        "Reviewed the SRS for testability and completeness, mapping each requirement to verification approaches and raising gaps in non-functional criteria before planning began.",
      ],
    },
  },
  "User Stories": {
    description: "Short, user-centered descriptions of functionality with acceptance criteria, used to define and prioritize work in iterative delivery.",
    bullets: {
      BUSINESS_ANALYST: [
        "Wrote and refined user stories with clear acceptance criteria for {subdomain} features, partnering with the product owner to keep the backlog prioritized and ready for planning.",
        "Decomposed large business capabilities into independent, testable user stories, sequencing them to deliver incremental value while managing cross-team dependencies.",
        "Facilitated backlog refinement sessions where developers and testers challenged each user story, tightening acceptance criteria and surfacing edge cases before commitment.",
      ],
      PROJECT_MANAGER: [
        "Monitored readiness of user stories ahead of each planning cycle, escalating blocked items and unresolved decisions to keep the delivery cadence on track.",
        "Aligned user story priorities with release objectives for {client}, negotiating scope trade-offs with business owners when capacity or timelines shifted.",
      ],
      QA_ENGINEER: [
        "Partnered with analysts to sharpen acceptance criteria on each user story, ensuring every requirement had verifiable conditions before development started.",
      ],
    },
  },
  "Use Cases": {
    description: "Structured descriptions of how actors interact with a system to achieve a goal, including main, alternate and exception flows.",
    bullets: {
      BUSINESS_ANALYST: [
        "Developed detailed use cases for {subdomain} processes, documenting actors, preconditions, main and alternate flows and exception handling to guide design and testing.",
        "Facilitated sessions with business users to validate each use case against real operational scenarios, capturing edge conditions that later drove key design decisions.",
        "Standardized the use case template and review approach across the analysis practice, improving consistency and making requirements easier for engineers to consume.",
      ],
      QA_ENGINEER: [
        "Converted each documented use case into end-to-end test scenarios covering main, alternate and exception paths for comprehensive functional coverage.",
      ],
    },
  },
  "Gap Analysis": {
    description: "Assessment that compares current-state capabilities against the desired future state to identify gaps and the changes needed to close them.",
    bullets: {
      BUSINESS_ANALYST: [
        "Led a gap analysis comparing current-state {subdomain} processes and systems with target capabilities, producing prioritized recommendations that shaped the delivery roadmap.",
        "Conducted gap analysis between vendor package functionality and business needs, guiding configure-versus-customize decisions with clear rationale for leadership.",
        "Presented gap analysis findings to executive sponsors at {client}, framing each gap by business impact and proposing remediation options with ownership and sequencing.",
      ],
      DATA_ANALYST: [
        "Performed gap analysis on existing reporting and data assets against new business requirements, identifying missing attributes, sources and quality issues to resolve.",
        "Documented gap analysis results for data consumers and engineering teams, prioritizing fixes by business criticality and agreeing remediation owners.",
      ],
    },
  },
  "Requirements Traceability Matrix": {
    description: "Matrix that links each requirement to its design elements, test cases and delivery status to ensure full coverage and controlled change.",
    bullets: {
      BUSINESS_ANALYST: [
        "Built and maintained the Requirements Traceability Matrix linking business needs to design artifacts and test cases, giving stakeholders clear visibility of coverage.",
        "Used the RTM to assess the impact of proposed changes for {client}, identifying affected requirements, components and tests before decisions were approved.",
        "Governed the traceability matrix through release readiness reviews, confirming every in-scope requirement was implemented, verified and accepted before go-live.",
      ],
      QA_ENGINEER: [
        "Mapped test cases and execution results to the Requirements Traceability Matrix, exposing coverage gaps early and supporting audit-ready release decisions.",
        "Reported requirement-level test status from the RTM to delivery leadership, highlighting unverified items that posed risk to the release.",
      ],
    },
  },
  "JAD Sessions": {
    description: "Joint Application Development workshops that bring business users and technical teams together to define requirements and design decisions collaboratively.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated JAD sessions with business owners, architects and developers to define {subdomain} requirements, resolving conflicting viewpoints and documenting agreed decisions in real time.",
        "Planned and moderated JAD sessions with clear agendas, pre-reads and decision logs, accelerating consensus on scope and design across distributed teams.",
        "Converted outcomes from JAD sessions into prioritized requirements and action items, following up with owners to close open questions before design began.",
      ],
      PROJECT_MANAGER: [
        "Sponsored JAD sessions to unblock cross-functional decisions at {client}, ensuring the right decision makers attended and outcomes were reflected in the delivery plan.",
      ],
    },
  },
  "BPMN": {
    description: "Business Process Model and Notation, a standard graphical notation for modeling business processes and workflows.",
    bullets: {
      BUSINESS_ANALYST: [
        "Modeled current-state and future-state {subdomain} workflows in BPMN, exposing handoffs, bottlenecks and control points that informed process redesign decisions.",
        "Facilitated process walkthroughs with operations leaders using BPMN diagrams, aligning stakeholders on roles, decision points and exception paths.",
        "Established BPMN modeling conventions and a shared process repository, ensuring diagrams stayed consistent and reusable across multiple workstreams.",
      ],
    },
  },
  "UML": {
    description: "Unified Modeling Language, a standard set of diagrams for describing system structure, behavior and interactions.",
    bullets: {
      BUSINESS_ANALYST: [
        "Produced UML activity, sequence and class diagrams to communicate system behavior and data relationships for {client} solutions to engineering teams.",
        "Used UML sequence diagrams to clarify complex integration flows between systems, resolving design ambiguities with architects before development started.",
        "Bridged business and technical audiences by pairing UML models with plain-language narratives, keeping requirements accurate and accessible to all stakeholders.",
      ],
    },
  },
  "Wireframing": {
    description: "Creating low-fidelity screen layouts to define page structure, content and interaction before visual design and development.",
    bullets: {
      BUSINESS_ANALYST: [
        "Created wireframes for {subdomain} screens to validate layout, data fields and navigation with business users before committing to development.",
        "Facilitated iterative feedback sessions around mockups, capturing usability concerns and business rules that were folded back into the requirements.",
        "Partnered with designers and developers to evolve wireframes into build-ready specifications, keeping screen behavior aligned with approved business rules.",
      ],
    },
  },
  "Data Mapping": {
    description: "Defining how data elements move and transform from source systems to target systems, including rules, formats and validations.",
    bullets: {
      BUSINESS_ANALYST: [
        "Owned source-to-target mapping for {subdomain} system migrations, defining field-level transformation rules, defaults and validation logic with data owners.",
        "Led data mapping workshops with business and engineering teams to reconcile definitions across systems and document agreed handling of exceptions.",
        "Governed changes to data mappings through formal review, assessing downstream impact on reports and interfaces before approving updates.",
      ],
      DATA_ANALYST: [
        "Developed detailed data mapping specifications between source and target models, profiling source data to confirm transformation rules were accurate.",
        "Validated migrated data against the approved data mapping, reconciling discrepancies with source owners and documenting resolutions for audit.",
      ],
    },
  },
  "Gherkin": {
    description: "Plain-language Given/When/Then syntax for writing executable behavior specifications and acceptance criteria.",
    bullets: {
      BUSINESS_ANALYST: [
        "Expressed acceptance criteria as Gherkin scenarios for {subdomain} features, giving business, development and test teams a single unambiguous definition of done.",
        "Facilitated collaborative sessions with testers and developers to draft BDD scenarios, uncovering edge cases and business rules before coding began.",
        "Standardized Gherkin writing conventions across delivery teams, keeping scenarios business-readable, reusable and aligned with domain terminology.",
      ],
      QA_ENGINEER: [
        "Authored and reviewed Gherkin scenarios with analysts to ensure each acceptance criterion was precise, testable and suitable for automation.",
        "Maintained a library of reusable BDD scenarios and step phrasing, reducing duplication and keeping behavior specifications consistent across releases.",
      ],
    },
  },

  // ---------------------------------------------------------------- Methodologies
  "Agile": {
    description: "Iterative, incremental approach to delivery that emphasizes collaboration, customer feedback and adapting to change.",
    bullets: {
      PROJECT_MANAGER: [
        "Led Agile delivery for {client} programs, coordinating multiple teams through iterative planning, reviews and retrospectives while keeping stakeholders aligned on priorities.",
        "Drove adoption of Agile practices across business and technology teams, coaching leaders on incremental delivery, transparency and empowered decision making.",
        "Balanced Agile flexibility with governance requirements, establishing lightweight reporting and risk controls that satisfied leadership without slowing teams down.",
      ],
      BUSINESS_ANALYST: [
        "Operated as the embedded analyst in Agile delivery teams, continuously refining requirements and acceptance criteria with the product owner across iterations.",
        "Championed Agile requirements practices for {subdomain} initiatives, replacing heavyweight documentation with just-in-time analysis and frequent stakeholder feedback.",
      ],
      QA_ENGINEER: [
        "Embedded quality activities within Agile iterations, partnering with developers and analysts so testing kept pace with incremental delivery.",
      ],
      DATA_ANALYST: [
        "Delivered analytics work in Agile increments, prioritizing high-value insights with stakeholders and incorporating feedback from each review.",
      ],
      AWS_ENGINEER: [
        "Delivered cloud infrastructure changes within Agile teams, breaking platform work into small increments and demonstrating progress at each review.",
      ],
    },
  },
  "Scrum": {
    description: "Agile framework that organizes work into time-boxed sprints with defined roles, ceremonies and a prioritized backlog.",
    bullets: {
      PROJECT_MANAGER: [
        "Served as Scrum Master for cross-functional teams at {client}, facilitating sprint planning, daily stand-ups, reviews and retrospectives while removing impediments.",
        "Coached product owners and teams on Scrum roles and responsibilities, improving backlog discipline and predictability of sprint commitments.",
        "Coordinated dependencies across multiple Scrum teams, running cross-team syncs and escalating blockers so shared release goals stayed achievable.",
      ],
      BUSINESS_ANALYST: [
        "Partnered with the product owner within a Scrum team, preparing refined backlog items and acceptance criteria ahead of each sprint planning session.",
        "Participated in Scrum ceremonies as the requirements lead, clarifying business rules during the sprint and demonstrating completed features to stakeholders.",
      ],
      QA_ENGINEER: [
        "Contributed to Scrum ceremonies as the quality voice, estimating testing effort and flagging risks to sprint commitments early.",
      ],
      AWS_ENGINEER: [
        "Worked within a Scrum team to plan, estimate and deliver cloud platform enhancements, demonstrating completed infrastructure work at sprint reviews.",
      ],
    },
  },
  "Kanban": {
    description: "Flow-based method that visualizes work, limits work in progress and optimizes throughput continuously.",
    bullets: {
      PROJECT_MANAGER: [
        "Introduced Kanban for {subdomain} operations and support work, visualizing flow, setting work-in-progress limits and reviewing bottlenecks with the team.",
        "Ran Kanban service delivery reviews with stakeholders, using flow metrics trends to rebalance capacity and reprioritize incoming demand.",
      ],
      BUSINESS_ANALYST: [
        "Managed requirements intake through a Kanban workflow, triaging incoming requests with stakeholders and keeping analysis work flowing to delivery teams.",
      ],
      AWS_ENGINEER: [
        "Managed platform operations and enhancement requests through Kanban, prioritizing urgent production work while protecting capacity for planned improvements.",
      ],
      QA_ENGINEER: [
        "Organized testing work on a Kanban flow, limiting work in progress and coordinating closely with developers to shorten feedback loops.",
      ],
    },
  },
  "Waterfall": {
    description: "Sequential delivery model that moves through requirements, design, build, test and deployment phases with formal gates.",
    bullets: {
      PROJECT_MANAGER: [
        "Managed {client} programs under a Waterfall model, governing phase gates, baselined schedules and formal change control from requirements through deployment.",
        "Prepared phase-gate reviews for steering committees within a Waterfall lifecycle, presenting status, risks and readiness evidence for go or no-go decisions.",
        "Coordinated vendor and internal teams across Waterfall phases, managing handoffs and dependencies to keep milestones and deliverables on schedule.",
      ],
      BUSINESS_ANALYST: [
        "Delivered comprehensive requirements packages for Waterfall projects, securing formal sign-off before design and managing controlled changes afterward.",
        "Supported transitions between Waterfall phases by walking design and test teams through approved requirements and resolving open questions.",
      ],
      QA_ENGINEER: [
        "Planned and executed the formal test phase within a Waterfall lifecycle, defining entry and exit criteria and reporting readiness to project leadership.",
      ],
    },
  },
  "SAFe": {
    description: "Scaled Agile Framework for coordinating multiple teams through release trains, program increments and portfolio governance.",
    bullets: {
      PROJECT_MANAGER: [
        "Facilitated program increment planning under SAFe, aligning multiple teams on objectives, dependencies and risks for {client} release trains.",
        "Served as Release Train Engineer within SAFe, coordinating cross-team ceremonies, tracking program risks and escalating impediments to portfolio leadership.",
        "Partnered with portfolio and product management to apply SAFe governance, connecting strategic themes to funded work and transparent progress reporting.",
      ],
      BUSINESS_ANALYST: [
        "Refined features and enablers for program increment planning in a SAFe environment, defining benefit hypotheses and acceptance criteria with product management.",
        "Coordinated requirements dependencies across teams on a SAFe release train, ensuring shared business rules were defined consistently for {subdomain} capabilities.",
      ],
    },
  },
  "SDLC": {
    description: "Software Development Life Cycle, the structured set of phases used to plan, build, test, deploy and maintain software.",
    bullets: {
      BUSINESS_ANALYST: [
        "Owned requirements activities across the full SDLC for {subdomain} applications, from discovery and analysis through testing support and post-release validation.",
        "Defined analysis deliverables and review checkpoints within the SDLC, ensuring requirements quality gates were met before work progressed to design.",
      ],
      PROJECT_MANAGER: [
        "Governed delivery across every SDLC phase for {client} initiatives, managing scope, schedule, risks and stakeholder approvals at each stage.",
        "Standardized SDLC artifacts and approval checkpoints for the delivery portfolio, improving consistency and audit readiness across projects.",
      ],
      QA_ENGINEER: [
        "Integrated quality activities throughout the SDLC, shifting test planning and requirement reviews earlier to catch issues before build.",
        "Defined quality entry and exit criteria for each SDLC phase, providing objective evidence for release decisions.",
      ],
      AWS_ENGINEER: [
        "Embedded infrastructure, security and deployment considerations into each SDLC phase, partnering with development teams from design through production support.",
      ],
    },
  },
  "Six Sigma": {
    description: "Data-driven process improvement methodology that uses DMAIC and statistical analysis to reduce variation and defects.",
    bullets: {
      BUSINESS_ANALYST: [
        "Applied Six Sigma DMAIC methods to analyze {subdomain} processes, identifying root causes of variation and recommending controls with process owners.",
        "Led Six Sigma improvement initiatives end to end, defining problem statements, measuring baselines and validating the sustainability of process changes.",
        "Facilitated root cause workshops using Six Sigma tools such as fishbone and process capability analysis, aligning stakeholders on evidence-based fixes.",
      ],
      PROJECT_MANAGER: [
        "Managed Six Sigma improvement projects for {client}, governing DMAIC tollgates, securing sponsor decisions and tracking control plans after handover.",
        "Embedded Six Sigma thinking into project governance, using measured process data rather than anecdote to prioritize improvement work.",
      ],
      DATA_ANALYST: [
        "Supported Six Sigma initiatives with statistical analysis of process performance, quantifying variation and validating improvement hypotheses.",
      ],
    },
  },
  "ITIL": {
    description: "IT service management framework of best practices for incident, problem, change and service delivery processes.",
    bullets: {
      PROJECT_MANAGER: [
        "Aligned project transitions with ITIL change and release practices, ensuring operational readiness, support handover and service documentation before go-live.",
        "Partnered with service management leads to embed ITIL processes into {client} delivery plans, coordinating change approvals and post-implementation reviews.",
      ],
      AWS_ENGINEER: [
        "Managed cloud incidents, problems and changes following ITIL practices, leading root cause investigations and implementing preventive actions.",
        "Prepared and presented infrastructure changes to change advisory boards under ITIL governance, documenting risk, rollback and validation steps.",
      ],
      BUSINESS_ANALYST: [
        "Defined service requirements and support processes aligned with ITIL for {subdomain} applications, clarifying ownership across incident, problem and change workflows.",
      ],
    },
  },

  // ---------------------------------------------------------------- Project Management & collaboration
  "JIRA": {
    description: "Atlassian work-tracking tool used to manage backlogs, sprints, issues and defects.",
    bullets: {
      BUSINESS_ANALYST: [
        "Managed the product backlog in JIRA for {subdomain} initiatives, maintaining prioritized backlog items with clear acceptance criteria and linked supporting artifacts.",
        "Configured JIRA workflows, issue types and fields with the delivery team to reflect how requirements moved from intake through acceptance.",
        "Built JIRA dashboards and filters that gave business stakeholders transparent visibility into requirement status, open decisions and upcoming releases.",
      ],
      PROJECT_MANAGER: [
        "Administered JIRA projects for {client} delivery teams, standardizing workflows and reporting so leadership had consistent visibility across workstreams.",
        "Tracked sprint progress, dependencies and blockers in JIRA, using burndown and velocity trends to guide planning conversations and escalations.",
        "Established JIRA governance conventions for issue hygiene, prioritization and release tagging, improving the reliability of status reporting.",
      ],
      QA_ENGINEER: [
        "Logged, prioritized and tracked issues in JIRA through resolution, partnering with developers and analysts to confirm fixes against acceptance criteria.",
        "Linked test results to backlog items in JIRA to provide traceable evidence of quality for release decisions.",
      ],
      DATA_ANALYST: [
        "Managed analytics requests and data issues in JIRA, prioritizing work with stakeholders and documenting definitions and outcomes for each ticket.",
      ],
      AWS_ENGINEER: [
        "Planned and tracked infrastructure work in JIRA, linking changes to incidents and releases to keep platform activity transparent to stakeholders.",
      ],
    },
  },
  "Confluence": {
    description: "Atlassian team wiki used to create, organize and share project documentation and knowledge.",
    bullets: {
      BUSINESS_ANALYST: [
        "Built and curated the Confluence requirements space for {subdomain} initiatives, organizing business rules, decisions and process documentation into a single source of truth.",
        "Published meeting notes, decision logs and requirements artifacts in Confluence, keeping distributed stakeholders aligned without relying on email threads.",
        "Standardized Confluence page templates for requirements and process documentation, improving consistency and making knowledge easier to find and reuse.",
      ],
      PROJECT_MANAGER: [
        "Maintained Confluence program hubs for {client} with plans, status reports, risk logs and governance decisions accessible to all stakeholders.",
        "Drove knowledge management in Confluence across teams, ensuring onboarding guides, runbooks and lessons learned were current and owned.",
      ],
      QA_ENGINEER: [
        "Documented test strategies, environments and release readiness summaries in Confluence for transparent review by delivery and business leads.",
      ],
      AWS_ENGINEER: [
        "Authored architecture overviews and operational runbooks in Confluence, giving support teams clear procedures for cloud environments.",
      ],
      DATA_ANALYST: [
        "Documented metric definitions, data sources and report logic in Confluence, giving business users a trusted reference for analytics outputs.",
      ],
    },
  },
  "Azure DevOps": {
    description: "Microsoft platform for planning work, tracking backlogs, managing repositories, pipelines and test plans.",
    bullets: {
      PROJECT_MANAGER: [
        "Managed delivery for {client} in Azure DevOps, configuring boards, iterations and area paths to track work across multiple teams.",
        "Built Azure DevOps dashboards and queries that surfaced progress, dependencies and risks for steering committee and sponsor reporting.",
        "Defined work item governance in Azure DevOps, standardizing states, priorities and tagging so portfolio reporting stayed consistent.",
      ],
      BUSINESS_ANALYST: [
        "Maintained requirements and backlog items in Azure DevOps for {subdomain} features, linking acceptance criteria, decisions and test evidence to each work item.",
        "Partnered with engineering leads to groom the Azure DevOps backlog, sequencing work by business value and technical dependency.",
      ],
      QA_ENGINEER: [
        "Organized test plans and suites in Azure DevOps, linking test results to work items to give stakeholders traceable quality status.",
        "Logged and tracked issues in Azure DevOps through resolution, coordinating retests with developers ahead of each release.",
      ],
      AWS_ENGINEER: [
        "Tracked infrastructure changes and operational tasks in Azure DevOps, linking work items to deployments for transparent change history.",
      ],
    },
  },
  "Rally": {
    description: "Enterprise agile planning tool for managing backlogs, iterations, releases and portfolio items.",
    bullets: {
      PROJECT_MANAGER: [
        "Managed release and iteration planning in Rally for {client} teams, tracking feature progress, dependencies and risks across the portfolio.",
        "Produced Rally portfolio and release reports for leadership, highlighting scope changes and at-risk features to drive timely decisions.",
        "Standardized Rally project hierarchy, workflow states and estimation practices across teams to improve reporting accuracy.",
      ],
      BUSINESS_ANALYST: [
        "Maintained the {subdomain} backlog in Rally, writing well-structured backlog items with acceptance criteria and linking them to parent features.",
        "Partnered with product owners in Rally to prioritize features and decompose them into deliverable work for upcoming iterations.",
      ],
      QA_ENGINEER: [
        "Tracked test cases and issues in Rally against iteration scope, reporting quality status and release risks to the delivery team.",
      ],
    },
  },
  "MS Project": {
    description: "Microsoft scheduling tool for building project plans, dependencies, resource assignments and baselines.",
    bullets: {
      PROJECT_MANAGER: [
        "Built and maintained integrated MS Project schedules for {client} programs, defining dependencies, milestones and the critical path across workstreams.",
        "Managed resource assignments and baselines in MS Project, analyzing schedule variance and recommending recovery options to sponsors.",
        "Produced executive milestone views from MS Project for steering committees, translating detailed plans into clear status and decision points.",
      ],
      BUSINESS_ANALYST: [
        "Contributed analysis tasks, estimates and dependencies to the MS Project plan, keeping requirements milestones aligned with the overall delivery schedule.",
      ],
    },
  },
  "SharePoint": {
    description: "Microsoft collaboration platform for document management, team sites, intranet content and simple workflows.",
    bullets: {
      PROJECT_MANAGER: [
        "Established SharePoint project sites for {client} with controlled document libraries, versioning and permissions for governance artifacts.",
        "Managed project records, approvals and status packs in SharePoint, ensuring audit-ready documentation throughout the delivery lifecycle.",
      ],
      BUSINESS_ANALYST: [
        "Organized requirements artifacts and sign-off records in SharePoint, maintaining version control and a clear approval history for {subdomain} projects.",
        "Gathered requirements for SharePoint intranet and document management solutions, defining site structure, metadata and access needs with business owners.",
      ],
      DATA_ANALYST: [
        "Published recurring reports and data definitions to SharePoint, giving business teams a governed, single location for analytical outputs.",
      ],
    },
  },
  "Microsoft Visio": {
    description: "Microsoft diagramming tool for process flows, system context diagrams, organizational charts and architecture visuals.",
    bullets: {
      BUSINESS_ANALYST: [
        "Created current-state and future-state process flows in Microsoft Visio for {subdomain} operations, highlighting handoffs, controls and improvement opportunities.",
        "Produced Visio swimlane and system context diagrams to align business and technical stakeholders on scope, actors and integration touchpoints.",
        "Maintained a library of reusable Visio templates and stencils, standardizing how process documentation was presented across the analysis team.",
      ],
      PROJECT_MANAGER: [
        "Developed Visio diagrams of program structure, governance and solution scope to communicate delivery approach to sponsors at {client}.",
      ],
      DATA_ANALYST: [
        "Diagrammed data flows and entity relationships in Microsoft Visio to document how source systems feed downstream reporting.",
      ],
    },
  },
  "Lucidchart": {
    description: "Cloud-based diagramming tool for collaborative process maps, flowcharts and system diagrams.",
    bullets: {
      BUSINESS_ANALYST: [
        "Mapped end-to-end {subdomain} workflows in Lucidchart, collaborating live with stakeholders to validate steps, decision points and exceptions.",
        "Built Lucidchart system context and integration diagrams to clarify boundaries and data exchanges between applications for engineering teams.",
        "Maintained shared Lucidchart diagram libraries so process and architecture visuals stayed current as requirements evolved.",
      ],
      PROJECT_MANAGER: [
        "Used Lucidchart to visualize delivery roadmaps, team structures and dependencies, giving {client} leadership a clear picture of program scope.",
      ],
    },
  },
  "Microsoft Excel": {
    description: "Microsoft spreadsheet application for data analysis, modeling, tracking and reporting.",
    bullets: {
      DATA_ANALYST: [
        "Built Microsoft Excel analytical models with pivot tables, lookups and advanced formulas to analyze {subdomain} performance and answer stakeholder questions.",
        "Designed reusable Excel reporting templates with consistent definitions and validation checks, improving reliability of recurring business reporting.",
        "Reconciled data extracts in Microsoft Excel across systems, investigating discrepancies with source owners and documenting resolutions.",
      ],
      BUSINESS_ANALYST: [
        "Analyzed operational data in Microsoft Excel to quantify process issues and support recommendations presented to business leadership.",
        "Maintained requirements inventories, decision logs and issue trackers in Excel for {client} initiatives when lightweight tracking was preferred.",
      ],
      PROJECT_MANAGER: [
        "Managed budgets, resource forecasts and risk registers in Microsoft Excel, giving sponsors clear financial and delivery visibility.",
        "Built Excel status trackers and dashboards consolidating input from multiple workstreams for weekly leadership reporting.",
      ],
      QA_ENGINEER: [
        "Prepared and managed test data sets and execution trackers in Microsoft Excel, keeping test coverage and results visible to the team.",
      ],
    },
  },
  "Smartsheet": {
    description: "Cloud-based work management platform for project plans, trackers, dashboards and automated workflows.",
    bullets: {
      PROJECT_MANAGER: [
        "Managed {client} program schedules in Smartsheet, tracking milestones, dependencies and accountable owners across multiple concurrent workstreams.",
        "Built Smartsheet dashboards and automated status requests that gave sponsors real-time visibility into progress, risks and decisions.",
        "Standardized Smartsheet templates for project intake, risk logs and action items, improving consistency across the delivery portfolio.",
      ],
      BUSINESS_ANALYST: [
        "Tracked requirements, open questions and stakeholder decisions in Smartsheet, keeping {subdomain} business owners informed of status and next steps.",
      ],
    },
  },
  "Trello": {
    description: "Lightweight board-and-card tool for organizing tasks and visualizing work status.",
    bullets: {
      PROJECT_MANAGER: [
        "Organized team workload in Trello for smaller {client} initiatives, structuring boards, owners and due dates to keep delivery visible.",
        "Used Trello boards to coordinate cross-functional launch activities, keeping stakeholders aligned on readiness tasks and blockers.",
      ],
      BUSINESS_ANALYST: [
        "Tracked analysis tasks, stakeholder questions and pending decisions in Trello, giving business partners transparent visibility into requirements progress.",
      ],
    },
  },
  "ServiceNow": {
    description: "Enterprise platform for IT service management, workflows, incidents, change requests and service catalogs.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered and documented requirements for ServiceNow workflows, service catalog items and forms supporting {subdomain} operations.",
        "Partnered with platform developers to configure ServiceNow processes, validating business rules and approvals with process owners before release.",
      ],
      PROJECT_MANAGER: [
        "Managed ServiceNow implementation and enhancement projects for {client}, coordinating platform teams, process owners and release planning.",
        "Coordinated change requests through ServiceNow for project releases, securing approvals and ensuring operational readiness before deployment.",
      ],
      QA_ENGINEER: [
        "Validated ServiceNow workflow, form and approval configurations against business requirements and process owner expectations before promotion to production.",
      ],
      AWS_ENGINEER: [
        "Managed infrastructure incidents and change records in ServiceNow, documenting business impact, remediation steps and post-incident follow-up actions for stakeholders.",
      ],
    },
  },
  "Figma": {
    description: "Collaborative interface design and prototyping tool used for screen designs and clickable prototypes.",
    bullets: {
      BUSINESS_ANALYST: [
        "Collaborated with designers in Figma to translate {subdomain} requirements into interactive prototypes, validating flows with business users before build.",
        "Reviewed Figma screen designs against business rules and data requirements, annotating field behavior and validations for developers.",
        "Facilitated stakeholder walkthroughs of Figma prototypes, capturing feedback and converting agreed changes into refined requirements.",
      ],
    },
  },
  "Balsamiq": {
    description: "Rapid low-fidelity interface sketching tool used to explore screen layouts early in requirements definition.",
    bullets: {
      BUSINESS_ANALYST: [
        "Sketched low-fidelity screen layouts in Balsamiq to explore {subdomain} interface options with business users early in requirements discovery.",
        "Used Balsamiq sketches during stakeholder workshops to make abstract requirements tangible and drive faster agreement on screen content.",
        "Evolved Balsamiq screen concepts into annotated requirements for designers and developers, clarifying field rules and navigation.",
      ],
    },
  },
  "Microsoft Teams": {
    description: "Microsoft collaboration hub for chat, meetings, channels and shared files.",
    bullets: {
      PROJECT_MANAGER: [
        "Structured Microsoft Teams channels for {client} workstreams, centralizing announcements, decisions and files to streamline distributed collaboration.",
        "Facilitated remote governance forums and status reviews in Microsoft Teams, keeping geographically dispersed stakeholders engaged and aligned.",
      ],
      BUSINESS_ANALYST: [
        "Ran virtual requirements workshops in Microsoft Teams, using shared whiteboards and recordings to capture decisions with remote stakeholders.",
      ],
    },
  },
  "Slack": {
    description: "Messaging platform for team channels, real-time communication and tool integrations.",
    bullets: {
      PROJECT_MANAGER: [
        "Organized Slack channels and communication norms for cross-functional delivery teams, improving responsiveness on blockers and decisions.",
      ],
      AWS_ENGINEER: [
        "Coordinated incident response through dedicated Slack channels, keeping engineers and stakeholders informed during investigation and recovery.",
        "Routed infrastructure alerts and deployment notifications into Slack, giving teams timely visibility into platform health.",
      ],
      BUSINESS_ANALYST: [
        "Used Slack to resolve requirement questions quickly with developers and business partners, capturing resulting decisions in formal documentation.",
      ],
    },
  },

  // ---------------------------------------------------------------- Added technologies
  "Miro": {
    description: "Online collaborative whiteboard for workshops, journey maps, story maps and visual planning.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated remote discovery workshops on Miro boards for {subdomain} initiatives, capturing pain points, journeys and ideas from distributed stakeholders.",
        "Built customer journey and story maps in Miro to align business and delivery teams on priorities and release slicing.",
        "Synthesized workshop outputs from Miro into structured requirements and decisions, closing the loop with participants after each session.",
      ],
      PROJECT_MANAGER: [
        "Ran retrospectives and planning sessions in Miro for {client} teams, turning collaborative input into owned improvement actions.",
        "Visualized program roadmaps and dependencies on Miro boards to support cross-team planning and leadership discussions.",
      ],
    },
  },
  "Asana": {
    description: "Work management platform for planning projects, assigning tasks and tracking progress across teams.",
    bullets: {
      PROJECT_MANAGER: [
        "Managed {client} project portfolios in Asana, defining project templates, milestones and owners to keep cross-functional work on schedule.",
        "Built Asana portfolio views and status updates that gave leadership consolidated visibility into progress, risks and upcoming milestones.",
        "Standardized Asana intake forms and rules to route new requests consistently and reduce manual coordination across teams.",
      ],
      BUSINESS_ANALYST: [
        "Tracked analysis deliverables, stakeholder reviews and open decisions in Asana, keeping {subdomain} business partners informed of progress.",
      ],
    },
  },
  "Monday.com": {
    description: "Configurable work operating system for managing projects, workflows and team dashboards.",
    bullets: {
      PROJECT_MANAGER: [
        "Configured Monday.com boards and automations for {client} delivery teams, tracking milestones, owners and status across concurrent initiatives.",
        "Designed Monday.com dashboards that consolidated team workload, delivery timelines and emerging risks for weekly leadership reviews.",
        "Standardized Monday.com workflows for project intake and approvals, improving consistency and accountability across the portfolio.",
      ],
      BUSINESS_ANALYST: [
        "Gathered requirements for Monday.com workflow configurations, mapping business steps, approvals and statuses with process owners before rollout.",
      ],
    },
  },
  "Microsoft Planner": {
    description: "Microsoft task management tool for organizing team tasks, buckets and assignments within the Microsoft ecosystem.",
    bullets: {
      PROJECT_MANAGER: [
        "Coordinated team tasks and action items in Microsoft Planner for {client} workstreams, keeping ownership and due dates transparent.",
        "Organized Microsoft Planner buckets by phase and workstream, using progress views to drive weekly follow-ups with task owners.",
      ],
      BUSINESS_ANALYST: [
        "Tracked analysis tasks and stakeholder follow-ups in Microsoft Planner, ensuring open questions were owned and resolved on time.",
      ],
    },
  },
  "Clarity PPM": {
    description: "Broadcom project and portfolio management platform for demand intake, resource planning, financials and portfolio reporting.",
    bullets: {
      PROJECT_MANAGER: [
        "Managed project financials, forecasts and resource allocations in Clarity PPM, keeping {client} portfolio data accurate for investment decisions.",
        "Prepared portfolio status and capacity reporting from Clarity PPM for governance boards, highlighting cost and schedule risks requiring action.",
        "Guided project teams on Clarity PPM time tracking and status update standards, improving the reliability of portfolio-level reporting.",
      ],
    },
  },
  "Microsoft Power Automate": {
    description: "Microsoft low-code automation service for building workflows, approvals and integrations across business applications.",
    bullets: {
      BUSINESS_ANALYST: [
        "Identified manual {subdomain} tasks suited to automation and designed Power Automate flows for approvals, notifications and document routing with process owners.",
        "Defined requirements, business rules and exception handling for Power Automate workflows, partnering with makers to validate behavior before rollout.",
        "Established governance guidelines for Microsoft Power Automate solutions, covering ownership, naming, documentation and support handover.",
      ],
      PROJECT_MANAGER: [
        "Streamlined project approvals and status reminders with Power Automate, reducing manual follow-up across {client} workstreams.",
      ],
      DATA_ANALYST: [
        "Automated recurring data collection and report distribution steps with Power Automate, improving timeliness and consistency of business reporting.",
      ],
    },
  },
  "Celonis": {
    description: "Process mining platform that reconstructs actual process flows from system event logs to find inefficiencies and deviations.",
    bullets: {
      BUSINESS_ANALYST: [
        "Used Celonis process mining to reveal how {subdomain} processes actually ran, identifying rework loops, deviations and bottlenecks for improvement.",
        "Presented Celonis findings to process owners and leadership, translating observed process variants into prioritized improvement recommendations.",
        "Partnered with data teams to define event log requirements for Celonis, aligning case identifiers, activities and timestamps with business definitions.",
      ],
      DATA_ANALYST: [
        "Prepared and validated event log data for Celonis analysis, ensuring activities and timestamps accurately reflected business process steps.",
        "Built Celonis analyses and views tracking conformance and throughput trends, supporting process owners in monitoring improvement initiatives.",
      ],
    },
  },
  "Jama Connect": {
    description: "Requirements management platform for authoring, reviewing, tracing and managing changes to requirements in regulated and complex products.",
    bullets: {
      BUSINESS_ANALYST: [
        "Managed requirements in Jama Connect for {subdomain} programs, structuring hierarchies and relationships so coverage and impact were always visible.",
        "Ran formal requirement reviews in Jama Connect, capturing stakeholder feedback, approvals and decisions with a complete audit history.",
        "Governed requirement baselines and change impact in Jama Connect, assessing affected downstream items before approving modifications.",
      ],
      QA_ENGINEER: [
        "Linked verification activities to requirements in Jama Connect, providing auditable evidence of coverage for release and compliance reviews.",
      ],
    },
  },
  "IBM DOORS": {
    description: "IBM requirements management tool used to capture, link and control requirements in complex and regulated engineering programs.",
    bullets: {
      BUSINESS_ANALYST: [
        "Authored and controlled requirements in IBM DOORS for {client} programs, maintaining attributes, links and baselines under formal configuration management.",
        "Maintained traceability links in IBM DOORS between stakeholder, system and verification requirements, supporting impact assessment for proposed changes.",
        "Led requirement baseline reviews in IBM DOORS with engineering and compliance stakeholders, ensuring changes were justified, approved and auditable.",
      ],
      QA_ENGINEER: [
        "Traced verification procedures to requirements in IBM DOORS, demonstrating coverage and compliance evidence for formal audits.",
      ],
    },
  },
  "OKRs": {
    description: "Objectives and Key Results, a goal-setting framework that links ambitious objectives to measurable outcomes.",
    bullets: {
      PROJECT_MANAGER: [
        "Facilitated quarterly OKRs planning with {client} leadership, aligning team objectives to strategic priorities and clarifying ownership of key results.",
        "Connected delivery roadmaps to OKRs, helping leaders prioritize initiatives by their contribution to agreed objectives.",
        "Led OKRs check-ins and retrospectives, surfacing risks to key results early and guiding teams on corrective actions.",
      ],
      BUSINESS_ANALYST: [
        "Translated business objectives into OKRs for {subdomain} initiatives, defining measurable key results and the data needed to track them.",
      ],
    },
  },
  "PRINCE2": {
    description: "Process-based project management method that structures projects into controlled stages with defined roles and governance.",
    bullets: {
      PROJECT_MANAGER: [
        "Managed {client} projects using PRINCE2, defining stage plans, tolerances and exception processes approved by the project board.",
        "Established PRINCE2 governance artifacts including the business case, risk register and highlight reports, keeping the project board informed and in control.",
        "Applied PRINCE2 management-by-exception principles, escalating forecast tolerance breaches with options and recommendations for board decisions.",
      ],
    },
  },
};
