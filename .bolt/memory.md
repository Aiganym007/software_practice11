# Project memory

## Product intent & audience

- App: **Smart Campus Room Availability Checker**
- Audience: students checking campus room availability
- Task #03 added optional "Explain Availability" feature: a mock (non-real) LLM adapter that restates the deterministic checker's result in student-friendly wording

## Brand personality & voice

- Explanations are concise, plain-language, student-friendly
- Honest labeling: AI-generated/mock content is clearly marked and disclaimed as not a confirmed booking or reservation

## Visual design & UX direction

- React + Tailwind CSS + Lucide React icons (per `.bolt/prompt` global instructions)
- Existing responsive UI design preserved; new "Explain Availability" button and labeled explanation box rendered inside the existing result panel without changing the deterministic verdict/reasons display
- Resetting or re-checking clears the explanation
- Fallback explanation shown on adapter failure, with "AI explanation unavailable" note

## Decisions, constraints & rationale

- Deterministic `checkAvailability` is the ONLY source of truth; adapter never decides or modifies availability
- Existing booking data and overlap logic untouched; no real AI API, no keys/secrets, no auth, no DB, no booking creation
- Path alias `@/` → `src/` used for imports
- Adapter location: `src/mockExplainer.ts`; tests in `src/mockExplainer.test.ts`
- Adapter input: room label, requested start/end times, checker result `{ available: boolean; reasons: string[] }`
- Adapter output: `{ explanation: string }`
- Validation: reject empty/malformed input, non-integer/NaN times, malformed result objects, input >500 chars; reject empty or output >600 chars; no invented booking details
- Fallback: on any adapter failure or invalid response, UI shows safe fallback built only from deterministic result

## Open questions & assumptions

- No browser preview available; UI/explanation layout verified via code inspection only
- Input length caps (500/600 chars) are current reasonable defaults; may need tuning if inputs grow
- No known remaining issues after Task #03; test suite: 44/44 passing; production build succeeds