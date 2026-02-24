import { useEffect, useState } from "react";
import subjectService from "../services/subjectService";
import SubjectCard from "../components/SubjectCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  // subjects are now nested under exams, so this page is mostly kept for
  // backward compatibility. We no longer allow creating subjects directly here.
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

  const removeSubject = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject and all its data?")) {
      return;
    }
    setError("");
    try {
      await subjectService.deleteSubject(subjectId);
      await loadSubjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete subject");
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);



  if (loading) return <Loader label="Loading subjects..." />;

  return (
    <div className="space-y-4">
      <div className="surface-card p-4">
        <p className="section-title">Subjects are now managed under exams</p>
        <p className="text-sm">
          Go to the <a href="/exams" className="text-blue-600">Exams</a> page and select
          an exam to add subjects for it.
        </p>
      </div>

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
        <EmptyState title="No subjects yet" description="Create an exam first and add subjects under it." />
      )}
    </div>
  );
}

export default SubjectsPage;

