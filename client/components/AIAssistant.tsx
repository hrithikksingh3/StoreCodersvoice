import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config";

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const suggestions = [
    "What is CodersVoice?",
    "Which projects are available?",
    "How do I purchase?",
    "Lifetime access?",
    "payment issue?",
  ];

  const clearChat = () => {
    setMessages([]);
    setTypingText("");
    setInput("");
  };

  const [typingText, setTypingText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input, history: messages.slice(-5) }),
    });

    const data = await res.json();

    setLoading(false);

    if (data.type === "product_recommendation") {
      setMessages([
        ...newMessages,
        {
          role: "ai",
          type: "products",
          products: data.products,
        },
      ]);
      setLoading(false);
      return;
    }

    if (!res.ok) {
      setMessages([...newMessages, { role: "ai", text: data.reply }]);
      return;
    }

    // Typing animation
    setTypingText("");

    let index = 0;
    const fullText = data.reply;

    const interval = setInterval(() => {
      index++;
      setTypingText(fullText.slice(0, index));

      if (index >= fullText.length) {
        clearInterval(interval);
        setMessages([...newMessages, { role: "ai", text: fullText }]);
        setTypingText("");
      }
    }, 15);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-blue-600 rounded-full text-white shadow-xl flex items-center justify-center text-xl"
      >
        🤖
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[9999] w-80 bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10">
          <div className="flex justify-between items-center mb-3">
            {/* Left Side - Title */}
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">
                🤖 CodersVoice AI
              </span>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={clearChat}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>

              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="h-64 overflow-y-auto mb-3 space-y-2 text-sm">
            {messages.length === 0 && (
              <div className="space-y-2">
                {suggestions.map((q, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => sendMessage(), 0);
                    }}
                    className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white text-xs p-2 rounded-lg"
                  >
                    {q}
                  </div>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i}>
                {m.type === "products" ? (
                  <div className="space-y-3">
                    {m.products.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-800 rounded-xl p-3 border border-white/10 space-y-2"
                      >
                        {/* Product Name */}
                        <div className="text-white font-semibold text-sm">
                          {p.name}
                        </div>

                        {/* Price */}
                        <div className="text-green-400 font-bold text-sm">
                          ₹{p.price}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex gap-2 pt-1">
                          <a
                           href={`/#/product/${p.slug}`}
                            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded-lg"
                          >
                            View Details
                          </a>

                          <a
                            href={`/#/product/${p.slug}`}
                            className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 rounded-lg"
                          >
                            Buy Now
                          </a>
                        </div>

                        {/* Micro CTA */}
                        <div className="text-xs text-slate-400 pt-1">
                          Want a quick overview of this product?
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`p-2 rounded-lg w-fit max-w-[75%] break-words ${
                      m.role === "user"
                        ? "bg-blue-600 text-white ml-auto"
                        : "bg-slate-800 text-white"
                    }`}
                  >
                    {m.text}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="text-slate-400 text-xs">Thinking...</div>
            )}
            {typingText && (
              <div className="p-2 rounded-lg w-fit max-w-[75%] break-words bg-slate-800 text-white">
                {typingText}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Ask something..."
            />

            <button
              onClick={sendMessage}
              className="px-3 py-2 bg-blue-600 rounded-lg text-white text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
