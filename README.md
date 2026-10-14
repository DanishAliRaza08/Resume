# Multi-Domain Resume Builder & ATS Optimization Platform

A secure web application that standardizes resume production for Banking, Retail, Healthcare,
Pharma and P&C Insurance. It implements the *Multi-Domain Resume Builder — Product R&D*
specification: a structured resume data system with a writing layer, not a single prompt that
invents five projects.

**Product principle.** The candidate's verified career history is the source of truth. Templates,
the client library and AI wording help organize and express that history. They never manufacture
employment, tools, credentials or outcomes.

## What it does

| Area | Highlights |
| --- | --- |
| **Create New Resume** (§5.1) | 5-step wizard: candidate → target role → five-project configuration → format → review & generate. It proposes a default timeline inside the verified employment span (P1 ≈ 2 yrs 3 mos, P2 2 yrs, P5 7 mos, P3/P4 share the rest). |
| **Update Existing Resume** (§5.2) | Upload a DOCX, PDF or TXT resume plus a JD. The app extracts the text, rebuilds section structure and stores the original as v1. It then matches the JD against the evidence and proposes traceable edits that you accept, reject or edit. |
| **Generation** (§6, §10) | Summary with varied openings, QA and professionalism bullets. Projects come in Full-detail, Standard or Concise mode, and the Technical Skills table depends on the role. Template placeholders resolve **only** to technologies the candidate confirmed, and every template bullet must be confirmed before approval. |
| **Validation** (§10.3) | Five check layers: schema, factual, consistency, quality and layout. Factual checks cover unconfirmed claims, unsupported tools, unverified metrics, timeline overlaps and gaps, projects outside employment, and anachronistic tools. Consistency checks catch skills without evidence and years-of-experience mismatches. Quality checks cover near-duplicates, tense and repeated verbs. Layout checks estimate the page count. |
| **Page count** (§6.5) | The page count is estimated before export, then measured on the rendered PDF. LibreOffice measures DOCX files when it is installed. Compression proposals need approval and come in a fixed order: spacing, then mode, then removing low-value template bullets. Candidate facts are never removed. |
| **JD tailoring** (§9) | Requirements are classified as must-have, preferred, domain, responsibility, qualification or methodology, and normalized through the catalog's aliases. Each requirement is marked supported, partial, missing or needs-confirmation. The coverage score is weighted and transparent. Every edit records its evidence and decision. |
| **Review workflow** (§5.3) | Draft → automated checks → human review → approved → exported. Authors cannot approve their own versions. Versions are immutable, so editing an approved version creates a new draft. |
| **Libraries** (§7, §8) | 25 versioned project templates (5 per domain), about 190 catalog technologies with aliases and availability years, and 118 client records. Client records support verification status, evidence, CSV import/export, deduplication, usage history and least-recently-used rotation. |
| **Security** (§14) | Session auth with scrypt hashing, password reset and login throttling. Access is role- and record-level, and denied attempts are audited. Uploads are validated by type and signature, and embedded instructions are treated as data. Exports are stored privately and served through authenticated downloads. Sensitive fields are redacted from logs. |
| **Operations** (§10.4, §17) | Generation jobs are idempotent and retryable, with tokens, cost and duration recorded. The Reports page shows aggregated operational data, and the admin page covers users, settings, retention and audit search. |

Roles: **Administrator**, **Resume Creator**, **Reviewer** and **Read-only** (§4).

## Quick start

Requirements: Node 20+ and PostgreSQL 14+. LibreOffice is optional; it gives accurate DOCX page counts.

```bash
npm install
cp .env.example .env            # set DATABASE_URL
npx prisma migrate deploy       # create the schema
npm run db:seed                 # reference data + demo workspace
npm run build && npm start      # or: npm run dev
```

Open http://localhost:3000 and sign in with one of the seeded demo accounts. The password is
`SEED_PASSWORD`, which defaults to `ChangeMe-2026!`:

| Account | Role |
| --- | --- |
| `admin@example.com` | Administrator |
| `creator@example.com`, `creator2@example.com` | Resume Creator |
| `reviewer@example.com` | Reviewer |
| `viewer@example.com` | Read-only |

The seed includes a synthetic demo candidate, *Jordan Avery (Demo)*, at fictional "(Demo)"
organizations. Demo outputs are labeled as samples. **Disable or re-password the demo accounts
before anyone else can reach the environment.**

### Optional AI wording layer

Set `ANTHROPIC_API_KEY` and enable *AI wording polish* under Administration. Claude
(`claude-opus-5-5` by default; override with `AI_MODEL`) rewrites template-phrased bullets for
fluency through structured outputs. Every rewrite is re-checked: if it introduces a technology,
number or organization that was not in its evidence, the original wording is kept. AI-reworded
bullets still require candidate confirmation. Without a key the deterministic generator runs on its
own.

## Tests

