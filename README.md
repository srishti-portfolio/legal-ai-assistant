# ClearTerms — Legal Document Assistant

Upload a contract, policy, or agreement (PDF, JPG/JPEG, or DOCX) and ask plain-language
questions about it, in any of 8 languages. ClearTerms answers **only from what the document
actually says** — if a question isn't addressed in the file, it says so instead of guessing,
hallucinating, or falling back on generic legal knowledge.

Built for the **Prompt Wars** hackathon.

**Live demo:**
- App: https://legal-ai-assistant-orpin.vercel.app
- API health check: https://legal-ai-assistant-qpc5.onrender.com/api/health

> ⚠️ Educational tool, not legal advice. ClearTerms explains what a document says; it never
> tells you what to do about it, and always points you to a licensed professional for that.
>
> ⚠️ The backend runs on Render's free tier, which sleeps after 15 minutes of no traffic. The
> first request after a period of inactivity can take 30–50 seconds to wake it up — hit the
> health check link above a minute or two before demoing.

---

## Why RAG (and not just a raw LLM call)

A raw LLM asked "what's the notice period?" will happily answer from its general training
knowledge of what contracts *usually* say — which is exactly the hallucination risk this
project has to avoid. Retrieval-Augmented Generation fixes that structurally, not just with a
prompt request:

1. The uploaded document is chunked and embedded (Gemini `gemini-embedding-001`).
2. A question is embedded the same way and matched against those chunks only
   (Postgres + **pgvector**, cosine similarity).
3. The model is given *only* those retrieved passages and told, in the system prompt, that it
   may not use outside knowledge.
4. **Two independent guardrails**, not just prompt instructions:
   - **Retrieval-confidence gate** — if nothing in the document is semantically close enough
     to the question, the backend returns "not mentioned in the document" *without ever
     calling the LLM* (see `MAX_TRUSTED_DISTANCE` in [`backend/src/services/rag.ts`](backend/src/services/rag.ts)).
   - **Model self-check** — the model is instructed to emit an exact sentinel token when the
     retrieved passages don't answer the question, which the backend maps to the same
     deterministic fallback message rather than trusting free-form text.
5. Every grounded answer is returned with the source passage(s) and page number(s) it came
   from, so the user can verify it against the original document.
6. Answers are generated in the user's chosen language (see **Multi-language support** below).

### Resilience against model outages

Google's hosted models occasionally return `429` (rate limited) or `503` (temporarily
overloaded) — not bugs, just normal shared-capacity behavior, but something a live demo can't
afford to visibly choke on. `backend/src/services/gemini.ts` handles this in two layers:

- **Retry with exponential backoff** on every Gemini call (embeddings and generation).
- **A fallback chain of models** for answer generation — if the configured primary model
  (`GEMINI_GENERATION_MODEL`, a high-capacity lite model by default) is still failing after
  retries, the backend automatically tries the next model in the chain before giving up.

---

## Architecture

```
┌─────────────┐        ┌──────────────────────────┐        ┌────────────────────┐
│   Frontend   │  HTTP  │         Backend           │        │     Google Cloud    │
│  Vite + React│───────▶│   Node.js + Express (TS)  │───────▶│  Gemini API          │
│  TypeScript  │◀───────│                            │◀───────│  (generation +       │
│  Tailwind    │ cookie │  - Auth (JWT, httpOnly)    │        │   embeddings, with   │
└─────────────┘         │  - Upload + extraction     │        │   retry + fallback)  │
                         │  - RAG orchestration       │        ├────────────────────┤
                         │  - History                 │───────▶│  Cloud Vision API    │
                         └──────────────┬─────────────┘        │  (OCR for images)    │
                                        │                       └────────────────────┘
                                        ▼
                          ┌───────────────────────────┐
                          │  PostgreSQL + pgvector     │
                          │  (Neon, or local Docker)   │
                          │  users, documents, chunks, │
                          │  embeddings, qa_history     │
                          └───────────────────────────┘
```

Deployed as: **Vercel** (frontend) → **Render** (backend) → **Neon** (Postgres + pgvector) →
**Google Gemini API**.

### Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS v4 | `react-router-dom` for the Home / History / You tabs |
| Backend | Node.js + Express + TypeScript | REST API, all AI calls happen server-side (API keys never reach the browser) |
| Database | PostgreSQL + `pgvector` | Relational data and vector search live in one database — no separate vector service to run. Works against Neon (hosted, `DATABASE_URL`) or local Docker Compose |
| **AI / Google services** | **Gemini API** (`gemini-flash-lite-latest` generation with a fallback chain, `gemini-embedding-001` embeddings), **Google Cloud Vision** (OCR) | See below |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing | No token ever touches `localStorage` or client JS |
| File parsing | `pdf-parse` (PDF text), `mammoth` (DOCX), Cloud Vision `documentTextDetection` (JPG/JPEG) | |
| i18n | Custom lightweight translation context, 8 languages | See **Multi-language support** below |
| Testing | Vitest + Supertest (backend), Vitest + Testing Library (frontend) | |
| Deployment | Vercel (frontend), Render (backend), Neon (database) | `backend/Dockerfile` also included for a Cloud Run deployment path |

