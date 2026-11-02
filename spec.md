# AI MYSTERY ROOM

## Spec-Driven Development (SDD) — Master Specification

**Document Type:** Product Requirements + Technical Specification
**Project Name:** AI Mystery Room
**Version:** 1.0.0
**Status:** Initial Development Specification
**Primary Stack:** MERN (MongoDB, Express.js, React.js, Node.js)
**AI Provider:** Google Gemini API
**Development Agent:** OpenAI Codex
**Document Purpose:** Single Source of Truth (SSOT)

---

# 1. Project Overview
## 1.1 Project Description

AI Mystery Room is an AI-powered interactive mystery investigation website where users become investigators and solve fictional criminal mysteries using evidence generated dynamically by artificial intelligence.

The user begins by submitting a short story scenario, such as:

- A valuable diamond disappears from a hotel room.
- A student is found to have stolen an examination paper.
- A business owner receives a mysterious threatening message.
- A priceless painting disappears during a private exhibition.
- A person goes missing during a family gathering.

Based on the user's scenario, the backend AI system creates a complete fictional mystery investigation. It establishes the incident, suspects, actual culprit, timeline, motives, and a consistent collection of evidence.

The website then presents the user with an interactive investigation room containing clues such as fictional WhatsApp conversations, photographs, CCTV footage or CCTV-style evidence, witness statements, timelines, and other relevant documents.

The user examines the evidence, identifies contradictions, connects clues, and finally selects the person they believe is responsible.

The system evaluates the user's answer against the original hidden solution and provides a final explanation showing whether the selection was correct and how the evidence supports the conclusion.

## 1.2 Core Concept

**User-created scenario → AI-generated mystery → AI-generated evidence → Interactive investigation → Culprit selection → Solution reveal**

The central principle is that every mystery must be generated as a coherent investigation rather than a random collection of clues.

The AI must decide the actual culprit and underlying truth *before* generating the evidence. All evidence must subsequently remain consistent with that established truth.

## 1.3 Problem Statement

Traditional mystery games generally provide predefined stories and limited replayability. Players cannot easily investigate their own story ideas, and the evidence available to them is fixed.

AI Mystery Room addresses this limitation by allowing users to generate unique, scenario-based investigations using an LLM, with dynamically created suspects, evidence, contradictions, and solutions.

## 1.4 Project Objectives

1. Allow users to create mysteries from their own scenarios.
2. Generate structured, logically consistent investigations using Gemini.
3. Produce fictional evidence in multiple formats.
4. Provide an engaging, detective-style investigation interface.
5. Allow users to select and accuse a suspect.
6. Evaluate the accusation using a hidden, authoritative solution.
7. Explain the solution using evidence-backed reasoning.
8. Support repeatable investigations with different outcomes and stories.
9. Keep the AI integration secure, reliable, and maintainable.
10. Build an architecture that supports future multimedia evidence and advanced gameplay.

## 1.5 Target Users

- Mystery and detective-story enthusiasts.
- Casual gamers.
- Students and creative writers.
- Users interested in interactive storytelling.
- Users who want to create their own investigation challenges.

## 1.6 Product Scope

The first version is a single-player, browser-based mystery investigation experience.

It must support the full lifecycle: scenario submission, mystery generation, evidence inspection, suspect selection, and solution reveal.

Multiplayer investigations, public sharing, competitive rankings, and user-generated mystery marketplaces are outside the initial release scope.

---

# 2. Product Principles

The following principles are mandatory throughout development.

### P1. Truth Before Evidence

The system must establish and store the true solution before generating any evidence.

### P2. Evidence Must Be Consistent

Every clue must agree with the mystery's underlying facts, except where a clue is intentionally misleading.

### P3. Fair Investigation

The user must receive enough information to identify the culprit through reasoning. The solution must not depend on arbitrary guessing.

### P4. Hidden Solution

The culprit, complete solution, and internal answer key must never be sent to the client before the user submits an accusation.

### P5. AI-Assisted, Backend-Controlled

Gemini generates narrative content and assists with evidence creation. The backend validates, stores, and controls all game state.

### P6. Transparent Fiction

All messages, photographs, and recordings are fictional game assets. The application must not present generated evidence as authentic records from real investigations.

### P7. Graceful Failure

If AI generation fails, the application must communicate the problem and allow a safe retry without creating a partially playable or inconsistent mystery.

---

# 3. Functional Requirements

## FR-01: Landing Page

The website must provide a polished landing page introducing AI Mystery Room.

Required elements:

- Project logo and name.
- Short product description.
- Primary "Create Mystery" action.
- Mystery-solving workflow explanation.
- Example mystery or demo investigation.
- Responsive navigation.
- Footer containing privacy, terms, and fictional-content notices.

## FR-02: Scenario Submission

The user must be able to describe the story or incident that should become a mystery.

Required fields:

- Scenario description.
- Optional mystery title.
- Difficulty: Easy, Medium, or Hard.
- Mystery category: Theft, Disappearance, Murder Mystery, Corporate, Personal, or Other.
- Optional atmosphere: Realistic, Suspenseful, Noir, or Lighthearted.

The category and atmosphere are optional inputs; the scenario description is required.

Requirements:

- Trim whitespace.
- Reject empty submissions.
- Enforce a configurable scenario length limit, initially 2,000 characters.
- Display validation errors clearly.
- Prevent duplicate submissions caused by repeated clicks.
- Explain that the story will be transformed into a fictional investigation.
- Do not require the user to provide the culprit or solution.

The server must validate all inputs independently of frontend validation.

## FR-03: Mystery Generation

After submission, the backend must use Gemini to generate a structured mystery.

The generated mystery must contain:

