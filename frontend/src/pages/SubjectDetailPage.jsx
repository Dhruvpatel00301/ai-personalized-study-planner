import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import subjectService from "../services/subjectService";
import planService from "../services/planService";
import { STRENGTH_OPTIONS } from "../utils/constants";
import Loader from "../components/Loader";

function SubjectDetailPage() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");
  const [topicForm, setTopicForm] = useState({ title: "", strength: "normal", estimatedMinutes: 45 });

  const strengthStats = useMemo(() => {
    return topics.reduce(
      (acc, topic) => {
        acc[topic.strength] += 1;
        return acc;
      },
      { weak: 0, normal: 0, strong: 0 }
    );
  }, [topics]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [subjectsData, topicsData] = await Promise.all([
        subjectService.getSubjects(),
        subjectService.getTopics(subjectId),
      ]);

      setSubject(subjectsData.find((item) => item._id === subjectId) || null);
      setTopics(topicsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subject details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subjectId]);

  const addTopic = async (event) => {
    event.preventDefault();
    setActionMessage("");
    setError("");

    try {
      await subjectService.createTopic(subjectId, {
        ...topicForm,
        estimatedMinutes: Number(topicForm.estimatedMinutes),
      });
      setTopicForm({ title: "", strength: "normal", estimatedMinutes: 45 });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add topic");
    }
  };

  const removeTopic = async (topicId) => {
    setError("");
    try {
      await subjectService.deleteTopic(topicId);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete topic");
    }
  };

  const runPlanAction = async (type) => {
    setActionMessage("");
    setError("");

    try {
      const response =
        type === "generate"
          ? await planService.generate(subjectId)
          : await planService.recalculate(subjectId);
      setActionMessage(`${type === "generate" ? "Generated" : "Recalculated"} ${response.totalDays} days`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update study plan");
    }
  };

  if (loading) return <Loader label="Loading subject..." />;

  if (!subject) {
    return <p className="status-error">Subject not found.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="surface-card p-4">
        <h2 className="text-lg font-semibold text-slate-800">{subject.name}</h2>
        <p className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
          Exam: {new Date(subject.examDate).toLocaleDateString()}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl bg-red-50 p-2 text-red-700">Weak: {strengthStats.weak}</div>
          <div className="rounded-xl bg-blue-50 p-2 text-blue-700">Normal: {strengthStats.normal}</div>
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">Strong: {strengthStats.strong}</div>
        </div>
      </div>

      <form onSubmit={addTopic} className="surface-card p-4">
        <p className="mb-3 section-title">Add Topic</p>
        <div className="space-y-2">
          <input
            className="field-input"
            placeholder="Topic title"
            value={topicForm.title}
            onChange={(e) => setTopicForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <select
            className="field-input"
            value={topicForm.strength}
            onChange={(e) => setTopicForm((prev) => ({ ...prev, strength: e.target.value }))}
          >
            {STRENGTH_OPTIONS.map((strength) => (
              <option key={strength} value={strength}>
                {strength}
              </option>
            ))}
          </select>
          <input
            className="field-input"
            type="number"
            min="10"
            value={topicForm.estimatedMinutes}
            onChange={(e) => setTopicForm((prev) => ({ ...prev, estimatedMinutes: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn-primary mt-3">
          Add Topic
        </button>
      </form>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => runPlanAction("generate")} className="btn-primary">
          Generate Plan
        </button>
        <button type="button" onClick={() => runPlanAction("recalculate")} className="btn-secondary">
          Recalculate
        </button>
      </div>

      {actionMessage ? <p className="status-success">{actionMessage}</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      <div className="space-y-2">
        {topics.map((topic) => (
          <div key={topic._id} className="surface-card flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">{topic.title}</p>
              <p className="text-xs text-slate-500">
                {topic.strength} - {topic.estimatedMinutes} mins
              </p>
            </div>
            <button type="button" onClick={() => removeTopic(topic._id)} className="btn-danger-soft">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubjectDetailPage;

