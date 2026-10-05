import { useMemo } from 'react';
import {
  calcExternalTotals,
  calcInternalTotals,
  isCalculationReady,
} from '../lib/calculations';
import { generateInterpretation } from '../lib/interpretation';
import { formatSigned } from '../lib/format';
import MatrixChart from './MatrixChart';

function StatCard({ label, value, subtitle, color = 'slate' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  return (
    <div className={`rounded-lg border px-4 py-3 ${colorMap[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-0.5">
        {formatSigned(value)}
      </p>
      {subtitle && <p className="text-xs mt-0.5 opacity-60">{subtitle}</p>}
    </div>
  );
}

export default function ResultPanel({ state }) {
  const readiness = useMemo(() => isCalculationReady(state), [state]);

  const results = useMemo(() => {
    if (!readiness.ready) return null;

    const ext = calcExternalTotals(state.external.variables);
    const int = calcInternalTotals(state.internal.categories);
    const interp = generateInterpretation(int.SAP, ext.ETOP);

    return { ext, int, quadrant: interp.quadrant, interp };
  }, [state, readiness.ready]);

  return (
    <section id="result-section" className="card">
      <div className="card-header">
        <h2 className="section-title flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">3</span>
          Hasil Analisis
        </h2>
        <p className="section-subtitle">SAP, ETOP, posisi kuadran, dan strategi yang direkomendasikan</p>
      </div>

      <div className="card-body">
        {!readiness.ready ? (
          <div className="py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm2.494-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.494-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.494-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-3">Kalkulasi belum dapat dijalankan</p>
            <div className="max-w-md mx-auto text-left space-y-1.5">
              {readiness.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <svg className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  {reason}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* ETOP Summary */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">
                Faktor Eksternal (ETOP)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  label="Peluang (O)"
                  value={results.ext.O}
                  subtitle="Skor positif"
                  color="blue"
                />
                <StatCard
                  label="Ancaman (T)"
                  value={results.ext.T}
                  subtitle="Skor negatif"
                  color="red"
                />
                <StatCard
                  label="ETOP"
                  value={results.ext.ETOP}
                  subtitle="O + T"
                  color={results.ext.ETOP >= 0 ? 'emerald' : 'amber'}
                />
              </div>
            </div>

            {/* SAP Summary */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">
                Faktor Internal (SAP)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  label="Kekuatan (S)"
                  value={results.int.S}
                  subtitle="Skor positif"
                  color="blue"
                />
                <StatCard
                  label="Kelemahan (W)"
                  value={results.int.W}
                  subtitle="Skor negatif"
                  color="red"
                />
                <StatCard
                  label="SAP"
                  value={results.int.SAP}
                  subtitle="S + W"
                  color={results.int.SAP >= 0 ? 'emerald' : 'amber'}
                />
              </div>
            </div>

            {/* Quadrant & Strategy */}
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: `${results.interp.color}10`, borderColor: `${results.interp.color}30`, borderWidth: 1 }}>
              <div
                className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
                style={{ backgroundColor: results.interp.color }}
              >
                {results.quadrant}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">
                  Kuadran {results.quadrant}
                </p>
                <p className="text-sm font-medium" style={{ color: results.interp.color }}>
                  Strategi: {results.interp.strategy}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Posisi: SAP = {formatSigned(results.int.SAP)}, ETOP = {formatSigned(results.ext.ETOP)}
                </p>
              </div>
            </div>

            {/* Boundary warnings */}
            {results.interp.warnings.length > 0 && (
              <div className="space-y-2">
                {results.interp.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    <p className="text-xs text-amber-700">{warning}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Matrix Chart */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">
                Matriks TOWS
              </h3>
              <div className="bg-white rounded-lg border border-slate-200 p-2">
                <MatrixChart
                  SAP={results.int.SAP}
                  ETOP={results.ext.ETOP}
                  quadrant={results.quadrant}
                />
              </div>
            </div>

            {/* Interpretation */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">
                Interpretasi
              </h3>
              <div className="bg-slate-50 rounded-lg border border-slate-200 px-5 py-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {results.interp.text}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
