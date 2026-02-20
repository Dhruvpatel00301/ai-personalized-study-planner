import { Outlet } from "react-router-dom";
import StickyHeader from "./StickyHeader";
import BottomNav from "./BottomNav";

function AppShell() {
  return (
    <div className="relative min-h-screen px-4 pb-24 pt-20">
      <StickyHeader />
      <Outlet />
      <BottomNav />
    </div>
  );
}

export default AppShell;
