# Benchsale Dan

**Resume builder, JD tailoring and Dice Apply — developed by Danish Ali Raza.**

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
| **Accounts** | Anyone can sign up and start building resumes straight away. Each account only sees its own people, resumes and job descriptions. |
| **Dice Apply** | Upload a candidate's resume; the app reads their details and asks only for the application answers it's missing (work authorization, sponsorship, salary and so on — never assumed "Yes"). Paste any number of Dice job links. For each job the app reads the posting (or takes a pasted description), tailors the resume using only real experience, and shows an answer sheet with copy buttons and ✔/✘ for yes/no boxes. Open the job on Dice in your own signed-in browser, submit it there, click "I submitted it — next job", and the app moves on. Duplicate links are skipped; the report shows submitted today/this week/total, plus a CSV export. The **⭐ Fill Dice** bookmark button (nothing to install: drag it to the bookmarks bar once) — or, for advanced users, the **Dice Helper** Chrome extension — does the in-browser work: on Dice search results it collects every job link page by page; on a job page it shows whether it is Easy Apply or an external "Apply Now"; on an application it fills text boxes, dropdowns, yes/no radios and tick boxes from the saved answers (including fields inside web components), optionally on every new step, and outlines unknown questions in orange. It never presses Next or Submit — the user does. |
| **Clients** | 646 built-in organizations across the five industries. Users pick one as they type (each shows its industry) or enter any other name. Nothing needs to be uploaded. |
| **Create New Resume** (§5.1) | 5-step wizard: who it is for → target role → projects → design → review & generate. Client and company names are typed freely (with suggestions). It can also propose a default five-project timeline (P1 ≈ 2 yrs 3 mos, P2 2 yrs, P5 7 mos, P3/P4 share the rest). |
| **Resume designs** | Seven designs: Classic, Modern, Executive, Minimal, Bold, Elegant and Compact. Each has a live thumbnail gallery, can be switched any time, and works for both PDF and Word downloads. All are single-column and ATS-readable. |
| **Tailor Existing Resume** (§5.2) | Upload a DOCX, PDF or TXT resume plus a JD. The app extracts the text, rebuilds section structure and stores the original as v1. It then matches the JD against the evidence and proposes traceable edits that you accept, reject or edit. |
| **Generation** (§6, §10) | Summary with varied openings, QA and professionalism bullets. Projects come in Full-detail, Standard or Concise mode, and the Technical Skills table depends on the role. Template placeholders resolve **only** to technologies the candidate confirmed, and every template bullet must be confirmed before approval. |
| **Validation** (§10.3) | Five check layers: schema, factual, consistency, quality and layout. Factual checks cover unconfirmed claims, unsupported tools, unverified metrics, timeline overlaps and gaps, projects outside employment, and anachronistic tools. Consistency checks catch skills without evidence and years-of-experience mismatches. Quality checks cover near-duplicates, tense and repeated verbs. Layout checks estimate the page count. |
| **Page count** (§6.5) | The page count is estimated before export, then measured on the rendered PDF. LibreOffice measures DOCX files when it is installed. Compression proposals need approval and come in a fixed order: spacing, then mode, then removing low-value template bullets. Candidate facts are never removed. |
| **JD tailoring** (§9) | Requirements are classified as must-have, preferred, domain, responsibility, qualification or methodology, and normalized through the catalog's aliases. Each requirement is marked supported, partial, missing or needs-confirmation. The coverage score is weighted and transparent. Every edit records its evidence and decision. |
| **Finalize** (§5.3) | Draft → automated checks → finalized → downloaded. Owners finalize their own resumes once the checks pass; asking someone else to review is optional. Versions are immutable, so editing a final version creates a new draft. |
| **Libraries** (§7, §8) | 25 versioned project templates (5 per domain), about 190 catalog technologies with aliases and availability years, and 646 client records. Client records support verification status, evidence, CSV import/export, deduplication, usage history and least-recently-used rotation. |
| **Security** (§14) | Session auth with scrypt hashing, password reset and login throttling. Access is role- and record-level, and denied attempts are audited. Uploads are validated by type and signature, and embedded instructions are treated as data. Exports are stored privately and served through authenticated downloads. Sensitive fields are redacted from logs. |
| **Operations** (§10.4, §17) | Generation jobs are idempotent and retryable, with tokens, cost and duration recorded. The Reports page shows aggregated operational data, and the admin page covers users, settings, retention and audit search. |

Every sign-up gets a normal account with full resume features. The address in `ADMIN_EMAIL` gets
administrator access, which adds reports, user management, settings, the audit trail and editing of
the shared template, technology and client libraries. Reviewer and read-only roles still exist for
teams that want them; an administrator assigns them.

## Quick start (local)

Requirements: Node 20+ and MySQL 8+ or MariaDB 10.6+. LibreOffice is optional; it gives exact page counts for Word downloads.

