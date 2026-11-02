# Architecture

The React/Vite client communicates only with the versioned Express API. Express validates every request, checks the case capability token, owns game-state transitions, and calls the Gemini provider through a dedicated AI module. MongoDB stores case metadata, public suspects/evidence, private solution, access-token hash and accusation separately.

## Generation flow

`POST /mysteries` validates and persists a generating case, then starts bounded background generation. Gemini returns one structured blueprint containing truth, suspects, timeline and evidence. Zod validates shape; deterministic checks validate suspect references, unique evidence IDs, chronological ordering, and clue references before the case can be marked ready. Failure marks the case failed. The client polls status and never sees blueprint/private solution fields.

## Trust boundaries

User scenarios and model output are untrusted text. They are never rendered as HTML or executed. The case token is generated with cryptographic randomness; MongoDB stores only its HMAC digest. Public DTOs are built field by field. The accusation service checks case state and suspect membership, then compares against the private stored culprit in a single state transition.

## Configuration

Secrets and deployment values come from environment variables. Gemini and MongoDB are required to create playable cases. Media generation is not enabled in this MVP; evidence uses accessible structured text and CCTV event logs.
