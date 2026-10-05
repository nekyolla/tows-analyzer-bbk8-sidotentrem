import {
  INTERPRETATION_TEMPLATES,
  BOUNDARY_WARNINGS,
  QUADRANTS,
} from './constants';
import { getQuadrant, isOnBoundary } from './calculations';

/**
 * Generate interpretation text based on quadrant and boundary status
 * @param {number} SAP
 * @param {number} ETOP
 * @returns {{ quadrant: string, strategy: string, color: string, text: string, warnings: string[] }}
 */
export function generateInterpretation(SAP, ETOP) {
  const quadrant = getQuadrant(SAP, ETOP);
  const boundary = isOnBoundary(SAP, ETOP);
  const quadrantInfo = QUADRANTS[quadrant];

  const warnings = [];
  if (boundary.sapZero) warnings.push(BOUNDARY_WARNINGS.sapZero);
  if (boundary.etopZero) warnings.push(BOUNDARY_WARNINGS.etopZero);

  return {
    quadrant,
    strategy: quadrantInfo.strategy,
    color: quadrantInfo.color,
    text: INTERPRETATION_TEMPLATES[quadrant],
    warnings,
  };
}
