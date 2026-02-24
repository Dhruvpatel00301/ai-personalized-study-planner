import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import examService from "../services/examService";
import subjectService from "../services/subjectService";
import SubjectCard from "../components/SubjectCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

function ExamDetailPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [examData, subjectsData] = await Promise.all([
        examService.getExam(examId),
        subjectService.getSubjects(examId),
      ]);
      setExam(examData);
      setSubjects(subjectsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load exam details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [examId]);

  const addSubject = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await subjectService.createSubject({ ...form, examId });
      setForm({ name: "", description: "" });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add subject");
    }
  };

  const removeSubject = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject and all its data?")) {
      return;
    }
    setError("");
    try {
      await subjectService.deleteSubject(subjectId);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete subject");
    }
  };

  if (loading) return <Loader label="Loading exam..." />;

  if (!exam) {
    return <p className="status-error">Exam not found.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="surface-card p-4">
        <h2 className="text-lg font-semibold text-slate-800">{exam.name}</h2>
        <p className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
          {new Date(exam.examDate).toLocaleDateString()}
        </p>
        {exam.description ? <p className="mt-2 text-sm text-slate-600">{exam.description}</p> : null}
        <Link to="/exams" className="mt-2 text-blue-600 text-sm inline-block">
          ← Back to all exams
        </Link>
      </div>

      <form onSubmit={addSubject} className="surface-card p-4">
        <p className="mb-3 section-title">Add Subject</p>
        <div className="space-y-2">
          <input
            className="field-input"
            placeholder="Subject name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <textarea
            className="field-input"
            rows="2"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
        {error ? <p className="status-error mt-2">{error}</p> : null}
        <button type="submit" className="btn-primary mt-3">
          Add Subject
        </button>
      </form>

      {subjects.length ? (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject._id}
              subject={subject}
              onDelete={() => removeSubject(subject._id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No subjects yet"
          description="Add a subject to begin building your study plan."
        />
      )}
    </div>
  );
}

export default ExamDetailPage;
