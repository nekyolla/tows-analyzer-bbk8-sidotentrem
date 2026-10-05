import { useEffect, useState } from 'react';
import { useAppReducer, ACTIONS } from './hooks/useAppReducer';
import ExternalSection from './components/ExternalSection';
import InternalSection from './components/InternalSection';
import ResultPanel from './components/ResultPanel';
import ConfirmDialog from './components/ConfirmDialog';

export default function App() {
  const { state, dispatch, hasData, lastSavedAt, saveFailed } = useAppReducer();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Data is autosaved, so only warn before leaving when saving to localStorage failed
  useEffect(() => {
    if (!saveFailed || !hasData) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveFailed, hasData]);

  // Show "Tersimpan" briefly after each successful save
  useEffect(() => {
    if (lastSavedAt == null) return;
    setShowSaved(true);
    const timeout = setTimeout(() => setShowSaved(false), 1500);
    return () => clearTimeout(timeout);
  }, [lastSavedAt]);

  const handleReset = () => {
    dispatch({ type: ACTIONS.RESET_ALL });
    setShowResetDialog(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">TOWS Analyzer</h1>
              <p className="text-xs text-slate-400">Kalkulator TOWS - Kinness</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saveFailed && (
              <span className="text-xs text-red-500" title="Penyimpanan browser penuh atau tidak tersedia">
                Gagal menyimpan
              </span>
            )}
            {/* Auto-save indicator */}
            <span
              className={`text-xs text-emerald-500 flex items-center gap-1 transition-opacity duration-300 ${
                showSaved ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Tersimpan
            </span>
            {hasData && (
              <button
                className="btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowResetDialog(true)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Step 1: External */}
        <ExternalSection
          variables={state.external.variables}
          dispatch={dispatch}
        />

        {/* Step 2: Internal */}
        <InternalSection
          categories={state.internal.categories}
          dispatch={dispatch}
        />

        {/* Step 3: Results */}
        <ResultPanel state={state} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-xs text-slate-400">
            TOWS Analyzer — Berdasarkan metodologi Dr. Setya Haksama, FKM Universitas Airlangga
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Data otomatis tersimpan di browser (localStorage). Tidak ada data yang dikirim ke server.
          </p>
        </div>
      </footer>

      {/* Reset confirmation */}
      <ConfirmDialog
        open={showResetDialog}
        title="Reset Semua Data"
        message="Yakin ingin menghapus semua data? Semua variabel, bobot, skala, dan observasi akan dihapus. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Reset"
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
}