1. A title.
2. An introductory incident report.
3. The original scenario and normalized premise.
4. The victim or affected party, where appropriate.
5. Three to five suspects.
6. Each suspect's profile, motive, opportunity, and relevant background.
7. One authoritative culprit.
8. A complete hidden solution.
9. A chronological event timeline.
10. Relationships between suspects and events.
11. A set of evidence items.
12. Relevant clues and contradictions.
13. Plausible red herrings.
14. A final explanation linking evidence to the culprit.

For the initial version, generate approximately six to ten evidence items.

The mystery-generation service must use structured JSON output or equivalent schema-constrained output wherever supported by the selected Gemini model.

The server must parse and validate the response before storing or exposing it.

If the output is malformed, incomplete, or inconsistent, the system must attempt a bounded repair or regeneration process.

It must not expose raw model responses, hidden reasoning, internal prompts, or private solution data to the browser.

## FR-04: Investigation Room

Each successfully generated mystery must open in a dedicated investigation interface.

The interface must contain:

- Case title and incident summary.
- Case status and difficulty.
- Suspect directory.
- Evidence board.
- Evidence detail viewer.
- Timeline.
- Investigation progress indicator.
- Suspect selection and accusation action.
- Optional notes area for the investigator.

The user must be able to inspect evidence in any order. The game must not require a rigid sequence unless a future game mode explicitly introduces one.

## FR-05: Suspect Profiles

Each suspect must have a fictional identity and an individual profile.

A profile may include:

- Name.
- Avatar or portrait.
- Age range where relevant.
- Occupation or role.
- Relationship to the incident.
- Stated alibi.
- Possible motive.
- Known connections.
- Publicly available case information.

The suspect list must not reveal the true culprit through a special badge, ordering, color, or metadata.

Suspect portraits must be clearly fictional AI-generated assets or illustrations.

## FR-06: Evidence Types

The application must support a common evidence model with multiple display formats.

### A. Fictional WhatsApp-Style Conversations

Each conversation may contain:

- Fictional contact names.
- Message text.
- Timestamps.
- Conversation participants.
- Optional delivered/read indicators.
- Optional image or attachment references.
- Relevant clue relationships.

The interface may resemble a familiar messaging application but must not claim that the conversation originated from a real WhatsApp account.

### B. Photographic Evidence

Examples:

- A room or crime scene.
- An object left behind.
- A damaged lock.
- A suspicious package.
- A fictional suspect portrait.
- A relevant item discovered at a location.

Store an asset reference, caption, timestamp where relevant, and explanation of its case relevance.

Do not expose the hidden explanation before the user submits an accusation.

### C. CCTV-Style Evidence

The system should support:

- Camera location.
- Recording date and time.
- Timestamped event descriptions.
- Video asset or simulated footage reference.
- Relevant frames or still images.
- A transcript or event log.

For the MVP, CCTV evidence may consist of a sequence of generated still images and a timestamped event log. This provides a reliable implementation even when actual AI video generation is unavailable.

Actual generated video is an enhanced capability and must only be enabled when a supported video-generation provider or model is configured.

### D. Witness Statements

Each statement should contain:

- Witness identity.
- Statement text.
- Relevant time or event.
- Optional inconsistencies with other evidence.

### E. Documents and Records

Examples:

- Fictional receipts.
- Access logs.
- Schedules.
- Letters.
- Reports.
- Invented transaction records.
- Event invitations.

### F. Timeline Evidence

The system should display important events chronologically, including events that the investigator can compare with messages, witness statements, and camera logs.

### Evidence Rules

- Each evidence item must have a unique ID.
- Each item must belong to a specific mystery.
- Evidence timestamps must align with the case timeline.
- Each item must have an intended narrative purpose.
- Misleading evidence must be deliberately defined as a red herring.
- Evidence must not contradict the hidden truth accidentally.
- Asset generation failures must not invalidate the entire case if a usable text fallback exists.

## FR-07: Evidence Detail Viewer

Selecting an evidence card must open a detail view.

The detail view must support:

- Text rendering.
- Image previews.
- Conversation layouts.
- Timestamped CCTV events.
- Video playback where a valid video asset exists.
- Expandable evidence metadata.
- Navigation between evidence items.

The viewer must distinguish unavailable media from genuinely empty evidence. Failed assets must display an appropriate fallback instead of a broken image or an endless loading indicator.

## FR-08: Accusation System

Once the user has examined the case, they must be able to select one suspect as the culprit.

The accusation interface must:

1. Display all eligible suspects.
2. Require one selection.
3. Ask the user to confirm the accusation.
4. Submit the selected suspect ID to the backend.
5. Evaluate the selection against the stored solution.
6. Prevent the client from providing or modifying the authoritative answer.

For the initial version, allow one final accusation per mystery. Hints and additional attempts may be added later as configurable game modes.

## FR-09: Result and Solution Reveal

After the accusation is submitted, the application must display:

- Correct or incorrect result.
- Actual culprit's name.
- Explanation of the culprit's motive and opportunity.
- Key supporting evidence.
- Relevant contradictions and red herrings.
- A chronological reconstruction of events.
- An explanation of why alternative suspects were less likely.
- A "Play Another Mystery" action.

The result must be determined using the backend's stored solution, not a fresh unconstrained Gemini judgment.

Gemini may assist in writing the final explanation, but the backend must verify that it refers to the authoritative culprit and actual evidence.

## FR-10: Mystery History

For the initial release, a user should be able to reopen mysteries created during the current browser session or through a stored case reference.

Persistent cross-device history and user accounts may be introduced later.

Publicly accessible mystery IDs must be unguessable or protected by appropriate authorization. A random ID alone is not a substitute for access control.

---

# 4. Non-Functional Requirements

## NFR-01: Performance

- Landing page should load quickly on a typical broadband connection.
- Existing case details should load without regenerating the mystery.
- AI generation must run asynchronously from the perspective of the user interface.
- The interface must display progress during generation.
- All external AI calls must have configurable timeouts.

## NFR-02: Reliability

