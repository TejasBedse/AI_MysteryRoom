# Acceptance Criteria

- Landing page and responsive scenario form with required scenario and preferences.
- API validates inputs independently and runs asynchronous generation.
- Only validated cases become playable; three to five suspects and six to ten evidence items.
- Gemini is called only from the server; no private solution is sent before accusation.
- Evidence can be opened in any order; suspects, timeline and structured evidence are inspectable.
- One accusation is evaluated deterministically against stored truth; repeat submissions cannot change it.
- Result reveals culprit and explanations only after completion.
- API responses use explicit DTOs; errors omit secrets and internal details.
- MongoDB and Gemini credentials are configured through environment variables.
- Setup and feature limitations are documented.

Image/video generation, user accounts, multiplayer and deployed infrastructure remain future work.
