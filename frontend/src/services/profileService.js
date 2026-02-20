import api from "./api";

const profileService = {
  async updateProfile(payload) {
    const { data } = await api.put("/profile", payload);
    return data.data;
  },

  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post("/profile/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.data;
  },
};

export default profileService;

