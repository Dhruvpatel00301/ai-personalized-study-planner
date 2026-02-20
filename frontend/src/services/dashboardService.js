import api from "./api";

const dashboardService = {
  async getSummary() {
    const { data } = await api.get("/dashboard/summary");
    return data.data;
  },

  async getToday() {
    const { data } = await api.get("/daily-schedule/today");
    return data.data;
  },

  async markComplete(taskId) {
    const { data } = await api.patch(`/daily-schedule/${taskId}/complete`);
    return data.data;
  },
};

export default dashboardService;

