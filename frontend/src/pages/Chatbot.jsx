import { Bot, Send } from "lucide-react";
import { useMemo, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";

const nowLabel = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Ask me about GST filing, input tax credit, and invoice tax treatment.",
      time: nowLabel(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const suggestions = useMemo(
    () => [
      "What expenses are tax deductible for retailers?",
      "How do I calculate GST from total amount?",
      "When is GSTR-3B due this month?",
      "How to handle input tax credit on mixed supplies?",
      "Show a GST reconciliation checklist",
    ],
    []
  );

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text,
      time: nowLabel(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const { data } = await api.post("/chatbot", { message: text });
      const answer = data?.answer || data?.message || data?.reply || "No response received.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: answer,
          time: nowLabel(),
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / CHATBOT</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Chatbot</h1>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="grid h-[calc(100vh-13rem)] gap-0 border border-fog bg-white lg:grid-cols-3">
        <aside className="border-r border-smoke bg-charcoal p-8 text-white lg:col-span-1">
          <h2 className="text-lg font-quicksand font-semibold text-white">Tax Assistant</h2>
          <p className="mt-2 text-sm font-quicksand text-silver">Choose a question to prefill your message.</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setInput(item)}
                className="cursor-pointer border border-smoke px-3 py-2 text-left text-xs font-quicksand text-silver transition-colors hover:border-silver hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex h-full flex-col bg-ghost lg:col-span-2">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-sm">
                  <div
                    className={`rounded-sm px-5 py-3 text-sm font-quicksand ${
                      message.role === "user"
                        ? "ml-auto bg-ink text-white"
                        : "border border-fog bg-white text-ink"
                    }`}
                  >
                    {message.role !== "user" && <Bot size={14} className="mb-2 text-ash" />}
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <p className="mt-1 text-[10px] font-mono text-ash">{message.time}</p>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="max-w-sm border border-fog bg-white px-5 py-3 text-sm font-quicksand text-ink">Thinking...</div>
              </div>
            )}
          </div>

          <div className="flex gap-3 border-t border-fog bg-white p-4">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your tax question"
              className="flex-1 border-b border-fog bg-transparent text-sm font-mono text-ink focus:border-ink focus:outline-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="rounded-sm bg-ink px-5 py-2.5 text-xs font-quicksand text-white transition-colors hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                <Send size={12} />
                Send
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
