"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, ShoppingCart, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool_calls?: { name: string; input: Record<string, unknown> }[];
}

const SUGGESTED_PROMPTS = [
  "Show me handloom sarees under ₹3000",
  "Find dupes for Fabindia kurtas",
  "I'm looking for indie-boho accessories",
  "What's trending in block print fashion?",
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
        isUser ? "bg-brand-500" : "bg-gradient-to-br from-purple-500 to-brand-500"
      )}>
        {isUser ? <User size={13} className="text-white" /> : <Sparkles size={13} className="text-white" />}
      </div>

      <div className={cn("max-w-[80%]", isUser ? "items-end" : "items-start", "flex flex-col gap-1")}>
        <div className={cn(
          "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-brand-500 text-white rounded-tr-sm"
            : "bg-white border border-zinc-100 text-zinc-800 rounded-tl-sm shadow-sm"
        )}>
          {msg.content}
        </div>

        {/* Tool call badges */}
        {!isUser && msg.tool_calls && msg.tool_calls.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.tool_calls.map((tc, i) => (
              <span key={i} className="text-[10px] bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full font-medium">
                🔧 {tc.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center flex-shrink-0">
        <Sparkles size={13} className="text-white" />
      </div>
      <div className="bg-white border border-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm Dupe, your AI shopping assistant. I can help you find affordable alternatives to expensive fashion, discover local artisan brands, or search by style. What are you looking for?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const reply = data.data;

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply.message || "Sorry, I couldn't process that. Please try again.",
          tool_calls: reply.tool_calls,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/" className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center">
          <ArrowLeft size={18} className="text-zinc-600" />
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center">
          <Sparkles size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">Dupe AI</p>
          <p className="text-xs text-emerald-500 font-medium">Online</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100">
          <Sparkles size={10} className="text-purple-500" />
          <span className="text-[10px] font-semibold text-purple-600">Claude Sonnet 5</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts (only when only the welcome message is shown) */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="h-8 px-3.5 rounded-full border border-zinc-200 bg-white text-xs font-medium text-zinc-600 hover:border-brand-300 hover:text-brand-600 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white border-t border-zinc-100 px-4 py-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 h-11">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask anything about fashion…"
            className="flex-1 bg-transparent text-sm text-zinc-800 placeholder-zinc-400 outline-none"
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-600 transition-colors"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
