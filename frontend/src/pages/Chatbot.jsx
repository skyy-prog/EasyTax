import { Bot, CheckCircle2, Send } from "lucide-react";
import { useMemo, useState } from "react";
import api from "../api/axios";
import ErrorBanner from "../components/ErrorBanner";

const nowLabel = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const renderInline = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });

function FormattedAnswer({ text }) {
  const blocks = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let listItems = [];
  let orderedItems = [];

  const flushLists = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
    if (orderedItems.length) {
      blocks.push({ type: "ordered", items: orderedItems });
      orderedItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushLists();
      return;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    const checkedBullet = trimmed.match(/^✔\s+(.+)$/);
    const plainBullet = trimmed.match(/^[-*•]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);

    if (heading) {
      flushLists();
      blocks.push({ type: "heading", text: heading[2] });
      return;
    }

    if (checkedBullet || plainBullet) {
      orderedItems = [];
      listItems.push((checkedBullet || plainBullet)[1]);
      return;
    }

    if (ordered) {
      listItems = [];
      orderedItems.push(ordered[1]);
      return;
    }

    flushLists();
    blocks.push({ type: "paragraph", text: trimmed.replace(/^_+|_+$/g, "") });
  });

  flushLists();

  return (
    <div className="space-y-3 leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={`${block.type}-${index}`} className="text-base font-quicksand font-bold text-ink">
              {renderInline(block.text)}
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`${block.type}-${index}`} className="space-y-2">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="flex gap-2 text-sm text-ink">
                  <CheckCircle2 size={15} className="mt-0.5 flex-none text-ash" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered") {
          return (
            <ol key={`${block.type}-${index}`} className="list-decimal space-y-2 pl-5 text-sm text-ink">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="text-sm text-ink">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

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
      const { data } = await api.post("/chat", { message: text });
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
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-fog pb-6">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-ash">EASYTAX / CHATBOT</p>
          <h1 className="text-3xl font-quicksand font-bold text-ink">Chatbot</h1>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="grid flex-1 min-h-[620px] gap-0 border border-fog bg-white lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-smoke bg-charcoal p-6 text-white lg:border-b-0 lg:border-r">
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

        <section className="flex min-h-0 flex-col bg-ghost">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={message.role === "user" ? "max-w-xl" : "w-full max-w-none"}>
                  <div
                    className={`rounded-sm px-5 py-4 text-sm font-quicksand ${
                      message.role === "user"
                        ? "ml-auto bg-ink text-white"
                        : "w-full border border-fog bg-white text-ink"
                    }`}
                  >
                    {message.role !== "user" && <Bot size={14} className="mb-2 text-ash" />}
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    ) : (
                      <FormattedAnswer text={message.text} />
                    )}
                  </div>
                  <p className={`mt-1 text-[10px] font-mono text-ash ${message.role === "user" ? "text-right" : ""}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="w-full border border-fog bg-white px-5 py-4 text-sm font-quicksand text-ink">Thinking...</div>
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
