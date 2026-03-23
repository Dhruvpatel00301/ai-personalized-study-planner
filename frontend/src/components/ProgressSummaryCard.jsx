function ProgressSummaryCard({
  tasksTotal = 0,
  tasksCompleted = 0,
  minutesSpent = 0,
  streakCurrent = 0,
  streakBest = 0,
}) {
  const safeTotal = Math.max(0, tasksTotal);
  const safeCompleted = Math.min(Math.max(0, tasksCompleted), safeTotal);
  const percent = safeTotal ? Math.round((safeCompleted / safeTotal) * 100) : 0;
  const formatMinutes = (mins) => {
    const total = Math.max(0, Math.round(mins));
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (!hours) return `${minutes} min`;
    if (!minutes) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="surface-card p-4">
      <p className="section-title">Daily Focus Snapshot</p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-semibold text-slate-800">
          {safeCompleted}/{safeTotal} tasks done
        </p>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
          {formatMinutes(minutesSpent)} today
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${percent}%` }}
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