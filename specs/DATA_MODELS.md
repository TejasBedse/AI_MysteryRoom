# Data Models

Mongo collections: `mysteries` (public metadata and state), `suspects`, `evidence` (public content only), `privateSolutions` (culprit, method, actual timeline, clue explanations), `accusations`, and `caseAccess` (HMAC token digest). Stable ObjectId references and timestamps are used. The private collection is queried only by the accusation/result services.

Timeline events use ISO timestamps and suspect/evidence ID references. Public evidence content is structured JSON rendered as text by React. The API never serializes database documents directly; response DTOs omit access hashes, private references, internal clue plans and solution values.
