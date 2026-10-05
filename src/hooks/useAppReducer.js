import { useReducer, useEffect, useState } from 'react';
import { INTERNAL_CATEGORIES } from '../lib/constants';
import { matchObservation } from '../lib/calculations';

const STORAGE_KEY = 'tows_analyzer_data';

// Generate unique IDs
let nextId = 1;
function generateId() {
  return `var_${Date.now()}_${nextId++}`;
}

// Create a blank variable template
function createBlankVariable() {
  return {
    id: generateId(),
    name: '',
    description: '',
    weight: 0,
    scaleType: 'qualitative',
    scales: [
      { level: 1, score: -3, description: '', rangeMin: null, rangeMax: null },
      { level: 2, score: -1, description: '', rangeMin: null, rangeMax: null },
      { level: 3, score: 1, description: '', rangeMin: null, rangeMax: null },
      { level: 4, score: 3, description: '', rangeMin: null, rangeMax: null },
    ],
    observation: '',
    matchedLevel: null,
  };
}

// Build initial state from INTERNAL_CATEGORIES
function buildInitialState() {
  return {
    external: {
      variables: [],
    },
    internal: {
      categories: INTERNAL_CATEGORIES.map((cat) => ({
        ...cat,
        weight: 0,
        variables: [],
      })),
    },
  };
}

/**
 * Load saved state from localStorage.
 * Merges saved data onto current category definitions so new categories
 * (like Time/Information) are always present even if they weren't in the save.
 */
function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || !saved.external || !saved.internal) return null;

    // Merge: ensure all current INTERNAL_CATEGORIES exist
    const savedCatMap = new Map(
      (saved.internal.categories || []).map((c) => [c.id, c])
    );

    const mergedCategories = INTERNAL_CATEGORIES.map((catDef) => {
      const existing = savedCatMap.get(catDef.id);
      if (existing) {
        // Keep saved data but refresh name/description from definition
        return { ...existing, name: catDef.name, description: catDef.description };
      }
      // New category not in saved data — create empty
      return { ...catDef, weight: 0, variables: [] };
    });

    return {
      external: saved.external,
      internal: { categories: mergedCategories },
    };
  } catch {
    return null;
  }
}

/**
 * @returns {boolean} true if saved, false if localStorage is full or unavailable
 */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

const initialState = loadSavedState() || buildInitialState();

// Action types
export const ACTIONS = {
  // External
  ADD_EXTERNAL_VAR: 'ADD_EXTERNAL_VAR',
  UPDATE_EXTERNAL_VAR: 'UPDATE_EXTERNAL_VAR',
  DELETE_EXTERNAL_VAR: 'DELETE_EXTERNAL_VAR',
  REORDER_EXTERNAL_VARS: 'REORDER_EXTERNAL_VARS',
  // Internal
  UPDATE_CATEGORY_WEIGHT: 'UPDATE_CATEGORY_WEIGHT',
  ADD_INTERNAL_VAR: 'ADD_INTERNAL_VAR',
  UPDATE_INTERNAL_VAR: 'UPDATE_INTERNAL_VAR',
  DELETE_INTERNAL_VAR: 'DELETE_INTERNAL_VAR',
  REORDER_INTERNAL_VARS: 'REORDER_INTERNAL_VARS',
  // Global
  RESET_ALL: 'RESET_ALL',
};

function reorder(list, fromIndex, toIndex) {
  const result = [...list];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Merge updates into a variable. For quantitative scales, matchedLevel is always
 * derived from observation + scales so it can never go stale when ranges change.
 */
function applyVariableUpdates(v, updates) {
  const next = { ...v, ...updates };
  if (next.scaleType === 'quantitative') {
    next.matchedLevel = matchObservation(next.observation, next.scales);
  }
  return next;
}

export function appReducer(state, action) {
  switch (action.type) {
    // === External ===
    case ACTIONS.ADD_EXTERNAL_VAR:
      return {
        ...state,
        external: {
          ...state.external,
          variables: [...state.external.variables, createBlankVariable()],
        },
      };

    case ACTIONS.UPDATE_EXTERNAL_VAR: {
      const { id, updates } = action.payload;
      return {
        ...state,
        external: {
          ...state.external,
          variables: state.external.variables.map((v) =>
            v.id === id ? applyVariableUpdates(v, updates) : v
          ),
        },
      };
    }

    case ACTIONS.DELETE_EXTERNAL_VAR:
      return {
        ...state,
        external: {
          ...state.external,
          variables: state.external.variables.filter(
            (v) => v.id !== action.payload.id
          ),
        },
      };

    case ACTIONS.REORDER_EXTERNAL_VARS: {
      const { fromIndex, toIndex } = action.payload;
      return {
        ...state,
        external: {
          ...state.external,
          variables: reorder(state.external.variables, fromIndex, toIndex),
        },
      };
    }

    // === Internal ===
    case ACTIONS.UPDATE_CATEGORY_WEIGHT: {
      const { categoryId, weight } = action.payload;
      return {
        ...state,
        internal: {
          ...state.internal,
          categories: state.internal.categories.map((c) =>
            c.id === categoryId ? { ...c, weight } : c
          ),
        },
      };
    }

    case ACTIONS.ADD_INTERNAL_VAR: {
      const { categoryId } = action.payload;
      return {
        ...state,
        internal: {
          ...state.internal,
          categories: state.internal.categories.map((c) =>
            c.id === categoryId
              ? { ...c, variables: [...c.variables, createBlankVariable()] }
              : c
          ),
        },
      };
    }

    case ACTIONS.UPDATE_INTERNAL_VAR: {
      const { categoryId, varId, updates } = action.payload;
      return {
        ...state,
        internal: {
          ...state.internal,
          categories: state.internal.categories.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  variables: c.variables.map((v) =>
                    v.id === varId ? applyVariableUpdates(v, updates) : v
                  ),
                }
              : c
          ),
        },
      };
    }

    case ACTIONS.DELETE_INTERNAL_VAR: {
      const { categoryId, varId } = action.payload;
      return {
        ...state,
        internal: {
          ...state.internal,
          categories: state.internal.categories.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  variables: c.variables.filter((v) => v.id !== varId),
                }
              : c
          ),
        },
      };
    }

    case ACTIONS.REORDER_INTERNAL_VARS: {
      const { categoryId, fromIndex, toIndex } = action.payload;
      return {
        ...state,
        internal: {
          ...state.internal,
          categories: state.internal.categories.map((c) =>
            c.id === categoryId
              ? { ...c, variables: reorder(c.variables, fromIndex, toIndex) }
              : c
          ),
        },
      };
    }

    // === Global ===
    case ACTIONS.RESET_ALL:
      // Persisted by the autosave effect — keep the reducer free of side effects
      return buildInitialState();

    default:
      return state;
  }
}

export function useAppReducer() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveFailed, setSaveFailed] = useState(false);

  // Auto-save to localStorage on every state change (debounced).
  // Skips the untouched loaded state (identity check is StrictMode-safe, unlike a first-render ref).
  useEffect(() => {
    if (state === initialState) return;
    const timeout = setTimeout(() => {
      const ok = saveState(state);
      setSaveFailed(!ok);
      if (ok) setLastSavedAt(Date.now());
    }, 300);
    return () => clearTimeout(timeout);
  }, [state]);

  // Check if any data has been entered
  const hasData =
    state.external.variables.length > 0 ||
    state.internal.categories.some((c) => c.variables.length > 0 || c.weight > 0);

  return { state, dispatch, hasData, lastSavedAt, saveFailed };
}
