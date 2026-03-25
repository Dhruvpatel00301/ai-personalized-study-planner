import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import StickyHeader from "./StickyHeader";
import BottomNav from "./BottomNav";
import StudyCoach from "./StudyCoach";
import DesktopSidebar from "./DesktopSidebar";
import OnboardingModal from "./OnboardingModal";

function AppShell() {
  const [coachOpen, setCoachOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", coachOpen || showOnboarding);
    document.documentElement.classList.toggle("no-scroll", coachOpen || showOnboarding);
    return () => {
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
    };
  }, [coachOpen, showOnboarding]);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("onboarding_seen_v1");
      if (!seen) {
        setShowOnboarding(true);
      }
    } catch {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    try {
      localStorage.setItem("onboarding_seen_v1", "true");
    } catch {
      // ignore storage errors
    }
    setShowOnboarding(false);
  };

  return (
    <div className="relative min-h-screen px-4 pb-28 pt-28 md:px-6 md:pb-8 md:pt-28">
      <StickyHeader />

      <div className="desktop-shell">
        <div className="md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6">
          <DesktopSidebar />
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-40 mx-auto max-w-[430px] px-4 md:bottom-8 md:right-6 md:left-auto md:max-w-none">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setCoachOpen(true)}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-600"
            aria-label="Open Study Coach"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
            AI Coach
          </button>
        </div>
      </div>

      {coachOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-50">
          <div className="mx-auto flex h-full w-full max-w-[430px] flex-col px-4 pb-4 pt-6 md:max-w-none md:px-6">
            <div className="surface-card mb-4 flex items-center justify-between p-3">
              <p className="section-title">Study Coach</p>
              <button
                type="button"
                onClick={() => setCoachOpen(false)}
                className="rounded-full px-3 py-1 text-sm font-semibold text-brand-600"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <StudyCoach hideTitle={true} />
            </div>
          </div>
        </div>
      ) : null}

      {showOnboarding ? <OnboardingModal onClose={handleCloseOnboarding} /> : null}
      <BottomNav />
    </div>
  );
}

export default AppShell;