```bash
npm install
cp .env.example .env            # set DATABASE_URL and ADMIN_EMAIL
npm run build
npm start                       # starts on :3000; creates tables + loads reference data on start-up
```

Open http://localhost:3000, choose **Create a free account**, and sign up. Sign up with the
`ADMIN_EMAIL` address to get administrator access.

For local development with sample data, run `SEED_DEMO=true npm run db:seed`. It creates demo
accounts (`admin@`, `creator@`, `creator2@`, `reviewer@` and `viewer@example.com`, password
`ChangeMe-2026!`) and a fictional candidate. **Never use `SEED_DEMO` on a public site.**

## Publishing on Hostinger

The app is a Node.js (Next.js) server with a MySQL database. Generated files are stored in the
database, so the app needs no persistent disk.

> **Plan requirement:** you need a Hostinger plan that can run **Node.js apps**: Business or Cloud
> web hosting with Node.js web apps, or a VPS. Plans that only run PHP/WordPress can host the
> database, but not this app.

### 1. Create the MySQL database
In **hPanel → Databases → MySQL Databases**, create a database and a user. Note the database name,
user, password and host. The host is usually `localhost` when the app runs on the same hosting
account. For a VPS or remote connection, use the host shown in hPanel and enable **Remote MySQL**.

Your connection string is:
`mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME`
(URL-encode special characters in the password; `@` becomes `%40`, for example).

### 2a. Hostinger Node.js web app (Business / Cloud hosting)
1. In hPanel, add a **Node.js web app**. Connect this GitHub repository or upload the project ZIP
   (without `node_modules` and `.next`).
2. Choose Node.js **20 or newer**. If hPanel asks for commands, use these:
   - Install: `npm install`
   - Build: `npm run build`
   - Start: `npm start` (or whatever hPanel uses by default). When the server starts it creates or
     updates the tables and loads the reference data (5 industries, about 190 technologies,
     25 templates and 646 clients) by itself. Every step is safe to repeat.
3. Add these **environment variables**:
   - `DATABASE_URL`: the connection string from step 1.
   - `APP_URL`: your site address, such as `https://resumes.yourdomain.com`.
   - `ADMIN_EMAIL`: your email. Signing up with this address makes you the administrator.
   - `SMTP_URL` and `MAIL_FROM`: needed for "Forgot password" emails. With a Hostinger mailbox:
     `smtps://you%40yourdomain.com:MAILBOX_PASSWORD@smtp.hostinger.com:465`.
   - `NODE_ENV=production`.
4. Deploy, open your domain, and sign up with your `ADMIN_EMAIL`.

### 2b. Hostinger VPS
Install Node.js 20+ (or Docker), clone the repository and create `.env` from `.env.example`. Then
either run `npm install && npm run build && npm start` under a process manager such as `pm2`, or
use the included Dockerfile:
`docker build -t resume-builder . && docker run -d -p 3000:3000 --env-file .env resume-builder`.
Put Nginx or Hostinger's proxy in front with HTTPS.

### 3. Check it
- Visit `https://your-domain/api/health`. It should return `"status":"ok"` with `"seed":"ok"`.
  If something is wrong it says in plain words what (wrong password, database not found, tables
  not created, …) and how to fix it. It never shows the password.
- Sign up with `ADMIN_EMAIL` and confirm **Administration** appears in the menu.
- Create a test resume and download it as PDF and Word.

## Optional AI wording layer

Set `ANTHROPIC_API_KEY` and enable *AI wording polish* under Administration. Claude
(`claude-opus-5-5` by default; override with `AI_MODEL`) rewrites template-phrased bullets for
fluency through structured outputs. Every rewrite is re-checked: if it introduces a technology,
number or organization that was not in its evidence, the original wording is kept. AI-reworded
bullets still require candidate confirmation. Without a key the deterministic generator runs on its
own.

## Tests

```bash
npm test                        # unit tests (no database needed)
npm run test:integration        # service tests against a seeded MySQL test database
npm run typecheck
```

To prepare the integration database:

```bash
mysql -e "CREATE DATABASE resume_builder_test CHARACTER SET utf8mb4"
DATABASE_URL=mysql://…/resume_builder_test npx prisma migrate deploy
SEED_DEMO=true DATABASE_URL=mysql://…/resume_builder_test npm run db:seed
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
          MySQL / MariaDB (Prisma schema: prisma/schema.prisma)    private file storage (STORAGE_DIR)
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

## Before scaling up

- The login, sign-up, password-reset and API throttles are kept in memory. They work for a single
  server instance. If you run several instances, move them to a shared store such as Redis.
- Scanned (image-only) PDFs are rejected with a clear message. Add OCR if your users need it.
- Turn on automated backups for your database (hPanel → Backups), and test a restore.
- Add a privacy policy and terms that fit the countries you serve. Resumes contain personal data.
  This software is not legal advice.
- An administrator should review the seeded project templates. Clients in the shared library start
  as "unverified"; that is informational only and no longer blocks finalizing.