- Use bounded retries for transient model failures.
- Do not create duplicate cases on repeated requests.
- Store successfully validated mysteries before marking them playable.
- Preserve already generated evidence if an optional media-generation step fails.
- Provide clear failure and retry states.

## NFR-03: Security

- Gemini API keys must remain on the server.
- Validate all request bodies and path parameters.
- Apply rate limits to expensive AI endpoints.
- Sanitize rendered text and restrict unsafe file types.
- Prevent unauthorized access to private mysteries.
- Do not execute model-generated code, HTML, scripts, or shell commands.
- Do not expose hidden solutions through client APIs or frontend bundles.

## NFR-04: Usability

- Responsive desktop, tablet, and mobile layouts.
- Accessible keyboard navigation.
- Readable evidence cards and timelines.
- Clear distinction between investigation and final solution views.
- Helpful empty, loading, error, and success states.

## NFR-05: Maintainability

- Separate frontend, API, AI orchestration, persistence, and media services.
- Use reusable components and typed data contracts.
- Keep prompts versioned.
- Centralize configuration and validation.
- Maintain a consistent source of truth for shared schemas and rules.

## NFR-06: Cost Control

- Set configurable token and output limits.
- Avoid regenerating completed mysteries.
- Generate media selectively rather than creating unnecessary assets.
- Cache or reuse successfully generated results where appropriate and safe.
- Monitor model usage, failures, latency, and cost.

---

# 5. Technology Stack

## 5.1 Frontend

- React.js
- Vite
- TypeScript
- React Router
- Tailwind CSS
- A reusable component library or custom accessible components
- Fetch API or Axios for backend communication

The frontend must not call Gemini directly.

## 5.2 Backend

- Node.js
- Express.js
- TypeScript
- Official Google Gen AI SDK or the currently supported Google Gemini SDK
- Zod or an equivalent runtime validation library
- MongoDB Node.js driver or Mongoose
- A structured logging library

The backend is responsible for validation, AI orchestration, database operations, authorization, case state, and scoring.

## 5.3 Database

MongoDB stores:

- Mystery metadata.
- Suspects.
- Public evidence metadata.
- Private solutions.
- Timelines.
- Asset references.
- Game status.
- Accusation results.
- Optional user and session records.

## 5.4 AI

Google Gemini is the primary language-model provider.

It is responsible for:

- Story interpretation.
- Mystery design.
- Suspect generation.
- Timeline creation.
- Evidence text generation.
- Consistency-review assistance.
- Final explanation drafting.
- Optional hints in a future release.

Image and video generation must be treated as separate model capabilities, even if they are available through Google's model ecosystem.

Do not assume that the selected Gemini text model can generate images or video directly. Use the appropriate supported media-generation API and model for each capability.

## 5.5 Media Storage

Store generated image and video files in object storage, with MongoDB containing only metadata and references.

The media-storage adapter should support a configurable provider, such as Google Cloud Storage or another compatible object-storage service.

For local development, a local media directory may be used behind the same adapter interface.

Do not store large binary media files directly in ordinary MongoDB documents.

## 5.6 Environment Configuration

Use environment variables for all secrets and deployment-specific settings.

Required configuration should include:

- `PORT`
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `GEMINI_TEXT_MODEL`
- `GEMINI_IMAGE_MODEL` (if enabled)
- `GEMINI_VIDEO_MODEL` (if enabled)
- `CLIENT_ORIGIN`
- `SESSION_SECRET` (if sessions are implemented)
- Media-storage configuration
- AI timeout and retry settings
- Rate-limit settings

These are configuration names, not hardcoded values. Model identifiers and API capabilities must be verified against current provider documentation.

Commit an `.env.example` containing placeholders only. Never commit real secrets.

---

# 6. System Architecture

## 6.1 High-Level Architecture

```text
┌────────────────────────────────────┐
│          React Frontend            │
│                                    │
│ Landing Page | Scenario Form        │
│ Investigation Room | Results        │
└─────────────────┬──────────────────┘
                  │ HTTPS / REST API
                  ▼
┌────────────────────────────────────┐
│          Express Backend           │
│                                    │
│ Routes and Controllers             │
│ Validation and Authorization       │
│ Case and Game-State Services       │
└─────────────────┬──────────────────┘
                  ▼
┌────────────────────────────────────┐
│         Mystery Orchestrator       │
│                                    │
│ 1. Interpret Scenario              │
│ 2. Create Hidden Solution          │
│ 3. Generate Evidence Plan          │
│ 4. Generate Evidence               │
│ 5. Validate Consistency            │
│ 6. Publish Playable Mystery        │
└────────┬─────────────────┬────────┘
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│ Google Gemini   │  │ Media Generation │
│ Text / Reasoning│  │ Images / Video   │
└─────────────────┘  └────────┬─────────┘
                              ▼
                    ┌──────────────────┐
                    │ Object Storage   │
                    └──────────────────┘

                  Backend
                     │
                     ▼
             ┌─────────────────┐
             │ MongoDB         │
             │ Cases / Evidence│
             │ Private Answers │
             └─────────────────┘
```

## 6.2 Architecture Rules

1. React communicates only with the Express API.
2. The Express backend is the only component authorized to call Gemini.
3. The mystery orchestrator owns generation sequencing and validation.
4. The database stores the authoritative solution separately from public case data.
5. Media storage stores generated files; MongoDB stores their references.
6. The result endpoint checks the stored solution before returning the result.
7. AI prompts and schemas must be versioned.
8. Frontend components must not contain business logic that determines the culprit.
9. AI-generated content must be treated as untrusted input.
10. The application must never expose private solution data through API responses, logs, or error messages.

---

# 7. AI Mystery Generation Pipeline

The AI pipeline is the most important backend subsystem.

## Stage 1: Scenario Normalization

Input: User's scenario and selected preferences.

Gemini transforms the scenario into a structured premise without changing its central idea.

