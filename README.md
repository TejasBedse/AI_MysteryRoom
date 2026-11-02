# AI Mystery Room

Scenario-driven detective mysteries. The Express API owns generation, case state and the private answer key; React only receives public case DTOs. See [`specs/SPEC.md`](specs/SPEC.md) for the approved product contract and the accompanying architecture/API/data/AI/acceptance documents.

## Requirements

- Node.js 20+
- MongoDB
- A Google Gemini API key

## Run locally

1. Copy `.env.example` to `.env`, set `GEMINI_API_KEY`, `MONGODB_URI`, and a long random `CASE_TOKEN_SECRET`. A local database URI must begin with `mongodb://`; an Atlas URI must begin with `mongodb+srv://` and point to a reachable cluster.
2. Install dependencies with `npm install`.
3. Start both apps with `npm run dev`.
4. Open `http://localhost:5173`. The API health check is at `http://localhost:4000/api/v1/health`.

The browser retains case access tokens for its current session. Keep `.env` private. Image and video generation are not included; the case uses structured fictional chat, witness, document, CCTV-style and timeline evidence.

## What is implemented

The MVP covers scenario submission, backend Gemini generation with schema and deterministic relationship/timeline validation, MongoDB persistence, case access tokens, investigation and evidence inspection, one final accusation, and a stored-solution result reveal. AI text generation needs a valid configured model/key and MongoDB connection. If generation fails, the case is marked failed and the UI provides a retry action.

## API and security

All API routes are under `/api/v1`. Case operations require the `X-Case-Token` returned on creation. Public response DTOs are explicitly constructed; the private solution is persisted separately and only loaded by accusation/result services. See `specs/API.md`.
