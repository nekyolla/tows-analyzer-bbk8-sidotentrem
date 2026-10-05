import { describe, it, expect } from 'vitest';
import { appReducer, ACTIONS } from './useAppReducer';

function stateWithExternalVar() {
  const empty = {
    external: { variables: [] },
    internal: { categories: [{ id: 'man', name: 'Man', weight: 0, variables: [] }] },
  };
  return appReducer(empty, { type: ACTIONS.ADD_EXTERNAL_VAR });
}

const RANGES = [[0, 10], [10, 20], [20, 30], [30, 40]];

function update(state, id, updates) {
  return appReducer(state, { type: ACTIONS.UPDATE_EXTERNAL_VAR, payload: { id, updates } });
}

function withRanges(scales, ranges) {
  return scales.map((s, i) => ({ ...s, rangeMin: ranges[i][0], rangeMax: ranges[i][1] }));
}

describe('appReducer — quantitative matchedLevel (bug 2)', () => {
  it('derives matchedLevel from the observation', () => {
    let state = stateWithExternalVar();
    const v = state.external.variables[0];
    state = update(state, v.id, { scaleType: 'quantitative', scales: withRanges(v.scales, RANGES) });
    state = update(state, v.id, { observation: '15' });
    expect(state.external.variables[0].matchedLevel).toBe(2);
  });

  it('recomputes matchedLevel when ranges are edited after observing', () => {
    let state = stateWithExternalVar();
    const v = state.external.variables[0];
    state = update(state, v.id, { scaleType: 'quantitative', scales: withRanges(v.scales, RANGES), observation: '15' });
    expect(state.external.variables[0].matchedLevel).toBe(2);

    const edited = withRanges(state.external.variables[0].scales, [[0, 10], [10, 14], [14, 30], [30, 40]]);
    state = update(state, v.id, { scales: edited });
    expect(state.external.variables[0].matchedLevel).toBe(3);
  });

  it('clears matchedLevel when the observation falls outside all ranges', () => {
    let state = stateWithExternalVar();
    const v = state.external.variables[0];
    state = update(state, v.id, { scaleType: 'quantitative', scales: withRanges(v.scales, RANGES), observation: '15' });
    state = update(state, v.id, { observation: '99' });
    expect(state.external.variables[0].matchedLevel).toBeNull();
  });

  it('also derives matchedLevel for internal variables', () => {
    let state = stateWithExternalVar();
    state = appReducer(state, { type: ACTIONS.ADD_INTERNAL_VAR, payload: { categoryId: 'man' } });
    const v = state.internal.categories[0].variables[0];
    state = appReducer(state, {
      type: ACTIONS.UPDATE_INTERNAL_VAR,
      payload: {
        categoryId: 'man',
        varId: v.id,
        updates: { scaleType: 'quantitative', scales: withRanges(v.scales, RANGES), observation: '35' },
      },
    });
    expect(state.internal.categories[0].variables[0].matchedLevel).toBe(4);
  });

  it('keeps manual matchedLevel for qualitative scales', () => {
    let state = stateWithExternalVar();
    const v = state.external.variables[0];
    state = update(state, v.id, { observation: 'catatan', matchedLevel: 3 });
    expect(state.external.variables[0].matchedLevel).toBe(3);
  });
});
