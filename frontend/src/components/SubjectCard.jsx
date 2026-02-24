import { Link } from "react-router-dom";
import { formatDate } from "../utils/dateUtils";

function SubjectCard({ subject, onDelete }) {
  return (
    <div className="relative">
      <Link
        to={`/subjects/${subject._id}`}
        className="surface-card block p-4 transition hover:translate-y-[-1px]"
      >
        <h3 className="text-base font-semibold text-slate-800">{subject.name}</h3>
        {subject.examId && subject.examId.name ? (
          <p className="mt-1 text-xs text-slate-500">For exam: {subject.examId.name}</p>
        ) : null}
        {subject.examDate ? (
          <p className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
            Exam: {formatDate(subject.examDate)}
          </p>
        ) : null}
        {subject.description ? <p className="mt-2 text-sm text-slate-600">{subject.description}</p> : null}
      </Link>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          title="Delete subject"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default SubjectCard;

