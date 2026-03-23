import { useState } from "react";
import { Outlet } from "react-router-dom";
import StickyHeader from "./StickyHeader";
import BottomNav from "./BottomNav";
import StudyCoach from "./StudyCoach";
import DesktopSidebar from "./DesktopSidebar";

function AppShell() {
  const [coachOpen, setCoachOpen] = useState(false);

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
            className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-600"
            aria-label="Open Study Coach"
          >
            AI
          </button>
        </div>
      </div>

      {coachOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-50">
          <div className="mx-auto flex h-full max-w-[430px] flex-col px-4 pb-4 pt-6 md:max-w-[720px]">
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

      <BottomNav />
    </div>
  );
}

export default AppShell;
