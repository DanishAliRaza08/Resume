import type { TechnologySeed } from "../technologies";
import type { TechKnowledge } from "./types";

/** Technologies added in this file (also need a knowledge entry below). */
export const EXTRA_PLATFORMS: TechnologySeed[] = [
  // Banking
  { canonicalName: "Jack Henry", category: "Domain Platforms", aliases: ["jack henry silverlake", "jack henry symitar", "silverlake system"], roles: [], domains: ["BANKING"], projectTypes: [] },
  { canonicalName: "FICO", category: "Domain Platforms", aliases: ["fico falcon", "fico blaze advisor", "fico decision manager"], roles: [], domains: ["BANKING"], projectTypes: [] },
  { canonicalName: "Black Knight MSP", category: "Domain Platforms", aliases: ["black knight", "msp servicing system"], roles: [], domains: ["BANKING"], projectTypes: [] },
  { canonicalName: "ICE Encompass", category: "Domain Platforms", aliases: ["ellie mae encompass", "encompass los", "ice mortgage technology"], roles: [], domains: ["BANKING"], projectTypes: [] },
  { canonicalName: "AxiomSL", category: "Domain Platforms", aliases: ["axiom controllerview", "adenza axiom"], roles: [], domains: ["BANKING"], projectTypes: [] },
  // Retail
  { canonicalName: "Oracle NetSuite", category: "Domain Platforms", aliases: ["netsuite"], roles: [], domains: ["RETAIL"], projectTypes: [] },
  { canonicalName: "Adobe Commerce", category: "Domain Platforms", aliases: ["magento", "magento commerce"], roles: [], domains: ["RETAIL"], projectTypes: [] },
  { canonicalName: "UKG Kronos", category: "Domain Platforms", aliases: ["kronos", "kronos workforce central", "ukg pro workforce management"], roles: [], domains: ["RETAIL"], projectTypes: [] },
  // Healthcare
  { canonicalName: "Availity", category: "Domain Platforms", aliases: ["availity portal"], roles: [], domains: ["HEALTHCARE"], projectTypes: [] },
  { canonicalName: "HEDIS", category: "Domain Platforms", aliases: ["healthcare effectiveness data and information set"], roles: [], domains: ["HEALTHCARE"], projectTypes: [] },
  { canonicalName: "CPT", category: "Domain Platforms", aliases: ["cpt codes", "current procedural terminology"], roles: [], domains: ["HEALTHCARE"], projectTypes: [] },
  // Pharma
  { canonicalName: "Oracle Clinical", category: "Domain Platforms", aliases: ["oracle clinical rdc", "oracle remote data capture"], roles: [], domains: ["PHARMA"], projectTypes: [] },
  { canonicalName: "Siebel CTMS", category: "Domain Platforms", aliases: ["oracle siebel ctms", "siebel clinical"], roles: [], domains: ["PHARMA"], projectTypes: [] },
  { canonicalName: "MedDRA", category: "Domain Platforms", aliases: ["medical dictionary for regulatory activities"], roles: [], domains: ["PHARMA"], projectTypes: [] },
  // P&C Insurance
  { canonicalName: "Guidewire InsuranceNow", category: "Domain Platforms", aliases: ["insurancenow", "guidewire insurance now"], roles: [], domains: ["PC_INSURANCE"], projectTypes: [] },
  { canonicalName: "Xactimate", category: "Domain Platforms", aliases: ["verisk xactimate", "xactware"], roles: [], domains: ["PC_INSURANCE"], projectTypes: [] },
  { canonicalName: "ISO ClaimSearch", category: "Domain Platforms", aliases: ["claimsearch", "verisk claimsearch"], roles: [], domains: ["PC_INSURANCE"], projectTypes: [] },
];

