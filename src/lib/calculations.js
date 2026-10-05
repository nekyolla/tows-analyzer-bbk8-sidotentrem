import { WEIGHT_TOLERANCE, SCALE_SCORES } from './constants';

/**
 * Round to 2 decimals to strip floating-point noise (e.g. 1.1 × 3 = 3.3000000000000003)
 * @param {number} n
 * @returns {number}
 */
export function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Get score from matched level (1-4)
 * @param {number|null} matchedLevel - 1, 2, 3, or 4
 * @returns {number|null} -3, -1, +1, or +3
 */
export function getScore(matchedLevel) {
  if (matchedLevel == null || matchedLevel < 1 || matchedLevel > 4) return null;
  return SCALE_SCORES[matchedLevel - 1];
}

/**
 * Calculate weighted score: Weight × Score
 * Weight is raw percentage number (e.g. 12 for 12%, NOT 0.12)
 * @param {number} weight - raw percentage (e.g. 12)
 * @param {number|null} score - -3, -1, +1, or +3
 * @returns {number|null}
 */
export function getWeightedScore(weight, score) {
  if (score == null || weight == null) return null;
  return round2(weight * score);
}

/**
 * Calculate external totals (ETOP)
 * @param {Array} variables - external variables with matchedLevel and weight
 * @returns {{ O: number, T: number, ETOP: number, complete: boolean }}
 */
export function calcExternalTotals(variables) {
  let O = 0;
  let T = 0;
  let complete = true;

  for (const v of variables) {
    const score = getScore(v.matchedLevel);
    if (score == null) {
      complete = false;
      continue;
    }
    const ws = getWeightedScore(v.weight, score);
    if (ws > 0) O += ws;
    else if (ws < 0) T += ws;
  }

  return { O: round2(O), T: round2(T), ETOP: round2(O + T), complete };
}

/**
 * Calculate internal totals (SAP)
 * @param {Array} categories - internal categories, each with variables
 * @returns {{ S: number, W: number, SAP: number, complete: boolean }}
 */
export function calcInternalTotals(categories) {
  let S = 0;
  let W = 0;
  let complete = true;

  for (const cat of categories) {
    for (const v of cat.variables) {
      const score = getScore(v.matchedLevel);
      if (score == null) {
        complete = false;
        continue;
      }
      const ws = getWeightedScore(v.weight, score);
      if (ws > 0) S += ws;
      else if (ws < 0) W += ws;
    }
  }

  return { S: round2(S), W: round2(W), SAP: round2(S + W), complete };
}

/**
 * Determine quadrant from SAP and ETOP values
 * Boundary rule: 0 is treated as non-negative (≥0 = positive side)
 * @param {number} SAP
 * @param {number} ETOP
 * @returns {string} "SO" | "WO" | "WT" | "ST"
 */
export function getQuadrant(SAP, ETOP) {
  if (SAP >= 0 && ETOP >= 0) return 'SO';
  if (SAP < 0 && ETOP >= 0) return 'WO';
  if (SAP < 0 && ETOP < 0) return 'WT';
  return 'ST';
}

/**
 * Check if position is on a boundary (axis)
 * @param {number} SAP
 * @param {number} ETOP
 * @returns {{ sapZero: boolean, etopZero: boolean }}
 */
export function isOnBoundary(SAP, ETOP) {
  return {
    sapZero: SAP === 0,
    etopZero: ETOP === 0,
  };
}

/**
 * Validate that weights sum to target within tolerance
 * @param {number} total - actual sum
 * @param {number} target - expected sum (default 100)
 * @returns {boolean}
 */
export function isWeightValid(total, target = 100) {
  return Math.abs(total - target) <= WEIGHT_TOLERANCE;
}

/**
 * Validate external variable weights (flat sum = 100%)
 * @param {Array} variables
 * @returns {{ total: number, isValid: boolean }}
 */
export function validateExternalWeights(variables) {
  const total = variables.reduce((sum, v) => sum + (v.weight || 0), 0);
  return { total: round2(total), isValid: isWeightValid(total) };
}

/**
 * Validate category weights (variables within category sum to category weight)
 * @param {object} category - category with weight and variables
 * @returns {{ total: number, target: number, isValid: boolean }}
 */
export function validateCategoryWeights(category) {
  const total = category.variables.reduce((sum, v) => sum + (v.weight || 0), 0);
  const target = category.weight || 0;
  // If category has 0 weight and 0 variables, it's valid
  if (target === 0 && category.variables.length === 0) {
    return { total: 0, target: 0, isValid: true };
  }
  return {
    total: round2(total),
    target,
    isValid: isWeightValid(total, target),
  };
}

/**
 * Validate internal grand total (all category weights sum to 100%)
 * @param {Array} categories
 * @returns {{ total: number, isValid: boolean }}
 */
export function validateInternalGrandTotal(categories) {
  const total = categories.reduce((sum, c) => sum + (c.weight || 0), 0);
  return { total: round2(total), isValid: isWeightValid(total) };
}

/**
 * Check if all variables in a list have completed observations
 * @param {Array} variables
 * @returns {boolean}
 */
export function allObservationsComplete(variables) {
  return variables.length > 0 && variables.every((v) => v.matchedLevel != null);
}

