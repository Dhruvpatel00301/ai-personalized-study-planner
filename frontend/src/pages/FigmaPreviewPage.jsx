import ProgressSummaryCard from "../components/ProgressSummaryCard";
import ExamTasksGroup from "../components/ExamTasksGroup";
import { todayLabel } from "../utils/dateUtils";

const previewTasks = [
  {
    taskId: "preview-1",
    topicId: "topic-1",
    topicTitle: "ER Model",
    subjectName: "DBMS",
    taskType: "Study",
    strength: "weak",
    examName: "GATE 2027",
    completed: false,
  },
  {
    taskId: "preview-2",
    topicId: "topic-2",
    topicTitle: "Normalization",
    subjectName: "DBMS",
    taskType: "Practice",
    strength: "normal",
    examName: "GATE 2027",
    completed: false,
  },
  {
    taskId: "preview-3",
    topicId: "topic-3",
    topicTitle: "Stacks & Queues",
    subjectName: "Data Structures",
    taskType: "Study",
    strength: "strong",
    examName: "IIIT Hyderabad",
    completed: false,
  },
];

function FigmaPreviewPage() {
  const grouped = previewTasks.reduce((acc, task) => {
    const key = task.examName || "No Exam";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="surface-card border border-dashed border-brand-200 bg-brand-50/80 p-3 text-sm text-brand-700">
        Preview Mode: No login required. This route is for Figma capture only.
      </div>

      <ProgressSummaryCard
        tasksTotal={previewTasks.length}
        tasksCompleted={1}
        minutesSpent={95}
        streakCurrent={3}
        streakBest={7}
      />

      <div className="surface-card p-4">
        <p className="section-title">Today</p>
        <p className="text-base font-semibold text-slate-800">{todayLabel()}</p>
      </div>

      <div className="surface-card bg-brand-50/90 p-4">
        <p className="section-title text-brand-700">AI Tip</p>
        <p className="text-sm text-slate-700">
          Use revision days to summarize concepts and test yourself.
        </p>
      </div>

      <div className="space-y-2">
        {Object.entries(grouped).map(([examName, tasks]) => (
          <ExamTasksGroup
            key={examName}
            examName={examName}
            examId={examName}
            tasks={tasks}
            onComplete={() => {}}
            onSave={() => {}}
            onUploadProof={() => {}}
            savingTaskId={null}
            disabled={true}
          />
        ))}
      </div>
    </div>
  );
}

export default FigmaPreviewPage;
