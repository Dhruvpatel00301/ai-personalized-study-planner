import { useEffect, useRef, useState } from "react";
import coachService from "../services/coachService";

const STORAGE_KEY = "studyCoachHistory";

export default function StudyCoach({ hideTitle = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const { history } = await coachService.getHistory();
        if (mounted && history?.length) {
          setMessages(history.map((item) => ({ role: item.role, text: item.text })));
          return;
        }
      } catch (err) {
        // ignore and fall back to local storage
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (mounted && stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length) {
            setMessages(parsed);
            return;
          }
        } catch (e) {
          // ignore
        }
      }

      if (mounted) {
        setMessages([
          {
            role: "assistant",
            text: "Hi! I'm your Study Coach. Ask me about today's tasks or weak topics.",
          },
        ]);
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setError("");
    setLoading(true);
    const nextMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    try {
      const data = await coachService.sendMessage(trimmed);
      setMessages([...nextMessages, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || "Coach is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          <div className="surface-card p-4">
            {hideTitle ? null : <p className="section-title">Study Coach</p>}
            <div className={hideTitle ? "space-y-2" : "mt-3 space-y-2"}>
              {messages.map((msg, index) => (
                <div
                  key={`${msg.role}-${index}`}
                  className={`chat-bubble max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "ml-auto chat-bubble-user"
                      : "chat-bubble-assistant"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loading ? (
                <div className="chat-bubble chat-bubble-assistant max-w-[60%] rounded-2xl px-3 py-2 text-sm text-slate-500">
                  <div className="typing-dots">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              ) : null}
              <div ref={endRef} />
            </div>
            {error ? <p className="status-error mt-3">{error}</p> : null}
          </div>
        </div>
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
