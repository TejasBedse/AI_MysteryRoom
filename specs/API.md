# API Contract

Base path: `/api/v1`. JSON envelope: `{ success, data }` or `{ success: false, error: { code, message } }`. Case-scoped routes require `X-Case-Token`.

| Method | Path | Behavior |
|---|---|---|
| GET | `/health` | Service readiness (does not reveal secrets) |
| POST | `/mysteries` | Validate scenario, create async case; returns `{id,status,accessToken}` |
| GET | `/mysteries/:id/status` | Generation state and approximate progress |
| GET | `/mysteries/:id` | Public case and suspect profiles only |
| GET | `/mysteries/:id/evidence` | Public evidence summaries |
| GET | `/mysteries/:id/evidence/:evidenceId` | One public evidence item |
| POST | `/mysteries/:id/accusations` | One final accusation; evaluates stored truth |
| GET | `/mysteries/:id/result` | Solution only after completed accusation |

Create request fields: `scenario` (required, <= configured limit), optional `title`, `difficulty` (`easy|medium|hard`), `category` (`theft|disappearance|murder-mystery|corporate|personal|other`), optional `atmosphere` (`realistic|suspenseful|noir|lighthearted`). Unknown fields are rejected. Accusation body is `{suspectId}`. Repeated accusations return HTTP 409. Error responses never include provider/database details.
