import { describe, it, expect } from 'vitest';
import {
  explainAvailability,
  fallbackExplanation,
} from './mockExplainer';
import type { ExplainAvailabilityInput } from './mockExplainer';
import type { AvailabilityResult } from './types';

function makeInput(overrides: Partial<ExplainAvailabilityInput> = {}): ExplainAvailabilityInput {
  const result: AvailabilityResult = { available: true, reasons: [] };
  return {
    roomLabel: 'Room A101',
    start: 540,
    end: 600,
    result,
    ...overrides,
  };
}

describe('explainAvailability (mock adapter)', () => {
  it('explains an available result', () => {
    const { explanation } = explainAvailability(makeInput());
    expect(explanation).toContain('Room A101');
    expect(explanation).toContain('09:00–10:00');
    expect(explanation).toContain('free');
    expect(explanation).toContain('no booking or reservation has been created');
  });

  it('explains an unavailable result using the checker reasons', () => {
    const input = makeInput({
      result: { available: false, reasons: ['This room is currently blocked and cannot be booked.'] },
    });
    const { explanation } = explainAvailability(input);
    expect(explanation).toContain('not available');
    expect(explanation).toContain('blocked');
  });

  it('restates facts but never invents a confirmation', () => {
    const { explanation } = explainAvailability(
      makeInput({ result: { available: true, reasons: [] } })
    );
    expect(explanation.toLowerCase()).not.toMatch(/reserved for you|booked for you|has been booked/);
    expect(explanation.toLowerCase()).toContain('no booking or reservation has been created or confirmed');
  });

  it('rejects empty room label', () => {
    expect(() => explainAvailability(makeInput({ roomLabel: '' }))).toThrow();
    expect(() => explainAvailability(makeInput({ roomLabel: '   ' }))).toThrow();
  });

  it('rejects non-integer or missing times', () => {
    expect(() =>
      explainAvailability(makeInput({ start: 540.5 } as Partial<ExplainAvailabilityInput> as ExplainAvailabilityInput))
    ).toThrow();
    expect(() =>
      explainAvailability(
        makeInput({ start: Number.NaN, end: 600 } as unknown as ExplainAvailabilityInput)
      )
    ).toThrow();
  });

  it('rejects malformed result objects', () => {
    expect(() =>
      explainAvailability(
        makeInput({ result: { available: 'yes', reasons: [] } } as unknown as ExplainAvailabilityInput)
      )
    ).toThrow();
    expect(() =>
      explainAvailability(
        makeInput({ result: { available: true, reasons: 'none' } } as unknown as ExplainAvailabilityInput)
      )
    ).toThrow();
  });

  it('rejects overly long input', () => {
    const longLabel = 'x'.repeat(600);
    expect(() => explainAvailability(makeInput({ roomLabel: longLabel }))).toThrow();
  });

  it('accepts normal reason input', () => {
    const reasons = [
      'The room is blocked for maintenance.',
      'The requested interval overlaps an existing booking.',
    ];
    const { explanation } = explainAvailability(
      makeInput({ result: { available: false, reasons } })
    );
    expect(explanation).toContain('blocked for maintenance');
    expect(explanation).toContain('overlaps an existing booking');
  });

  it('rejects an excessive number of reasons', () => {
    const reasons = Array.from({ length: 11 }, () => 'Some reason.');
    expect(() =>
      explainAvailability(makeInput({ result: { available: false, reasons } }))
    ).toThrow();
  });

  it('rejects reasons whose combined length is excessive', () => {
    const reasons = Array.from({ length: 10 }, () => 'y'.repeat(150));
    expect(() =>
      explainAvailability(makeInput({ result: { available: false, reasons } }))
    ).toThrow();
  });

  it('accepts reason content within the combined length limit', () => {
    const reasons = Array.from({ length: 10 }, () => 'z'.repeat(40));
    expect(() =>
      explainAvailability(makeInput({ result: { available: false, reasons } }))
    ).not.toThrow();
  });

  it('rejects null or non-object input', () => {
    expect(() => explainAvailability(null as unknown as ExplainAvailabilityInput)).toThrow();
    expect(() => explainAvailability(undefined as unknown as ExplainAvailabilityInput)).toThrow();
    expect(() => explainAvailability('free!' as unknown as ExplainAvailabilityInput)).toThrow();
  });
});

describe('fallbackExplanation', () => {
  it('falls back to a safe available-result message', () => {
    const msg = fallbackExplanation(makeInput());
    expect(msg).toContain('availability check');
    expect(msg).toContain('No booking has been created');
  });

  it('falls back to the checker reasons on failure', () => {
    const msg = fallbackExplanation(
      makeInput({
        result: { available: false, reasons: ['Booking cannot be longer than 120 minutes.'] },
      })
    );
    expect(msg).toContain('120 minutes');
    expect(msg).toContain('No booking has been created');
  });
});
