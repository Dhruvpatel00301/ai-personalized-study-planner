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
      <form onSubmit={handleSubmit} className="rounded-card bg-white p-4 shadow-soft">
        <p className="mb-3 text-sm font-semibold text-slate-700">Create Subject</p>
        <div className="space-y-2">
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Subject name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            type="date"
            value={form.examDate}
            onChange={(e) => setForm((prev) => ({ ...prev, examDate: e.target.value }))}
            required
          />
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows="2"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          className="mt-3 w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white"
        >
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
