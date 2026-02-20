import api from "./api";

const profileService = {
  async updateProfile(payload) {
    const { data } = await api.put("/profile", payload);
    return data.data;
  },
};

export default profileService;
