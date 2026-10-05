import { useState } from 'react';
import { validateQuantitativeRanges } from '../lib/calculations';
import { formatSigned } from '../lib/format';

export default function ScaleEditor({ variable, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const { scaleType, scales } = variable;

  const handleScaleTypeChange = (newType) => {
    if (newType === scaleType) return;
    // Reset scale definitions and observation when switching type
    // (a qualitative text observation is meaningless as a number, and vice versa)
    const resetScales = scales.map((s) => ({
      ...s,
      description: '',
      rangeMin: null,
      rangeMax: null,
    }));
    onUpdate({ scaleType: newType, scales: resetScales, observation: '', matchedLevel: null });
  };

  const handleScaleUpdate = (levelIndex, field, value) => {
    const newScales = scales.map((s, i) => {
      if (i !== levelIndex) return s;
      return { ...s, [field]: value };
    });
    onUpdate({ scales: newScales });
  };

  const hasAnyDefinition = scales.some(
    (s) => s.description || s.rangeMin != null
  );

  // Validate quantitative ranges
  const quantRangeValidation =
    scaleType === 'quantitative' ? validateQuantitativeRanges(scales) : null;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-ghost btn-sm gap-1.5 ${hasAnyDefinition ? 'text-brand-600' : 'text-slate-400'}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
        {hasAnyDefinition ? 'Edit Skala' : 'Atur Skala'}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
          {/* Scale type toggle */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-slate-500">Tipe:</span>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  scaleType === 'qualitative'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => handleScaleTypeChange('qualitative')}
              >
                Kualitatif
              </button>
              <button
                className={`px-3 py-1 text-xs font-medium transition-colors border-l border-slate-200 ${
                  scaleType === 'quantitative'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => handleScaleTypeChange('quantitative')}
              >
                Kuantitatif
              </button>
            </div>
          </div>

          {/* Scale definitions */}
          <div className="space-y-2">
            {scales.map((scale, idx) => (
              <div key={scale.level} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-16 text-right">
                  <span
                    className={`inline-flex items-center justify-center w-full px-2 py-1 rounded text-xs font-bold ${
                      scale.score < 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {formatSigned(scale.score)}
                  </span>
                </div>

                {scaleType === 'qualitative' ? (
                  <input
                    type="text"
                    className="input input-sm flex-1"
                    placeholder={
                      idx === 0 || idx === 3
                        ? `Deskripsi level ${scale.level} (wajib)`
                        : `Deskripsi level ${scale.level} (opsional)`
                    }
                    value={scale.description}
                    onChange={(e) =>
                      handleScaleUpdate(idx, 'description', e.target.value)
                    }
                  />
                ) : (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="number"
                      className="input input-sm w-20"
                      placeholder="Min"
                      value={scale.rangeMin ?? ''}
                      onChange={(e) =>
                        handleScaleUpdate(
                          idx,
                          'rangeMin',
                          e.target.value === '' ? null : parseFloat(e.target.value)
                        )
                      }
                    />
                    <span className="text-slate-400 text-xs">—</span>
                    <input
                      type="number"
                      className="input input-sm w-20"
                      placeholder="Max"
                      value={scale.rangeMax ?? ''}
                      onChange={(e) =>
                        handleScaleUpdate(
                          idx,
                          'rangeMax',
                          e.target.value === '' ? null : parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {scaleType === 'qualitative' && (
            <p className="mt-2 text-xs text-slate-400 italic">
              Level 1 dan 4 wajib diisi. Level 2 dan 3 boleh dikosongkan — tetap bisa dipilih saat observasi.
            </p>
          )}
          {scaleType === 'quantitative' && (
            <>
              <p className="mt-2 text-xs text-slate-400 italic">
                Semua 4 range wajib diisi dan tidak boleh tumpang tindih. Batas yang sama (mis. maks 10 dan min 10) diperbolehkan; nilai tepat di batas masuk ke level dengan nomor lebih kecil.
              </p>
              {/* Quantitative range validation errors */}
              {/* Quantitative range validation: errors block calculation, warnings (gaps) don't */}
              {quantRangeValidation &&
                (quantRangeValidation.errors.length > 0 || quantRangeValidation.warnings.length > 0) && (
                <div className="mt-2 space-y-1">
                  {[
                    ...quantRangeValidation.errors.map((msg) => ({ msg, className: 'text-red-600' })),
                    ...quantRangeValidation.warnings.map((msg) => ({ msg, className: 'text-amber-600' })),
                  ].map(({ msg, className }, i) => (
                    <div key={i} className={`flex items-start gap-1.5 text-xs ${className}`}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-px" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      {msg}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
