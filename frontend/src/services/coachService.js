import api from "./api";

const sendMessage = async (message) => {
  const response = await api.post("/coach/chat", { message });
  return response.data.data;
};

const getHistory = async () => {
  const response = await api.get("/coach/history");
  return response.data.data;
};

export default {
  sendMessage,
  getHistory,
};