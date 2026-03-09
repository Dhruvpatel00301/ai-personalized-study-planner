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

  const conceptScore = overview?.confidenceMeter?.concept ?? overview?.metrics?.weakCoverage ?? 0;
  const practiceScore = overview?.confidenceMeter?.practice ?? overview?.metrics?.completion ?? 0;
  const consistencyScore = overview?.confidenceMeter?.consistency ?? overview?.metrics?.streakConsistency ?? 0;

  const confidenceCards = [
    { key: "concept", label: "Concept", value: conceptScore, color: "from-sky-500 to-blue-500" },
    { key: "practice", label: "Practice", value: practiceScore, color: "from-indigo-500 to-blue-600" },
    { key: "consistency", label: "Consistency", value: consistencyScore, color: "from-blue-600 to-cyan-600" },
  ];

  return (
    <div className="space-y-4">
      {error ? <p className="status-error">{error}</p> : null}

      <div className="surface-card p-4">
        <p className="section-title">Exam Confidence Meter</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {confidenceCards.map((item) => (
            <div key={item.key} className="rounded-2xl bg-white/80 p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">{item.value}%</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                <div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${item.color}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card p-4">
        <p className="section-title">Overall Readiness</p>
        <p className="text-3xl font-bold text-brand-700">{overview?.readiness || 0}</p>
        <p className="mt-2 text-xs text-slate-500">
          completion {overview?.metrics?.completion || 0}% - weak coverage{" "}
          {overview?.metrics?.weakCoverage || 0}% - streak consistency{" "}
          {overview?.metrics?.streakConsistency || 0}%
        </p>
      </div>

      <ProgressLineChart lineChart={overview?.lineChart || []} />
      <WeakCoveragePieChart pieChart={overview?.pieChart || { weakCompleted: 0, weakPending: 0 }} />
    </div>
  );
}

export default AnalyticsPage;

