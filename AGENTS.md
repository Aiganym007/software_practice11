# Smart Campus Room Availability Checker — Agent Instructions

This file is the instruction file for AI agents working on this repository. All project rules below are binding. Where this file and README.md overlap, keep them consistent; do not edit README.md as part of agent tasks unless explicitly approved.

## 1. Project Purpose and Scope

Smart Campus Room Availability Checker is a web application that lets students check whether Room A101 is available for a requested time interval. The project is an educational prototype for Software Engineering coursework.

- Supports one room: Room A101.
- Uses fictional booking data only, stored in the frontend.
- Provides availability checking only.
- Does not create or confirm actual bookings.
- Demonstrates reliable time validation, booking conflict detection, automated testing and a responsive user interface.

## 2. Project Architecture

| File | Responsibility |
|---|---|
| `src/main.tsx` | Application entry point; mounts the React application. |
| `src/App.tsx` | Entire user interface: checker card, time inputs, decision panel, bookings list, and the "Explain Availability" section. |
| `src/types.ts` | Shared types: `Room`, `Booking`, `AvailabilityResult`, `Decision`. |
| `src/data.ts` | Fictional fixture data: one room (`ROOM`, Room A101) and two existing bookings (`INITIAL_BOOKINGS`). |
| `src/availability.ts` | Deterministic availability rules and time helpers, including `formatDurationLabel()`. Sole source of truth for availability decisions. |
| `src/availability.test.ts` | Automated tests for the availability rules and time helpers. |
| `src/mockExplainer.ts` | Mock (non-AI) explanation adapter that restates a checker result in student-friendly wording. It never decides or modifies availability and never calls external APIs. |
| `src/mockExplainer.test.ts` | Automated tests for the explanation adapter, including input validation and fallback behavior. |

Relationships: `App.tsx` uses `data.ts`, `availability.ts` and `mockExplainer.ts`. The explainer consumes an `AvailabilityResult` produced by `availability.ts`; the explanation is presentation only and is always kept separate from the availability decision.

## 3. Setup Instructions

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## 4. Safe Development and Verification Commands

These are the actual commands that exist in this project. Do not invent other package scripts.

| Command | Purpose |
|---|---|
| `npx vitest run` | Run the full automated test suite (Vitest). |
| `npm run build` | Production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Check TypeScript types. |

## 5. Coding Conventions

- Use TypeScript and follow the existing project conventions.
- Keep functions small and focused.
- Separate UI and business logic (availability logic stays in `src/availability.ts`; the explainer stays separate from the decision).
- Avoid unnecessary abstractions and design patterns; do not introduce Adapter or Strategy patterns unless a genuine requirement justifies them.
- Preserve existing interfaces unless a change is justified.
- Avoid duplicated validation logic; reuse the existing helpers.
- Do not mutate shared fixture data in `src/data.ts`.

## 6. Testing Expectations

- Add targeted tests for changed behavior.
- Add regression tests where appropriate.
- Run the full test suite after changes: `npx vitest run`.
- Run build, lint and typecheck after changes.
- Report actual command output.
- Never claim that a test passed unless it was actually executed.
- Do not delete or weaken existing tests to make checks pass.

## 7. Acceptance Criteria

Reproduced accurately from README.md. Do not invent or silently change these definitions.

- **AC1 – Time Validation:** Requested intervals must use valid integer minutes within the day, and the start time must be in the future.
- **AC2 – Maximum Duration:** The requested interval cannot exceed 120 minutes.
- **AC3 – Blocked Room:** A blocked room must be rejected.
- **AC4 – Booking Conflicts:** Requests overlapping existing bookings must be rejected. Endpoint-touching intervals are allowed.
- **AC5 – Data Preservation:** Availability checks must not modify existing booking data.
- **AC6 – User Interface:** The application must provide clear validation feedback and support desktop and mobile layouts.

The optional "Explain Availability" feature adds an explanation layer on top of the deterministic decision. The adapter restates results but never decides, modifies or creates availability, bookings or reservations.

## 8. Agent Permissions

Agents working in this repository may:

- Read and inspect repository files.
- Perform read-only analysis (inspections, reviews, baseline reports).
- Propose focused changes.
- Modify only files within an explicitly approved task scope.
- Add targeted tests when authorized.

## 9. Security and Forbidden Actions

Agents must never:

- Read, expose or commit secrets, credentials or environment variable values.
- Deploy the application to production.
- Run destructive commands or delete project data.
- Add, remove or update dependencies without explicit human approval.
- Make unapproved application scope changes.
- Modify or delete baseline evidence without approval.
- Weaken or delete existing tests to make checks pass.
- Introduce a backend, authentication, databases or real booking functionality without approval.

## 10. Human Review

All AI-generated changes require human approval before they are accepted. For every proposed modification, the agent must:

- Explain the modification.
- Show the relevant diff.
- Report test and verification results (actually executed).
- Identify remaining risks.
- Wait for human approval before taking further actions outside the approved scope.

## 11. Baseline Protection

The original baseline of the project must remain available for comparison with the final version. Do not overwrite, delete or rewrite baseline artifacts (reports, fixtures, recorded evidence) without approval.

## 12. Instruction File Discovery

This file must keep the required filename `AGENTS.md` at the repository root. Do not create a duplicate `agents.md` file. Note: automatic loading of uppercase `AGENTS.md` by the hosting environment has not been verified; refer to this file explicitly in task instructions when in doubt.
