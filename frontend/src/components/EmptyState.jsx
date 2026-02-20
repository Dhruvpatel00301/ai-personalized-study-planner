function EmptyState({ title, description }) {
  return (
    <div className="rounded-card bg-white p-6 text-center shadow-soft">
      <p className="text-base font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default EmptyState;
