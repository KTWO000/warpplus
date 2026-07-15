import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCw, Sparkles, Smartphone, HelpCircle, AlertCircle } from "lucide-react";
import { ChatMessage, ConnectionStatus } from "../types";

interface AIAssistantProps {
  carrier: string;
}

export default function AIAssistant({ carrier }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "model",
      content: `Hello! I am **mGuard AI Adviser**, your personal speed optimizer and censorship-bypass assistant. 
      
I see you are currently using the **${carrier}** network. Here are some quick carrier-specific bypass parameters:

* **ATOM (Telenor)**: Set MTU to exactly \`1280\` to avoid fragmentation.
* **MPT**: Enable DNS-over-HTTPS/TLS to bypass DNS Hijacking.
* **Ooredoo**: VLESS over TLS (Port 443) provides maximum stability.

How can I assist you with your connection speed or unblocking websites today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    "How do I unblock Facebook?",
    "Optimize my speed on ATOM",
    "Best settings for MPT",
    "What is MTU 1280?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          carrier
        })
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      
      const replyMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, replyMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: "Sorry, I am having trouble connecting to my central engine. Locally resolved advice: ensure your local device is not blocking background data for mGuard.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdown = (text: string) => {
    // Simple parser for bold **text** and `code` blocks
    return text.split("\n").map((line, lineIdx) => {
      let elements: React.ReactNode[] = [];
      let currentString = "";
      let i = 0;

      while (i < line.length) {
        if (line.startsWith("**", i)) {
          if (currentString) {
            elements.push(currentString);
            currentString = "";
          }
          let end = line.indexOf("**", i + 2);
          if (end !== -1) {
            elements.push(<strong key={`b-${i}`} className="font-bold text-white">{line.substring(i + 2, end)}</strong>);
            i = end + 2;
          } else {
            currentString += "**";
            i += 2;
          }
        } else if (line.startsWith("`", i)) {
          if (currentString) {
            elements.push(currentString);
            currentString = "";
          }
          let end = line.indexOf("`", i + 1);
          if (end !== -1) {
            elements.push(
              <code key={`c-${i}`} className="bg-black/80 px-1.5 py-0.5 rounded text-xs text-neon-cyan font-mono border border-sophisticated-border">
                {line.substring(i + 1, end)}
              </code>
            );
            i = end + 1;
          } else {
            currentString += "`";
            i += 1;
          }
        } else {
          currentString += line[i];
          i++;
        }
      }
      if (currentString) {
        elements.push(currentString);
      }

      // Check if it's a bullet point
      const isBullet = line.trim().startsWith("*") || line.trim().startsWith("-");
      if (isBullet) {
        // Strip the bullet marker
        const bulletText = line.replace(/^\s*[\*\-]\s*/, "");
        return (
          <li key={lineIdx} className="ml-4 list-disc text-xs text-gray-300 leading-relaxed font-sans mb-1 mt-1">
            {elements}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="text-xs text-gray-300 leading-relaxed font-sans min-h-[1.2em] mb-1.5">
          {elements}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-sophisticated-bg overflow-hidden" id="ai-assistant-container">
      {/* Advisor Header Status */}
      <div className="p-4 bg-sophisticated-card border-b border-sophisticated-border flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-neon-cyan/10 text-neon-cyan rounded-xl flex items-center justify-center border border-neon-cyan/20">
            <Bot className="w-5 h-5 animate-pulse text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
              mGuard AI Adviser
              <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping" />
              <p className="text-[10px] text-gray-500 font-medium font-sans">Online • Ready to optimize</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-[#111111] border border-sophisticated-border text-gray-300 px-3 py-1.5 rounded-xl font-mono">
          <Smartphone className="w-3.5 h-3.5 text-neon-cyan" />
          <span>{carrier}</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="ai-chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
              m.role === "user"
                ? "bg-neon-cyan border-neon-cyan text-black"
                : "bg-[#111111] border-sophisticated-border text-neon-cyan"
            }`}>
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`p-3.5 rounded-2xl shadow-sm ${
              m.role === "user"
                ? "bg-neon-cyan text-black rounded-tr-none font-medium"
                : "bg-sophisticated-card border border-sophisticated-border text-gray-300 rounded-tl-none"
            }`}>
              <div className="space-y-1">
                {m.role === "user" ? (
                  <p className="text-xs font-sans leading-relaxed break-words">{m.content}</p>
                ) : (
                  <div>{parseMarkdown(m.content)}</div>
                )}
              </div>
              <span className={`block text-[8px] font-mono text-right mt-1.5 ${m.role === "user" ? "text-gray-800" : "text-gray-500"}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border bg-[#111111] border-sophisticated-border text-neon-cyan">
              <Bot className="w-4 h-4 animate-spin text-neon-cyan" />
            </div>
            <div className="p-4 bg-sophisticated-card border border-sophisticated-border rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-neon-cyan" />
              <span>Analyzing routing configurations...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer input and starter suggestions */}
      <div className="p-4 bg-sophisticated-card border-t border-sophisticated-border space-y-3 shrink-0 shadow-inner">
        {/* Helper Starter Prompts */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-1.5 pb-1">
            {starterPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="flex items-center gap-1 text-[11px] bg-[#111111] hover:bg-sophisticated-hover border border-sophisticated-border text-gray-300 px-3 py-1.5 rounded-xl transition-all active:scale-95"
              >
                <HelpCircle className="w-3 h-3 text-neon-cyan" />
                <span>{p}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Text Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={`Ask about ${carrier} speed optimization...`}
            className="flex-1 bg-[#111111] border border-sophisticated-border focus:border-neon-cyan text-sm text-gray-200 placeholder-gray-500 rounded-2xl px-4 py-3 focus:outline-none transition-all disabled:opacity-50 font-sans tracking-wide"
            id="ai-chat-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-neon-cyan hover:bg-[#5cf2fd] disabled:opacity-50 text-black p-3.5 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-all shadow-md"
            id="ai-chat-send-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
