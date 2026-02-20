import { useLocation } from "react-router-dom";

const titles = {
  "/": "Today",
  "/subjects": "Subjects",
  "/analytics": "Analytics",
  "/profile": "Profile",
};

function StickyHeader() {
  const location = useLocation();

  const title = Object.entries(titles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  )?.[1] || "Study Planner";

  return (
    <header className="fixed left-0 right-0 top-0 z-30 mx-auto max-w-[430px] px-4 pt-3">
      <div className="rounded-card bg-white/90 p-4 shadow-soft backdrop-blur">
        <h1 className="text-lg font-semibold text-brand-700">AI Personalized Study Planner</h1>
        <p className="text-sm text-slate-500">{title}</p>
      </div>
    </header>
  );
}

export default StickyHeader;