### Google services used

- **Gemini API** — both the question-answering model and the embedding model, with retry and
  a model-fallback chain for resilience. This is the core of the RAG pipeline, not a
  bolt-on feature.
- **Google Cloud Vision API** (`documentTextDetection`) — OCR for JPG/JPEG uploads, so
  ClearTerms can read a photographed page of a contract, not just clean text PDFs.
- `backend/Dockerfile` is ready for a **Cloud Run** deployment, and the database layer works
  unmodified against **Cloud SQL for PostgreSQL** (which supports `pgvector`), for anyone who
  wants to run the whole stack on Google Cloud instead of Vercel/Render/Neon.

---

## Multi-language support

Language isn't just a per-answer setting — the whole UI translates:

- **Chosen at sign-up.** The Register page includes a language picker; selecting a language
  there immediately re-translates the registration page itself, and the choice is saved to
  the new account.
- **Applies everywhere.** Every page, button, label, and status message is translated via a
  small custom i18n layer (`frontend/src/i18n/translations.ts`, `frontend/src/context/LanguageContext.tsx`)
  — 8 languages: English, Hindi, Spanish, French, German, Portuguese, Arabic, and Chinese.
  Arabic renders right-to-left automatically.
- **Changeable anytime** from the **You** tab — updates the account's saved preference and
  re-translates the UI immediately, and also changes the language the AI answers in.
- **Persists locally** (so the picked language survives a refresh even before login) and is
  synced to the account's saved preference on login/registration.

---

## Account management

The **You** tab has two separate forms, deliberately split by sensitivity:

- **Name & language** — no re-authentication needed, since neither can be used to take over
  the account.
- **Email & password** — changing either requires re-entering the **current password** first
  (`PATCH /api/user/credentials`, verified server-side against the stored hash before anything
  is changed). This stops a hijacked but still-logged-in session — an unattended browser tab,
  say — from silently locking the real owner out by swapping the email or password. Changing
  the email also checks it isn't already registered to another account, with the same
  friendly conflict error whether that's caught by the pre-check or the database's own unique
  constraint (covers the race condition between two simultaneous requests).

---

## Project structure

```
legal-ai-assistant/
├── backend/           Express + TypeScript API
│   ├── src/
│   │   ├── config/    env loading
│   │   ├── db/        pool, migrations, repositories
│   │   ├── middleware/auth, upload, error handling
│   │   ├── routes/    auth, documents, chat, history, user
│   │   ├── services/  extract, chunk, ocr, gemini (retry + fallback), rag, ingest
│   │   └── validators/zod schemas
│   └── tests/         Vitest + Supertest
├── frontend/          Vite + React + TypeScript
│   └── src/
│       ├── api/       typed fetch client
│       ├── components/reusable UI + feature components
│       ├── context/   auth state, language/i18n state
│       ├── i18n/      translation dictionary (8 languages)
│       └── routes/    Login, Register, Home, History, You
└── docker-compose.yml Postgres + pgvector for local dev
```

---

## Running it locally

### 1. Database — pick one

**Option A — hosted (Neon), no local install needed:**
Create a free project at [neon.tech](https://neon.tech), run `CREATE EXTENSION IF NOT EXISTS vector;`
in its SQL editor, and copy the connection string it gives you — you'll paste it into
`backend/.env` as `DATABASE_URL` in the next step.

**Option B — local Docker:**
```bash
docker compose up -d postgres
```
Starts Postgres with `pgvector` and applies `backend/src/db/migrations/*.sql` automatically on
first boot. Leave `DATABASE_URL` empty in `.env` to use this instead (the discrete `DB_HOST` /
`DB_PORT` / etc. fields take over).

### 2. Backend

```bash
cd backend
cp .env.example .env     # then fill in DATABASE_URL, GEMINI_API_KEY, JWT_SECRET
npm install
npm run migrate           # creates tables (skip if using docker-compose's auto-init)
npm run dev                # http://localhost:4000
```

You need:
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey) → `GEMINI_API_KEY`.
- (Optional, for image OCR) A **Google Cloud Vision** service account key JSON →
  `GOOGLE_APPLICATION_CREDENTIALS`. Without it, PDF and DOCX uploads still work; JPG/JPEG
  uploads will return a clear "OCR not configured" error instead of failing silently.

