# ClearTerms — Legal Document Assistant

Upload a contract, policy, or agreement (PDF, JPG/JPEG, or DOCX) and ask plain-language
questions about it. ClearTerms answers **only from what the document actually says** — if a
question isn't addressed in the file, it says so instead of guessing, hallucinating, or
falling back on generic legal knowledge.

Built for the **Prompt Wars** hackathon.

> ⚠️ Educational tool, not legal advice. ClearTerms explains what a document says; it never
> tells you what to do about it, and always points you to a licensed professional for that.

---

## Why RAG (and not just a raw LLM call)

A raw LLM asked "what's the notice period?" will happily answer from its general training
knowledge of what contracts *usually* say — which is exactly the hallucination risk this
project has to avoid. Retrieval-Augmented Generation fixes that structurally, not just with a
prompt request:

1. The uploaded document is chunked and embedded (Gemini `text-embedding-004`).
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

---

## Architecture

```
┌─────────────┐        ┌──────────────────────────┐        ┌────────────────────┐
│   Frontend   │  HTTP  │         Backend           │        │     Google Cloud    │
│  Vite + React│───────▶│   Node.js + Express (TS)  │───────▶│  Gemini API          │
│  TypeScript  │◀───────│                            │◀───────│  (generation +       │
│  Tailwind    │ cookie │  - Auth (JWT, httpOnly)    │        │   embeddings)        │
└─────────────┘         │  - Upload + extraction     │        ├────────────────────┤
                         │  - RAG orchestration       │───────▶│  Cloud Vision API    │
                         │  - History                 │        │  (OCR for images /   │
                         └──────────────┬─────────────┘        │   scanned pages)     │
                                        │                       └────────────────────┘
                                        ▼
                          ┌───────────────────────────┐
                          │  PostgreSQL + pgvector     │
                          │  users, documents, chunks, │
                          │  embeddings, qa_history     │
                          └───────────────────────────┘
```

### Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS v4 | `react-router-dom` for the Home / History / You tabs |
| Backend | Node.js + Express + TypeScript | REST API, all AI calls happen server-side (API keys never reach the browser) |
| Database | PostgreSQL + `pgvector` | Relational data and vector search live in one database — no separate vector service to run |
| **AI / Google services** | **Gemini API** (`gemini-2.5-flash` generation, `text-embedding-004` embeddings), **Google Cloud Vision** (OCR) | See below |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing | No token ever touches `localStorage` or client JS |
| File parsing | `pdf-parse` (PDF text), `mammoth` (DOCX), Cloud Vision `documentTextDetection` (JPG/JPEG + as an OCR path for scans) | |
| Testing | Vitest + Supertest (backend), Vitest + Testing Library (frontend) | |

### Google services used

- **Gemini API** — both the question-answering model and the embedding model. This is the
  core of the RAG pipeline, not a bolt-on feature.
- **Google Cloud Vision API** (`documentTextDetection`) — OCR for JPG/JPEG uploads, so
  ClearTerms can read a photographed page of a contract, not just clean text PDFs.
- Deployment is designed for **Cloud Run** (backend, see `backend/Dockerfile`) and
  **Cloud SQL for PostgreSQL** (which supports the `pgvector` extension), keeping the whole
  stack on Google Cloud if you choose to deploy it there.

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
│   │   ├── services/  extract, chunk, ocr, gemini, rag, ingest
│   │   └── validators/zod schemas
│   └── tests/         Vitest + Supertest
├── frontend/          Vite + React + TypeScript
│   └── src/
│       ├── api/       typed fetch client
│       ├── components/reusable UI + feature components
│       ├── context/   auth state
│       └── routes/    Login, Register, Home, History, You
└── docker-compose.yml Postgres + pgvector for local dev
```

---

## Running it locally

### 1. Database

```bash
docker compose up -d postgres
```

This starts Postgres with the `pgvector` extension and applies `backend/src/db/migrations/*.sql`
automatically on first boot (mounted into `docker-entrypoint-initdb.d`). If you ever need to
re-apply migrations against an existing container (e.g. after a schema change), run
`npm run migrate` inside `backend/` instead.

### 2. Backend

```bash
cd backend
cp .env.example .env     # then fill in GEMINI_API_KEY, JWT_SECRET, etc.
npm install
npm run dev               # http://localhost:4000
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

Open `http://localhost:5173`, create an account, upload a document, and ask it questions.

---

## Testing

```bash
cd backend && npm test      # 35 tests: validators, JWT, password hashing, chunking,
                             # RAG guardrails (mocked), auth/route security
cd frontend && npm test     # component tests: UI primitives, document list, chat thread,
                             # auth context (mocked API)
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
  exfiltrate it. Combined with `sameSite=lax` and a strict (non-wildcard) CORS origin, this
  also closes off the common CSRF vectors for a JSON-only API.
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
- The document upload control is a real `<input type="file">` behind a styled `<label>` (fully
  keyboard- and screen-reader-operable), not a div with a click handler.
- Grounded vs. "not mentioned" answers are distinguished with **text**, not color alone.
- Linted with `eslint-plugin-jsx-a11y` as part of the standard lint pass.

---

## Known limitations / next steps

- **Scanned PDFs** (image-only, no selectable text) are not OCR'd automatically — the app
  tells the user to re-upload as JPG/JPEG instead of silently failing. A production version
  would route these through **Document AI**'s batch PDF OCR instead.
- No email verification / password reset flow (out of scope for a hackathon MVP).
- The `MAX_TRUSTED_DISTANCE` retrieval threshold in `rag.ts` is a reasonable default but would
  benefit from tuning against a labeled set of real contract Q&A pairs.