Output:

- Normalized premise.
- Incident type.
- Relevant setting.
- Constraints and assumptions.
- Suitable mystery structure.

The backend must reject unsafe, empty, or excessively long input before sending it to the model.

## Stage 2: Hidden Case Blueprint

Gemini generates the complete underlying truth before generating player-facing evidence.

The blueprint includes:

- Actual sequence of events.
- Culprit ID.
- Culprit motive.
- Opportunity and method.
- Suspect identities.
- Individual alibis.
- Key timeline events.
- What each suspect knows.
- Essential clues.
- Deliberate red herrings.
- Expected solution reasoning.

The blueprint must be saved as private server-side data.

## Stage 3: Evidence Planning

Generate an evidence plan from the blueprint.

Each evidence item must define:

- Evidence ID.
- Evidence type.
- Creation instructions.
- Source or fictional origin.
- Timestamp or relevant event.
- Facts it supports.
- Suspect relationships.
- Whether it is misleading.
- Intended deduction.
- Required media assets.

The plan must ensure that the evidence set is sufficient to distinguish the culprit from alternative suspects.

## Stage 4: Evidence Generation

Generate textual evidence through Gemini.

Generate image or video assets through an appropriate configured media-generation service.

Examples:

- Conversation screenshots rendered by the application from structured fictional messages.
- Scene photographs created by an image model.
- CCTV-style sequences made from generated still images and timestamped events.
- Video clips from a supported video model, if enabled.

For consistent text layouts, WhatsApp-style conversations and document images should preferably be rendered by the frontend or a backend template renderer from structured content rather than relying on an image model to reproduce exact text.

## Stage 5: Consistency Validation

The backend must validate:

- Every referenced suspect exists.
- Every evidence ID is unique.
- The culprit exists in the suspect list.
- The timeline is chronologically valid.
- Evidence timestamps are compatible with established events.
- Essential clues support the intended solution.
- Red herrings are intentional and explainable.
- Evidence does not accidentally reveal the solution before the reveal.
- The case contains enough useful evidence for a fair investigation.

Use deterministic code for structural and temporal validation wherever possible.

A second Gemini review may assess narrative contradictions, but it must not replace server-side validation.

## Stage 6: Bounded Repair

If the case fails validation:

1. Identify the validation errors.
2. Request a targeted correction from Gemini.
3. Validate again.
4. Retry only a configured number of times.
5. If validation still fails, mark generation as failed or regenerate the case from a fresh blueprint.

Do not publish an inconsistent case as playable.

## Stage 7: Publication

Only after validation should the case become playable.

The system must persist the complete case, public evidence, private solution, generation status, and available media references.

The frontend receives only the public case representation.

---

# 8. Gemini Integration Specification

## 8.1 Integration Design

Create a dedicated AI provider layer rather than placing Gemini calls directly inside controllers.

Suggested module:

`server/src/modules/ai/`

Responsibilities:

- Provider configuration.
- Model invocation.
- Prompt templates.
- Structured response parsing.
- Retry and timeout handling.
- Usage metadata.
- Model error normalization.

Suggested interface:

```typescript
interface MysteryAIProvider {
  generateCaseBlueprint(
    input: MysteryInput
  ): Promise<CaseBlueprint>;

  generateEvidence(
    blueprint: CaseBlueprint,
    plan: EvidencePlan
  ): Promise<EvidenceItem[]>;

  validateCase(
    blueprint: CaseBlueprint,
    evidence: EvidenceItem[]
  ): Promise<ValidationReport>;

  generateFinalExplanation(
    caseData: PublicCaseData,
    solution: PrivateSolution
  ): Promise<FinalExplanation>;
}
```

Implementation details may change as provider capabilities evolve, but the service contract should remain stable.

## 8.2 Prompt Requirements

Every prompt must:

- Specify the task and expected output schema.
- Include only the context necessary for the current stage.
- Define the difficulty level.
- Require internally consistent fictional facts.
- Distinguish authoritative facts from misleading evidence.
- Prohibit unsupported changes to established case facts.
- Avoid exposing internal solution data in public evidence.
- Request valid identifiers and explicit relationships.
- Avoid unnecessary personal information.
- Instruct the model to return structured data rather than executable code.

Prompts must be stored in version-controlled files or a dedicated prompt module.

## 8.3 Master Mystery Blueprint Prompt

Use the following as the starting template for the case-blueprint stage:

```text
You are the mystery designer for AI Mystery Room,
an interactive fictional detective game.

Create a complete, logically consistent mystery using
the user-provided scenario and preferences.

SCENARIO:
{{scenario}}

DIFFICULTY:
{{difficulty}}

CATEGORY:
{{category}}

ATMOSPHERE:
{{atmosphere}}

RULES:
1. Establish the complete truth before creating evidence.
2. Assign exactly one authoritative culprit.
3. Create 3-5 distinct suspects.
4. Give each suspect a plausible motive, opportunity,
   and a reason they may initially appear suspicious.
5. Establish a coherent, chronological event timeline.
6. Define the culprit's actual actions, motive, and method.
7. Define at least three essential clues that collectively
   support the correct solution.
8. Include plausible but explainable red herrings.
9. Make the mystery solvable from the available evidence.
10. Ensure the solution is not dependent on arbitrary guessing.
11. Keep all dates, times, identities, and locations consistent.
12. Do not create real allegations about real people.
13. Treat the scenario as fictional game content.
14. Return data matching the requested schema.
15. Do not include chain-of-thought or private deliberations.

Return the structured case blueprint.
Do not create final evidence in this stage.
```

This is a baseline prompt, not a substitute for schema validation or consistency checks.

## 8.4 Evidence Generation Prompt