/**
 * Check if the entire calculation is ready to produce results
 * Requirements:
 * - At least 1 external variable
 * - At least 1 internal variable (across all categories)
 * - External weights valid (sum = 100%)
 * - All internal category weights valid
 * - Internal grand total valid (sum = 100%)
 * - All variables have matched scales
 * @param {object} state - { external, internal }
 * @returns {{ ready: boolean, reasons: string[] }}
 */
export function isCalculationReady(state) {
  const reasons = [];
  const { external, internal } = state;

  // Min variable counts
  if (external.variables.length === 0) {
    reasons.push('Minimal 1 variabel eksternal diperlukan');
  }

  const totalInternalVars = internal.categories.reduce(
    (sum, c) => sum + c.variables.length,
    0
  );
  if (totalInternalVars === 0) {
    reasons.push('Minimal 1 variabel internal diperlukan');
  }

  // External weight validation
  const extWeight = validateExternalWeights(external.variables);
  if (external.variables.length > 0 && !extWeight.isValid) {
    reasons.push(`Bobot eksternal belum valid (${extWeight.total}% / 100%)`);
  }

  // Internal weight validations
  const intGrand = validateInternalGrandTotal(internal.categories);
  if (!intGrand.isValid) {
    reasons.push(`Bobot kategori internal belum valid (${intGrand.total}% / 100%)`);
  }

  for (const cat of internal.categories) {
    if (cat.variables.length > 0 || cat.weight > 0) {
      const catWeight = validateCategoryWeights(cat);
      if (!catWeight.isValid) {
        reasons.push(
          `Bobot variabel ${cat.name} belum valid (${catWeight.total}% / ${catWeight.target}%)`
        );
      }
    }
  }

  // Quantitative range validity (overlapping ranges would silently pick the first match)
  const allVars = [...external.variables, ...internal.categories.flatMap((c) => c.variables)];
  for (const v of allVars) {
    if (hasInvalidQuantitativeRanges(v)) {
      reasons.push(`Range skala "${v.name || 'tanpa nama'}" tidak valid (overlap / min > max)`);
    }
  }

  // Observation completeness
  if (external.variables.length > 0 && !allObservationsComplete(external.variables)) {
    reasons.push('Belum semua variabel eksternal memiliki skala terpilih');
  }

  const allInternalVars = internal.categories.flatMap((c) => c.variables);
  if (allInternalVars.length > 0 && !allObservationsComplete(allInternalVars)) {
    reasons.push('Belum semua variabel internal memiliki skala terpilih');
  }

  return { ready: reasons.length === 0, reasons };
}

/**
 * Validate quantitative scale ranges.
 * Errors (block calculation): incomplete ranges, min > max, overlapping ranges.
 * Warnings (non-blocking): gaps between ranges — a value inside a gap simply
 * matches no level, which already blocks via matchedLevel == null.
 * Touching boundaries (max of one level = min of the next) are allowed.
 * @param {Array} scales - array of { level, rangeMin, rangeMax } (4 levels)
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateQuantitativeRanges(scales) {
  const errors = [];
  const warnings = [];
  const defined = scales.filter(
    (s) => s.rangeMin != null && s.rangeMax != null
  );

  if (defined.length !== 4) {
    errors.push('Semua 4 level harus memiliki range yang terdefinisi untuk skala kuantitatif');
    return { valid: false, errors, warnings };
  }

  for (const s of defined) {
    if (s.rangeMin > s.rangeMax) {
      errors.push(`Level ${s.level}: nilai minimum lebih besar dari maksimum`);
    }
  }

  // Sort by rangeMin — levels need not be ascending (e.g. "fewer complaints is better")
  const sorted = [...defined].sort((a, b) => a.rangeMin - b.rangeMin);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.rangeMin < prev.rangeMax) {
      errors.push(`Overlap ditemukan antara range level ${prev.level} dan ${curr.level}`);
    } else if (curr.rangeMin > prev.rangeMax + 0.01) {
      warnings.push(
        `Ada celah antara range level ${prev.level} (maks ${prev.rangeMax}) dan level ${curr.level} (min ${curr.rangeMin}) — nilai di celah ini tidak cocok dengan level mana pun`
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * True when a quantitative variable has all 4 ranges filled in but they are invalid.
 * Incomplete ranges are reported separately as "scale not defined".
 * @param {object} v - variable
 * @returns {boolean}
 */
export function hasInvalidQuantitativeRanges(v) {
  if (v.scaleType !== 'quantitative') return false;
  const allFilled = v.scales.every((s) => s.rangeMin != null && s.rangeMax != null);
  return allFilled && !validateQuantitativeRanges(v.scales).valid;
}

/**
 * Derive matched level from a quantitative observation string
 * @param {string} observation
 * @param {Array} scales
 * @returns {number|null}
 */
export function matchObservation(observation, scales) {
  if (observation === '' || observation == null) return null;
  const value = parseFloat(observation);
  if (isNaN(value)) return null;
  return autoMatchQuantitative(value, scales);
}

/**
 * Auto-match a numeric observation to a quantitative scale level
 * @param {number} value - the observed numeric value
 * @param {Array} scales - array of { level, score, rangeMin, rangeMax }
 * @returns {number|null} matched level (1-4) or null if no match
 */
export function autoMatchQuantitative(value, scales) {
  for (const scale of scales) {
    if (
      scale.rangeMin != null &&
      scale.rangeMax != null &&
      value >= scale.rangeMin &&
      value <= scale.rangeMax
    ) {
      return scale.level;
    }
  }
  return null;
}
