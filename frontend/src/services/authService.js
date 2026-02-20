import api from "./api";

const authService = {
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data.data;
  },

  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data.data;
  },

  async me() {
    const { data } = await api.get("/auth/me");
    return data.data;
  },
};

export default authService;
