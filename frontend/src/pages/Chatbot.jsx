import { useMemo, useState } from "react";
import api from "../api/axios";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Ask me about GST, ITR, TDS, filing timelines, and tax basics.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const infoItems = useMemo(
    () => ["GST guidance", "ITR basics", "TDS questions", "General filing support"],
    []
  );

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const { data } = await api.post("/chatbot", { message: trimmed });
      const answer = data?.answer || data?.message || data?.reply || "No response received.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "error",
          text: error.response?.data?.message || "Message failed. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-7xl flex-col gap-4 lg:flex-row">
      <aside className="border-2 border-primary bg-white p-5 shadow-brutal lg:w-1/3">
        <h2 className="font-quicksand text-2xl font-bold">AI Tax Assistant</h2>
        <p className="mt-2 text-sm">Get practical answers for daily tax and compliance work.</p>
        <div className="mt-4 space-y-2">
          {infoItems.map((item) => (
            <div key={item} className="border-2 border-primary bg-base px-3 py-2 text-sm font-bold">
              {item}
            </div>
          ))}
        </div>
      </aside>

      <section className="flex flex-1 flex-col border-2 border-primary bg-white shadow-brutal lg:w-2/3">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((message) => {
            const isUser = message.role === "user";
            const isError = message.role === "error";
            return (
              <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] border-2 border-primary px-3 py-2 text-sm ${
                    isUser ? "bg-accent text-primary" : isError ? "bg-accent text-primary" : "bg-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex justify-start">
              <div className="border-2 border-primary bg-white px-3 py-2 text-sm">Typing...</div>
            </div>
          )}
        </div>

        <div className="border-t-2 border-primary p-3">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a tax question"
              disabled={sending}
              rows={2}
              className="data-mono flex-1 resize-none border-2 border-primary bg-white px-3 py-2 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="h-fit border-2 border-primary bg-accent px-5 py-2 font-bold shadow-brutal transition hover:shadow-brutalSm disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
