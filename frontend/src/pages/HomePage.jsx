import { useEffect, useMemo, useState } from "react";
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
  const tip = useMemo(() => AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)], []);

  // track the currently displayed date so we can auto-refresh past midnight
  const [currentDate, setCurrentDate] = useState(todayLabel());

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

    // check every minute whether the date has changed, and reload if so
    const interval = setInterval(() => {
      const today = todayLabel();
      if (today !== currentDate) {
        setCurrentDate(today);
        loadSummary();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [currentDate]);

  const handleComplete = async (taskId) => {
    setError("");
    setSavingTaskId(taskId);

    // optimistic update so user sees 'Done' immediately
    setSummary((prev) => {
      if (!prev) return prev;
      const updated = prev.todayTasks.map((t) =>
        t.taskId === taskId ? { ...t, completed: true } : t
      );
      return { ...prev, todayTasks: updated };
    });

    try {
      await dashboardService.markComplete(taskId);
      await loadSummary();
    } catch (err) {
      // if something went wrong (404 due to date change or network), refresh and show message
      await loadSummary();
      setError(
        err.response?.data?.message || "Unable to mark task complete"
      );
    } finally {
      setSavingTaskId(null);
    }
  };

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="space-y-4">
      {error ? <p className="status-error">{error}</p> : null}

      <ProgressSummaryCard
        progressPercent={summary?.progressPercent || 0}
        streakCurrent={summary?.streakCurrent || 0}
        streakBest={summary?.streakBest || 0}
      />

      <div className="surface-card p-4">
        <p className="section-title">Today</p>
        <p className="text-base font-semibold text-slate-800">{todayLabel()}</p>
      </div>

      <div className="surface-card bg-brand-50/90 p-4">
        <p className="section-title text-brand-700">AI Tip</p>
        <p className="text-sm text-slate-700">{tip}</p>
      </div>

      <div className="px-1">
        <p className="section-title">Today's Tasks</p>
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

