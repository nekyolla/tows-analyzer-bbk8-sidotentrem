import { hasInvalidQuantitativeRanges } from './calculations';

/**
 * Check whether a variable's scale is defined enough to observe against.
 * Qualitative: level 1 and level 4 descriptions are required (2 and 3 optional).
 * Quantitative: all 4 ranges must be filled in.
 * @param {object} v - variable object
 * @returns {boolean}
 */
export function hasScaleDefined(v) {
  if (v.scaleType === 'qualitative') {
    return Boolean(v.scales[0]?.description?.trim() && v.scales[3]?.description?.trim());
  }
  return v.scales.every((s) => s.rangeMin != null && s.rangeMax != null);
}

/**
 * Check completeness of a variable for validation indicators
 * @param {object} v - variable object
 * @returns {{ issues: string[], isComplete: boolean }}
 */
export function getVariableIssues(v) {
  const issues = [];

  if (!v.name || v.name.trim() === '') {
    issues.push('Nama variabel wajib diisi');
  }

  if (!v.weight || v.weight <= 0) {
    issues.push('Bobot belum diatur');
  }

  if (!hasScaleDefined(v)) {
    issues.push('Skala belum didefinisikan');
  } else if (hasInvalidQuantitativeRanges(v)) {
    issues.push('Range skala tidak valid');
  }

  if (v.matchedLevel == null) {
    issues.push('Skala observasi belum dipilih');
  }

  return { issues, isComplete: issues.length === 0 };
}
