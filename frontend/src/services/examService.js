import api from "./api";

const examService = {
  async getExams() {
    const { data } = await api.get("/exams");
    return data.data;
  },
  async getExam(examId) {
    const { data } = await api.get(`/exams/${examId}`);
    return data.data;
  },
  async createExam(payload) {
    const { data } = await api.post("/exams", payload);
    return data.data;
  },
  async updateExam(examId, payload) {
    const { data } = await api.put(`/exams/${examId}`, payload);
    return data.data;
  },
  async deleteExam(examId) {
    await api.delete(`/exams/${examId}`);
  },
};

export default examService;
