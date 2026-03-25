import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen px-4 pb-10 pt-10 md:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <header className="surface-card relative overflow-hidden p-6 md:p-8">
          <p className="section-title relative">AI Personalized Study Planner</p>
          <div className="relative mt-4 grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-brand-700 md:text-4xl">
                Plan smarter. Study with proof.
              </h1>
              <p className="mt-3 text-sm text-slate-600 md:text-base">
                Build your exam roadmap, auto-generate daily tasks, and lock in
                real progress with timers, streaks, and evidence uploads.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary w-auto px-6">
                  Create account
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-brand-200 bg-white px-6 py-2.5 text-sm font-semibold text-brand-700 shadow-sm"
                >
                  Sign in
                </Link>
                <Link
                  to="/how-it-works"
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                >
                  How it works
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Today&apos;s focus
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-800">
                  DBMS · ER Model
                </p>
                <p className="text-xs text-slate-500">25 min study · proof required</p>
              </div>
              <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Streak
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">7 days</p>
                <p className="text-xs text-slate-500">Stay consistent</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "1. Create your exam",
              text: "Add exam name and date to align your schedule with your deadline.",
            },
            {
              title: "2. Add subjects & topics",
              text: "Tag topics as weak, normal, or strong so the planner can weight them.",
            },
            {
              title: "3. Generate the plan",
              text: "Daily tasks appear automatically.",
            },
          ].map((item) => (
            <div key={item.title} className="surface-card p-4">
              <p className="text-sm font-semibold text-brand-700">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <div className="surface-card p-6">
            <p className="section-title">Evidence driven</p>
            <h2 className="mt-2 text-xl font-bold text-slate-800">
              Log real study sessions
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Start a timer, save your session, and upload proof. Completed tasks
              move out of your queue so you always know what remains.
            </p>
            <div className="mt-4 rounded-2xl bg-brand-50 p-4 text-sm text-brand-700">
              Screenshot + time = verified progress.
            </div>
          </div>
          <div className="surface-card p-6">
            <p className="section-title">AI Coach</p>
            <h2 className="mt-2 text-xl font-bold text-slate-800">
              Ask focused questions
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Get quick guidance about today’s tasks or weak topics without
              leaving the planner.
            </p>
            <div className="mt-4 space-y-2">
              <div className="rounded-xl bg-white/90 px-3 py-2 text-sm text-slate-700">
                “What should I finish first today?”
              </div>
              <div className="rounded-xl bg-brand-500 px-3 py-2 text-sm text-white">
                Start with the weakest topic to build momentum.
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-title">Ready to begin?</p>
              <h2 className="mt-2 text-xl font-bold text-slate-800">
                Turn plans into daily wins.
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Join and build your personalized study plan in minutes.
              </p>
            </div>
            <Link to="/register" className="btn-primary w-auto px-6">
              Start free
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
