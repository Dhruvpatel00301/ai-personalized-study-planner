import api from "./api";

const coachService = {
  async sendMessage(message) {
    const { data } = await api.post("/coach/chat", { message });
    return data.data;
  },
};

export default coachService;
