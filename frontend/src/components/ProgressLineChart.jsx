import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { lineOptions } from "../utils/chartConfig";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

function ProgressLineChart({ lineChart }) {
  const data = {
    labels: lineChart.map((item) => item.date),
    datasets: [
      {
        label: "Progress",
        data: lineChart.map((item) => item.progressPercent),
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.2)",
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="surface-card h-56 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">Progress Trend</p>
      <Line data={data} options={lineOptions} />
    </div>
  );
}

export default ProgressLineChart;

