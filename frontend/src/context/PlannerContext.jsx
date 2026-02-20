import { createContext, useContext, useMemo, useState } from "react";

const PlannerContext = createContext(null);

export function PlannerProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const value = useMemo(() => ({ refreshKey, triggerRefresh }), [refreshKey]);

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  return useContext(PlannerContext);
}

