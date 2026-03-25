import { useEffect, useMemo, useState } from "react";
import examService from "../services/examService";
import subjectService from "../services/subjectService";
import studySessionService from "../services/studySessionService";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const formatDuration = (seconds) => {
  const mins = Math.round(seconds / 60);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return `${hours}h ${remaining}m`;
};

const buildFileName = (session) => {
  const date = session?.startedAt ? new Date(session.startedAt).toISOString().slice(0, 10) : "session";
  const topic = session?.topicTitle || "proof";
  const safeTopic = topic.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 48);
  return `study-proof-${safeTopic}-${date}.jpg`;
};

function AnalyticsPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const allowedSubjectIds = useMemo(
    () => new Set(subjects.map((subject) => String(subject._id))),
    [subjects]
  );

  const filteredSessions = useMemo(() => {
    if (!selectedExam || selectedSubject) {
      return sessions;
    }
    return sessions.filter((session) => allowedSubjectIds.has(String(session.subjectId)));
  }, [sessions, allowedSubjectIds, selectedExam, selectedSubject]);

  const loadExams = async () => {
    try {
      const examList = await examService.getExams();
      setExams(examList || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load exams");
    }
  };

  const loadSubjects = async (examId) => {
    try {
      const subjectList = await subjectService.getSubjects(examId || null);
      setSubjects(subjectList || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load subjects");
    }
  };

  const loadEvidence = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studySessionService.getEvidence({
        subjectId: selectedSubject,
        from: fromDate,
        to: toDate,
      });
      setSessions(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load evidence gallery");
    } finally {
      setLoading(false);
    }
  };


  const handleDownload = async () => {
    if (!activeImage?.proofImageUrl) return;
    setDownloading(true);
    setError("");
    try {
      const response = await fetch(activeImage.proofImageUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error("Unable to download image");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildFileName(activeImage);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    loadExams();
    loadSubjects("");
    loadEvidence();
  }, []);

  useEffect(() => {
    loadEvidence();
  }, [selectedSubject, fromDate, toDate]);

  useEffect(() => {
    setSelectedSubject("");
    loadSubjects(selectedExam);
  }, [selectedExam]);


  if (loading) {
    return <Loader label="Loading evidence gallery..." />;
  }

  return (
    <div className="space-y-4">
      {error ? <p className="status-error">{error}</p> : null}


      <div className="surface-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-title">Evidence Gallery</p>
            <p className="mt-2 text-sm text-slate-600">
              Review your study proof screenshots and track progress by exam, subject, or date.
            </p>
          </div>
          <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Filters
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Exam
              <select
                className="field-input mt-2 bg-white/90"
                value={selectedExam}
                onChange={(event) => setSelectedExam(event.target.value)}
              >
                <option value="">All exams</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subject
              <select
                className="field-input mt-2 bg-white/90"
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
                disabled={!subjects.length}
              >
                <option value="">All subjects</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              From
              <input
                type="date"
                className="field-input mt-2 bg-white/90"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              To
              <input
                type="date"
                className="field-input mt-2 bg-white/90"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      {filteredSessions.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredSessions.map((session) => (
            <button
              type="button"
              key={session.id}
              className="surface-card overflow-hidden text-left transition hover:shadow-lg"
              onClick={() => setActiveImage(session)}
            >
              <img
                src={session.proofImageUrl}
                alt={`Study proof for ${session.topicTitle}`}
                className="h-32 w-full object-cover"
                loading="lazy"
              />
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-800">{session.topicTitle}</p>
                <p className="text-xs text-slate-500">{session.subjectName}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(session.startedAt).toLocaleDateString()} · {formatDuration(session.durationSeconds)}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No evidence yet"
          description="Upload screenshots after saving a study session to see them here."
        />
      )}

      {activeImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setActiveImage(null)}
        >
          <div className="w-full max-w-[900px]">
            <div
              className="surface-card relative overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  {downloading ? "Downloading..." : "Download"}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700"
                  onClick={() => setActiveImage(null)}
                >
                  Close
                </button>
              </div>
              <img
                src={activeImage.proofImageUrl}
                alt={`Study proof for ${activeImage.topicTitle}`}
                className="max-h-[75vh] w-full object-contain bg-slate-900"
              />
              <div className="p-4">
                <p className="text-sm font-semibold text-slate-800">{activeImage.topicTitle}</p>
                <p className="text-xs text-slate-500">{activeImage.subjectName}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(activeImage.startedAt).toLocaleDateString()} · {formatDuration(activeImage.durationSeconds)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AnalyticsPage;

