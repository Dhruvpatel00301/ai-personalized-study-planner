import { useState } from "react";
import coachService from "../services/coachService";

export default function StudyCoach({ hideTitle = false }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your Study Coach. Ask me about today's tasks or weak topics." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setError("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    try {
      const data = await coachService.sendMessage(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || "Coach is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="surface-card p-4">
        {hideTitle ? null : <p className="section-title">Study Coach</p>}
        <div className={hideTitle ? "space-y-2" : "mt-3 space-y-2"}>
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "ml-auto bg-brand-500 text-white"
                  : "bg-white/80 text-slate-700"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading ? (
            <div className="max-w-[60%] rounded-2xl bg-white/80 px-3 py-2 text-sm text-slate-500">
              Thinking...
            </div>
          ) : null}
        </div>
        {error ? <p className="status-error mt-3">{error}</p> : null}
      </div>

      <form onSubmit={handleSend} className="surface-card p-3">
        <input
          className="field-input"
          placeholder="Ask about today's plan, weak topics, or schedule..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary mt-3" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}