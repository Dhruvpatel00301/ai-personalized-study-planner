import { Link } from "react-router-dom";
import { formatDate } from "../utils/dateUtils";

function ExamCard({ exam, onDelete }) {
  return (
    <div className="relative">
      <Link
        to={`/exams/${exam._id}`}
        className="surface-card block p-4 transition hover:translate-y-[-1px]"
      >
        <h3 className="text-base font-semibold text-slate-800">{exam.name}</h3>
        <p className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
          {formatDate(exam.examDate)}
        </p>
        {exam.description ? <p className="mt-2 text-sm text-slate-600">{exam.description}</p> : null}
      </Link>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          title="Delete exam"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default ExamCard;
