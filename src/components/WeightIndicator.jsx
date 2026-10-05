export default function WeightIndicator({ current, target, label, size = 'default' }) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 120) : 0;
  const isValid = Math.abs(current - target) <= 0.01;
  const isOver = current > target + 0.01;

  let barColor = 'bg-amber-400';
  let textColor = 'text-amber-700';
  if (isValid) {
    barColor = 'bg-emerald-500';
    textColor = 'text-emerald-700';
  } else if (isOver) {
    barColor = 'bg-red-500';
    textColor = 'text-red-700';
  }

  const isSmall = size === 'sm';

  return (
    <div className={`flex items-center gap-3 ${isSmall ? 'text-xs' : 'text-sm'}`}>
      {label && (
        <span className="text-slate-500 whitespace-nowrap font-medium">{label}</span>
      )}
      <div className={`flex-1 ${isSmall ? 'max-w-[120px]' : 'max-w-[200px]'}`}>
        <div className={`weight-bar ${isSmall ? 'h-1.5' : ''}`}>
          <div
            className={`weight-bar-fill ${barColor}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
      <span className={`font-semibold whitespace-nowrap ${textColor}`}>
        {current.toFixed(current % 1 === 0 ? 0 : 2)}% / {target}%
      </span>
      {isValid && (
        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )}
      {isOver && (
        <svg className="w-4 h-4 text-red-500 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      )}
    </div>
  );
}
