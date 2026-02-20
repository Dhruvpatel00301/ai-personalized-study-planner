function ProgressSummaryCard({ progressPercent, streakCurrent, streakBest }) {
  return (
    <div className="rounded-card bg-white p-4 shadow-soft">
      <p className="text-sm text-slate-500">Overall Progress</p>
      <p className="text-3xl font-bold text-brand-700">{progressPercent}%</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-brand-50 p-2">
          <p className="text-slate-500">Current streak</p>
          <p className="font-semibold text-slate-800">{streakCurrent} days</p>
        </div>
        <div className="rounded-lg bg-brand-50 p-2">
          <p className="text-slate-500">Best streak</p>
          <p className="font-semibold text-slate-800">{streakBest} days</p>
        </div>
      </div>
    </div>
  );
}

export default ProgressSummaryCard;
