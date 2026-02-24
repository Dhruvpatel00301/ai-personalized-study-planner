function TaskCard({ task, onComplete, disabled, hideStrengthLabel }) {
  // map strength to border color with strong visible colors
  const strengthColors = {
    weak: {
      border: "border-l-4 border-l-red-600",
      badge: "bg-red-100 text-red-800",
    },
    normal: {
      border: "border-l-4 border-l-yellow-500",
      badge: "bg-yellow-100 text-yellow-800",
    },
    strong: {
      border: "border-l-4 border-l-green-600",
      badge: "bg-green-100 text-green-800",
    },
  };

  const colors = strengthColors[task.strength] || strengthColors.normal;

  return (
    <div className={`surface-card p-4 ${colors.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {task.examName ? (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              {task.examName}
            </p>
          ) : null}
          <p className="text-sm font-semibold text-slate-800">{task.topicTitle}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <p className="text-xs text-slate-600 font-medium">{task.subjectName}</p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
              {task.taskType}
            </span>
            {!hideStrengthLabel && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors.badge}`}>
                {task.strength}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={task.completed || disabled}
          onClick={() => onComplete(task.taskId)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
            task.completed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-brand-500 text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
          }`}
        >
          {task.completed ? "Done" : "Complete"}
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
