import { useEffect, useMemo, useState } from "react";
import dashboardService from "../services/dashboardService";
import examService from "../services/examService";
import studySessionService from "../services/studySessionService";
import recoveryService from "../services/recoveryService";
import ProgressSummaryCard from "../components/ProgressSummaryCard";
import ExamTasksGroup from "../components/ExamTasksGroup";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import { AI_TIPS } from "../utils/constants";
import { todayLabel } from "../utils/dateUtils";

function HomePage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingTaskId, setSavingTaskId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [expandedExam, setExpandedExam] = useState(null);
  const [examNameMap, setExamNameMap] = useState({});
  const [taskView, setTaskView] = useState("remaining");
  const [recoveryPreview, setRecoveryPreview] = useState(null);
  const [applyingRecovery, setApplyingRecovery] = useState(false);
  const tip = useMemo(() => AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)], []);

  const [currentDate, setCurrentDate] = useState(todayLabel());

  const loadSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryData, examsData] = await Promise.all([
        dashboardService.getSummary(),
        examService.getExams(),
      ]);

      setSummary(summaryData);

      const map = {};
      examsData.forEach((exam) => {
        map[String(exam._id)] = exam.name;
      });
      setExamNameMap(map);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadRecoveryPreview = async () => {
    try {
      const data = await recoveryService.getPreview();
      setRecoveryPreview(data);
    } catch {
      setRecoveryPreview(null);
    }
  };

  useEffect(() => {
    loadSummary();
    loadRecoveryPreview();

    const interval = setInterval(() => {
      const today = todayLabel();
      if (today !== currentDate) {
        setCurrentDate(today);
        loadSummary();
        loadRecoveryPreview();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [currentDate]);

  const handleComplete = async (taskId) => {
    setError("");
    setSavingTaskId(taskId);

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
      await loadRecoveryPreview();
    } catch (err) {
      await loadSummary();
      setError(
        err.response?.data?.message || "Unable to mark task complete"
      );
    } finally {
      setSavingTaskId(null);
    }
  };

    const handleSaveSession = async ({ topicId, durationSeconds, startedAt, proofFile }) => {
    setError("");
    try {
      const result = await studySessionService.saveSession({
        topicId,
        durationSeconds,
        startedAt,
        proofFile,
      });
      if (result?.id) {
        if (proofFile) {
          setToast({ type: "success", message: "Screenshot uploaded" });
        }
        return { ok: true, ...result };
      }
      const message = "Unable to save study session";
      setError(message);
      if (proofFile) {
        setToast({ type: "error", message: `Upload failed: ${message}` });
      }
      return { ok: false, message };
    } catch (err) {
      const message = err.response?.data?.message || "Unable to save study session";
      setError(message);
      if (proofFile) {
        setToast({ type: "error", message: `Upload failed: ${message}` });
      }
      return { ok: false, message };
    }
  };

    const handleUploadProof = async ({ sessionId, proofFile }) => {
    setError("");
    try {
      await studySessionService.uploadProof(sessionId, proofFile);
      setToast({ type: "success", message: "Screenshot uploaded" });
      await loadSummary();
      await loadRecoveryPreview();
      return { ok: true };
    } catch (err) {
      const message = err.response?.data?.message || "Unable to upload screenshot";
      setError(message);
      setToast({ type: "error", message: `Upload failed: ${message}` });
      return { ok: false, message };
    }
  };

  const handleApplyRecovery = async () => {
    setApplyingRecovery(true);
    try {
      await recoveryService.applyPlan();
      await loadSummary();
      await loadRecoveryPreview();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to apply recovery plan");
    } finally {
      setApplyingRecovery(false);
    }
  };

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="space-y-4">
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
      {error ? <p className="status-error">{error}</p> : null}

      <ProgressSummaryCard
        tasksTotal={summary?.todayTasks?.length || 0}
        tasksCompleted={summary?.todayTasks?.filter((task) => task.completed).length || 0}
        minutesSpent={summary?.todayMinutes || 0}
        streakCurrent={summary?.streakCurrent || 0}
        streakBest={summary?.streakBest || 0}
      />

      {recoveryPreview?.missedDaysCount ? (
        <div className="surface-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="section-title">Smart Recovery Planner</p>
              <p className="text-sm text-slate-600">
                You missed {recoveryPreview.missedDaysCount} day
                {recoveryPreview.missedDaysCount !== 1 ? "s" : ""}. Let's get back on track.
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyRecovery}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600 disabled:opacity-60"
              disabled={applyingRecovery}
            >
              {applyingRecovery ? "Applying..." : "Apply Recovery"}
            </button>
          </div>

          {recoveryPreview.recoverySprint?.length ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recovery sprint</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {recoveryPreview.recoverySprint.map((item) => (
                  <div key={item.topicTitle} className="rounded-lg bg-brand-50 p-3 text-sm text-slate-700">
                    <span className="font-semibold text-slate-800">{item.topicTitle}</span>
                    <span className="text-slate-500"> · {item.minutes} min</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {recoveryPreview.before?.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-white/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Before</p>
                {recoveryPreview.before.map((day) => (
                  <div key={day.date} className="mt-2">
                    <p className="text-xs font-semibold text-slate-600">{day.date}</p>
                    <p className="text-sm text-slate-700">
                      {day.tasks.length ? day.tasks.join(", ") : "No tasks"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-white/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">After</p>
                {recoveryPreview.after.map((day) => (
                  <div key={day.date} className="mt-2">
                    <p className="text-xs font-semibold text-slate-600">{day.date}</p>
                    <p className="text-sm text-slate-700">
                      {day.tasks.length ? day.tasks.join(", ") : "No tasks"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

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
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTaskView("remaining")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              taskView === "remaining"
                ? "bg-brand-500 text-white shadow"
                : "bg-white/80 text-slate-600 hover:bg-white"
            }`}
          >
            Remaining
          </button>
          <button
            type="button"
            onClick={() => setTaskView("completed")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              taskView === "completed"
                ? "bg-emerald-500 text-white shadow"
                : "bg-white/80 text-slate-600 hover:bg-white"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {taskView === "remaining" ? (
        summary?.todayTasks?.filter((task) => !task.completed).length ? (
          <div className="space-y-2">
            {Object.entries(
              summary.todayTasks
                .filter((task) => !task.completed)
                .reduce((acc, task) => {
                  const examId = task.examId ? String(task.examId) : "no-exam";
                  const examName =
                    (examId !== "no-exam" ? examNameMap[examId] : "") ||
                    task.examName?.trim() ||
                    "No Exam";

                  if (!acc[examId]) {
                    acc[examId] = { examName, tasks: [] };
                  }

                  acc[examId].tasks.push({ ...task, examName });
                  return acc;
                }, {})
            ).map(([examId, { examName, tasks }]) => (
              <div key={examId} className="space-y-2">
                <button
                  onClick={() => setExpandedExam(expandedExam === examId ? null : examId)}
                  className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white p-4 rounded-lg flex items-center justify-between hover:shadow-lg transition transform hover:scale-105"
                >
                  <div className="text-left">
                    <p className="text-lg font-bold">{examName}</p>
                    <p className="text-sm text-brand-100">
                      {tasks.length} task{tasks.length !== 1 ? "s" : ""} today
                    </p>
                  </div>
                  <span className={`text-2xl transition transform ${expandedExam === examId ? "rotate-180" : ""}`}>
                    ?
                  </span>
                </button>

                {expandedExam === examId && (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <ExamTasksGroup
                        key={task.taskId}
                        examId={examId}
                        examName={examName}
                        tasks={[task]}
                        onComplete={handleComplete}
                        onSave={handleSaveSession}
                        onUploadProof={handleUploadProof}
                        savingTaskId={savingTaskId}
                        disabled={false}
                        hideHeader={true}
                        hideStrengthLabel={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No remaining tasks" description="You're all caught up for today." />
        )
      ) : summary?.todayTasks?.filter((task) => task.completed).length ? (
        <div className="space-y-2">
          {Object.entries(
            summary.todayTasks
              .filter((task) => task.completed)
              .reduce((acc, task) => {
                const examId = task.examId ? String(task.examId) : "no-exam";
                const examName =
                  (examId !== "no-exam" ? examNameMap[examId] : "") ||
                  task.examName?.trim() ||
                  "No Exam";

                if (!acc[examId]) {
                  acc[examId] = { examName, tasks: [] };
                }

                acc[examId].tasks.push({ ...task, examName });
                return acc;
              }, {})
          ).map(([examId, { examName, tasks }]) => (
            <div key={`completed-${examId}`} className="space-y-2">
              <button
                onClick={() =>
                  setExpandedExam(expandedExam === `completed-${examId}` ? null : `completed-${examId}`)
                }
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-lg flex items-center justify-between hover:shadow-lg transition transform hover:scale-105"
              >
                <div className="text-left">
                  <p className="text-lg font-bold">{examName}</p>
                  <p className="text-sm text-emerald-100">
                    {tasks.length} task{tasks.length !== 1 ? "s" : ""} completed
                  </p>
                </div>
                <span
                  className={`text-2xl transition transform ${
                    expandedExam === `completed-${examId}` ? "rotate-180" : ""
                  }`}
                >
                  ?
                </span>
              </button>

              {expandedExam === `completed-${examId}` && (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <ExamTasksGroup
                      key={task.taskId}
                      examId={examId}
                      examName={examName}
                      tasks={[task]}
                      onComplete={handleComplete}
                      onSave={handleSaveSession}
                      onUploadProof={handleUploadProof}
                      savingTaskId={savingTaskId}
                      disabled={true}
                      hideHeader={true}
                      hideStrengthLabel={true}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No completed tasks yet"
          description="Finish a task by saving time and uploading a screenshot."
        />
      )}
    </div>
  );
}

export default HomePage;

