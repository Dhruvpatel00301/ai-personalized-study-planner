import api from "./api";

const analyticsService = {
  async getOverview() {
    const { data } = await api.get("/analytics/overview");
    return data.data;
  },
};

export default analyticsService;
