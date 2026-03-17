import api from "./api";

const studySessionService = {
  async saveSession({ topicId, durationSeconds, startedAt, proofFile }) {
    const formData = new FormData();
    formData.append("topicId", topicId);
    formData.append("durationSeconds", String(durationSeconds));
    if (startedAt) {
      formData.append("startedAt", startedAt);
    }
    if (proofFile) {
      formData.append("proof", proofFile);
    }

    const { data } = await api.post("/study-sessions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async uploadProof(sessionId, proofFile) {
    const formData = new FormData();
    formData.append("proof", proofFile);
    const { data } = await api.patch(`/study-sessions/${sessionId}/proof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
};

export default studySessionService;
