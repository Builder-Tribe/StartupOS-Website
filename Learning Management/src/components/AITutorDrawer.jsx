import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, MessageSquare, Terminal } from 'lucide-react';
import { sound } from '../utils/sound';

export default function AITutorDrawer({ isOpen, onClose, currentLessonContext }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hi there! I am your AI Builder Coach. I see you're working on "${currentLessonContext?.title || 'Drafting AI Prompt Architecture'}". Ask me anything about prompts, tools (Antigravity, Claude Code, Cursor, Replit), or how to debug issues!`
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const userMsg = textToSend || query;
    if (!userMsg.trim()) return;

    sound.playClick();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    if (!textToSend) setQuery('');
    setIsThinking(true);

    setTimeout(() => {
      sound.playSuccess();
      let aiText = "Here is how to approach this step: Make sure your AI coding tool has active project context. Copy the prompt block provided in the Guided Builder workbench and paste it into your tool console.";
      
      if (userMsg.toLowerCase().includes('simpler') || userMsg.toLowerCase().includes('non-coder')) {
        aiText = "💡 **Non-Coder Analogy**: Think of your database schema like a digital filing cabinet. The migration file you generated is just the instruction manual telling the cabinet how many drawers to create (tables) and what labels to put on each folder (columns)!";
      } else if (userMsg.toLowerCase().includes('debug') || userMsg.toLowerCase().includes('error')) {
        aiText = "🚨 **Debugging Tip**: If your AI tool output throws an error, copy the exact error log message and paste it back to the AI tool with the prompt: *'I received this error while running the previous migration. Fix it and update the SQL script.'*";
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiText }]);
      setIsThinking(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] glass-panel border-l border-slate-800 shadow-2xl flex flex-col backdrop-blur-2xl animate-fade-in">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2 text-cyan-400 font-heading font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          AI Tutor Layer (Context Injected)
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none font-sans whitespace-pre-line'
              }`}
            >
              {m.text}
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            AI Tutor is analyzing step context...
          </div>
        )}
      </div>

      {/* Quick Prompts for Non-Coders */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-2">
        <div className="text-[10px] font-mono text-slate-500">Quick Non-Coder Suggestions:</div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSend('Explain this concept simpler for a non-coder founder')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300"
          >
            💡 Explain Simpler
          </button>
          <button
            onClick={() => handleSend('How do I debug an error in my AI tool prompt?')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300"
          >
            🚨 Debug Prompt Error
          </button>
        </div>
      </div>

      {/* Input Row */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2">
        <input
          type="text"
          placeholder="Ask AI Tutor..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={() => handleSend()}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