export const PLATFORM_KNOWLEDGE: Record<string, TechKnowledge> = {
  // ───────────────────────────── Banking ─────────────────────────────
  "Loan IQ": {
    description: "Finastra commercial lending platform for syndicated and bilateral loan servicing, from deal setup through drawdowns, rollovers, fees and agency payments.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated workshops with loan operations and agency teams to define Loan IQ deal, facility and outstanding setup requirements for syndicated and bilateral {subdomain} transactions.",
        "Authored detailed requirements for Loan IQ drawdowns, rollovers, repricings and interest and fee accrual logic, aligning operations, finance and technology on servicing rules.",
        "Documented Loan IQ agency servicing workflows covering lender share allocation, borrower notices and participant payments, clarifying exception handling and control points for operations leadership.",
      ],
      QA_ENGINEER: [
        "Validated Loan IQ lifecycle events including drawdowns, rollovers, paydowns and fee accruals against expected interest calculations and general ledger postings across complex facility structures.",
        "Designed end-to-end test scenarios for Loan IQ agency servicing, verifying lender share distributions, borrower billing notices and downstream accounting feeds before each release.",
      ],
      DATA_ANALYST: [
        "Reconciled Loan IQ outstandings, accruals and lender shares against finance ledgers and risk extracts, investigating breaks with loan operations and documenting root causes.",
      ],
      PROJECT_MANAGER: [
        "Led the Loan IQ upgrade program for {client}, coordinating loan operations, agency, finance and vendor teams through conversion rehearsals, cutover planning and post-go-live stabilization.",
      ],
    },
  },
  "AFS Vision": {
    description: "Commercial loan accounting and servicing system used by banks to book, bill, accrue and report on commercial and commercial real estate loans.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered requirements for AFS Vision obligation and obligor setup, collateral linkage and billing schedules with commercial loan servicing and credit administration teams.",
        "Mapped AFS Vision accrual, payment application and nonaccrual processing rules to business policies, documenting edge cases for participations and complex repayment structures.",
        "Defined interface requirements between AFS Vision and origination, general ledger and regulatory reporting systems for {subdomain}, clarifying field ownership and timing dependencies.",
      ],
      QA_ENGINEER: [
        "Verified AFS Vision billing, payment application and interest accrual outcomes across fixed, variable and participated loans, confirming accounting entries matched servicing policy.",
        "Executed end-to-end validation of AFS Vision nightly processing and downstream feeds, coordinating defect resolution with servicing operations and the vendor support team.",
      ],
      DATA_ANALYST: [
        "Analyzed AFS Vision loan-level balances, accruals and risk ratings to support allowance, call report and portfolio monitoring needs for credit and finance stakeholders.",
      ],
      PROJECT_MANAGER: [
        "Directed an AFS Vision conversion for {client}, managing data migration rehearsals, operational readiness, vendor deliverables and control sign-offs with servicing leadership.",
      ],
    },
  },
  "Calypso": {
    description: "Front-to-back capital markets platform for trading, risk, collateral and processing of derivatives, fixed income and treasury products.",
    bullets: {
      BUSINESS_ANALYST: [
        "Elicited requirements from trading, middle office and operations for Calypso trade capture, lifecycle events and confirmation workflows across interest rate and credit derivatives.",
        "Documented Calypso collateral management and margin call processes, aligning operations and risk on eligibility schedules, dispute handling and settlement controls.",
        "Analyzed Calypso static and reference data needs for {subdomain}, defining product, counterparty and settlement instruction requirements with front office and operations stakeholders.",
      ],
      QA_ENGINEER: [
        "Validated Calypso trade lifecycle processing including amendments, novations, resets and terminations, confirming cash flows, valuations and accounting postings matched expected results.",
        "Built end-to-end test packs covering Calypso trade booking through settlement and downstream risk feeds, coordinating defect resolution with front office and technology teams.",
      ],
      DATA_ANALYST: [
        "Reconciled Calypso positions, valuations and cash flows against risk and finance systems, investigating breaks and documenting systemic causes for operations leadership.",
      ],
      PROJECT_MANAGER: [
        "Managed a Calypso implementation workstream for {client}, coordinating trading, operations, risk and vendor teams across build, testing, parallel runs and production cutover.",
      ],
    },
  },
  "Murex": {
    description: "Integrated capital markets platform for trading, risk management, collateral and post-trade processing across asset classes.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated sessions with trading desks and market risk to define Murex trade capture, pricing and position-keeping requirements for {subdomain} products.",
        "Authored Murex post-trade requirements covering confirmations, settlements and accounting events, clarifying ownership between middle office, back office and finance teams.",
        "Documented Murex market data and curve setup requirements, aligning risk, product control and front office on sourcing, validation and end-of-day procedures.",
      ],
      QA_ENGINEER: [
        "Validated Murex trade lifecycle events and end-of-day processing, confirming valuations, sensitivities and accounting entries against independent expected results for each product type.",
        "Designed scenario-based test suites for Murex upgrades, comparing pre- and post-upgrade valuations and risk outputs and triaging differences with product control.",
      ],
      DATA_ANALYST: [
        "Analyzed Murex risk and profit-and-loss outputs, reconciling desk-level results with finance and investigating attribution breaks alongside product control analysts.",
      ],
      PROJECT_MANAGER: [
        "Led a Murex upgrade for {client}, governing scope, vendor deliverables, parallel-run sign-off and cutover readiness across trading, risk, operations and technology.",
      ],
    },
  },
  "Fidessa": {
    description: "Equities and listed-derivatives order and execution management platform used by brokers and trading desks for order routing and market access.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered requirements from equity trading desks for Fidessa order routing, care order handling and algorithmic strategy configuration, documenting desk-specific workflows and controls.",
        "Defined Fidessa pre-trade risk check and compliance rule requirements with trading supervision, aligning limit structures with best-execution and market access obligations.",
        "Documented Fidessa downstream allocation and booking flows to middle office for {subdomain}, clarifying enrichment rules, exception queues and end-of-day controls.",
      ],
      QA_ENGINEER: [
        "Validated Fidessa order lifecycle scenarios including partial fills, amendments, cancels and allocations, confirming downstream bookings and audit trails matched trading expectations.",
        "Tested Fidessa pre-trade risk limits and venue routing rules, documenting breach behaviors and coordinating fixes with trading technology before market go-live.",
      ],
      DATA_ANALYST: [
        "Analyzed Fidessa order and execution records to support best-execution reviews, surfacing routing patterns and fill quality insights for trading supervision.",
      ],
      PROJECT_MANAGER: [
        "Coordinated a Fidessa rollout for {client} trading desks, managing connectivity onboarding, desk readiness, vendor milestones and go-live support with trading leadership.",
      ],
    },
  },
  "Temenos T24": {
    description: "Temenos core banking platform (now Temenos Transact) for retail, corporate and treasury account, lending and payment processing.",
    bullets: {
      BUSINESS_ANALYST: [
        "Led requirements workshops for Temenos T24 customer, account and product setup, translating {subdomain} product rules into arrangement architecture and parameter configurations.",
        "Documented Temenos T24 close-of-business processing, interest capitalization and charges logic, aligning operations and finance on timing, dependencies and exception handling.",
        "Defined local regulatory and reporting enhancements to Temenos T24, coordinating with compliance and vendor teams to agree scope, configuration options and acceptance criteria.",
      ],
      QA_ENGINEER: [
        "Validated Temenos T24 account opening, lending and deposit product behaviors, confirming interest, charges and accounting entries through close-of-business cycles.",
        "Executed end-to-end Temenos T24 migration validation, reconciling customer, balance and arrangement data between legacy and target environments with operations stakeholders.",
      ],
      DATA_ANALYST: [
        "Profiled and reconciled Temenos T24 customer and balance extracts during migration, quantifying data issues and driving remediation with business data owners.",
      ],
      PROJECT_MANAGER: [
        "Managed a Temenos T24 core banking transformation for {client}, governing migration waves, branch readiness, vendor delivery and regulatory notifications through go-live.",
      ],
    },
  },
  "Finacle": {
    description: "Infosys core banking suite covering customer accounts, deposits, loans, payments and digital channels for retail and corporate banks.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated requirements sessions for Finacle deposit and loan product parameterization, documenting interest, fee and tenor rules agreed with product and operations teams.",
        "Analyzed Finacle customer onboarding and account maintenance workflows, defining maker-checker controls, document requirements and exception routing for branch and back-office users.",
        "Documented Finacle interface specifications with payments, cards and general ledger systems for {subdomain}, clarifying message content, timing and reconciliation responsibilities.",
      ],
      QA_ENGINEER: [
        "Validated Finacle end-of-day batch processing including interest accrual, standing instructions and charge collection, confirming accounting and customer balances matched expected outcomes.",
        "Tested Finacle branch and back-office workflows across onboarding, account servicing and closures, logging defects with clear business impact for prioritization.",
      ],
      DATA_ANALYST: [
        "Reconciled Finacle account and general ledger balances during migration rehearsals, investigating variances and documenting fixes with finance and operations data owners.",
      ],
      PROJECT_MANAGER: [
        "Directed Finacle rollout activities for {client}, coordinating branch training, data migration rehearsals, vendor fixes and cutover go or no-go decisions with executives.",
      ],
    },
  },
  "Oracle Flexcube": {
    description: "Oracle core banking platform for retail, corporate and investor servicing, covering accounts, deposits, lending, trade finance and payments.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered requirements for Oracle Flexcube lending and deposit product setup, documenting interest, penalty and schedule rules with product owners and operations managers.",
        "Mapped current-state branch and back-office processes to Oracle Flexcube standard functionality, recommending configuration over customization and documenting accepted process changes.",
        "Defined Oracle Flexcube trade finance requirements for letters of credit and guarantees in {subdomain}, aligning operations, compliance and credit on approval workflows.",
      ],
      QA_ENGINEER: [
        "Validated Oracle Flexcube loan schedules, disbursements and repayment processing, confirming interest calculations and accounting entries against product parameter specifications.",
        "Executed Oracle Flexcube end-of-day and end-of-month cycle testing, verifying accruals, maturities and status changes and escalating blocking defects to the vendor.",
      ],
      DATA_ANALYST: [
        "Analyzed Oracle Flexcube portfolio and delinquency extracts to support finance and risk reporting, documenting field definitions and reconciling totals to the ledger.",
      ],
      PROJECT_MANAGER: [
        "Managed Oracle Flexcube implementation milestones for {client}, aligning business, vendor and infrastructure teams on scope, migration readiness and cutover sequencing.",
      ],
    },
  },
  "FIS Systematics": {
    description: "FIS mainframe core banking system used by large banks for deposit, loan, customer information and general ledger processing.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented FIS Systematics deposit and loan application processing rules, translating batch parameters and tables into business-readable requirements for operations and finance.",
        "Analyzed FIS Systematics customer information and account relationship structures, defining requirements to support {subdomain} product changes and regulatory disclosures.",
        "Elicited requirements for integrating FIS Systematics with digital and payments channels, clarifying posting rules, memo-post behavior and end-of-day dependencies.",
      ],
      QA_ENGINEER: [
        "Validated FIS Systematics nightly batch postings, interest accruals and fee assessments against expected outcomes, coordinating mainframe job reruns with operations support.",
        "Designed end-to-end test scenarios spanning FIS Systematics and downstream statement, ledger and reporting systems, confirming balances and transaction histories matched.",
      ],
      DATA_ANALYST: [
        "Reconciled FIS Systematics account and ledger extracts with downstream finance systems, investigating breaks and documenting field-level definitions for reporting teams.",
      ],
      PROJECT_MANAGER: [
        "Led a FIS Systematics modernization initiative, coordinating mainframe, channel and operations teams on release scheduling, batch impact assessment and production readiness.",
      ],
    },
  },
  "Fiserv": {
    description: "Fiserv banking platforms for core account processing, payments, cards and digital banking used by banks and credit unions.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated requirements sessions for Fiserv core account processing changes, documenting deposit, loan and fee parameter updates with product and operations owners.",
        "Mapped Fiserv account opening and maintenance workflows end to end, identifying manual workarounds and defining configuration changes to reduce operational risk.",
        "Defined requirements for integrating Fiserv core processing with digital banking and payments for {subdomain}, clarifying real-time posting and exception handling expectations.",
      ],
      QA_ENGINEER: [
        "Validated Fiserv core parameter changes across deposit and loan products, verifying interest, fees and statement outputs before vendor release promotion.",
        "Tested Fiserv conversion outcomes by comparing account balances, holds and transaction histories between legacy and converted environments with operations stakeholders.",
      ],
      DATA_ANALYST: [
        "Analyzed Fiserv core extracts to monitor deposit balances, fee income and account attrition, delivering recurring insights to retail banking leadership.",
      ],
      PROJECT_MANAGER: [
        "Managed a Fiserv core conversion for {client}, coordinating vendor mock conversions, staff training, customer communications and weekend cutover execution.",
      ],
    },
  },
  "NICE Actimize": {
    description: "Financial crime platform for anti-money laundering transaction monitoring, fraud detection, sanctions screening and case management.",
    bullets: {
      BUSINESS_ANALYST: [
        "Defined NICE Actimize transaction monitoring scenario requirements with financial crimes compliance, documenting typologies, thresholds and segmentation rationale for regulatory defensibility.",
        "Documented NICE Actimize alert and case management workflows, aligning investigators, quality assurance and compliance leadership on escalation paths and filing decisions.",
        "Gathered requirements for onboarding new {subdomain} transaction sources into NICE Actimize, defining data elements, enrichment rules and completeness controls with compliance.",
      ],
      QA_ENGINEER: [
        "Validated NICE Actimize detection scenarios by constructing transaction patterns that should and should not alert, confirming threshold and segmentation logic behaved as designed.",
        "Tested NICE Actimize case management workflows, verifying alert routing, investigator actions, audit trails and regulatory filing outputs against compliance requirements.",
      ],
      DATA_ANALYST: [
        "Performed NICE Actimize above-the-line and below-the-line threshold tuning analysis, documenting productivity findings and recommendations for model risk and compliance review.",
        "Analyzed NICE Actimize alert dispositions and investigator workloads, identifying low-yield scenarios and supporting evidence-based tuning decisions with compliance leadership.",
      ],
      PROJECT_MANAGER: [
        "Led a NICE Actimize implementation for {client}, coordinating compliance, data, vendor and model validation teams through scenario build, tuning and regulatory readiness.",
      ],
    },
  },
  "Oracle Mantas": {
    description: "Oracle financial crime and compliance management platform for anti-money laundering behavior detection, surveillance and case management.",
    bullets: {
      BUSINESS_ANALYST: [
        "Defined Oracle Mantas behavior detection scenario requirements with compliance, documenting thresholds, jurisdictions and customer segmentation rules supporting anti-money laundering coverage.",
        "Documented Oracle Mantas data sourcing requirements for accounts, customers and transactions, aligning business owners on completeness checks and exception handling.",
        "Analyzed Oracle Mantas alert investigation workflows for {subdomain}, recommending queue design and disposition codes that improved consistency of investigator decisions.",
      ],
      QA_ENGINEER: [
        "Validated Oracle Mantas scenario outputs by staging targeted transaction patterns and confirming alert generation, scoring and suppression behaved according to specifications.",
        "Executed Oracle Mantas upgrade validation, comparing alert populations between versions and documenting differences for compliance and model risk sign-off.",
      ],
      DATA_ANALYST: [
        "Conducted Oracle Mantas threshold tuning and data completeness analysis, documenting findings and evidence packages for independent model validation reviews.",
      ],
      PROJECT_MANAGER: [
        "Managed an Oracle Mantas remediation program for {client}, tracking regulatory commitments, scenario delivery and validation milestones with compliance executives.",
      ],
    },
  },
  "SWIFT": {
    description: "Global interbank messaging network and standards used for cross-border payments, securities settlement and trade finance instructions.",
    bullets: {
      BUSINESS_ANALYST: [
        "Defined requirements for SWIFT MT and MX payment message handling, documenting field usage, enrichment and repair rules with payments operations and compliance.",
        "Led SWIFT MX migration analysis for {subdomain}, identifying impacted message types, downstream consumers and truncation risks, and agreeing remediation with operations stakeholders.",
        "Documented SWIFT gpi tracking and exception workflows, clarifying ownership of investigations, returns and fee disputes across payments operations and correspondent banking.",
      ],
      QA_ENGINEER: [
        "Validated SWIFT MT message generation and parsing for cross-border payments, verifying mandatory fields, character sets and screening outcomes against network standards.",
        "Tested SWIFT MX message flows end to end, confirming structured remittance and party data was preserved through payment hubs and sanctions screening.",
      ],
      DATA_ANALYST: [
        "Analyzed SWIFT payment message volumes, repair rates and rejection reasons to identify upstream data quality issues and prioritize fixes with operations.",
      ],
      PROJECT_MANAGER: [
        "Led the SWIFT MX migration program for {client}, coordinating payments, compliance, correspondent banking and technology teams against industry coexistence deadlines.",
      ],
    },
  },
  "Bloomberg Terminal": {
    description: "Bloomberg market data, analytics, news and trading terminal used by front office, research, risk and treasury professionals.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered requirements from traders and risk managers for Bloomberg Terminal market data fields used in pricing and valuation, documenting sourcing rules and fallbacks.",
        "Documented reference data requirements for securities sourced through Bloomberg Terminal, aligning front office, operations and risk on field definitions and refresh timing.",
        "Analyzed {subdomain} workflows relying on Bloomberg Terminal analytics, identifying manual rekeying and defining requirements for automated market data feeds.",
      ],
      QA_ENGINEER: [
        "Validated pricing and reference data loaded from Bloomberg Terminal sources against independent values, confirming tolerance checks and stale-price alerts behaved correctly.",
      ],
      DATA_ANALYST: [
        "Sourced pricing, curve and issuer data from Bloomberg Terminal to support valuation reviews, independent price verification and portfolio analytics for risk stakeholders.",
        "Built recurring market analysis packs using Bloomberg Terminal data on rates, spreads and credit events to inform treasury and investment committee discussions.",
      ],
      PROJECT_MANAGER: [
        "Coordinated Bloomberg Terminal entitlement rationalization across desks, aligning business owners, procurement and market data compliance on licensing and usage controls.",
      ],
    },
  },
  "Moody's Analytics": {
    description: "Moody's Analytics credit risk, expected credit loss, regulatory capital and economic scenario solutions used by banks and lenders.",
    bullets: {
      BUSINESS_ANALYST: [
        "Defined requirements for Moody's Analytics expected credit loss calculations, documenting segmentation, scenario weighting and qualitative overlay processes with credit risk and finance.",
        "Documented Moody's Analytics borrower risk rating workflows with credit officers, clarifying financial spreading, override governance and approval routing for {subdomain} portfolios.",
        "Gathered data requirements to feed Moody's Analytics models from loan, collateral and financial statement sources, agreeing ownership and completeness controls with data stewards.",
      ],
      QA_ENGINEER: [
        "Validated Moody's Analytics loss and rating outputs against independent recalculations, confirming input mappings, scenario selections and overlays were applied as designed.",
      ],
      DATA_ANALYST: [
        "Analyzed Moody's Analytics loss forecasts and economic scenarios, explaining period-over-period allowance movements to finance leadership and model risk reviewers.",
      ],
      PROJECT_MANAGER: [
        "Managed a Moody's Analytics credit loss implementation, coordinating credit risk, finance, model validation and audit stakeholders through parallel runs and sign-off.",
      ],
    },
  },
  "nCino": {
    description: "Cloud bank operating system for commercial, small business and retail loan origination, credit decisioning and onboarding.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated workshops with relationship managers and credit officers to design nCino loan origination stages, approval routing and checklist requirements for {subdomain}.",
        "Authored nCino requirements for credit memo templates, spreading, covenant tracking and exception management, aligning credit policy with configurable platform behavior.",
        "Documented nCino integration requirements with core banking and document imaging systems, defining booking handoffs, field ownership and error handling for loan operations.",
      ],
      QA_ENGINEER: [
        "Validated nCino origination workflows from application through approval and booking, confirming routing rules, required documents and approval authorities behaved correctly.",
        "Tested nCino role-based access and approval authority configurations, verifying relationship managers, underwriters and approvers saw only appropriate actions and records.",
      ],
      DATA_ANALYST: [
        "Analyzed nCino pipeline and cycle-time data to identify origination bottlenecks, delivering stage-level insights to commercial lending and credit leadership.",
      ],
      PROJECT_MANAGER: [
        "Led the nCino rollout for {client} commercial lending, managing phased releases, user training, adoption tracking and vendor coordination through hypercare.",
      ],
    },
  },
  "Jack Henry": {
    description: "Jack Henry core processing and digital banking platforms used by community banks and credit unions for accounts, lending and payments.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered requirements for Jack Henry core parameter changes supporting new deposit and loan products, documenting rate, fee and statement rules with product owners.",
        "Mapped member and customer servicing workflows on Jack Henry platforms, identifying manual steps and defining configuration and integration changes with operations leaders.",
        "Documented integration requirements between Jack Henry core processing and digital channels for {subdomain}, clarifying real-time posting and exception handling expectations.",
      ],
      QA_ENGINEER: [
        "Validated Jack Henry core product and fee configuration changes, confirming interest, service charges and statement outputs before production promotion.",
        "Tested Jack Henry conversion results by reconciling balances, holds and transaction histories between legacy and converted environments with operations stakeholders.",
      ],
      DATA_ANALYST: [
        "Analyzed Jack Henry core account data to report deposit growth, product penetration and attrition trends for community banking leadership.",
      ],
      PROJECT_MANAGER: [
        "Managed a Jack Henry core conversion for {client}, coordinating vendor mock conversions, staff training, member communications and cutover weekend execution.",
      ],
    },
  },
  "FICO": {
    description: "FICO decisioning and analytics products, including credit scores, Falcon fraud detection and Blaze Advisor decision rules, used across lending and fraud.",
    bullets: {
      BUSINESS_ANALYST: [
        "Defined FICO Blaze Advisor decision rule requirements for {subdomain} credit applications, documenting cutoffs, policy exclusions and override handling with credit policy owners.",
        "Documented FICO Falcon fraud alert workflows with fraud operations, clarifying score thresholds, case queues and customer contact strategies for card authorizations.",
        "Gathered requirements for incorporating FICO credit scores into underwriting and account management strategies, aligning risk, compliance and operations on adverse action reasons.",
      ],
      QA_ENGINEER: [
        "Validated FICO Blaze Advisor rule changes by executing champion and challenger test populations, confirming decision outcomes and reason codes matched approved policy.",
        "Tested FICO Falcon alert generation and case routing, verifying score thresholds, queue assignments and investigator actions behaved according to fraud strategy.",
      ],
      DATA_ANALYST: [
        "Analyzed FICO score distributions, approval rates and early delinquency trends to support credit strategy reviews and policy cutoff recommendations.",
      ],
      PROJECT_MANAGER: [
        "Coordinated a FICO decisioning platform rollout, aligning credit risk, fraud, compliance and technology teams on strategy migration, validation and production release.",
      ],
    },
  },
  "Black Knight MSP": {
    description: "Black Knight mortgage servicing platform for loan boarding, payment processing, escrow, investor reporting and default management.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented Black Knight MSP loan boarding, payment application and escrow analysis requirements with mortgage servicing operations, clarifying investor and regulatory constraints.",
        "Analyzed Black Knight MSP default servicing workflows covering loss mitigation, forbearance and foreclosure referrals, aligning operations and compliance on timelines and controls.",
        "Defined Black Knight MSP investor reporting and remittance requirements for {subdomain}, agreeing cutoff schedules, exception handling and reconciliation responsibilities.",
      ],
      QA_ENGINEER: [
        "Validated Black Knight MSP payment application, escrow disbursement and late fee processing, confirming loan balances and borrower statements matched servicing policy.",
        "Tested Black Knight MSP servicing transfer boarding, reconciling loan-level balances, escrow details and borrower data between prior servicer files and boarded records.",
      ],
      DATA_ANALYST: [
        "Analyzed Black Knight MSP delinquency, loss mitigation and escrow data to support servicing performance reviews and investor reporting reconciliations.",
      ],
      PROJECT_MANAGER: [
        "Managed Black Knight MSP servicing transfer projects for {client}, coordinating boarding rehearsals, borrower notifications, investor approvals and post-transfer stabilization.",
      ],
    },
  },
  "ICE Encompass": {
    description: "ICE Mortgage Technology loan origination system for mortgage application, processing, underwriting, disclosures and closing.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated requirements sessions with mortgage processing and underwriting teams to design ICE Encompass milestones, persona permissions and loan folder workflows.",
        "Documented ICE Encompass disclosure and closing requirements, aligning compliance and operations on fee tolerance handling, change-of-circumstance rules and timing obligations.",
        "Defined ICE Encompass business rules and custom field requirements for {subdomain}, clarifying conditions management, document ordering and investor delivery expectations.",
      ],
      QA_ENGINEER: [
        "Validated ICE Encompass business rules, milestone progression and persona access, confirming loans could not advance without required conditions and approvals.",
        "Tested ICE Encompass disclosure generation and fee tolerance calculations across loan scenarios, verifying outputs against regulatory timing and tolerance requirements.",
      ],
      DATA_ANALYST: [
        "Analyzed ICE Encompass pipeline, pull-through and cycle-time data to surface processing bottlenecks for mortgage production leadership.",
      ],
      PROJECT_MANAGER: [
        "Led an ICE Encompass optimization program for {client}, prioritizing workflow enhancements with production leaders and coordinating releases, training and adoption.",
      ],
    },
  },
  "AxiomSL": {
    description: "Regulatory reporting and risk data platform used by banks to produce capital, liquidity and supervisory returns.",
    bullets: {
      BUSINESS_ANALYST: [
        "Interpreted regulatory reporting instructions and translated them into AxiomSL calculation and schedule requirements, documenting line-item logic with regulatory reporting owners.",
        "Documented AxiomSL source data requirements for {subdomain} exposures, defining required attributes, adjustments and reconciliation controls with finance and data owners.",
        "Facilitated reviews of AxiomSL report variances with controllers, clarifying adjustment governance, sign-off steps and evidence retention for regulatory examinations.",
      ],
      QA_ENGINEER: [
        "Validated AxiomSL report outputs against independently calculated line items, confirming aggregation rules, adjustments and validation checks matched regulatory instructions.",
        "Tested AxiomSL release changes by comparing prior and current period returns, documenting expected and unexpected movements for regulatory reporting sign-off.",
      ],
      DATA_ANALYST: [
        "Performed AxiomSL variance and reconciliation analysis between regulatory returns and general ledger balances, documenting explanations for controllers and auditors.",
      ],
      PROJECT_MANAGER: [
        "Managed AxiomSL regulatory reporting deliveries for {client}, tracking filing calendars, data remediation and control sign-offs with finance and compliance leadership.",
      ],
    },
  },

  // ───────────────────────────── Retail ─────────────────────────────
  "SAP ERP": {
    description: "SAP enterprise resource planning suite (ECC and S/4HANA) for finance, procurement, inventory, sales and manufacturing processes.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated fit-to-standard workshops for SAP S/4HANA procure-to-pay and order-to-cash processes, documenting configuration decisions and justified customizations with process owners.",
        "Authored SAP ERP functional requirements for pricing, inventory movements and goods receipt processing in {subdomain}, aligning merchandising, supply chain and finance stakeholders.",
        "Documented SAP ERP master data governance requirements for materials, vendors and customers, defining ownership, approval workflows and quality rules with data stewards.",
      ],
      QA_ENGINEER: [
        "Validated SAP ERP order-to-cash and procure-to-pay flows end to end, confirming document flow, inventory postings and financial entries matched configuration specifications.",
        "Executed SAP S/4HANA integration test cycles with warehouse, commerce and finance interfaces, triaging failures with functional consultants and business process owners.",
      ],
      DATA_ANALYST: [
        "Reconciled SAP ERP inventory valuation and sales postings against operational systems, investigating variances and documenting root causes for finance and supply chain.",
      ],
      PROJECT_MANAGER: [
        "Led an SAP S/4HANA workstream for {client}, governing design sign-offs, data conversion rehearsals, cutover planning and business readiness across finance and supply chain.",
      ],
    },
  },
  "Oracle Retail": {
    description: "Oracle merchandising suite for retail item, pricing, purchasing, inventory and allocation management (formerly Retek).",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered Oracle Retail merchandising requirements for item setup, supplier management and purchase order workflows with buyers, planners and merchandise operations.",
        "Documented Oracle Retail pricing and promotion processes, aligning merchandising, marketing and store operations on price change timing, clearance rules and approvals.",
        "Defined Oracle Retail inventory and allocation requirements for {subdomain}, clarifying store replenishment rules, transfer processing and stock ledger expectations.",
      ],
      QA_ENGINEER: [
        "Validated Oracle Retail item, purchase order and receiving flows, confirming inventory positions and stock ledger postings updated correctly across stores and warehouses.",
        "Tested Oracle Retail price change and promotion propagation to stores and digital channels, verifying effective dates, overlaps and clearance markdown behaviors.",
      ],
      DATA_ANALYST: [
        "Analyzed Oracle Retail sales, inventory and markdown data to report sell-through, weeks of supply and margin trends for merchandising leadership.",
      ],
      PROJECT_MANAGER: [
        "Managed an Oracle Retail merchandising upgrade for {client}, coordinating buyers, store operations, integration teams and the vendor through phased deployments.",
      ],
    },
  },
  "Salesforce": {
    description: "Cloud CRM platform for sales, service and marketing processes, including opportunity management, case management and customer data.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated discovery sessions with sales and service leaders to define Salesforce opportunity stages, case routing and escalation rules for {subdomain} teams.",
        "Authored Salesforce requirements for object models, page layouts, validation rules and approval processes, translating business policies into maintainable declarative configuration.",
        "Documented Salesforce integration requirements with order, billing and marketing systems, defining record ownership, synchronization timing and duplicate management rules.",
      ],
      QA_ENGINEER: [
        "Validated Salesforce case assignment, escalation and service-level entitlement rules across support tiers, confirming routing and notifications behaved as specified.",
        "Tested Salesforce profile, permission set and sharing rule configurations, verifying users saw and edited only records appropriate to their role and territory.",
      ],
      DATA_ANALYST: [
        "Analyzed Salesforce pipeline, win-rate and case resolution data, building recurring reports that informed forecasting and service staffing decisions.",
      ],
      PROJECT_MANAGER: [
        "Led a Salesforce rollout for {client}, managing release planning, data migration, user training and adoption metrics definition with sales and service leadership.",
      ],
    },
  },
  "Salesforce Commerce Cloud": {
    description: "Enterprise digital commerce platform (formerly Demandware) for storefronts, catalogs, promotions, search and checkout.",
    bullets: {
      BUSINESS_ANALYST: [
        "Defined Salesforce Commerce Cloud storefront requirements for catalog navigation, search refinements and product detail content with ecommerce merchandising and brand teams.",
        "Documented Salesforce Commerce Cloud promotion, coupon and price book rules, aligning marketing and finance on stacking, exclusions and margin protection.",
        "Gathered checkout and order export requirements for Salesforce Commerce Cloud in {subdomain}, clarifying payment, tax, inventory reservation and fulfillment handoffs.",
      ],
      QA_ENGINEER: [
        "Validated Salesforce Commerce Cloud checkout flows across payment methods, shipping options and promotions, confirming totals, taxes and order exports were accurate.",
        "Tested Salesforce Commerce Cloud catalog, price book and inventory updates on storefronts, verifying correct product visibility, pricing and availability messaging.",
      ],
      DATA_ANALYST: [
        "Analyzed Salesforce Commerce Cloud conversion funnel and promotion performance data to inform merchandising, site search and campaign decisions.",
      ],
      PROJECT_MANAGER: [
        "Managed Salesforce Commerce Cloud site launches for {client}, coordinating merchandising, creative, integration partners and operations through peak-season readiness.",
      ],
    },
  },
  "Shopify": {
    description: "Commerce platform for online storefronts, product catalogs, checkout, order management and retail point of sale.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered requirements for Shopify storefront, collection and product variant structures with merchandising teams, documenting catalog rules and content ownership.",
        "Documented Shopify order, fulfillment and returns workflows for {subdomain}, clarifying handoffs to warehouse, customer service and finance teams.",
        "Evaluated Shopify app and integration options for loyalty, tax and inventory needs, documenting tradeoffs and recommendations for business leadership.",
      ],
      QA_ENGINEER: [
        "Validated Shopify checkout, discount and shipping rate configurations across customer scenarios, confirming order totals, taxes and confirmation messages were correct.",
        "Exercised Shopify inventory and order synchronization with fulfillment systems, verifying stock levels, order statuses and refunds stayed consistent.",
      ],
      DATA_ANALYST: [
        "Evaluated Shopify sales, discount and customer cohort data to report repeat purchase behavior and product performance to ecommerce leadership.",
      ],
      PROJECT_MANAGER: [
        "Led a Shopify replatforming for {client}, coordinating catalog migration, integration partners, launch readiness and post-launch stabilization.",
      ],
    },
  },
  "Manhattan WMS": {
    description: "Manhattan Associates warehouse management system for receiving, putaway, inventory control, wave planning, picking and shipping.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated warehouse process walkthroughs to define Manhattan WMS receiving, putaway and replenishment requirements with distribution center managers and inventory control.",
        "Documented Manhattan WMS wave planning, pick allocation and cartonization rules for {subdomain}, aligning operations on labor, slotting and service priorities.",
        "Defined Manhattan WMS integration requirements with order management and transportation systems, clarifying order release, shipment confirmation and inventory adjustment messages.",
      ],
      QA_ENGINEER: [
        "Validated Manhattan WMS inbound and outbound flows from receipt through shipment, confirming inventory, task generation and shipment confirmations behaved correctly.",
        "Executed Manhattan WMS volume and peak-readiness scenarios with operations, verifying wave release, picking and packing performance under realistic order profiles.",
      ],
      DATA_ANALYST: [
        "Analyzed Manhattan WMS task, inventory and shipment data to identify picking inefficiencies and inventory accuracy issues for distribution leadership.",
      ],
      PROJECT_MANAGER: [
        "Managed Manhattan WMS distribution center go-lives for {client}, coordinating operations readiness, hardware, training, cutover inventory counts and hypercare support.",
      ],
    },
  },
  "Blue Yonder": {
    description: "Supply chain planning and execution suite (formerly JDA) for demand forecasting, replenishment, assortment and warehouse operations.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered Blue Yonder demand planning requirements with planners, documenting forecast hierarchies, seasonality handling and promotional lift processes for {subdomain}.",
        "Documented Blue Yonder replenishment parameters including safety stock, order cycles and presentation minimums, aligning planning and store operations on policies.",
        "Defined Blue Yonder integration requirements for sales history, inventory and purchase order data, clarifying timing, ownership and exception handling.",
      ],
      QA_ENGINEER: [
        "Validated Blue Yonder forecast and replenishment outputs against planner expectations, confirming parameter changes produced correct order recommendations.",
        "Tested Blue Yonder inbound sales and inventory loads, verifying completeness and timing so planning runs used accurate positions.",
      ],
      DATA_ANALYST: [
        "Measured Blue Yonder forecast accuracy and bias by category and location, recommending parameter adjustments with demand planning leadership.",
      ],
      PROJECT_MANAGER: [
        "Led a Blue Yonder planning implementation for {client}, coordinating planners, merchandising, integration teams and the vendor through pilot and rollout.",
      ],
    },
  },
  "Microsoft Dynamics 365": {
    description: "Microsoft business applications suite for finance, supply chain, commerce and customer engagement.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated Microsoft Dynamics 365 design workshops for finance and supply chain processes, documenting configuration decisions and required extensions with process owners.",
        "Authored Dynamics 365 requirements for store operations, pricing and inventory in {subdomain}, aligning retail operations and finance on posting and replenishment rules.",
        "Documented Microsoft Dynamics 365 data migration requirements for customers, vendors and open transactions, defining cleansing rules and ownership with business data stewards.",
      ],
      QA_ENGINEER: [
        "Validated Microsoft Dynamics 365 procure-to-pay and order-to-cash scenarios, confirming document flows, inventory transactions and ledger postings matched design.",
        "Tested Dynamics 365 security roles and workflow approvals, verifying segregation of duties and approval routing across finance and operations users.",
      ],
      DATA_ANALYST: [
        "Reconciled Microsoft Dynamics 365 subledger and general ledger balances after migration, investigating variances with finance and documenting resolutions.",
      ],
      PROJECT_MANAGER: [
        "Managed a Microsoft Dynamics 365 implementation for {client}, coordinating partner delivery, business readiness, data conversion and phased go-lives.",
      ],
    },
  },
  "Adobe Analytics": {
    description: "Digital analytics platform for measuring web and app behavior, conversion funnels, attribution and customer segments.",
    bullets: {
      BUSINESS_ANALYST: [
        "Defined Adobe Analytics measurement requirements with digital product and marketing teams, documenting events, variables and success criteria for key customer journeys.",
        "Authored Adobe Analytics solution design references describing props, eVars and events for {subdomain} experiences, aligning analysts and developers on definitions.",
        "Facilitated reviews of Adobe Analytics reporting needs with stakeholders, prioritizing tagging enhancements that closed gaps in funnel and campaign measurement.",
      ],
      QA_ENGINEER: [
        "Validated Adobe Analytics tagging across critical journeys, confirming page, event and variable values fired correctly before releases.",
        "Tested Adobe Analytics data collection after site changes, verifying conversion events, campaign parameters and product data remained accurate.",
      ],
      DATA_ANALYST: [
        "Analyzed Adobe Analytics funnel, segment and attribution data to identify conversion drop-offs and recommend site experience improvements.",
        "Built Adobe Analytics workspace projects tracking campaign, search and product performance, sharing insights with marketing and ecommerce leadership.",
      ],
      PROJECT_MANAGER: [
        "Coordinated an Adobe Analytics implementation refresh for {client}, aligning marketing, product, development and privacy teams on scope, governance and timelines.",
      ],
    },
  },
  "NCR POS": {
    description: "NCR point-of-sale software and hardware for store checkout, tendering, returns, promotions and store operations.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered NCR POS requirements with store operations for tendering, returns, voids and manager overrides, documenting controls and loss prevention expectations.",
        "Documented NCR POS promotion and pricing behaviors for {subdomain}, aligning merchandising and store operations on discount sequencing and receipt presentation.",
        "Defined NCR POS integration requirements for transaction logs, inventory updates and payment processing, clarifying store-to-host timing and recovery procedures.",
      ],
      QA_ENGINEER: [
        "Validated NCR POS checkout scenarios across tenders, promotions, returns and voids, confirming totals, taxes and receipts matched business rules.",
        "Simulated NCR POS offline mode and recovery behavior, verifying transactions queued and posted correctly once store connectivity was restored.",
      ],
      DATA_ANALYST: [
        "Analyzed NCR POS transaction data to report basket composition, tender mix and return patterns for store operations and loss prevention.",
      ],
      PROJECT_MANAGER: [
        "Managed NCR POS store rollouts for {client}, coordinating pilot stores, hardware installation, cashier training and staged deployment waves.",
      ],
    },
  },
  "Oracle NetSuite": {
    description: "Cloud ERP for financials, order management, inventory and procurement, widely used by mid-market retailers and distributors.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated Oracle NetSuite design sessions for order-to-cash and procure-to-pay processes, documenting saved searches, workflows and approval requirements with finance and operations.",
        "Documented Oracle NetSuite inventory, fulfillment and location requirements for {subdomain}, clarifying item types, costing methods and transfer order handling.",
        "Defined NetSuite integration requirements with ecommerce and warehouse systems, specifying order, inventory and payment synchronization rules and error ownership.",
      ],
      QA_ENGINEER: [
        "Validated Oracle NetSuite sales order, fulfillment and invoicing flows, confirming inventory, revenue and ledger postings matched configured rules.",
        "Tested NetSuite approval workflows and role permissions, verifying segregation of duties across purchasing, payables and finance users.",
      ],
      DATA_ANALYST: [
        "Built Oracle NetSuite saved searches and reports on sales, margin and inventory aging, reconciling results to financial statements for finance leadership.",
      ],
      PROJECT_MANAGER: [
        "Led an Oracle NetSuite implementation for {client}, coordinating partner delivery, data migration, user training and month-end close readiness.",
      ],
    },
  },
  "Adobe Commerce": {
    description: "Ecommerce platform (formerly Magento) for storefronts, catalogs, pricing rules, promotions and checkout.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered Adobe Commerce catalog, attribute set and category requirements with merchandising teams, documenting product data ownership and enrichment rules.",
        "Documented Adobe Commerce cart price rules, customer groups and promotion logic for {subdomain}, aligning marketing and finance on exclusions and stacking.",
        "Defined Adobe Commerce checkout and order export requirements, clarifying payment, tax, shipping and fulfillment integration responsibilities.",
      ],
      QA_ENGINEER: [
        "Validated Adobe Commerce checkout scenarios across payment methods, promotions and shipping rules, confirming totals and order exports were accurate.",
        "Tested Adobe Commerce catalog and pricing updates on storefronts, verifying product visibility, configurable options and customer group pricing.",
      ],
      DATA_ANALYST: [
        "Analyzed Adobe Commerce order, promotion and customer data to evaluate campaign effectiveness and average order value trends for ecommerce leadership.",
      ],
      PROJECT_MANAGER: [
        "Managed an Adobe Commerce replatforming for {client}, coordinating agency partners, catalog migration, integration testing and launch readiness.",
      ],
    },
  },
  "UKG Kronos": {
    description: "Workforce management platform for scheduling, timekeeping, labor forecasting, attendance and pay rules for hourly workforces.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered UKG Kronos scheduling and labor forecasting requirements with store and distribution operations, documenting labor standards, coverage rules and approval steps.",
        "Documented UKG Kronos pay rules, overtime and premium calculations for {subdomain}, aligning human resources, payroll and legal on jurisdictional requirements.",
        "Defined UKG Kronos integration requirements with human resources and payroll systems, clarifying employee data ownership, timing and exception handling.",
      ],
      QA_ENGINEER: [
        "Validated UKG Kronos pay rule and overtime calculations across shift patterns and jurisdictions, confirming timecard totals matched payroll policy.",
        "Tested UKG Kronos schedule generation and time punch processing, verifying exceptions, approvals and payroll exports behaved correctly.",
      ],
      DATA_ANALYST: [
        "Analyzed UKG Kronos labor, attendance and overtime data to compare scheduled versus actual hours and support staffing decisions with operations leaders.",
      ],
      PROJECT_MANAGER: [
        "Led a UKG Kronos rollout for {client} stores, coordinating payroll parallel runs, manager training, labor relations review and phased deployment.",
      ],
    },
  },

  // ───────────────────────────── Healthcare ─────────────────────────────
  "Epic": {
    description: "Epic electronic health record suite covering clinical documentation, orders, scheduling, registration and revenue cycle (Cadence, Prelude, Resolute and others).",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated clinical workflow sessions with physicians and nursing leaders to define Epic order sets, documentation templates and decision support requirements for {subdomain}.",
        "Documented Epic Cadence scheduling and Prelude registration workflows, aligning access center, front desk and revenue cycle teams on visit types, eligibility checks and templates.",
        "Analyzed Epic Resolute charge capture and claim workflows with revenue cycle leaders, defining charge router rules, work queue routing and denial prevention requirements.",
      ],
      QA_ENGINEER: [
        "Validated Epic clinical workflows end to end, confirming orders, results and documentation flowed correctly across ambulatory, inpatient and ancillary departments.",
        "Executed Epic integrated testing for upgrades, verifying registration, scheduling, charging and billing scenarios with clinical and revenue cycle super users.",
      ],
      DATA_ANALYST: [
        "Built Epic Clarity and Reporting Workbench analyses on access, throughput and quality measures, validating definitions with clinical and operational leaders.",
      ],
      PROJECT_MANAGER: [
        "Led Epic implementation activities for {client}, coordinating application analysts, clinical champions, training and command center operations through go-live.",
        "Managed Epic upgrade planning and readiness, aligning application teams, end-user communications and downtime procedures with clinical and revenue cycle leadership.",
      ],
    },
  },
  "Cerner": {
    description: "Oracle Cerner electronic health record platform (Millennium) for clinical documentation, orders, pharmacy, scheduling and revenue cycle.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered Cerner Millennium clinical documentation and order requirements with nursing and physician leaders, translating workflows into power plans and form designs.",
        "Documented Cerner registration, scheduling and patient accounting workflows for {subdomain}, aligning patient access and revenue cycle teams on handoffs and controls.",
        "Defined Cerner interface requirements for laboratory, radiology and pharmacy systems, clarifying order and result flows, identifiers and error handling.",
      ],
      QA_ENGINEER: [
        "Validated Cerner order-to-result workflows across laboratory, radiology and pharmacy, confirming results posted to the correct patient chart and encounter.",
        "Executed Cerner integrated testing cycles with clinical super users, verifying documentation, medication administration and charging scenarios before go-live.",
      ],
      DATA_ANALYST: [
        "Analyzed Cerner clinical and encounter data to support quality measure reporting, documentation compliance and throughput reviews for clinical leadership.",
      ],
      PROJECT_MANAGER: [
        "Managed Cerner implementation and optimization efforts for {client}, coordinating clinical informatics, training, interface teams and go-live command center support.",
      ],
    },
  },
  "Facets": {
    description: "TriZetto core administrative platform for health plans, covering membership, provider, benefits configuration, claims and billing.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated sessions with benefits and product teams to translate plan designs into Facets benefit configuration requirements, covering accumulators, cost shares and limits.",
        "Documented Facets claims adjudication requirements for pricing, edits and pend resolution, aligning claims operations and configuration teams on business rules.",
        "Defined Facets membership and provider data requirements for {subdomain}, clarifying enrollment, eligibility spans and network affiliation handling.",
      ],
      QA_ENGINEER: [
        "Validated Facets claims adjudication outcomes across benefit, pricing and coordination of benefits scenarios, confirming allowed amounts and member liability.",
        "Tested Facets enrollment and eligibility processing, verifying member spans, plan assignments and premium billing results matched enrollment files.",
      ],
      DATA_ANALYST: [
        "Analyzed Facets claim, pend and denial data to identify configuration-driven errors and prioritize fixes with claims operations leadership.",
      ],
      PROJECT_MANAGER: [
        "Oversaw Facets upgrade and benefit configuration releases for {client}, coordinating configuration, claims, testing and compliance teams around plan-year deadlines.",
      ],
    },
  },
  "QNXT": {
    description: "TriZetto core administration system for health plans, especially Medicaid and Medicare, covering enrollment, benefits, providers and claims.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented QNXT benefit plan and contract configuration requirements with product and provider contracting teams, clarifying reimbursement methodologies and authorization rules.",
        "Analyzed QNXT claims processing and pend workflows for {subdomain}, defining edits, routing and resolution requirements with claims operations.",
        "Defined QNXT enrollment and eligibility requirements for government programs, aligning enrollment operations and compliance on retroactivity and reconciliation rules.",
      ],
      QA_ENGINEER: [
        "Validated QNXT claims adjudication across contract, benefit and authorization scenarios, confirming payment amounts, denials and explanation codes matched configuration.",
        "Tested QNXT enrollment loads and eligibility changes, verifying member records, retroactive adjustments and claim reprocessing behaved correctly.",
      ],
      DATA_ANALYST: [
        "Analyzed QNXT claims and encounter data to support payment accuracy reviews and state reporting reconciliations with finance and compliance.",
      ],
      PROJECT_MANAGER: [
        "Managed QNXT configuration and upgrade initiatives for {client}, coordinating claims, configuration, provider and compliance teams against regulatory deadlines.",
      ],
    },
  },
  "HL7": {
    description: "Health Level Seven messaging standard (v2) used to exchange admissions, orders, results and scheduling data between clinical systems.",
    bullets: {
      BUSINESS_ANALYST: [
        "Authored HL7 interface specifications for admission, order and result messages, documenting segment usage, identifiers and code mappings with clinical and integration teams.",
        "Facilitated HL7 interface requirements sessions with laboratory and radiology stakeholders for {subdomain}, clarifying triggers, acknowledgments and error handling.",
        "Documented HL7 patient identity and encounter handling rules, aligning registration, clinical and integration teams on merges, updates and duplicate resolution.",
      ],
      QA_ENGINEER: [
        "Validated HL7 admission, order and result messages end to end, confirming segment content, code translations and patient matching against interface specifications.",
        "Verified HL7 interface error and acknowledgment handling, verifying rejected messages were queued, alerted and reprocessed correctly.",
      ],
      DATA_ANALYST: [
        "Analyzed HL7 message logs to identify recurring interface errors and data quality issues, prioritizing fixes with integration and clinical owners.",
      ],
      PROJECT_MANAGER: [
        "Coordinated HL7 interface delivery for {client} clinical system implementations, tracking build, testing and go-live readiness across vendors and internal teams.",
      ],
    },
  },
  "FHIR": {
    description: "HL7 Fast Healthcare Interoperability Resources standard for exchanging clinical and administrative data through resource-based web services.",
    bullets: {
      BUSINESS_ANALYST: [
        "Defined FHIR resource and profile requirements for patient, encounter and coverage data, documenting element usage and terminology bindings with interoperability teams.",
        "Analyzed interoperability and patient access regulations, translating obligations into FHIR exchange requirements for {subdomain} with compliance and product stakeholders.",
        "Documented FHIR consent, authorization and data sharing rules, aligning privacy, security and product teams on third-party application access.",
      ],
      QA_ENGINEER: [
        "Validated FHIR resources against implementation guide profiles, confirming required elements, cardinality and terminology bindings were satisfied.",
        "Exercised FHIR search, paging and authorization behaviors, verifying applications received only permitted patient data with correct resource references.",
      ],
      DATA_ANALYST: [
        "Analyzed FHIR resource payloads to assess completeness of clinical and coverage data, documenting gaps for source system owners.",
      ],
      PROJECT_MANAGER: [
        "Led a FHIR interoperability program for {client}, coordinating compliance, vendor and product teams to meet regulatory patient access deadlines.",
      ],
    },
  },
  "Allscripts": {
    description: "Allscripts (now Veradigm) electronic health record and practice management solutions for ambulatory and acute care providers.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered Allscripts ambulatory documentation and order requirements with providers, documenting templates, favorites and clinical decision support needs.",
        "Mapped Allscripts practice management workflows for scheduling, registration and billing in {subdomain}, aligning front office and billing teams on handoffs.",
        "Defined Allscripts interface requirements with laboratory and imaging partners, clarifying order and result exchange expectations and exception handling.",
      ],
      QA_ENGINEER: [
        "Validated Allscripts clinical documentation, orders and prescribing workflows, confirming results routed to providers and charts updated correctly.",
        "Verified Allscripts scheduling and charge entry processes, verifying appointment types, charges and claims outputs matched configuration.",
      ],
      DATA_ANALYST: [
        "Analyzed Allscripts encounter and charge data to support provider productivity and documentation quality reviews with practice leadership.",
      ],
      PROJECT_MANAGER: [
        "Managed Allscripts upgrade and optimization efforts for {client} practices, coordinating providers, trainers, vendor support and go-live readiness.",
      ],
    },
  },
  "athenahealth": {
    description: "Cloud electronic health record, practice management and revenue cycle services platform for ambulatory practices.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented athenahealth scheduling, check-in and clinical encounter workflows with practice managers, identifying configuration changes to reduce front-desk rework.",
        "Analyzed athenahealth claim hold and denial workflows for {subdomain}, defining rule and work queue requirements with billing leadership.",
        "Gathered athenahealth integration requirements with referral and patient engagement tools, clarifying data ownership and synchronization expectations.",
      ],
      QA_ENGINEER: [
        "Validated athenahealth appointment, encounter and charge workflows, confirming claims generated with correct providers, locations and billing details.",
        "Assessed athenahealth configuration changes to claim rules and templates, verifying expected holds and documentation behaviors before practice rollout.",
      ],
      DATA_ANALYST: [
        "Analyzed athenahealth revenue cycle data on days in receivables, denial reasons and collections to inform billing improvement priorities.",
      ],
      PROJECT_MANAGER: [
        "Led athenahealth practice onboarding for {client}, coordinating data conversion, staff training, workflow design and go-live support.",
      ],
    },
  },
  "Meditech": {
    description: "Meditech electronic health record platform (including Expanse) for hospital clinical, patient access and revenue cycle operations.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered Meditech clinical documentation and order management requirements with nursing and physician leaders, documenting workflows and decision support needs.",
        "Mapped Meditech patient registration, scheduling and billing workflows for {subdomain}, aligning patient access and revenue cycle teams on controls.",
        "Defined Meditech interface requirements with ancillary systems, clarifying order, result and charge flows and error handling with integration staff.",
      ],
      QA_ENGINEER: [
        "Validated Meditech order-to-result and medication workflows, confirming accurate charting and charge generation across hospital departments.",
        "Executed Meditech integrated testing with super users, verifying registration, documentation and billing scenarios before upgrade go-live.",
      ],
      DATA_ANALYST: [
        "Interpreted Meditech encounter and quality data to support regulatory measure reporting and clinical performance reviews.",
      ],
      PROJECT_MANAGER: [
        "Managed a Meditech Expanse migration for {client}, coordinating clinical champions, training, interface readiness and command center operations.",
      ],
    },
  },
  "ICD-10": {
    description: "International classification code set for diagnoses and inpatient procedures used for clinical documentation, claims and reporting.",
    bullets: {
      BUSINESS_ANALYST: [
        "Analyzed ICD-10 code set impacts on claims, authorization and reporting processes, documenting required system and policy changes with coding and compliance leaders.",
        "Documented ICD-10 diagnosis-driven business rules for {subdomain}, clarifying medical necessity, benefit determination and risk adjustment dependencies.",
        "Facilitated annual ICD-10 code update reviews with coding, configuration and clinical policy teams, defining effective dates and crosswalk handling.",
      ],
      QA_ENGINEER: [
        "Validated ICD-10 code handling across claims and authorization workflows, confirming valid codes, effective dates and diagnosis-driven edits behaved correctly.",
        "Tested ICD-10 annual update loads, verifying new, revised and deleted codes were applied with correct effective dating.",
      ],
      DATA_ANALYST: [
        "Analyzed ICD-10 diagnosis patterns in claims and encounter data to support risk adjustment, population health and documentation improvement initiatives.",
      ],
      PROJECT_MANAGER: [
        "Coordinated ICD-10 code update readiness across claims, clinical and reporting systems, tracking configuration, validation and communication milestones.",
      ],
    },
  },
  "Availity": {
    description: "Healthcare clearinghouse and provider portal for eligibility, claim submission and status, authorizations and remittance between providers and payers.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented Availity eligibility, claim status and authorization workflows with provider services, clarifying payer responses and escalation paths.",
        "Defined Availity onboarding requirements for {subdomain} transactions, aligning provider relations, operations and compliance on enrollment and access controls.",
        "Analyzed Availity portal usage and provider pain points, recommending self-service enhancements that reduced call center inquiries.",
      ],
      QA_ENGINEER: [
        "Validated Availity eligibility and claim status responses against payer system data, confirming benefits, statuses and denial reasons displayed accurately.",
        "Tested Availity claim submission and remittance flows, verifying acknowledgments, rejections and payment details reached provider accounts correctly.",
      ],
      DATA_ANALYST: [
        "Investigated Availity transaction and rejection data to identify recurring submission errors and target provider education with operations teams.",
      ],
      PROJECT_MANAGER: [
        "Coordinated Availity connectivity and provider onboarding for {client}, tracking payer enablement, testing and provider communications.",
      ],
    },
  },
  "HEDIS": {
    description: "NCQA Healthcare Effectiveness Data and Information Set quality measures used by health plans to report care quality and performance.",
    bullets: {
      BUSINESS_ANALYST: [
        "Interpreted HEDIS technical specifications and documented measure logic, denominators, exclusions and data sources with quality and analytics teams.",
        "Defined HEDIS supplemental data and medical record review requirements for {subdomain}, aligning quality, provider and data teams on evidence standards.",
        "Facilitated HEDIS gap-in-care workflow design with care management and provider engagement teams, defining outreach triggers and closure tracking.",
      ],
      QA_ENGINEER: [
        "Validated HEDIS measure outputs against specification logic, confirming eligible populations, exclusions and numerator compliance for sample members.",
      ],
      DATA_ANALYST: [
        "Analyzed HEDIS measure rates and member-level gaps in care, identifying improvement opportunities and supporting audit preparation with quality leadership.",
        "Reconciled HEDIS administrative and supplemental data sources, investigating discrepancies that affected measure rates before audit submission.",
      ],
      PROJECT_MANAGER: [
        "Managed the annual HEDIS reporting cycle for {client}, coordinating data extracts, medical record review, auditor milestones and final submission.",
      ],
    },
  },
  "CPT": {
    description: "Current Procedural Terminology code set for reporting medical services and procedures on claims, used in billing, payment and utilization review.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented CPT-driven billing and reimbursement rules with coding and payment integrity teams, clarifying modifiers, bundling and fee schedule dependencies.",
        "Analyzed annual CPT code changes for {subdomain}, defining configuration, authorization and policy updates with clinical and claims stakeholders.",
        "Defined CPT code requirements for charge capture workflows, aligning clinical departments, coding and revenue cycle on documentation and charge accuracy.",
      ],
      QA_ENGINEER: [
        "Validated CPT code and modifier handling in claims processing, confirming pricing, bundling edits and authorization requirements behaved correctly.",
        "Tested annual CPT code update loads, verifying new and deleted codes, descriptions and effective dates were applied accurately.",
      ],
      DATA_ANALYST: [
        "Investigated CPT utilization and reimbursement patterns to identify coding variation, outlier billing and payment integrity opportunities.",
      ],
      PROJECT_MANAGER: [
        "Coordinated annual CPT update readiness across claims, charge capture and reporting systems, tracking configuration, validation and communications.",
      ],
    },
  },

  // ───────────────────────────── Pharma ─────────────────────────────
  "Veeva Vault": {
    description: "Veeva cloud content and data management suite for regulated life sciences processes, including quality, regulatory, clinical and commercial.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated Veeva Vault quality document management workshops, defining document types, lifecycles, review and approval workflows with quality assurance leadership.",
        "Documented Veeva Vault regulatory submission and registration tracking requirements for {subdomain}, aligning regulatory affairs and publishing teams on metadata standards.",
        "Defined Veeva Vault clinical trial master file requirements, clarifying artifact classification, filing responsibilities and inspection readiness expectations with clinical operations.",
      ],
      QA_ENGINEER: [
        "Executed computer system validation scripts for Veeva Vault releases, verifying document lifecycles, electronic signatures and audit trails met regulatory requirements.",
        "Validated Veeva Vault security and workflow configurations, confirming role-based access, approval routing and periodic release impact assessments.",
      ],
      DATA_ANALYST: [
        "Analyzed Veeva Vault document and workflow metadata to report review cycle times, overdue tasks and filing completeness for quality and clinical leadership.",
      ],
      PROJECT_MANAGER: [
        "Led a Veeva Vault implementation for {client}, coordinating quality, regulatory, validation and vendor teams through configuration, migration and go-live.",
      ],
    },
  },
  "LabWare LIMS": {
    description: "LabWare laboratory information management system for sample management, testing, specifications, stability studies and result review.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered LabWare LIMS requirements with quality control laboratories, documenting sample login, test assignment, specification limits and result review workflows.",
        "Documented LabWare LIMS stability study and environmental monitoring processes for {subdomain}, aligning laboratory and quality teams on scheduling and reporting.",
        "Defined LabWare LIMS master data requirements for products, analyses and specifications, clarifying ownership, change control and approval responsibilities.",
      ],
      QA_ENGINEER: [
        "Executed LabWare LIMS validation protocols, verifying result entry, specification checks, out-of-specification flags and audit trails met data integrity expectations.",
        "Tested LabWare LIMS instrument and enterprise integrations, confirming results transferred accurately with complete metadata and traceability.",
      ],
      DATA_ANALYST: [
        "Analyzed LabWare LIMS result and stability data to support trend reviews, product quality reviews and investigation evidence for quality leadership.",
      ],
      PROJECT_MANAGER: [
        "Managed a LabWare LIMS deployment for {client} laboratories, coordinating master data build, validation execution, training and site go-live.",
      ],
    },
  },
  "LIMS": {
    description: "Laboratory information management systems used to manage samples, tests, results, specifications and laboratory workflows under regulatory controls.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated requirements sessions with laboratory managers to define LIMS sample lifecycle, test scheduling and result approval workflows under data integrity controls.",
        "Documented LIMS specification, stability and certificate of analysis requirements for {subdomain}, aligning quality control and quality assurance on review steps.",
        "Analyzed laboratory processes for LIMS configuration, identifying paper-based steps and defining electronic workflow requirements with laboratory leadership.",
      ],
      QA_ENGINEER: [
        "Executed LIMS validation protocols, verifying calculations, specification checks, electronic signatures and audit trail behavior against regulatory expectations.",
        "Tested LIMS instrument and enterprise integrations, confirming sample and result data transferred accurately without manual transcription.",
      ],
      DATA_ANALYST: [
        "Analyzed LIMS result, turnaround and out-of-specification data to support laboratory performance reviews and quality trending.",
      ],
      PROJECT_MANAGER: [
        "Led a LIMS implementation for {client} laboratories, coordinating validation, master data, instrument integration and training workstreams.",
      ],
    },
  },
  "Medidata Rave": {
    description: "Electronic data capture platform for clinical trials, covering eCRF design, edit checks, data review, queries and database lock.",
    bullets: {
      BUSINESS_ANALYST: [
        "Translated study protocols into Medidata Rave eCRF and visit schedule requirements, aligning clinical operations, data management and biostatistics on collected data.",
        "Authored Medidata Rave edit check specifications, documenting validation logic, query wording and dynamic form behavior with data managers.",
        "Documented Medidata Rave integration requirements for randomization, laboratory and safety data in {subdomain} studies, clarifying ownership and reconciliation steps.",
      ],
      QA_ENGINEER: [
        "Validated Medidata Rave study builds by executing edit checks, derivations and dynamic forms against specifications before production release.",
        "Verified Medidata Rave mid-study amendments, verifying migrated subject data, revised edit checks and visit schedules behaved correctly.",
      ],
      DATA_ANALYST: [
        "Reviewed Medidata Rave subject data and query metrics, driving data cleaning, reconciliation and database lock readiness with data management.",
      ],
      PROJECT_MANAGER: [
        "Managed Medidata Rave study start-up timelines for {client}, coordinating protocol review, build, validation and site training through first patient in.",
      ],
    },
  },
  "Oracle Argus": {
    description: "Oracle Argus Safety pharmacovigilance system for adverse event case intake, processing, medical review and expedited and periodic regulatory reporting.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented Oracle Argus case intake, triage and processing workflows with drug safety teams, clarifying seriousness, causality and expedited reporting decisions.",
        "Defined Oracle Argus reporting rule requirements for {subdomain} products, aligning safety, regulatory and quality teams on submission timelines and destinations.",
        "Gathered Oracle Argus configuration requirements for products, licenses and study data, clarifying ownership and change control with safety operations.",
      ],
      QA_ENGINEER: [
        "Executed Oracle Argus validation scripts, verifying case processing, reporting rules and electronic submissions met pharmacovigilance and data integrity requirements.",
        "Verified Oracle Argus expedited report scheduling across case scenarios, confirming correct due dates, recipients and report formats.",
      ],
      DATA_ANALYST: [
        "Analyzed Oracle Argus case volumes, timeliness and reporting compliance data to support safety governance and inspection readiness.",
      ],
      PROJECT_MANAGER: [
        "Led an Oracle Argus upgrade for {client}, coordinating drug safety, validation, vendor and infrastructure teams through migration and go-live.",
      ],
    },
  },
  "TrackWise": {
    description: "Quality management system for deviations, CAPA, change control, complaints and audit management in regulated manufacturing.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated TrackWise workflow design for deviations, CAPA and change control, documenting states, approvals and required fields with quality assurance leadership.",
        "Documented TrackWise complaint handling requirements for {subdomain}, aligning quality, medical and regulatory teams on investigation and reportability decisions.",
        "Defined TrackWise reporting and metrics requirements, clarifying aging, recurrence and effectiveness check measures for quality management review.",
      ],
      QA_ENGINEER: [
        "Executed TrackWise validation scripts, verifying workflow transitions, electronic signatures and audit trail capture against approved requirements.",
        "Tested TrackWise configuration changes for deviations and CAPA, confirming field rules, notifications and due date calculations behaved correctly.",
      ],
      DATA_ANALYST: [
        "Trended TrackWise deviation and CAPA records to identify recurring root causes and overdue actions for quality leadership reviews.",
      ],
      PROJECT_MANAGER: [
        "Managed a TrackWise implementation for {client} sites, coordinating quality, validation, data migration and training through phased rollout.",
      ],
    },
  },
  "MasterControl": {
    description: "Quality management platform for document control, training management, CAPA, change control and audits in regulated industries.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered MasterControl document control requirements, defining document types, review cycles and approval routing with quality and site leadership.",
        "Documented MasterControl training management requirements for {subdomain}, linking curricula to roles and controlled documents with human resources and quality.",
        "Defined MasterControl CAPA and change control workflows, clarifying ownership, approval authority and effectiveness verification steps.",
      ],
      QA_ENGINEER: [
        "Executed MasterControl validation protocols, verifying document routing, electronic signatures and audit trails met regulatory expectations.",
        "Confirmed MasterControl training assignment rules, confirming document revisions triggered correct training tasks for affected roles.",
      ],
      DATA_ANALYST: [
        "Monitored MasterControl training compliance and document review data to highlight overdue items and inspection readiness risks.",
      ],
      PROJECT_MANAGER: [
        "Led a MasterControl rollout for {client}, coordinating document migration, validation, training curricula setup and site go-lives.",
      ],
    },
  },
  "CDISC SDTM": {
    description: "CDISC Study Data Tabulation Model standard for organizing clinical trial data for regulatory submission.",
    bullets: {
      BUSINESS_ANALYST: [
        "Authored CDISC SDTM domain specifications, documenting variable derivations, controlled terminology and supplemental qualifiers with data management and biostatistics.",
        "Facilitated CDISC SDTM standards governance for {subdomain} studies, aligning sponsors, vendors and programmers on implementation conventions.",
        "Documented collection-to-tabulation requirements so case report form designs supported clean CDISC SDTM conversion and submission readiness.",
      ],
      QA_ENGINEER: [
        "Validated CDISC SDTM datasets against specifications and conformance rules, confirming derivations, terminology and domain structures before submission.",
        "Reviewed CDISC SDTM conformance reports with programmers, resolving issues and documenting justifications for reviewer guides.",
      ],
      DATA_ANALYST: [
        "Mapped raw clinical data to CDISC SDTM domains, reconciling records and controlled terminology with data management before database lock.",
      ],
      PROJECT_MANAGER: [
        "Coordinated CDISC SDTM deliverables for {client} submissions, tracking specifications, programming, validation and regulatory package milestones.",
      ],
    },
  },
  "Empower CDS": {
    description: "Waters chromatography data system for instrument control, data acquisition, processing and reporting in regulated laboratories.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered Empower CDS requirements with analytical laboratories, documenting project structures, processing methods, custom fields and result review workflows.",
        "Documented Empower CDS data integrity controls for {subdomain}, aligning laboratory and quality teams on audit trail review and user privilege design.",
        "Defined Empower CDS integration requirements with laboratory information systems, clarifying sample, result and metadata exchange expectations.",
      ],
      QA_ENGINEER: [
        "Executed Empower CDS validation protocols, verifying instrument control, calculations, electronic signatures and audit trails against regulatory expectations.",
        "Tested Empower CDS privilege and system policy configurations, confirming analysts could not alter processed results without traceable audit entries.",
      ],
      DATA_ANALYST: [
        "Reviewed Empower CDS audit trail and result data to support data integrity assessments and investigation evidence for quality assurance.",
      ],
      PROJECT_MANAGER: [
        "Managed an Empower CDS upgrade across {client} laboratories, coordinating validation, instrument qualification, data migration and analyst training.",
      ],
    },
  },
  "Oracle Clinical": {
    description: "Oracle clinical data management system with remote data capture for study design, data entry, discrepancy management and database lock.",
    bullets: {
      BUSINESS_ANALYST: [
        "Translated study protocols into Oracle Clinical data collection and validation procedure requirements, aligning data management and biostatistics on collected fields.",
        "Documented Oracle Clinical discrepancy management workflows for {subdomain} studies, clarifying query ownership, resolution timelines and site communication.",
        "Specified Oracle Clinical data extract and reconciliation requirements with safety and laboratory teams, clarifying matching keys and timing.",
      ],
      QA_ENGINEER: [
        "Validated Oracle Clinical study builds, executing validation procedures and derivations against specifications before data entry began.",
        "Tested Oracle Clinical study amendments, confirming revised forms and validation procedures preserved existing subject data correctly.",
      ],
      DATA_ANALYST: [
        "Reviewed Oracle Clinical discrepancy and data entry metrics, supporting data cleaning priorities and database lock readiness with data managers.",
      ],
      PROJECT_MANAGER: [
        "Coordinated Oracle Clinical study start-up and lock activities for {client}, tracking build, validation, cleaning and lock milestones.",
      ],
    },
  },
  "Siebel CTMS": {
    description: "Oracle Siebel clinical trial management system for study, site, subject visit, monitoring and investigator payment tracking.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered Siebel CTMS requirements with clinical operations, documenting study, site and milestone tracking needs and monitoring visit report workflows.",
        "Documented Siebel CTMS investigator payment requirements for {subdomain} studies, aligning clinical finance and operations on payment triggers and approvals.",
        "Defined Siebel CTMS integration requirements with data capture and trial master file systems, clarifying subject status and site document synchronization.",
      ],
      QA_ENGINEER: [
        "Validated Siebel CTMS monitoring visit and trip report workflows, confirming approvals, follow-up items and audit trails behaved as specified.",
        "Verified Siebel CTMS investigator payment calculations across visit schedules and protocol amendments, confirming visit-based payments, holdbacks and adjustments matched approved site budgets.",
      ],
      DATA_ANALYST: [
        "Analyzed Siebel CTMS enrollment and site activation data to report study progress and site performance to clinical operations leadership.",
      ],
      PROJECT_MANAGER: [
        "Steered Siebel CTMS enhancement releases for {client}, coordinating clinical operations, validation and vendor teams across study portfolios.",
      ],
    },
  },
  "MedDRA": {
    description: "Medical Dictionary for Regulatory Activities, the standardized terminology used to code adverse events and medical history in clinical and safety data.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented MedDRA coding conventions and version upgrade requirements with safety and clinical data teams, clarifying recoding and impact review steps.",
        "Defined MedDRA query and grouping requirements for {subdomain} safety signal reviews, aligning medical reviewers and statisticians on term selection.",
        "Analyzed MedDRA version change impacts on safety databases and clinical studies, documenting required recoding and communication responsibilities.",
      ],
      QA_ENGINEER: [
        "Validated MedDRA dictionary version loads, confirming term hierarchies, coded records and recoding outcomes matched expected results.",
        "Tested MedDRA autocoding behavior, verifying verbatim terms coded to correct lowest level terms and uncoded items routed for review.",
      ],
      DATA_ANALYST: [
        "Analyzed MedDRA-coded adverse event data by system organ class and preferred term to support safety reviews and aggregate reports.",
      ],
      PROJECT_MANAGER: [
        "Coordinated MedDRA version upgrades for {client}, tracking recoding, validation and communication milestones across safety and clinical teams.",
      ],
    },
  },

  // ───────────────────────────── P&C Insurance ─────────────────────────────
  "Guidewire PolicyCenter": {
    description: "Guidewire policy administration system for personal and commercial lines, covering submission, quoting, binding, issuance, endorsements and renewals.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated product modeling sessions with underwriting to define Guidewire PolicyCenter coverages, conditions, exclusions and underwriting rules for {subdomain} lines.",
        "Authored Guidewire PolicyCenter requirements for submission, quote, bind and issuance workflows, documenting referral rules and authority levels with underwriting leadership.",
        "Documented Guidewire PolicyCenter policy change, cancellation and renewal transactions, aligning underwriting, billing and compliance teams on rules and notices.",
      ],
      QA_ENGINEER: [
        "Validated Guidewire PolicyCenter rating and premium outcomes across coverage, territory and endorsement scenarios, confirming results matched filed rate manuals.",
        "Tested Guidewire PolicyCenter policy transactions including endorsements, cancellations, reinstatements and renewals, verifying forms, premiums and downstream billing.",
      ],
      DATA_ANALYST: [
        "Analyzed Guidewire PolicyCenter quote, bind and renewal data to report hit ratios, retention and premium trends for underwriting leadership.",
      ],
      PROJECT_MANAGER: [
        "Led Guidewire PolicyCenter line-of-business rollouts for {client}, coordinating product, underwriting, integration and conversion workstreams through state launches.",
      ],
    },
  },
  "Guidewire ClaimCenter": {
    description: "Guidewire claims management system covering first notice of loss, coverage verification, reserving, payments, recovery and litigation.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated claims workshops to define Guidewire ClaimCenter FNOL intake, segmentation and assignment rules with claims operations and adjuster leadership.",
        "Documented Guidewire ClaimCenter coverage verification, reserving and payment authority requirements for {subdomain}, aligning claims, finance and compliance on controls.",
        "Defined Guidewire ClaimCenter subrogation, salvage and recovery workflows, clarifying referral triggers, recovery reserves and accounting treatment with claims leadership.",
      ],
      QA_ENGINEER: [
        "Validated Guidewire ClaimCenter FNOL through closure scenarios, confirming segmentation, assignment, reserves, payments and activity generation behaved as designed.",
        "Tested Guidewire ClaimCenter payment authority limits and reserve changes, verifying approvals, financial transactions and downstream accounting feeds.",
      ],
      DATA_ANALYST: [
        "Analyzed Guidewire ClaimCenter reserve, cycle-time and severity data to identify adjuster workload and leakage trends for claims leadership.",
      ],
      PROJECT_MANAGER: [
        "Managed a Guidewire ClaimCenter implementation for {client}, coordinating claims operations, integration, data conversion and adjuster training through go-live.",
      ],
    },
  },
  "Guidewire BillingCenter": {
    description: "Guidewire insurance billing system for invoicing, payment plans, collections, delinquency, commissions and disbursements.",
    bullets: {
      BUSINESS_ANALYST: [
        "Captured Guidewire BillingCenter payment plan, invoicing and installment fee requirements with billing operations and finance stakeholders.",
        "Defined Guidewire BillingCenter delinquency and cancellation-for-nonpayment workflows for {subdomain}, aligning billing, underwriting and compliance on notice timing.",
        "Gathered Guidewire BillingCenter agency commission and disbursement requirements, clarifying direct and agency bill handling with finance and distribution teams.",
      ],
      QA_ENGINEER: [
        "Validated Guidewire BillingCenter invoice generation, payment allocation and delinquency processing across payment plans and policy changes.",
        "Tested Guidewire BillingCenter commission calculations and disbursements, verifying amounts and accounting entries matched agency agreements.",
      ],
      DATA_ANALYST: [
        "Reconciled Guidewire BillingCenter receivables and cash postings with general ledger balances, investigating breaks with finance.",
      ],
      PROJECT_MANAGER: [
        "Led Guidewire BillingCenter implementation activities for {client}, coordinating billing operations, finance, integration and conversion workstreams.",
      ],
    },
  },
  "Duck Creek": {
    description: "Duck Creek suite for P&C insurance policy administration, rating, billing and claims, often configured through its product authoring tools.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated Duck Creek product authoring sessions with underwriting and actuarial teams, documenting coverages, rating steps and underwriting rules for {subdomain}.",
        "Authored Duck Creek policy transaction requirements for new business, endorsements and renewals, aligning underwriting and operations on forms and workflows.",
        "Documented Duck Creek rating requirements from filed rate manuals, clarifying factor tables, rounding and minimum premium rules with actuarial stakeholders.",
      ],
      QA_ENGINEER: [
        "Validated Duck Creek rating results against filed rate manuals across states and coverages, documenting discrepancies for product and actuarial review.",
        "Verified Duck Creek policy lifecycle transactions, confirming forms attachment, premium changes and downstream billing outputs.",
      ],
      DATA_ANALYST: [
        "Evaluated Duck Creek policy and premium data to support rate monitoring and product performance reviews with actuarial teams.",
      ],
      PROJECT_MANAGER: [
        "Managed Duck Creek product launches for {client}, coordinating underwriting, actuarial, state filings and technology teams through release.",
      ],
    },
  },
  "Majesco": {
    description: "Insurance core suite for policy administration, billing and claims across P&C and specialty lines.",
    bullets: {
      BUSINESS_ANALYST: [
        "Gathered Majesco policy administration requirements with underwriting, documenting product definitions, rating rules and transaction workflows.",
        "Documented Majesco billing and claims requirements for {subdomain}, aligning operations and finance on invoicing, payments and reserve handling.",
        "Specified Majesco data conversion requirements for in-force policies and open claims, clarifying transformation rules, term handling and reconciliation checkpoints with operations owners.",
      ],
      QA_ENGINEER: [
        "Validated Majesco policy transactions and premium calculations against product specifications, confirming forms and billing outputs.",
        "Certified Majesco converted policies by reconciling coverages, limits, premiums and policy terms between legacy and target systems before each conversion wave.",
      ],
      DATA_ANALYST: [
        "Profiled Majesco policy and premium data to support conversion reconciliation, written premium balancing and book-of-business reporting for finance and underwriting.",
      ],
      PROJECT_MANAGER: [
        "Led a Majesco core platform implementation for {client}, coordinating vendor delivery, conversion waves and business readiness.",
      ],
    },
  },
  "Sapiens": {
    description: "Insurance software suite for policy administration, billing, claims and reinsurance across P&C and life lines.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented Sapiens policy administration requirements with underwriting and product owners, defining product configuration, rating logic and endorsement transaction rules.",
        "Defined Sapiens claims and reinsurance requirements for {subdomain}, aligning claims, reinsurance and finance teams on recoveries and treaty allocation.",
        "Facilitated Sapiens configuration reviews with business owners, prioritizing product changes against filing dates and documenting acceptance criteria for each release.",
      ],
      QA_ENGINEER: [
        "Validated Sapiens policy issuance and endorsement transactions, confirming premiums, forms and billing results matched specifications.",
        "Tested Sapiens reinsurance cession calculations, verifying treaty allocations and recoverables for sample claims and policies.",
      ],
      DATA_ANALYST: [
        "Reconciled Sapiens policy, claim and reinsurance data with finance ledgers, supporting ceded premium accounting, recoverable tracking and portfolio reporting.",
      ],
      PROJECT_MANAGER: [
        "Orchestrated Sapiens implementation milestones for {client}, coordinating vendor, business and integration teams through phased product launches.",
      ],
    },
  },
  "ACORD Standards": {
    description: "Insurance industry data and forms standards for exchanging policy, claims and agency information between carriers, agents and partners.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented ACORD message and form requirements for agency submissions, aligning distribution, underwriting and integration teams on data elements and usage.",
        "Mapped carrier policy and claim data elements to ACORD Standards for {subdomain}, documenting extensions and code list translations with partners.",
        "Facilitated ACORD form implementation reviews with compliance and product teams, confirming required fields and state-specific editions.",
      ],
      QA_ENGINEER: [
        "Validated ACORD messages exchanged with agency partners, confirming required elements, code values and policy details matched carrier records.",
        "Tested ACORD form generation for policy transactions, verifying edition dates, field population and state-specific requirements.",
      ],
      DATA_ANALYST: [
        "Analyzed ACORD submission data from agencies to identify incomplete or inconsistent elements and prioritize partner remediation.",
      ],
      PROJECT_MANAGER: [
        "Coordinated an ACORD-based agency integration rollout for {client}, tracking partner onboarding, certification testing, production enablement and post-launch issue resolution.",
      ],
    },
  },
  "ISO ERC": {
    description: "Verisk ISO Electronic Rating Content, the loss costs, rules and forms content carriers use to implement and update P&C rating.",
    bullets: {
      BUSINESS_ANALYST: [
        "Analyzed ISO ERC circulars and rating content updates, documenting rate, rule and form changes required for {subdomain} products with actuarial and product teams.",
        "Defined ISO ERC adoption requirements, clarifying deviations, effective dates and state filing dependencies with actuarial, compliance and product owners.",
        "Documented ISO ERC rating algorithm interpretations, aligning actuarial and configuration teams on factor application, rounding and minimum premiums.",
      ],
      QA_ENGINEER: [
        "Validated rating results after ISO ERC content loads, comparing premiums to manual calculations across states, classes and coverages.",
        "Tested ISO ERC loss cost and rule updates, verifying effective dating and deviation factors were applied correctly.",
      ],
      DATA_ANALYST: [
        "Analyzed premium impacts of ISO ERC loss cost changes on the in-force book, supporting adoption decisions with actuarial leadership.",
      ],
      PROJECT_MANAGER: [
        "Coordinated ISO ERC circular adoption cycles for {client}, tracking analysis, configuration, validation and filing milestones by state.",
      ],
    },
  },
  "Insurity": {
    description: "Insurance software provider for policy administration, billing, claims and analytics for P&C carriers and MGAs.",
    bullets: {
      BUSINESS_ANALYST: [
        "Elicited Insurity policy administration requirements with underwriting and program managers, documenting product rules, rating steps and new business and endorsement workflows.",
        "Documented Insurity billing and claims integration requirements for {subdomain}, clarifying data ownership and posting timing.",
        "Standardized Insurity reporting requirements for underwriting and finance, aligning definitions for premium, loss and exposure measures.",
      ],
      QA_ENGINEER: [
        "Validated Insurity policy transactions and rating outputs, confirming premiums, forms and billing records matched product specifications.",
        "Tested Insurity integrations with billing and claims, verifying policy data and financial transactions synchronized correctly.",
      ],
      DATA_ANALYST: [
        "Examined Insurity policy, exposure and loss data to support book-of-business reporting, loss ratio monitoring and underwriting performance reviews.",
      ],
      PROJECT_MANAGER: [
        "Directed an Insurity platform implementation for {client}, coordinating underwriting, finance, vendor and conversion workstreams through phased program launches.",
      ],
    },
  },
  "Guidewire InsuranceNow": {
    description: "Guidewire cloud core platform for small and mid-sized P&C carriers, combining policy, billing and claims in one system.",
    bullets: {
      BUSINESS_ANALYST: [
        "Facilitated Guidewire InsuranceNow product configuration sessions with underwriting, documenting coverages, rating and underwriting rules for {subdomain}.",
        "Documented Guidewire InsuranceNow policy, billing and claims workflows end to end, aligning operations teams on handoffs and controls.",
        "Defined Guidewire InsuranceNow agent portal requirements, clarifying quoting, submission and policy service capabilities with distribution leaders.",
      ],
      QA_ENGINEER: [
        "Validated Guidewire InsuranceNow quoting, issuance and endorsement transactions across states and coverages, confirming premiums, forms and billing outcomes matched specifications.",
        "Tested Guidewire InsuranceNow claims intake and payment processing, verifying reserves, payments and notifications behaved correctly.",
      ],
      DATA_ANALYST: [
        "Analyzed Guidewire InsuranceNow policy and claims data to support underwriting, loss ratio and agency performance reporting.",
      ],
      PROJECT_MANAGER: [
        "Led a Guidewire InsuranceNow implementation for {client}, coordinating vendor delivery, conversion, agent onboarding and go-live.",
      ],
    },
  },
  "Xactimate": {
    description: "Verisk property claims estimating software used by adjusters and contractors to scope damage and price repairs.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented Xactimate estimate review workflows with property claims leadership, clarifying desk review, reinspection and approval responsibilities.",
        "Defined requirements for integrating Xactimate estimates with claims systems for {subdomain}, clarifying estimate status, payment and reserve updates.",
        "Analyzed property estimating practices using Xactimate, recommending guidelines that improved consistency across staff and independent adjusters.",
      ],
      QA_ENGINEER: [
        "Validated Xactimate estimate imports into claims workflows, confirming line items, totals and status updates were captured accurately.",
        "Exercised Xactimate assignment and return flows, verifying claims, estimates and documents synchronized correctly with adjusters.",
      ],
      DATA_ANALYST: [
        "Analyzed Xactimate estimate data to identify severity trends, pricing variance and leakage opportunities for property claims leadership.",
      ],
      PROJECT_MANAGER: [
        "Coordinated an Xactimate integration rollout for {client}, aligning property claims, vendor and integration teams on testing and adoption.",
      ],
    },
  },
  "ISO ClaimSearch": {
    description: "Verisk industry claims database used by insurers to detect duplicate claims, prior losses and potential fraud.",
    bullets: {
      BUSINESS_ANALYST: [
        "Documented ISO ClaimSearch reporting and match review requirements with special investigations, clarifying referral triggers and adjuster responsibilities.",
        "Defined ISO ClaimSearch submission requirements for {subdomain} claims, aligning claims and compliance teams on timing and required data elements.",
        "Analyzed ISO ClaimSearch match handling workflows, recommending triage rules that focused investigators on higher-risk claims.",
      ],
      QA_ENGINEER: [
        "Validated ISO ClaimSearch claim submissions, confirming required data elements, updates and closures were reported accurately.",
        "Tested ISO ClaimSearch match report handling, verifying alerts routed to adjusters and investigators as designed.",
      ],
      DATA_ANALYST: [
        "Analyzed ISO ClaimSearch match results with claim outcomes to evaluate fraud referral effectiveness for special investigations leadership.",
      ],
      PROJECT_MANAGER: [
        "Coordinated ISO ClaimSearch reporting compliance improvements for {client}, tracking data remediation, workflow changes and adjuster training.",
      ],
    },
  },
};
