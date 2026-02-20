function TaskCard({ task, onComplete, disabled }) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{task.topicTitle}</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs text-slate-500">{task.subjectName}</p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
              {task.taskType}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={task.completed || disabled}
          onClick={() => onComplete(task.taskId)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
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