```text
You are generating fictional investigation evidence
for an existing AI Mystery Room case.

Use the supplied case facts and evidence plan.

CASE FACTS:
{{approved_case_facts}}

EVIDENCE PLAN:
{{evidence_plan}}

RULES:
1. Do not change established case facts.
2. Do not invent a new culprit.
3. Keep names, times, places, and events consistent.
4. Follow the assigned evidence type.
5. Preserve all essential clues specified in the plan.
6. Make misleading clues intentional and explainable.
7. Do not reveal the complete solution in the evidence.
8. Return only the requested structured evidence.
9. Do not generate executable code or HTML.
10. Treat all generated content as fictional.

Return evidence matching the required schema.
```

## 8.5 Solution Evaluation

Accusation evaluation must be deterministic.

Example:

```typescript
const isCorrect =
  selectedSuspectId === privateSolution.culpritId;
```

The actual implementation must validate that the submitted suspect ID belongs to the case and that the case has not already been completed.

Do not ask Gemini to independently choose the culprit at accusation time.

## 8.6 Final Explanation Prompt

The final explanation may use Gemini to turn verified case facts into readable storytelling.

The backend should supply:

- Actual culprit.
- Approved timeline.
- Verified essential clues.
- Established motive and method.
- Explanation of red herrings.
- User's accusation result.

The model must not invent new evidence or modify the authoritative solution.

If explanation generation fails, return a deterministic template-based explanation assembled from the stored solution and validated clues.

## 8.7 Model Configuration

Model names must be configurable through environment variables.

The implementation must:

- Use a currently supported Gemini model for text generation.
- Use structured output capabilities when supported.
- Respect provider rate limits.
- Handle quota exhaustion and unavailable models.
- Track model usage and errors.
- Avoid depending on undocumented API behavior.

---

# 9. Data Models

All database records must use stable identifiers, timestamps, and validated schemas.

## 9.1 Mystery Collection

```typescript
interface Mystery {
  _id: string;
  title: string;
  scenario: string;
  normalizedPremise: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  atmosphere: string;

  status:
    | "generating"
    | "validating"
    | "ready"
    | "failed"
    | "completed";

  promptVersion: string;
  generationVersion: string;

  suspectIds: string[];
  evidenceIds: string[];

  solutionId: string;
  timeline: TimelineEvent[];

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

The `Mystery` object above is an internal domain model. It is not a response DTO that may be returned directly to the browser. In particular, `solutionId` must remain private.

## 9.2 Suspect Model

```typescript
interface Suspect {
  _id: string;
  mysteryId: string;
  name: string;
  profile: string;
  role: string;
  motiveSummary: string;
  alibiSummary: string;
  portraitAssetId?: string;
}
```

The motive and alibi summaries must be written for the investigation experience and must not directly reveal the answer.

Detailed private facts about a suspect belong in the solution model, not the public suspect record.

## 9.3 Evidence Model

```typescript
type EvidenceType =
  | "chat"
  | "image"
  | "cctv"
  | "witness"
  | "document"
  | "timeline";

interface Evidence {
  _id: string;
  mysteryId: string;
  type: EvidenceType;
  title: string;
  description: string;

  occurredAt?: Date;
  createdAt: Date;

  publicContent: Record<string, unknown>;
  assetIds: string[];

  visibility: "public";
  status: "ready" | "partial";
}
```

Internal evidence-planning fields, clue answers, and hidden interpretations must be stored separately or filtered through a strict server-side response DTO.

## 9.4 Private Solution Model

```typescript
interface PrivateSolution {
  _id: string;
  mysteryId: string;
  culpritId: string;

  motive: string;
  method: string;
  actualTimeline: TimelineEvent[];

  essentialClueIds: string[];
  redHerringIds: string[];

  evidenceExplanations: Array<{
    evidenceId: string;
    explanation: string;
  }>;

  fullExplanation: string;
  createdAt: Date;
}
```

This collection must never be queried through a public endpoint that returns the document to the client.

## 9.5 Timeline Event

```typescript
interface TimelineEvent {
  id: string;
  occurredAt: string;
  description: string;
  involvedSuspectIds: string[];
  relatedEvidenceIds: string[];
}
```

Validate timestamp formats and chronological consistency before publication.

## 9.6 Accusation Model

```typescript
interface Accusation {
  _id: string;
  mysteryId: string;
  suspectId: string;
  isCorrect: boolean;
  submittedAt: Date;
  explanationVersion?: string;
}
```

For the MVP, the application must enforce one final accusation per playable mystery.

---

# 10. API Specification

All API routes must be versioned under `/api/v1`.

Use consistent JSON responses and appropriate HTTP status codes.

## 10.1 Create Mystery

**POST** `/api/v1/mysteries`

Request:

```json
{
  "scenario": "A diamond disappears from a locked hotel room.",
  "difficulty": "medium",
  "category": "theft",
  "atmosphere": "suspenseful"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "opaque-case-id",
    "status": "generating"
  }
}
```

The preferred implementation uses asynchronous generation. The server returns a case identifier and the frontend polls for readiness.

The case identifier must be unguessable or protected through an appropriate access-control mechanism.

## 10.2 Get Generation Status

**GET** `/api/v1/mysteries/:id/status`

Example response:

```json
{
  "success": true,
  "data": {
    "status": "ready",
    "progress": 100
  }
}
```

Progress is an approximate user-interface indicator. Do not imply precise completion percentages unless they correspond to defined pipeline stages.

## 10.3 Get Public Mystery

**GET** `/api/v1/mysteries/:id`

Returns:

- Case title.
- Public incident description.
- Difficulty.
- Public suspect profiles.
- Public timeline information.
- Game status.

Must not return:

- Culprit ID.
- Private solution.
- Hidden clue explanations.
- Internal prompt content.
- Model reasoning.
- Internal evidence-planning metadata.

## 10.4 Get Evidence List

**GET** `/api/v1/mysteries/:id/evidence`

Returns the evidence available to the investigator, including safe metadata and media references.

## 10.5 Get Evidence Details

**GET** `/api/v1/mysteries/:id/evidence/:evidenceId`

Returns the selected evidence item after validating that it belongs to the specified mystery.

## 10.6 Submit Accusation

**POST** `/api/v1/mysteries/:id/accusations`

Request:

```json
{
  "suspectId": "suspect-id"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "isCorrect": false,
    "completed": true,
    "resultId": "result-id"
  }
}
```

The response must not disclose the culprit or full solution until the accusation has been accepted and the case is completed.

## 10.7 Get Results

**GET** `/api/v1/mysteries/:id/result`

Available only after a valid accusation.

Returns:

- User's accusation.
- Correctness.
- Actual culprit.
- Verified solution explanation.
- Supporting clues.
- Timeline reconstruction.

## 10.8 Error Response Format

Use a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "MYSTERY_GENERATION_FAILED",
    "message": "Unable to generate this mystery. Please try again."
  }
}
```

