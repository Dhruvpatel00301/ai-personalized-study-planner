import { useEffect, useState } from "react";
import examService from "../services/examService";
import ExamCard from "../components/ExamCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", examDate: "", description: "" });
  const [error, setError] = useState("");

  const loadExams = async () => {
    setLoading(true);
    try {
      const data = await examService.getExams();
      setExams(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const removeExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam and all its subjects?")) {
      return;
    }
    setError("");
    try {
      await examService.deleteExam(examId);
      await loadExams();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete exam");
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await examService.createExam(form);
      setForm({ name: "", examDate: "", description: "" });
      await loadExams();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create exam");
    }
  };

  if (loading) return <Loader label="Loading exams..." />;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="surface-card p-4">
        <p className="mb-3 section-title">Create Exam</p>
        <div className="space-y-2">
          <input
            className="field-input"
            placeholder="Exam name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="field-input"
            type="date"
            value={form.examDate}
            onChange={(e) => setForm((prev) => ({ ...prev, examDate: e.target.value }))}
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
          Add Exam
        </button>
      </form>

      {exams.length ? (
        <div className="space-y-3">
          {exams.map((exam) => (
            <ExamCard key={exam._id} exam={exam} onDelete={() => removeExam(exam._id)} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No exams yet"
          description="Add an exam to begin organizing subjects."
        />
      )}
    </div>
  );
}

export default ExamsPage;
