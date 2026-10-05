/**
 * Format a number with an explicit "+" for positive values (e.g. +3, -1.5, 0)
 * @param {number} n
 * @returns {string}
 */
export function formatSigned(n) {
  return `${n > 0 ? '+' : ''}${n}`;
}