Never return stack traces, API keys, private prompts, database credentials, or hidden solution details in errors.

## 10.9 Additional API Rules

- Validate all request bodies.
- Validate path parameters.
- Reject unknown or invalid fields where appropriate.
- Apply rate limiting to generation and accusation endpoints.
- Ensure evidence belongs to the requested mystery.
- Prevent repeated accusations from changing the final result.
- Return `404` for nonexistent or inaccessible resources where appropriate.
- Return `409` for conflicting state transitions.
- Return `429` when rate limits are exceeded.
- Use `500` or `503` for appropriate server or dependency failures.

---

# 11. Frontend Pages and UX

## Page 1: Landing Page

Purpose: Introduce the game and encourage the user to create a mystery.

Sections:

- Hero with a compelling detective-room visual.
- Short product description.
- Create Mystery button.
- How It Works section.
- Sample evidence preview.
- Example investigation card.
- Footer and fictional-content notice.

## Page 2: Create Mystery

Purpose: Capture the scenario and preferences.

Components:

- Scenario textarea.
- Difficulty selector.
- Category selector.
- Atmosphere selector.
- Generate Mystery button.
- Input validation messages.
- Generation progress view.

## Page 3: Mystery Generation

Purpose: Keep the user informed while the AI constructs the case.

Display meaningful stages such as:

1. Understanding the scenario.
2. Establishing the case.
3. Preparing suspects.
4. Creating evidence.
5. Checking consistency.
6. Preparing the investigation room.

The UI must reflect backend status. It must not claim that a stage has completed when it has not.

## Page 4: Investigation Room

Suggested desktop layout:

```text
┌──────────────────────────────────────────────────────┐
│ AI MYSTERY ROOM     CASE TITLE       CASE STATUS      │
├───────────────┬──────────────────────┬───────────────┤
│ SUSPECTS      │ EVIDENCE BOARD       │ CASE TIMELINE │
│               │                      │               │
│ Suspect A     │ Chats                │ Event 1       │
│ Suspect B     │ Images               │ Event 2       │
│ Suspect C     │ CCTV                 │ Event 3       │
│ Suspect D     │ Documents            │ Event 4       │
│               │                      │               │
├───────────────┴──────────────────────┴───────────────┤
│                 ACCUSE A SUSPECT                      │
└──────────────────────────────────────────────────────┘
```

On mobile, the three main areas should become tabs or stacked sections.

## Page 5: Evidence Viewer

Show the selected evidence in an accessible modal, side panel, or dedicated view.

The user must be able to return to the investigation room without losing progress.

## Page 6: Accusation Confirmation

Display the selected suspect and ask the user to confirm the final accusation.

Clearly explain that submitting the accusation completes the investigation.

## Page 7: Results

Show the outcome, reveal the solution, connect important evidence to the conclusion, and offer a new mystery.

## Visual Design Direction

Use a cinematic detective aesthetic rather than a generic administrative dashboard.

Recommended design:

- Dark charcoal or deep navy background.
- Warm amber or restrained red accents.
- Evidence cards with clear hierarchy.
- Subtle paper, dossier, or investigation-board textures.
- High-quality typography.
- Restrained motion and transitions.
- Clear contrast and accessible text sizes.
- Responsive layouts for desktop and mobile.

Do not sacrifice readability for atmosphere. Evidence must remain easy to inspect, compare, and navigate.

---

# 12. Recommended Project Structure

