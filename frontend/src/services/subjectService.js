import api from "./api";

const subjectService = {
  async getSubjects() {
    const { data } = await api.get("/subjects");
    return data.data;
  },

  async createSubject(payload) {
    const { data } = await api.post("/subjects", payload);
    return data.data;
  },

  async updateSubject(subjectId, payload) {
    const { data } = await api.put(`/subjects/${subjectId}`, payload);
    return data.data;
  },

  async deleteSubject(subjectId) {
    await api.delete(`/subjects/${subjectId}`);
  },

  async getTopics(subjectId) {
    const { data } = await api.get(`/topics/${subjectId}`);
    return data.data;
  },

  async createTopic(subjectId, payload) {
    const { data } = await api.post(`/topics/${subjectId}`, payload);
    return data.data;
  },

  async updateTopic(topicId, payload) {
    const { data } = await api.put(`/topics/item/${topicId}`, payload);
    return data.data;
  },

  async deleteTopic(topicId) {
    await api.delete(`/topics/item/${topicId}`);
  },
};

export default subjectService;
