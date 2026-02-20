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
      <div className="surface-card relative overflow-hidden p-4">
        <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-brand-100/70" />
        <p className="section-title relative">AI Personalized Study Planner</p>
        <div className="relative mt-1 flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-700">{title}</h1>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            Mobile
          </span>
        </div>
      </div>
    </header>
  );
}

export default StickyHeader;

