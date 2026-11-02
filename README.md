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

## Deploy to Vercel

The root `vercel.json` configures one Vercel project with separate Vite client and Express API services. Import this repository into Vercel and set the project root to the repository root. Add these environment variables to both Production and Preview before deploying:

- `MONGODB_URI`: a reachable MongoDB connection string.
- `GEMINI_API_KEY`: a valid Google Gemini API key.
- `CASE_TOKEN_SECRET`: a unique random value of at least 24 characters.
- `CLIENT_ORIGIN`: the deployed Vercel origin (for example, `https://your-project.vercel.app`); add any Vercel preview origins you use.

Never commit `.env` or paste secrets into source files. The client calls `/api/v1` on the deployed site's domain; local development continues to use the API on port 4000.

## What is implemented

The MVP covers scenario submission, backend Gemini generation with schema and deterministic relationship/timeline validation, MongoDB persistence, case access tokens, investigation and evidence inspection, one final accusation, and a stored-solution result reveal. AI text generation needs a valid configured model/key and MongoDB connection. If generation fails, the case is marked failed and the UI provides a retry action.

## API and security

All API routes are under `/api/v1`. Case operations require the `X-Case-Token` returned on creation. Public response DTOs are explicitly constructed; the private solution is persisted separately and only loaded by accusation/result services. See `specs/API.md`.
