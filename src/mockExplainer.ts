import type { AvailabilityResult } from './types';
import { minutesToTime } from "./availability";

/**
 * Mock LLM adapter for the "Explain Availability" feature.
 *
 * This is NOT a real LLM and is NOT connected to any external AI API. It
 * deterministically composes a short, student-friendly explanation from the
 * structured data produced by the deterministic checker in availability.ts,
 * which remains the only source of truth for availability decisions.
 */

export interface ExplainAvailabilityInput {
  roomLabel: string;
  /** Requested start time, minutes after midnight (from the checker inputs). */
  start: number;
  /** Requested end time, minutes after midnight (from the checker inputs). */
  end: number;
  /** The deterministic availability result being explained. */
  result: AvailabilityResult;
}

export interface ExplainAvailabilityResponse {
  explanation: string;
}

const MAX_INPUT_LENGTH = 500;
const MAX_EXPLANATION_LENGTH = 600;
const MAX_REASON_COUNT = 10;
const MAX_TOTAL_REASONS_LENGTH = 1000;

function isValidInput(input: unknown): input is ExplainAvailabilityInput {
  if (typeof input !== 'object' || input === null) return false;
  const i = input as Record<string, unknown>;
  if (typeof i.roomLabel !== 'string' || i.roomLabel.trim().length === 0) return false;
  if (!Number.isInteger(i.start) || !Number.isInteger(i.end)) return false;
  const r = i.result;
  if (typeof r !== 'object' || r === null) return false;
  const rr = r as Record<string, unknown>;
  if (typeof rr.available !== 'boolean') return false;
  if (!Array.isArray(rr.reasons) || rr.reasons.some((x) => typeof x !== 'string')) return false;
  if (i.roomLabel.length > MAX_INPUT_LENGTH) return false;
  if (rr.reasons.some((x) => (x as string).length > MAX_INPUT_LENGTH)) return false;
  if (rr.reasons.length > MAX_REASON_COUNT) return false;
  const totalReasonsLength = (rr.reasons as string[]).reduce((sum, x) => sum + x.length, 0);
  if (totalReasonsLength > MAX_TOTAL_REASONS_LENGTH) return false;
  return true;
}

function isValidResponse(res: unknown): res is ExplainAvailabilityResponse {
  if (typeof res !== 'object' || res === null) return false;
  const r = res as Record<string, unknown>;
  if (typeof r.explanation !== 'string') return false;
  const text = r.explanation.trim();
  return text.length > 0 && text.length <= MAX_EXPLANATION_LENGTH;
}

function formatClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Builds the mock "LLM" reply. It only restates facts contained in the
 * supplied structured data — it never invents bookings, availability
 * changes, or any other claims.
 */
function composeExplanation(input: ExplainAvailabilityInput): ExplainAvailabilityResponse {
  const { roomLabel, start, end, result } = input;
  const window = `${minutesToTime(start)}–${minutesToTime(end)}`;

  let explanation: string;
  if (result.available) {
    explanation =
      `Based on the availability check, ${roomLabel} has no conflicting bookings ` +
      `for ${window}, so this time slot appears to be free. ` +
      `This is an explanation only — no booking or reservation has been created or confirmed.`;
  } else {
    const reasonText = result.reasons.length > 0 ? result.reasons.join(' ') : '';
    explanation =
      `Based on the availability check, ${roomLabel} is not available for ${window}. ` +
      (reasonText ? `The check reported: ${reasonText} ` : '') +
      `This is an explanation only — no booking or reservation has been created or confirmed.`;
  }

  return { explanation: explanation.trim() };
}

/**
 * Deterministic fallback used when the adapter fails or returns an invalid
 * response. It repeats the checker's own result verbatim and adds nothing.
 */
export function fallbackExplanation(input: ExplainAvailabilityInput): string {
  if (input.result.available) {
    return `The availability check found no problems for this time slot. No booking has been created.`;
  }
  const reasonText =
    input.result.reasons.length > 0
      ? ` The check reported: ${input.result.reasons.join(' ')}`
      : '';
  return `The availability check could not confirm this time slot.${reasonText} No booking has been created.`;
}

/**
 * Mock adapter entry point. Synchronously validates input, composes an
 * explanation strictly from the supplied data, and validates its own output.
 * Throws on invalid input so callers can apply the fallback.
 */
export function explainAvailability(
  input: ExplainAvailabilityInput
): ExplainAvailabilityResponse {
  if (!isValidInput(input)) {
    throw new Error('explainAvailability: invalid input');
  }

  const response = composeExplanation(input);

  if (!isValidResponse(response)) {
    throw new Error('explainAvailability: invalid response');
  }

  return response;
}
