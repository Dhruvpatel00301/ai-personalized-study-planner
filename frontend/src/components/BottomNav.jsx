import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../utils/constants";

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[430px] px-4 pb-3">
      <div className="grid grid-cols-4 rounded-card bg-white p-2 shadow-soft">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `rounded-lg py-2 text-center text-sm font-medium ${
                isActive ? "bg-brand-500 text-white" : "text-slate-500"
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
