import api from "./api";

const planService = {
  async generate(subjectId) {
    const { data } = await api.post(`/study-plan/generate/${subjectId}`);
    return data.data;
  },

  async recalculate(subjectId) {
    const { data } = await api.post(`/study-plan/recalculate/${subjectId}`);
    return data.data;
  },
};

export default planService;

