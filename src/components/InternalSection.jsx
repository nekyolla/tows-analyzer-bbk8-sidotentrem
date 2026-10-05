import { validateInternalGrandTotal } from '../lib/calculations';
import WeightIndicator from './WeightIndicator';
import CategoryCard from './CategoryCard';

export default function InternalSection({ categories, dispatch }) {
  const grandTotal = validateInternalGrandTotal(categories);
  const isOver = grandTotal.total > 100.01;

  return (
    <section id="internal-section" className="card animate-fade-in">
      <div className="card-header flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 text-violet-700 text-xs font-bold">2</span>
            Variabel Internal
          </h2>
          <p className="section-subtitle">Kelemahan (Weaknesses) & Kekuatan (Strengths) — dikelompokkan dalam 8M</p>
        </div>
        <WeightIndicator current={grandTotal.total} target={100} label="Bobot Kategori" />
      </div>

      <div className="card-body space-y-3">
        {/* Grand total > 100% alert */}
        {isOver && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">
                Total bobot kategori melebihi 100%
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Total bobot 8 kategori saat ini <strong>{grandTotal.total.toFixed(2)}%</strong>. Kurangi bobot pada beberapa kategori agar total tepat 100% (±0.01%).
              </p>
            </div>
          </div>
        )}

        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            dispatch={dispatch}
          />
        ))}
      </div>
    </section>
  );
}
