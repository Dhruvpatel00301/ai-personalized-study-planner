function OnboardingModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
      <div className="surface-card w-full max-w-[420px] p-5">
        <p className="section-title">Welcome</p>
        <h2 className="mt-2 text-xl font-bold text-slate-800">
          AI Personalized Study Planner
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Here’s the fastest way to get started.
        </p>

        <ol className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="rounded-lg bg-white/80 p-3">
            1. Create an exam and add subjects.
          </li>
          <li className="rounded-lg bg-white/80 p-3">
            2. Add topics and mark strength (weak/normal/strong).
          </li>
          <li className="rounded-lg bg-white/80 p-3">
            3. Generate your study plan to see today’s tasks.
          </li>
          <li className="rounded-lg bg-white/80 p-3">
            4. Start timer → Save → Upload screenshot to complete a task.
          </li>
        </ol>

        <div className="mt-5 flex gap-2">
          <button type="button" className="btn-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;