```bash
npm test                        # unit tests (no database needed)
npm run test:integration        # service tests against a seeded PostgreSQL test database
npm run typecheck
```

To prepare the integration database:

```bash
createdb resume_builder_test
DATABASE_URL=postgresql://…/resume_builder_test npx prisma migrate deploy
DATABASE_URL=postgresql://…/resume_builder_test npm run db:seed
```

### Acceptance test coverage (§16)

| Test | Where |
| --- | --- |
| AT-01 Banking BA resume | `tests/generator.test.ts` |
| AT-02 All five domains | `tests/generator.test.ts` |
| AT-03 Overlapping dates, no double counting | `tests/timeline.test.ts` |
| AT-04 Tableau vs Power BI per project | `tests/generator.test.ts` |
| AT-05 Unsupported JD technology flagged, not inserted | `tests/validation-jd.test.ts` |
| AT-06 Malformed or unsupported files | `tests/files-export.test.ts` |
| AT-07 Cross-user access denied and logged | `tests/integration.test.ts` |
| AT-08 Client rotation | `tests/rotation.test.ts` |
| AT-09 Over-long resume, compression, actual page count | `tests/validation-jd.test.ts`, `tests/integration.test.ts` |
| AT-10 DOCX/PDF open, parse and keep sections | `tests/files-export.test.ts` |
| AT-11 Editing an approved resume creates a new version | `tests/integration.test.ts` |
| AT-12 Near-duplicate detection | `tests/validation-jd.test.ts` |
| AT-13 Candidate deletion | `tests/integration.test.ts` and the candidate page's delete flow (removes export files, audited) |
| AT-14 AI timeout, draft preserved, retry without duplicates | `tests/integration.test.ts` |

## Architecture

```
Browser ─► Next.js App Router (server components + server actions, /api JSON routes)
            │  auth (session cookie) → permission checks (role + record) → zod validation
            ▼
          Services (src/lib/server)
            resume-service   build input from verified records, idempotent jobs, immutable versions, review workflow
            jd-service       JD storage/analysis, evidence matching, suggestions, resume import
            export-service   DOCX/PDF render → page count → integrity check → private storage
            ai               optional Claude wording polish with post-validation
            audit            audit events + redacted structured logs
            ▼
          Pure domain logic (src/lib) — unit tested, no I/O
            generator · validation · timeline · jd · layout · resume-parser · files · export · rotation · text
            ▼
          PostgreSQL (Prisma schema: prisma/schema.prisma)    private file storage (STORAGE_DIR)
```

Key decisions:

- **Template bullets require confirmation.** Generated drafts can be reviewed straight away, but
  approval stays blocked until each template-sourced statement is confirmed. Candidate-supplied
  responsibilities and imported resume text count as evidence.
- **Unverified library clients block approval by default** (§8.2). An administrator can switch this
  off under Administration → Settings.
- **The JD coverage score is a diagnostic.** The UI states that it does not predict ATS ranking.
- **Generation jobs** run in-process in the background and persist their status. For multi-instance
  deployments, move `runGenerationJob` onto a queue worker; the job record is already idempotent.

### API (Appendix B)

All endpoints require a session cookie and return `{ data }` or `{ error: { code, message } }`.

| Endpoint | Purpose |
| --- | --- |
| `GET/POST /api/candidates`, `GET/PATCH /api/candidates/:id` | Candidate profiles |
| `POST /api/resume-jobs` (requires an `Idempotency-Key` header), `GET /api/resume-jobs/:id` | Generation jobs |
| `GET/POST /api/resumes/:id/versions` | Version history and new versions |
| `POST /api/documents/parse` | Validate and parse an uploaded resume or JD (multipart) |
| `POST /api/job-descriptions`, `POST /api/job-descriptions/:id/analyze` | JD storage and analysis |
| `POST /api/resumes/:id/match` | Match a JD and propose edits |
| `POST /api/resumes/:id/suggestions/:suggestionId/decision` | Accept or reject an edit |
| `GET /api/clients`, `POST /api/clients/import`, `GET /api/clients/export` | Client library |
| `POST /api/resumes/:id/export`, `GET /api/exports/:id` | Exports and authorized download |
| `GET /api/admin/audit-events` | Restricted audit search |
| `GET /api/health` | Health check |

## Before production

Pilot with synthetic data and a small group of authorized users, as the release gate in §16 requires. Before a wider launch:

- Put the app behind HTTPS and use managed PostgreSQL with encryption at rest, automated backups and restore tests.
- Replace the in-process login throttle and API rate limiter with a shared store such as Redis.
- Wire password-reset links to email. In development they are written to the server log or shown to administrators.
- Add malware scanning and OCR for scanned PDFs if your infrastructure supports them. Scanned PDFs are currently rejected with a clear message.
- Review the legal basis, notices and retention policy for each jurisdiction you operate in. This software is not legal advice.
- Have an administrator review the seeded templates and verify client records, with evidence, before using them.
