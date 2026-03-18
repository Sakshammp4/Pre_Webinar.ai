# TASK_LOG

## Project Context

This repository is a Next.js (App Router) application used to manage webinars and generate LinkedIn post templates for webinar attendees.

Core capabilities:
- Hosts can create/manage webinars.
- The dashboard shows webinar details, templates, and submissions.
- A "Generate Templates" action triggers an API route that calls an LLM to generate multiple LinkedIn post variations.
- Generated templates are stored in Supabase (Postgres) and rendered back in the dashboard.

Primary stack:
- Next.js 16 (Turbopack)
- React 19
- Supabase (auth + database) via `@supabase/ssr`
- UI: Tailwind + Radix primitives

---

## Change Log (Append-only)

### 2026-03-11

#### Supabase configuration and local dev bring-up

- **What was done**
  - Added local environment variables for Supabase:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Installed project dependencies via `npm install` and started the dev server (`npm run dev`).

- **Why**
  - The middleware/server client required Supabase URL + anon key to initialize (`createServerClient`). Missing env vars caused a runtime error.

- **Result**
  - App runs locally at `http://localhost:3000`.

#### Supabase MCP setup (Windsurf)

- **What was done**
  - Updated Windsurf MCP configuration to use the Supabase MCP remote endpoint with project ref `zedkwmuqomthovjubdib`.
  - Added `SUPABASE_ACCESS_TOKEN` (PAT) to authenticate MCP.
  - Verified the MCP remote proxy can connect after OAuth authorization.

- **Why**
  - Needed MCP connectivity to inspect/manage Supabase project resources from the IDE.

#### AI template generation endpoint: migrate to Gemini + strict JSON output

- **What was done**
  - Updated `POST /api/generate-templates` to generate templates via Gemini (Google Generative AI SDK) instead of an OpenAI model.
  - Enforced predictable output shape:
    - Gemini is requested to return `application/json`.
    - Server parses with `JSON.parse` and validates with `zod` to ensure `{ templates: string[] }`.
  - Added `GEMINI_API_KEY` to `.env`.
  - Installed `@google/generative-ai`.
  - Improved error responses to return upstream Gemini error details (via `502`) rather than only `Internal server error`.

- **Why**
  - The UI displayed "Internal server error" when the LLM response could not be reliably parsed.
  - The prior implementation used `openai/gpt-4o-mini` through the `ai` SDK without OpenAI credentials configured.

- **Known issue / Follow-ups**
  - Gemini calls returned `403 PERMISSION_DENIED` / `404 model not found` depending on configuration.
  - This indicates Google-side project/API key configuration is still required:
    - Enable the Generative Language API in the Google Cloud project behind the AI Studio key.
    - Ensure the API key is not restricted (or allowlist the Generative Language API).
    - Confirm billing/quota eligibility.

---

### 2026-03-12

#### Local LLM integration: migrate from Gemini to LMStudio + connectivity fixes

- **What was done**
  - Replaced Gemini API calls with local LMStudio OpenAI-compatible endpoint (`http://127.0.0.1:1234/v1/chat/completions`).
  - Initially used `qwen/qwen3-4b-thinking-2507` model.
  - Added robust JSON parsing:
    - Strip `<think>...</think>` blocks from thinking model outputs.
    - Extract first valid JSON object `{...}` from response text.
    - Fallback parsing with regex to handle noisy LLM output.
  - Fixed connectivity issues between Next.js API route and LMStudio server:
    - Enforced Node.js runtime (`export const runtime = "nodejs"`) to avoid Edge sandbox restrictions.
    - Used `127.0.0.1` instead of `localhost` for IPv4 resolution.
    - Added `AbortController` with 480s timeout to prevent client disconnects.
  - Removed unsupported LMStudio parameters (`response_format: { type: "json_object" }`).
  - Improved error reporting in frontend (`components/generate-templates.tsx`) to show backend `details` alongside error messages.
  - Switched to non-thinking model `qwen3-vl-4b-instruct` for better JSON compliance and faster generation.
  - Increased `max_tokens` to 2000 for complete post generation.

- **Why**
  - Gemini API required Google Cloud configuration (billing, API enablement, key restrictions) which was complex.
  - Local LLM provides privacy, no API costs, and direct control.
  - Initial LMStudio calls failed due to fetch connectivity (sandboxing), parameter incompatibilities, and thinking model verbosity causing JSON parse failures.

- **Result**
  - End-to-end generation works: `POST /api/generate-templates 200` → templates saved to Supabase → UI refreshes with new templates.
  - Templates are now real LinkedIn posts (not placeholders) with proper JSON output.
  - Generation time ~4 minutes with 1400-2000 tokens.

- **Known issue / Follow-ups**
  - If LMStudio server stops, templates will fail with "Local LLM request failed" (restarting LMStudio fixes).
  - Model output quality depends on prompt tuning; current prompts enforce first-person, professional tone with required hashtags.

#### Attendee flow enhancements: photo upload + preview + share

- **What was done**
  - Created a public Supabase Storage bucket `attendee-photos`.
  - Added Storage policies:
    - Public read for objects in `attendee-photos`.
    - Authenticated insert/update for objects in `attendee-photos`.
  - Updated attendee onboarding flow (`components/attendee-flow.tsx`) to include a new optional "Add your photo" step.
  - Implemented upload to Supabase Storage and saved the resulting public URL to `attendee_submissions.photo_url` on submission.
  - Added an attendee preview card in the copy step:
    - Round photo avatar (fallback initials)
    - Name shown in bold
    - Rating stars
    - Professional bordered card layout
  - Added "Download Image" (uses `html2canvas`) so attendees can download the preview as a PNG.
  - Share UX already copies text to clipboard and opens LinkedIn in a new tab.
  - Installed `html2canvas` dependency.

- **Why**
  - The database already had `photo_url` but the UI had no way to capture an attendee image.
  - Attendees need a polished, downloadable preview image and a fast share flow (copy text + upload image on LinkedIn).

- **Result**
  - Attendees can upload an optional photo, see a complete preview (with photo + name), download the image, and share the post.

---

## Notes / Operational Guidance

- Local env is loaded from `.env` (as shown by Next.js "Environments: .env" in terminal).
- If env vars change, restart `npm run dev`.
- Keep API keys out of git history; rotate and move secrets to a non-committed env file if needed.
