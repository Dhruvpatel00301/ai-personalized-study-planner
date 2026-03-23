import api from "./api";

const recoveryService = {
  async getPreview() {
    const { data } = await api.get("/recovery/preview");
    return data.data;
  },

  async applyPlan() {
    const { data } = await api.post("/recovery/apply");
    return data.data;
  },
};

export default recoveryService;