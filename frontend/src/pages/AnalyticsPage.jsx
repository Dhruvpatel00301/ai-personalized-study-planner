import { useEffect, useState } from "react";
import analyticsService from "../services/analyticsService";
import ProgressLineChart from "../components/ProgressLineChart";
import WeakCoveragePieChart from "../components/WeakCoveragePieChart";
import Loader from "../components/Loader";

function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await analyticsService.getOverview();
        setOverview(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <Loader label="Loading analytics..." />;

  return (
    <div className="space-y-4">
      {error ? <p className="status-error">{error}</p> : null}

      <div className="surface-card p-4">
        <p className="section-title">Readiness Score</p>
        <p className="text-3xl font-bold text-brand-700">{overview?.readiness || 0}</p>
        <p className="mt-2 text-xs text-slate-500">
          completion {overview?.metrics?.completion || 0}% - weak coverage {overview?.metrics?.weakCoverage || 0}% - streak consistency {overview?.metrics?.streakConsistency || 0}%
        </p>
      </div>

      <ProgressLineChart lineChart={overview?.lineChart || []} />
      <WeakCoveragePieChart pieChart={overview?.pieChart || { weakCompleted: 0, weakPending: 0 }} />
    </div>
  );
}

export default AnalyticsPage;

