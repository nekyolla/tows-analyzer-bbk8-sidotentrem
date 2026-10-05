import { describe, it, expect } from 'vitest';
import {
  round2,
  getWeightedScore,
  calcExternalTotals,
  calcInternalTotals,
  getQuadrant,
  autoMatchQuantitative,
  validateQuantitativeRanges,
  hasInvalidQuantitativeRanges,
  matchObservation,
  isCalculationReady,
} from './calculations';
import { getVariableIssues, hasScaleDefined } from './validators';
import { formatSigned } from './format';

const SCORES = [-3, -1, 1, 3];

function scales(ranges) {
  return SCORES.map((score, i) => ({
    level: i + 1,
    score,
    description: '',
    rangeMin: ranges?.[i]?.[0] ?? null,
    rangeMax: ranges?.[i]?.[1] ?? null,
  }));
}

function variable(overrides = {}) {
  return {
    id: overrides.id ?? 'v1',
    name: 'Var',
    description: '',
    weight: 100,
    scaleType: 'qualitative',
    scales: scales().map((s, i) => ({ ...s, description: i === 0 || i === 3 ? `L${i + 1}` : '' })),
    observation: '',
    matchedLevel: 4,
    ...overrides,
  };
}

function readyState({ external, internal } = {}) {
  return {
    external: { variables: external ?? [variable()] },
    internal: {
      categories: [
        { id: 'man', name: 'Man', weight: 100, variables: internal ?? [variable({ id: 'v2' })] },
      ],
    },
  };
}

describe('rounding (bug 1)', () => {
  it('round2 strips floating-point noise', () => {
    expect(round2(1.1 * 3)).toBe(3.3);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });

  it('getWeightedScore returns clean values', () => {
    expect(getWeightedScore(1.1, 3)).toBe(3.3);
    expect(getWeightedScore(0.1, 3)).toBe(0.3);
    expect(getWeightedScore(12, null)).toBeNull();
  });

  it('totals are free of floating-point noise', () => {
    const ext = calcExternalTotals([
      variable({ weight: 0.1, matchedLevel: 4 }),
      variable({ weight: 0.2, matchedLevel: 4 }),
      variable({ weight: 99.7, matchedLevel: 1 }),
    ]);
    expect(ext.O).toBe(0.9);
    expect(ext.T).toBe(-299.1);
    expect(ext.ETOP).toBe(-298.2);

    const int = calcInternalTotals([
      { variables: [variable({ weight: 1.1, matchedLevel: 4 }), variable({ weight: 2.2, matchedLevel: 4 })] },
    ]);
    expect(int.S).toBe(9.9);
    expect(int.SAP).toBe(9.9);
  });

  it('formatSigned adds + only for positive values', () => {
    expect(formatSigned(3.3)).toBe('+3.3');
    expect(formatSigned(-1.5)).toBe('-1.5');
    expect(formatSigned(0)).toBe('0');
  });
});

describe('getQuadrant', () => {
  it('maps signs to quadrants, treating 0 as positive', () => {
    expect(getQuadrant(1, 1)).toBe('SO');
    expect(getQuadrant(-1, 1)).toBe('WO');
    expect(getQuadrant(-1, -1)).toBe('WT');
    expect(getQuadrant(1, -1)).toBe('ST');
    expect(getQuadrant(0, 0)).toBe('SO');
    expect(getQuadrant(0, -1)).toBe('ST');
  });
});

describe('quantitative matching', () => {
  const s = scales([[0, 10], [10, 20], [20, 30], [30, 40]]);

  it('auto-matches a value to its range; boundary goes to the lower level number', () => {
    expect(autoMatchQuantitative(15, s)).toBe(2);
    expect(autoMatchQuantitative(10, s)).toBe(1);
    expect(autoMatchQuantitative(50, s)).toBeNull();
  });

  it('matchObservation handles empty and non-numeric input', () => {
    expect(matchObservation('15', s)).toBe(2);
    expect(matchObservation('', s)).toBeNull();
    expect(matchObservation('abc', s)).toBeNull();
  });
});

describe('validateQuantitativeRanges (bug 3)', () => {
  it('accepts contiguous and touching ranges', () => {
    const r = validateQuantitativeRanges(scales([[0, 10], [10, 20], [20, 30], [30, 40]]));
    expect(r).toEqual({ valid: true, errors: [], warnings: [] });
  });

  it('accepts descending ranges (lower value is better)', () => {
    const r = validateQuantitativeRanges(scales([[30, 40], [20, 30], [10, 20], [0, 10]]));
    expect(r.valid).toBe(true);
  });

  it('reports overlaps as errors using the real level numbers', () => {
    const r = validateQuantitativeRanges(scales([[30, 40], [20, 30], [5, 25], [0, 10]]));
    expect(r.valid).toBe(false);
    expect(r.errors).toContain('Overlap ditemukan antara range level 4 dan 3');
    expect(r.errors).toContain('Overlap ditemukan antara range level 3 dan 2');
  });

  it('reports min > max as an error', () => {
    const r = validateQuantitativeRanges(scales([[10, 0], [10, 20], [20, 30], [30, 40]]));
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toMatch(/Level 1/);
  });

  it('reports gaps as non-blocking warnings', () => {
    const r = validateQuantitativeRanges(scales([[0, 10], [11, 20], [21, 30], [31, 40]]));
    expect(r.valid).toBe(true);
    expect(r.warnings).toHaveLength(3);
  });

  it('hasInvalidQuantitativeRanges ignores incomplete and qualitative scales', () => {
    expect(hasInvalidQuantitativeRanges(variable())).toBe(false);
    expect(hasInvalidQuantitativeRanges(variable({ scaleType: 'quantitative', scales: scales() }))).toBe(false);
    expect(
      hasInvalidQuantitativeRanges(
        variable({ scaleType: 'quantitative', scales: scales([[0, 20], [10, 30], [30, 40], [40, 50]]) })
      )
    ).toBe(true);
  });
});

describe('isCalculationReady', () => {
  it('is ready for a complete, valid state', () => {
    expect(isCalculationReady(readyState())).toEqual({ ready: true, reasons: [] });
  });

  it('blocks when a quantitative variable has overlapping ranges (bug 3)', () => {
    const bad = variable({
      name: 'Omzet',
      scaleType: 'quantitative',
      scales: scales([[0, 20], [10, 30], [30, 40], [40, 50]]),
      observation: '5',
      matchedLevel: 1,
    });
    const result = isCalculationReady(readyState({ external: [bad] }));
    expect(result.ready).toBe(false);
    expect(result.reasons).toContain('Range skala "Omzet" tidak valid (overlap / min > max)');
  });
});

describe('validators', () => {
  it('qualitative scale requires level 1 and 4 descriptions', () => {
    const onlyLevel1 = variable({ scales: scales().map((s, i) => ({ ...s, description: i === 0 ? 'x' : '' })) });
    expect(hasScaleDefined(onlyLevel1)).toBe(false);
    expect(hasScaleDefined(variable())).toBe(true);
  });

  it('flags invalid quantitative ranges on the variable', () => {
    const v = variable({ scaleType: 'quantitative', scales: scales([[0, 20], [10, 30], [30, 40], [40, 50]]) });
    expect(getVariableIssues(v).issues).toContain('Range skala tidak valid');
  });
});