### 3. Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:4000/api
npm install
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173`, create an account (pick a language on the way), upload a
document, and ask it questions.

---

## Deployment

The live demo linked at the top runs on:

- **Frontend → Vercel.** Root directory `frontend`, framework auto-detected as Vite, one
  environment variable: `VITE_API_URL` pointing at the backend's `/api` path.
- **Backend → Render.** Root directory `backend`, Node runtime.
  - Build command: `npm install --include=dev && npm run build` (the `--include=dev` matters:
    with `NODE_ENV=production` set, plain `npm install` skips devDependencies, which is where
    TypeScript and all `@types/*` packages live — the build needs them even though the app
    doesn't at runtime).
  - Start command: `npm start`.
  - Environment variables: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`,
    `GEMINI_API_KEY`, `GEMINI_GENERATION_MODEL`, `GEMINI_EMBEDDING_MODEL`, and `CORS_ORIGIN`
    set to the exact Vercel URL (no trailing slash) — this must match exactly, or the browser
    will block every request as a CORS violation.
- **Database → Neon**, connected via `DATABASE_URL` (see the local setup section above).

---

## Testing

```bash
cd backend && npm test      # 41 tests: validators (incl. credential-change rules), JWT,
                             # password hashing, chunking, RAG guardrails (mocked), auth/route security
cd frontend && npm test     # component tests: UI primitives, document list, chat thread,
                             # auth context, language/i18n context (all with mocked APIs)
```

Backend tests mock the database and Gemini layers so `npm test` runs standalone without a
live Postgres instance or a real API key — useful for CI. `npm run typecheck` and `npm run
lint` are available in both projects and are clean (zero errors, zero `npm audit`
vulnerabilities in both projects as of this writing).

---

## Security

- **No secrets in the client.** All Gemini/Cloud Vision calls happen server-side; API keys
  never reach the browser bundle.
- **Session token in an httpOnly cookie**, not `localStorage` — an XSS payload cannot read or
  exfiltrate it. `sameSite` is `lax` in local dev (frontend and backend share the same
  registrable domain, `localhost`) and `none` (with `secure: true`, HTTPS-only) in production,
  where the frontend and backend are on genuinely different domains — paired with a strict,
  non-wildcard CORS origin, which is what actually covers CSRF here.
- **Passwords** hashed with bcrypt (cost factor 12), never logged or returned.
- **Every document/chat/history query is scoped to `user_id`** at the SQL level — one user
  cannot read, ask questions about, or delete another user's documents (IDOR is not possible
  via ID guessing).
- **Input validation** with `zod` on every request body/query, including strict UUID checks
  before ID params ever reach a database query.
- **Uploads**: filenames are replaced with a random UUID before touching disk (path traversal
  is not possible via a crafted filename), MIME type is allow-listed, and size is capped.
- **Rate limiting**: a global limiter, plus a tighter one specifically on `/chat/ask` since
  that's the endpoint that spends LLM quota.
- **Security headers** via `helmet`.
- `npm audit`: **0 vulnerabilities** in both `backend/` and `frontend/` (verified during
  development; dependency overrides applied where a transitive package pinned an old version).

---

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`), a "skip to main content" link, and a visible
  focus ring on every interactive element (never suppressed).
- All form fields have a real `<label htmlFor>`, `aria-invalid`, and `aria-describedby` wired
  to their error/hint text; errors are announced via `role="alert"`.
- Password fields have a show/hide toggle (a real `<button>` with an `aria-label` that updates
  between "Show password" / "Hide password", not just an icon).
- The document upload control is a real `<input type="file">` behind a styled `<label>` (fully
  keyboard- and screen-reader-operable), not a div with a click handler.
- Grounded vs. "not mentioned" answers are distinguished with **text**, not color alone.
- Arabic renders the whole UI right-to-left automatically.
- Linted with `eslint-plugin-jsx-a11y` as part of the standard lint pass.

---

## Known limitations / next steps

- **Scanned PDFs** (image-only, no selectable text) are not OCR'd automatically — the app
  tells the user to re-upload as JPG/JPEG instead of silently failing. A production version
  would route these through **Document AI**'s batch PDF OCR instead.
- No email verification / password reset flow (out of scope for a hackathon MVP).
- The `MAX_TRUSTED_DISTANCE` retrieval threshold in `rag.ts` is a reasonable default but would
  benefit from tuning against a labeled set of real contract Q&A pairs.
- Render's free tier sleeps the backend after inactivity (see the warning at the top) —
  a paid tier or a periodic keep-alive ping would remove the cold-start delay in production.
