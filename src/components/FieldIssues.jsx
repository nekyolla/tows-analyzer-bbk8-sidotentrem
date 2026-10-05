export default function FieldIssues({ issues }) {
  if (issues.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {issues.map((issue, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {issue}
        </span>
      ))}
    </div>
  );
}
