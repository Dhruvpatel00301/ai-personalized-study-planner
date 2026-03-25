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
  const [showSample, setShowSample] = useState(false);

  const sampleExam = {
    name: "IIIT PGEE",
    examDate: "2026-05-02",
    description: "Entrance exam",
  };

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
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="surface-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="section-title">Create Exam</p>
          <button
            type="button"
            onClick={() => setShowSample((prev) => !prev)}
            className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
          >
            {showSample ? "Hide sample" : "Show sample"}
          </button>
        </div>
        <div className="mt-3 space-y-3">
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

        {error ? <p className="status-error mt-3">{error}</p> : null}

        <button type="submit" className="btn-primary mt-4">
          Add Exam
        </button>
      </form>

      {showSample ? (
        <div className="surface-card p-4">
          <p className="section-title">Sample exam</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p className="font-semibold">{sampleExam.name}</p>
            <p className="inline-block rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
              5/2/2026
            </p>
            <p className="text-sm text-slate-600">{sampleExam.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(sampleExam)}
            className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600"
          >
            Use sample in form
          </button>
        </div>
      ) : null}

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
