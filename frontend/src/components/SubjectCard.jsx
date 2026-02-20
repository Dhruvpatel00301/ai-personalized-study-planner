import { Link } from "react-router-dom";
import { formatDate } from "../utils/dateUtils";

function SubjectCard({ subject }) {
  return (
    <Link
      to={`/subjects/${subject._id}`}
      className="surface-card block p-4 transition hover:translate-y-[-1px]"
    >
      <h3 className="text-base font-semibold text-slate-800">{subject.name}</h3>
      <p className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
        Exam: {formatDate(subject.examDate)}
      </p>
      {subject.description ? <p className="mt-2 text-sm text-slate-600">{subject.description}</p> : null}
    </Link>
  );
}

export default SubjectCard;

