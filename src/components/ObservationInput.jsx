import { hasScaleDefined } from '../lib/validators';
import { formatSigned } from '../lib/format';

export default function ObservationInput({ variable, onUpdate }) {
  const { scaleType, scales, observation, matchedLevel } = variable;
  const matchedScale = scales.find((s) => s.level === matchedLevel);

  // For quantitative scales the reducer derives matchedLevel from the observation
  const handleObservationChange = (value) => {
    onUpdate({ observation: value });
  };

  const handleManualMatch = (level) => {
    onUpdate({ matchedLevel: level });
  };

  if (!hasScaleDefined(variable)) {
    return (
      <p className="text-xs text-slate-400 italic">
        {scaleType === 'qualitative'
          ? 'Atur skala terlebih dahulu (deskripsi level 1 dan 4 wajib diisi)'
          : 'Atur skala terlebih dahulu (keempat range wajib diisi)'}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* Observation text/number input */}
      <div>
        {scaleType === 'quantitative' ? (
          <input
            type="number"
            className="input input-sm"
            placeholder="Masukkan nilai observasi..."
            value={observation}
            onChange={(e) => handleObservationChange(e.target.value)}
          />
        ) : (
          <textarea
            className="input input-sm resize-none"
            rows={2}
            placeholder="Deskripsi hasil observasi, diskusi, wawancara..."
            value={observation}
            onChange={(e) => handleObservationChange(e.target.value)}
          />
        )}
      </div>

      {/* Scale matching */}
      {scaleType === 'qualitative' ? (
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Pilih skala:</span>
          <div className="grid grid-cols-1 gap-1">
            {scales.map((scale) => {
              const isSelected = matchedLevel === scale.level;
              const desc =
                scale.description ||
                `Level ${scale.level} (${formatSigned(scale.score)}) — tidak ada deskripsi khusus`;

              return (
                <button
                  key={scale.level}
                  onClick={() => handleManualMatch(scale.level)}
                  className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? scale.score < 0
                        ? 'border-red-300 bg-red-50 text-red-800 ring-1 ring-red-300'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold">
                    [{formatSigned(scale.score)}]
                  </span>{' '}
                  {desc}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        matchedScale && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Skala terpilih:</span>
            <span
              className={`badge ${
                matchedScale.score < 0
                  ? 'badge-error'
                  : 'badge-success'
              }`}
            >
              Level {matchedLevel} ({formatSigned(matchedScale.score)})
            </span>
          </div>
        )
      )}

      {scaleType === 'quantitative' && observation && matchedLevel == null && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          Nilai di luar semua range yang didefinisikan
        </p>
      )}
    </div>
  );
}
