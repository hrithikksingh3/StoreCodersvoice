import React, { useState } from "react";
import { API_BASE_URL } from "../config";

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages([...newMessages, { role: "ai", text: data.reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full text-white shadow-xl flex items-center justify-center text-xl"
      >
        🤖
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold text-sm">
              CodersVoice AI
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="h-64 overflow-y-auto mb-3 space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg ${
                  m.role === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-slate-800 text-white"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="text-slate-400 text-xs">
                Thinking...
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
