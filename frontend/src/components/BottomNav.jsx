import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../utils/constants";

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[430px] px-4 pb-3">
      <div className="surface-card grid grid-cols-4 p-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative rounded-xl py-2 text-center text-sm font-semibold transition ${
                isActive ? "bg-brand-500 text-white shadow" : "text-slate-500 hover:text-slate-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;

