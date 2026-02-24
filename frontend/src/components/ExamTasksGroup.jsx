import { useState } from "react";
import TaskCard from "./TaskCard";

function ExamTasksGroup({ examName, examId, tasks, onComplete, savingTaskId, disabled, hideHeader, hideStrengthLabel }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (hideHeader) {
    // Render tasks without the exam header
    return (
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.taskId}
            task={task}
            onComplete={onComplete}
            disabled={savingTaskId === task.taskId || disabled}
            hideStrengthLabel={hideStrengthLabel}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-brand-50 to-brand-100 p-3 rounded-lg text-left flex items-center justify-between hover:shadow transition"
      >
        <div>
          <p className="text-base font-semibold text-brand-900">{examName}</p>
          <p className="text-xs text-brand-700">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
        </div>
        <span className={`text-lg transition transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="space-y-2 ml-1">
          {tasks.map((task) => (
            <TaskCard
              key={task.taskId}
              task={task}
              onComplete={onComplete}
              disabled={savingTaskId === task.taskId || disabled}
              hideStrengthLabel={hideStrengthLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExamTasksGroup;
