import { useState } from 'react';
import { ACTIONS } from '../hooks/useAppReducer';
import { getScore, getWeightedScore, validateExternalWeights } from '../lib/calculations';
import { VARIABLE_COUNT_WARNING } from '../lib/constants';
import { getVariableIssues } from '../lib/validators';
import { formatSigned } from '../lib/format';
import WeightIndicator from './WeightIndicator';
import ScaleEditor from './ScaleEditor';
import ObservationInput from './ObservationInput';
import ConfirmDialog from './ConfirmDialog';
import FieldIssues from './FieldIssues';

export default function ExternalSection({ variables, dispatch }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const weightInfo = validateExternalWeights(variables);
  const isOver = variables.length > 0 && weightInfo.total > 100.01;

  const handleAdd = () => {
    dispatch({ type: ACTIONS.ADD_EXTERNAL_VAR });
  };

  const handleUpdate = (id, updates) => {
    dispatch({ type: ACTIONS.UPDATE_EXTERNAL_VAR, payload: { id, updates } });
  };

  const handleDelete = (id) => {
    dispatch({ type: ACTIONS.DELETE_EXTERNAL_VAR, payload: { id } });
    setDeleteTarget(null);
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      dispatch({
        type: ACTIONS.REORDER_EXTERNAL_VARS,
        payload: { fromIndex: index, toIndex: index - 1 },
      });
    }
  };

  const handleMoveDown = (index) => {
    if (index < variables.length - 1) {
      dispatch({
        type: ACTIONS.REORDER_EXTERNAL_VARS,
        payload: { fromIndex: index, toIndex: index + 1 },
      });
    }
  };

  return (
    <section id="external-section" className="card animate-fade-in">
      <div className="card-header flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">1</span>
            Variabel Eksternal
          </h2>
          <p className="section-subtitle">Ancaman (Threats) & Peluang (Opportunities) — daftar flat, tanpa kategori</p>
        </div>
        <WeightIndicator current={weightInfo.total} target={100} label="Bobot" />
      </div>

      <div className="card-body">
        {/* Weight > 100% alert */}
        {isOver && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">
                Total bobot melebihi 100%
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Total bobot saat ini <strong>{weightInfo.total.toFixed(2)}%</strong>. Kurangi bobot pada beberapa variabel agar total tepat 100% (±0.01%).
              </p>
            </div>
          </div>
        )}

        {variables.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 mb-1">Belum ada variabel eksternal.</p>
            <p className="text-xs text-slate-400 mb-4">
              Tambahkan faktor-faktor eksternal seperti kebijakan pemerintah, kondisi pasar, persaingan, iklim, dll.
            </p>
            <button className="btn-primary" onClick={handleAdd}>
              + Tambah Variabel
            </button>
          </div>
        ) : (
          <>
            {variables.length > VARIABLE_COUNT_WARNING && (
              <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                Lebih dari {VARIABLE_COUNT_WARNING} variabel — pertimbangkan menggabungkan variabel yang mirip agar analisis tetap mudah dibaca.
              </div>
            )}

            <div className="space-y-3">
              {variables.map((v, index) => {
                const score = getScore(v.matchedLevel);
                const weightedScore = getWeightedScore(v.weight, score);
                const { issues, isComplete } = getVariableIssues(v);
                const hasName = v.name && v.name.trim() !== '';

                return (
                  <div
                    key={v.id}
                    className={`border rounded-lg p-4 transition-colors bg-white ${
                      !isComplete
                        ? 'border-amber-200 hover:border-amber-300'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Reorder controls */}
                      <div className="flex flex-col gap-0.5 pt-1">
                        <button
                          className="p-0.5 text-slate-300 hover:text-slate-500 disabled:opacity-30"
                          disabled={index === 0}
                          onClick={() => handleMoveUp(index)}
                          title="Pindah ke atas"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          className="p-0.5 text-slate-300 hover:text-slate-500 disabled:opacity-30"
                          disabled={index === variables.length - 1}
                          onClick={() => handleMoveDown(index)}
                          title="Pindah ke bawah"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>

                      {/* Number + completion indicator */}
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-1 ${
                        isComplete
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isComplete ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </span>

                      {/* Main content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Row 1: Name + Weight */}
                        <div className="flex gap-3 flex-wrap">
                          <input
                            type="text"
                            className={`input flex-1 min-w-[200px] ${!hasName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                            placeholder="Nama variabel (mis. Kebijakan Pemerintah) *"
                            value={v.name}
                            onChange={(e) =>
                              handleUpdate(v.id, { name: e.target.value })
                            }
                          />
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Bobot</label>
                            <input
                              type="number"
                              className={`input input-sm w-20 text-center ${!v.weight || v.weight <= 0 ? 'border-red-300' : ''}`}
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.01"
                              value={v.weight || ''}
                              onChange={(e) =>
                                handleUpdate(v.id, {
                                  weight: e.target.value === '' ? 0 : parseFloat(e.target.value),
                                })
                              }
                            />
                            <span className="text-xs text-slate-400">%</span>
                          </div>
                        </div>

                        {/* Row 2: Description (optional) */}
                        <input
                          type="text"
                          className="input input-sm text-slate-500"
                          placeholder="Deskripsi (opsional)"
                          value={v.description}
                          onChange={(e) =>
                            handleUpdate(v.id, { description: e.target.value })
                          }
                        />

                        {/* Row 3: Scale Editor */}
                        <ScaleEditor
                          variable={v}
                          onUpdate={(updates) => handleUpdate(v.id, updates)}
                        />

                        {/* Row 4: Observation Input */}
                        <ObservationInput
                          variable={v}
                          onUpdate={(updates) => handleUpdate(v.id, updates)}
                        />

                        {/* Row 5: Calculated results */}
                        {score != null && (
                          <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-400">Skor:</span>
                              <span
                                className={`badge ${
                                  score < 0 ? 'badge-error' : 'badge-success'
                                }`}
                              >
                                {formatSigned(score)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-400">Skor × Bobot:</span>
                              <span
                                className={`font-semibold text-sm ${
                                  weightedScore < 0
                                    ? 'text-red-600'
                                    : weightedScore > 0
                                    ? 'text-emerald-600'
                                    : 'text-slate-500'
                                }`}
                              >
                                {formatSigned(weightedScore)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-400">Kolom:</span>
                              <span
                                className={`badge ${
                                  score > 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {score > 0 ? 'Peluang (O)' : 'Ancaman (T)'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Field validation issues */}
                        <FieldIssues issues={issues} />
                      </div>

                      {/* Delete button */}
                      <button
                        className="flex-shrink-0 p-1.5 text-slate-300 hover:text-red-500 transition-colors mt-1"
                        onClick={() => setDeleteTarget(v)}
                        title="Hapus variabel"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-center">
              <button className="btn-secondary" onClick={handleAdd}>
                + Tambah Variabel
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget != null}
        title="Hapus Variabel"
        message={`Yakin ingin menghapus "${deleteTarget?.name || 'variabel ini'}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