```text
ai-mystery-room/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── layout/
│       │   ├── evidence/
│       │   ├── suspects/
│       │   └── ui/
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── CreateMysteryPage.tsx
│       │   ├── InvestigationPage.tsx
│       │   └── ResultsPage.tsx
│       ├── hooks/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── App.tsx
│       └── main.tsx
│
├── server/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       ├── controllers/
│       ├── modules/
│       │   ├── mysteries/
│       │   ├── suspects/
│       │   ├── evidence/
│       │   ├── accusations/
│       │   ├── ai/
│       │   │   ├── providers/
│       │   │   ├── prompts/
│       │   │   ├── schemas/
│       │   │   └── orchestrator/
│       │   └── media/
│       ├── models/
│       ├── services/
│       ├── validators/
│       ├── utils/
│       ├── app.ts
│       └── server.ts
│
├── specs/
│   ├── SPEC.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATA_MODELS.md
│   ├── AI_PIPELINE.md
│   └── ACCEPTANCE_CRITERIA.md
│
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The exact filenames may change during implementation, but the separation of concerns must remain.

`specs/SPEC.md` is the canonical product specification. The other documents are supporting details and must not contradict it.

---

# 13. Error Handling and Edge Cases

The application must handle the following cases explicitly.

| Scenario                     | Required behavior                                                   |
| ---------------------------- | ------------------------------------------------------------------- |
| Empty scenario               | Reject input with a validation message.                             |
| Invalid preferences          | Reject the request before AI invocation.                            |
| Gemini timeout               | Retry within configured limits, then show a recoverable error.      |
| Invalid model output         | Validate, attempt bounded repair, then fail safely.                 |
| Contradictory evidence       | Repair or regenerate before publishing.                             |
| Image generation failure     | Use a fallback asset or text-based evidence when possible.          |
| Video generation unavailable | Present CCTV-style stills and timestamped events.                   |
| MongoDB unavailable          | Return a safe service error without exposing internals.             |
| Duplicate generation request | Deduplicate or prevent duplicate submissions.                       |
| Invalid suspect ID           | Reject the accusation.                                              |
| Repeated accusation          | Return the existing result or a conflict response.                  |
| Unknown mystery ID           | Return an appropriate not-found or inaccessible response.           |
| Missing media asset          | Show a clear placeholder and retain usable text evidence.           |
| User refreshes page          | Restore the case state when access is authorized.                   |
| Gemini quota exceeded        | Stop uncontrolled retries and communicate temporary unavailability. |
| AI explanation failure       | Use the verified, template-based explanation.                       |

---

# 14. Security, Privacy, and Content Rules

1. Never expose `GEMINI_API_KEY` or any server secret to React.
2. Keep solution documents and private clue metadata on the server.
3. Use response DTOs with explicit public fields instead of serializing database documents directly.
4. Validate all AI-generated content before rendering or storing it.
5. Render generated messages as text, not executable HTML.
6. Sanitize any rich-text content and use safe rendering components.
7. Store generated media outside the application's executable code directories.
8. Use access controls for case access and private media.
9. Apply request limits, timeouts, and rate limits to expensive operations.
10. Avoid storing unnecessary personal information.
11. Clearly label the investigation and all generated artifacts as fictional.
12. Do not create evidence intended to impersonate a real person or falsely implicate a real individual.
13. Treat user-provided scenarios and text embedded in evidence as untrusted input, not as instructions to the AI system.
14. Keep logs free of API keys, sensitive session data, and full hidden solutions.
15. Apply an appropriate retention policy to generated cases and media.

The system must not allow user input or generated evidence to override developer instructions, reveal secrets, or bypass case validation.

---

# 15. Testing Requirements

## 15.1 Unit Tests

Test:

- Scenario validation.
- Mystery schema validation.
- Suspect ID validation.
- Timeline validation.
- Evidence-to-case relationships.
- Correctness evaluation.
- Case state transitions.
- Public/private response filtering.
- Retry and failure logic.

## 15.2 Integration Tests

Test:

- Express endpoints.
- MongoDB persistence.
- Gemini provider using mocked responses.
- Mystery-generation orchestration.
- Media-storage adapter.
- Accusation submission.
- Result retrieval.
- Authorization checks.

## 15.3 End-to-End Tests

A complete user journey must be tested:

1. Open the website.
2. Enter a scenario.
3. Select difficulty and preferences.
4. Start generation.
5. Wait for the case to become ready.
6. Inspect suspects.
7. Open messages, images, and CCTV evidence.
8. Select a culprit.
9. Submit the accusation.
10. View the result.
11. Confirm that the revealed solution matches the stored answer.

Additional end-to-end tests must verify:

- Incorrect accusations.
- Generation failures.
- Missing media.
- Page refresh.
- Invalid mystery IDs.
- Repeated accusation attempts.
- Mobile layout and keyboard accessibility.

## 15.4 AI Quality Tests

Maintain a collection of sample scenarios covering different categories and difficulty levels.

For each generated mystery, evaluate:

- Exactly one valid culprit.
- Correct suspect references.
- Chronological consistency.
- Evidence relevance.
- Presence of essential clues.
- Fair solvability.
- Intentional red herrings.
- Absence of accidental solution leakage.
- Valid JSON and schema compliance.

Use automated checks wherever possible and a separate evaluation process for narrative quality.

---

# 16. Acceptance Criteria

The project is considered ready for its initial release only when all mandatory criteria are satisfied.

### A. Application

- [ ] Landing page is complete and responsive.
- [ ] Scenario form accepts valid input and rejects invalid input.
- [ ] User can create a mystery without manually specifying the culprit.
- [ ] Generation status is visible.
- [ ] Errors are handled without exposing technical secrets.

### B. AI Generation

- [ ] Gemini is called through the backend.
- [ ] A structured mystery blueprint is generated.
- [ ] Three to five suspects are created.
- [ ] A single authoritative culprit is stored.
- [ ] Evidence is generated from the established blueprint.
- [ ] Validation catches invalid or contradictory cases.
- [ ] Only validated cases become playable.

### C. Evidence

- [ ] Fictional chat evidence is viewable.
- [ ] Image evidence is viewable or has a usable fallback.
- [ ] CCTV-style evidence includes timestamped events.
- [ ] Evidence details remain consistent with the case.
- [ ] Evidence can be opened in any order.
- [ ] Hidden explanations are not exposed before accusation.

### D. Investigation

- [ ] Suspects can be inspected.
- [ ] Evidence can be examined.
- [ ] The user can select one suspect.
- [ ] The backend validates and evaluates the accusation.
- [ ] Repeated accusations cannot change the result.

### E. Solution

- [ ] Correct and incorrect accusations are handled correctly.
- [ ] The actual culprit is revealed after completion.
- [ ] The explanation uses the stored solution.
- [ ] The explanation references real evidence IDs or verified evidence facts.
- [ ] A failed AI explanation falls back to a deterministic explanation.

### F. Security and Quality

- [ ] No Gemini API key is exposed to the browser.
- [ ] Public APIs never return the hidden solution prematurely.
- [ ] Input and output schemas are validated.
- [ ] Essential backend services have automated tests.
- [ ] Setup and deployment instructions are documented.
- [ ] No placeholder or fake functionality is presented as a completed feature.

---

# 17. Development Phases

## Phase 1 — Foundation

- Initialize the MERN project.
- Configure TypeScript.
- Set up the React application.
- Set up Express and MongoDB.
- Establish environment configuration.
- Implement shared data contracts.
- Build the landing page and scenario form.

**Deliverable:** Running application foundation.

## Phase 2 — Core AI Mystery Engine

- Integrate Gemini.
- Create prompts and schemas.
- Generate the private case blueprint.
- Generate suspects and timeline.
- Implement validation and bounded repair.
- Store cases in MongoDB.

**Deliverable:** A consistent mystery generated from a user scenario.

## Phase 3 — Evidence System

- Generate structured chat evidence.
- Build evidence cards and detail viewers.
- Integrate image generation where supported.
- Implement CCTV-style stills and event logs.
- Store media references.
- Validate evidence relationships.

**Deliverable:** An interactive investigation with multiple evidence types.

## Phase 4 — Investigation and Results

- Build the investigation room.
- Add suspect profiles and timeline navigation.
- Implement accusation submission.
- Store the final result.
- Reveal the solution.
- Generate or assemble the final explanation.

**Deliverable:** Complete end-to-end gameplay.

## Phase 5 — Reliability and Security

- Add rate limiting.
- Add request validation and authorization.
- Test failure scenarios.
- Prevent solution leakage.
- Add automated tests.
- Improve accessibility and responsiveness.

**Deliverable:** Tested MVP.

## Phase 6 — Deployment

- Deploy the frontend.
- Deploy the backend.
- Configure MongoDB and media storage.
- Set production environment variables.
- Verify HTTPS and CORS.
- Test real Gemini calls.
- Document setup, operations, and limitations.

**Deliverable:** A functioning deployed application.

---

# 18. Future Scope

The following are not mandatory for the initial release.

- Actual AI-generated CCTV video.
- Voice-based interrogation of suspects.
- AI-generated voice recordings.
- Interactive suspect interviews.
- Dynamic hints based on investigation progress.
- Multiple accusations and scoring modes.
- User accounts and saved case libraries.
- Shareable mystery challenges.
- Multiplayer collaborative investigations.
- Competitive detective leaderboards.
- Procedurally generated difficulty.
- AI-generated case cover artwork.
- Advanced evidence-board connections.
- Mystery creation from uploaded documents or images.
- Additional AI providers through a provider abstraction layer.

Future additions must preserve the established security and consistency rules.

---

# 19. Codex Implementation Rules

This section defines how Codex must use the specification.

## 19.1 Source-of-Truth Rules

1. Treat `specs/SPEC.md` as the canonical product specification.
2. Read the relevant specification before implementing any feature.
3. Do not silently change requirements, API contracts, data models, or core user flows.
4. If a technical detail is unspecified, choose the simplest maintainable solution consistent with this specification.
5. Record important technical decisions in a separate architecture decision document.
6. If two requirements conflict, prioritize security and data integrity, then the explicit product requirements; document the conflict rather than silently inventing a new product behavior.
7. Update the specification when an approved change modifies intended behavior.
8. Never treat a generated implementation as more authoritative than the approved specification.

## 19.2 Development Rules

- Implement features in the documented phases.
- Build vertical slices that can be tested end to end.
- Use TypeScript and runtime validation for external data.
- Keep controllers thin and business logic in services.
- Keep AI prompts separate from route handlers.
- Never call Gemini directly from the frontend.
- Never expose the private solution through public response objects.
- Avoid unnecessary dependencies.
- Do not create placeholder APIs that return hardcoded success responses.
- Do not claim image or video generation works unless the provider integration has been implemented and tested.
- Use mocked AI responses in automated tests.
- Keep real API credentials out of source control.
- Run relevant tests and type checks after changes.
- Document setup instructions and any remaining limitations.

## 19.3 Completion Rules

A feature is not complete merely because its UI exists.

A feature is complete only when:

- Its backend behavior is implemented where required.
- Its data contracts are defined.
- Input and output validation exist.
- Errors are handled.
- Relevant tests pass.
- Security requirements are satisfied.
- Its acceptance criteria are met.

## 19.4 Before Each Coding Task

Codex should:

1. Identify the relevant functional requirements.
2. Review the relevant data models and API contracts.
3. Identify security and consistency implications.
4. Implement the smallest complete feature.
5. Run relevant tests, linting, and type checks.
6. Report what changed and which requirements were satisfied.
7. Record unresolved issues rather than claiming full completion.

---

# 20. Definition of Done

AI Mystery Room is ready for its first MVP release when a user can enter a short fictional scenario and complete a fully functioning investigation generated from it.

The investigation must include:

- A coherent story.
- Three to five suspects.
- A privately stored true solution.
- Multiple relevant evidence types.
- A usable investigation interface.
- A validated accusation workflow.
- A correct result and solution reveal.
- Secure Gemini integration.
- Persistent case data.
- Graceful handling of AI and media failures.

The experience must be genuinely scenario-driven. It must not simply display a predefined mystery while pretending that AI generated it.

**Final product principle:** AI creates the mystery, the backend preserves the truth, evidence supports the investigation, and the user solves the case.

---

# 21. Instructions for Initial Codex Execution

Codex must first inspect the repository and compare its current state with this specification.

It must then:

1. Create `specs/SPEC.md` containing this approved specification.
2. Create the supporting architecture, API, data-model, AI-pipeline, and acceptance-criteria documents.
3. Establish the MERN project structure and environment configuration.
4. Implement the foundation phase.
5. Verify the foundation with tests and document the results.
6. Proceed through the remaining phases without skipping required security or validation work.
7. Ask for clarification only when a genuine blocking ambiguity cannot be resolved safely from the specification.

Do not attempt to implement the entire product as an untested, single-step code dump.

**The canonical specification governs product behavior.** Implementation details may evolve, but any change affecting functionality, data contracts, security, or acceptance criteria must be documented and reconciled with the specification.
