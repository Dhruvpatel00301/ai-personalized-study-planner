import { Link } from "react-router-dom";

function HowItWorksPage() {
  const steps = [
    {
      title: "1. Create your exam",
      detail:
        "Add an exam name and date. This anchors your entire schedule to a real deadline.",
    },
    {
      title: "2. Add subjects",
      detail:
        "Create subjects under the exam (ex: DBMS, Algorithms). Each subject holds topics.",
    },
    {
      title: "3. Add topics + strength",
      detail:
        "Add topics for each subject and mark them as weak/normal/strong so the planner can weight them.",
    },
    {
      title: "4. Generate your study plan",
      detail:
        "The scheduler distributes topics across the remaining days, inserts revision days, and builds today’s tasks.",
    },
    {
      title: "5. Study with proof",
      detail:
        "Start the timer, Save the session, then upload a screenshot as proof. The task moves to Completed.",
    },
    {
      title: "6. Track progress",
      detail:
        "See streaks, daily minutes, and evidence gallery. Use the AI Coach for quick guidance.",
    },
    {
      title: "7. Recovery planning",
      detail:
        "If you miss a day, the recovery planner auto‑rebalances your remaining schedule.",
    },
  ];

  return (
    <div className="min-h-screen px-4 pb-10 pt-10 md:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="surface-card p-6 md:p-8">
          <p className="section-title">How It Works</p>
          <h1 className="mt-2 text-2xl font-bold text-brand-700 md:text-3xl">
            From exam setup to daily wins
          </h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            This quick walkthrough shows the full workflow — start to finish.
          </p>
        </div>

        <div className="grid gap-4">
          {steps.map((step) => (
            <div key={step.title} className="surface-card p-5">
              <p className="text-sm font-semibold text-brand-700">{step.title}</p>
              <p className="mt-2 text-sm text-slate-600">{step.detail}</p>
            </div>
          ))}
        </div>

        <div className="surface-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-title">Ready?</p>
              <p className="mt-1 text-sm text-slate-600">
                Start by creating your exam and adding subjects.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/register" className="btn-primary w-auto px-5">
                Create account
              </Link>
              <Link
                to="/landing"
                className="rounded-xl border border-brand-200 bg-white px-5 py-2 text-sm font-semibold text-brand-700"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorksPage;

