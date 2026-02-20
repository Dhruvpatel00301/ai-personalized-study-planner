import { useEffect, useState } from "react";
import dashboardService from "../services/dashboardService";
import ProgressSummaryCard from "../components/ProgressSummaryCard";
import TaskCard from "../components/TaskCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { AI_TIPS } from "../utils/constants";
import { todayLabel } from "../utils/dateUtils";

function HomePage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingTaskId, setSavingTaskId] = useState(null);
  const [error, setError] = useState("");

  const loadSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleComplete = async (taskId) => {
    setSavingTaskId(taskId);
    try {
      await dashboardService.markComplete(taskId);
      await loadSummary();
    } finally {
      setSavingTaskId(null);
    }
  };

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <ProgressSummaryCard
        progressPercent={summary?.progressPercent || 0}
        streakCurrent={summary?.streakCurrent || 0}
        streakBest={summary?.streakBest || 0}
      />

      <div className="rounded-card bg-white p-4 shadow-soft">
        <p className="text-sm text-slate-500">Today</p>
        <p className="text-base font-semibold text-slate-800">{todayLabel()}</p>
      </div>

      <div className="rounded-card bg-brand-50 p-4 shadow-soft">
        <p className="text-sm text-brand-700">AI tip</p>
        <p className="text-sm text-slate-700">{AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]}</p>
      </div>

      {summary?.todayTasks?.length ? (
        <div className="space-y-3">
          {summary.todayTasks.map((task) => (
            <TaskCard
              key={task.taskId}
              task={task}
              onComplete={handleComplete}
              disabled={savingTaskId === task.taskId}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tasks for today"
          description="Generate a study plan from Subjects to start your schedule."
        />
      )}
    </div>
  );
}

export default HomePage;
