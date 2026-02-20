import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import { pieOptions } from "../utils/chartConfig";

ChartJS.register(ArcElement, Tooltip, Legend);

function WeakCoveragePieChart({ pieChart }) {
  const data = {
    labels: ["Weak Completed", "Weak Pending"],
    datasets: [
      {
        data: [pieChart.weakCompleted, pieChart.weakPending],
        backgroundColor: ["#348ef8", "#b4d9ff"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="h-56 rounded-card bg-white p-4 shadow-soft">
      <p className="mb-3 text-sm font-semibold text-slate-700">Weak Topic Coverage</p>
      <Pie data={data} options={pieOptions} />
    </div>
  );
}

export default WeakCoveragePieChart;
