import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full rounded-card bg-white p-6 text-center shadow-soft">
        <p className="text-lg font-semibold text-slate-800">Page not found</p>
        <Link to="/" className="mt-3 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

