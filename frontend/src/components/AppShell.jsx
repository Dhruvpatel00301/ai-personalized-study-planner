import { useState } from "react";
import { Outlet } from "react-router-dom";
import StickyHeader from "./StickyHeader";
import BottomNav from "./BottomNav";
import StudyCoach from "./StudyCoach";

function AppShell() {
  const [coachOpen, setCoachOpen] = useState(false);

  return (
    <div className="relative min-h-screen px-4 pb-28 pt-24">
      <StickyHeader />
      <Outlet />

      <div className="fixed bottom-20 left-0 right-0 z-40 mx-auto max-w-[430px] px-4">
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
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setCoachOpen(false)}
            aria-label="Close Study Coach"
          />
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[430px] px-4 pb-24">
            <div className="surface-card mb-3 flex items-center justify-between p-3">
              <p className="section-title">Study Coach</p>
              <button
                type="button"
                onClick={() => setCoachOpen(false)}
                className="text-sm font-semibold text-brand-600"
              >
                Close
              </button>
            </div>
            <StudyCoach hideTitle={true} />
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
  );
}

export default AppShell;