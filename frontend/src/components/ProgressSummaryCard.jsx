function ProgressSummaryCard({ progressPercent, streakCurrent, streakBest }) {
  return (
    <div className="surface-card p-4">
      <p className="section-title">Overall Progress</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-3xl font-bold text-brand-700">{progressPercent}%</p>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
          Readiness input
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-brand-50 p-2.5">
          <p className="text-slate-500">Current streak</p>
          <p className="font-semibold text-slate-800">{streakCurrent} days</p>
        </div>
        <div className="rounded-xl bg-brand-50 p-2.5">
          <p className="text-slate-500">Best streak</p>
          <p className="font-semibold text-slate-800">{streakBest} days</p>
        </div>
      </div>
    </div>
  );
}

export default ProgressSummaryCard;

