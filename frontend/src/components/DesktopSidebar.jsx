import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../utils/constants";

function DesktopSidebar() {
  return (
    <aside className="hidden md:block">
      <div className="sticky top-24 space-y-4">
        <div className="surface-card p-4">
          <p className="section-title">Navigation</p>
          <nav className="mt-3 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-brand-500 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="surface-card p-4">
          <p className="section-title">Study Coach</p>
          <p className="mt-2 text-sm text-slate-600">
            Need a quick suggestion? Tap the AI button to open your coach.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default DesktopSidebar;