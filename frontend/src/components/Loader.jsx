function Loader({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="surface-card flex items-center gap-3 px-4 py-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-brand-500" />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}

export default Loader;

