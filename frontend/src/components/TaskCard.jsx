function TaskCard({ task, onComplete, disabled }) {
  return (
    <div className="rounded-card bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{task.topicTitle}</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {task.subjectName} • {task.taskType}
          </p>
        </div>

        <button
          type="button"
          disabled={task.completed || disabled}
          onClick={() => onComplete(task.taskId)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            task.completed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-brand-500 text-white disabled:cursor-not-allowed disabled:opacity-50"
          }`}
        >
          {task.completed ? "Done" : "Complete"}
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
