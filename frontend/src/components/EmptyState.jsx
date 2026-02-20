function EmptyState({ title, description }) {
  return (
    <div className="surface-card border-dashed p-6 text-center">
      <p className="text-base font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default EmptyState;

