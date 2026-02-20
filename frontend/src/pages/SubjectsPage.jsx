import { useEffect, useState } from "react";
import subjectService from "../services/subjectService";
import SubjectCard from "../components/SubjectCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", examDate: "", description: "" });
  const [error, setError] = useState("");

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await subjectService.createSubject(form);
      setForm({ name: "", examDate: "", description: "" });
      await loadSubjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create subject");
    }
  };

  if (loading) return <Loader label="Loading subjects..." />;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="surface-card p-4">
        <p className="mb-3 section-title">Create Subject</p>
        <div className="space-y-2">
          <input
            className="field-input"
            placeholder="Subject name"
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
          Add Subject
        </button>
      </form>

      {subjects.length ? (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject._id} subject={subject} />
          ))}
        </div>
      ) : (
        <EmptyState title="No subjects yet" description="Add a subject to begin building your plan." />
      )}
    </div>
  );
}

export default SubjectsPage;

