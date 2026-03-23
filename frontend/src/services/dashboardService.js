import api from "./api";

const dashboardService = {
  async getSummary() {
    const { data } = await api.get("/dashboard/summary");
    return data.data;
  },

  async markComplete(taskId) {
    const { data } = await api.post("/dashboard/complete", { taskId });
    return data.data;
  },
};

export default dashboardService;