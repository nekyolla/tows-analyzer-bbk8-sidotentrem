import { useState } from 'react';
import { ACTIONS } from '../hooks/useAppReducer';
import { getScore, getWeightedScore, validateCategoryWeights } from '../lib/calculations';
import { VARIABLE_COUNT_WARNING } from '../lib/constants';
import { getVariableIssues } from '../lib/validators';
import { formatSigned } from '../lib/format';
import WeightIndicator from './WeightIndicator';
import ScaleEditor from './ScaleEditor';
import ObservationInput from './ObservationInput';
import ConfirmDialog from './ConfirmDialog';
import FieldIssues from './FieldIssues';

export default function CategoryCard({ category, dispatch }) {
  const [isOpen, setIsOpen] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const catWeight = validateCategoryWeights(category);
  const isOver = category.variables.length > 0 && catWeight.total > catWeight.target + 0.01;

  const handleCategoryWeightChange = (weight) => {
    dispatch({
      type: ACTIONS.UPDATE_CATEGORY_WEIGHT,
      payload: { categoryId: category.id, weight },
    });
  };

  const handleAddVar = () => {
    dispatch({
      type: ACTIONS.ADD_INTERNAL_VAR,
      payload: { categoryId: category.id },
    });
  };

  const handleUpdateVar = (varId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_INTERNAL_VAR,
      payload: { categoryId: category.id, varId, updates },
    });
  };

  const handleDeleteVar = (varId) => {
    dispatch({
      type: ACTIONS.DELETE_INTERNAL_VAR,
      payload: { categoryId: category.id, varId },
    });
    setDeleteTarget(null);
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      dispatch({
        type: ACTIONS.REORDER_INTERNAL_VARS,
        payload: { categoryId: category.id, fromIndex: index, toIndex: index - 1 },
      });
    }
  };

  const handleMoveDown = (index) => {
    if (index < category.variables.length - 1) {
      dispatch({
        type: ACTIONS.REORDER_INTERNAL_VARS,
        payload: { categoryId: category.id, fromIndex: index, toIndex: index + 1 },
      });
    }
  };

  const varCount = category.variables.length;

  return (
    <div className={`border rounded-lg overflow-hidden bg-white transition-colors ${
      isOver ? 'border-red-200' : 'border-slate-200'
    }`}>
      {/* Category header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          <div>
            <span className="font-semibold text-sm text-slate-800">{category.name}</span>
            <span className="ml-2 text-xs text-slate-400">{category.description}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{varCount} variabel</span>
          {varCount > 0 && (
            <WeightIndicator
              current={catWeight.total}
              target={catWeight.target}
              size="sm"
            />
          )}
        </div>
      </button>

      {/* Category content */}
      {isOpen && (
        <div className="p-4 animate-fade-in">
          {/* Category weight input */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <label className="text-xs font-medium text-slate-500">Bobot Kategori:</label>
            <input
              type="number"
              className="input input-sm w-20 text-center"
              placeholder="0"
              min="0"
              max="100"
              step="0.01"
              value={category.weight || ''}
              onChange={(e) =>
                handleCategoryWeightChange(
                  e.target.value === '' ? 0 : parseFloat(e.target.value)
                )
              }
            />
            <span className="text-xs text-slate-400">%</span>
          </div>

          {/* Weight > target alert */}
          {isOver && (
            <div className="mb-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-fade-in">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-red-700">
                  Bobot variabel melebihi bobot kategori
                </p>
                <p className="text-[11px] text-red-600 mt-0.5">
                  Total variabel <strong>{catWeight.total.toFixed(2)}%</strong> melebihi bobot kategori {category.name} (<strong>{catWeight.target}%</strong>). Sesuaikan bobot variabel.
                </p>
              </div>
            </div>
          )}

          {/* Variables */}
          {varCount === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400 mb-3">
                Belum ada variabel di kategori {category.name}.
              </p>
              <button className="btn-secondary btn-sm" onClick={handleAddVar}>
                + Tambah Variabel
              </button>
            </div>
          ) : (
            <>
              {varCount > VARIABLE_COUNT_WARNING && (
                <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  ⚠ Lebih dari {VARIABLE_COUNT_WARNING} variabel dalam kategori ini.
                </div>
              )}

              <div className="space-y-3">
                {category.variables.map((v, index) => {
                  const score = getScore(v.matchedLevel);
                  const weightedScore = getWeightedScore(v.weight, score);
                  const { issues, isComplete } = getVariableIssues(v);
                  const hasName = v.name && v.name.trim() !== '';

                  return (
                    <div
                      key={v.id}
                      className={`border rounded-lg p-3 transition-colors ${
                        !isComplete
                          ? 'border-amber-100 hover:border-amber-200'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* Reorder */}
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <button
                            className="p-0.5 text-slate-300 hover:text-slate-500 disabled:opacity-30"
                            disabled={index === 0}
                            onClick={() => handleMoveUp(index)}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                            </svg>
                          </button>
                          <button
                            className="p-0.5 text-slate-300 hover:text-slate-500 disabled:opacity-30"
                            disabled={index === category.variables.length - 1}
                            onClick={() => handleMoveDown(index)}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        </div>

                        {/* Number + completion indicator */}
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold mt-0.5 ${
                          isComplete
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isComplete ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </span>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            <input
                              type="text"
                              className={`input input-sm flex-1 min-w-[160px] ${!hasName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                              placeholder="Nama variabel *"
                              value={v.name}
                              onChange={(e) =>
                                handleUpdateVar(v.id, { name: e.target.value })
                              }
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                className={`input input-sm w-16 text-center ${!v.weight || v.weight <= 0 ? 'border-red-300' : ''}`}
                                placeholder="0"
                                min="0"
                                max="100"
                                step="0.01"
                                value={v.weight || ''}
                                onChange={(e) =>
                                  handleUpdateVar(v.id, {
                                    weight: e.target.value === '' ? 0 : parseFloat(e.target.value),
                                  })
                                }
                              />
                              <span className="text-xs text-slate-400">%</span>
                            </div>
                          </div>

                          <input
                            type="text"
                            className="input input-sm text-slate-500"
                            placeholder="Deskripsi (opsional)"
                            value={v.description}
                            onChange={(e) =>
                              handleUpdateVar(v.id, { description: e.target.value })
                            }
                          />

                          <ScaleEditor
                            variable={v}
                            onUpdate={(updates) => handleUpdateVar(v.id, updates)}
                          />

                          <ObservationInput
                            variable={v}
                            onUpdate={(updates) => handleUpdateVar(v.id, updates)}
                          />

                          {score != null && (
                            <div className="flex items-center gap-3 pt-2 border-t border-slate-50 flex-wrap">
                              <span className={`badge ${score < 0 ? 'badge-error' : 'badge-success'}`}>
                                Skor: {formatSigned(score)}
                              </span>
                              <span className={`text-xs font-semibold ${weightedScore < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                Skor × Bobot = {formatSigned(weightedScore)}
                              </span>
                              <span className={`badge ${score > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {score > 0 ? 'Kekuatan (S)' : 'Kelemahan (W)'}
                              </span>
                            </div>
                          )}

                          {/* Field validation issues */}
                          <FieldIssues issues={issues} />
                        </div>

                        <button
                          className="flex-shrink-0 p-1 text-slate-300 hover:text-red-500 transition-colors"
                          onClick={() => setDeleteTarget(v)}
                          title="Hapus variabel"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex justify-center">
                <button className="btn-ghost btn-sm" onClick={handleAddVar}>
                  + Tambah Variabel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget != null}
        title="Hapus Variabel"
        message={`Yakin ingin menghapus "${deleteTarget?.name || 'variabel ini'}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => handleDeleteVar(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
