import React, { useState } from 'react';
import { 
  X, HelpCircle, Sparkles, Send, BookOpen, ShieldCheck, Rocket, Cpu, 
  MessageSquare, ChevronRight, CheckCircle2, ArrowRight, Lightbulb, Terminal
} from 'lucide-react';

export default function HelpCenterModal({ isOpen, onClose, onNavigateToAcademy, currentUser }) {
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  if (!isOpen) return null;

  const handleAskAi = (e, customQuery = query) => {
    if (e) e.preventDefault();
    const q = customQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      let responseText = "StartupOS AI recommends breaking down your product into an 8-part PRD spec, using AntiGravity for autonomous execution, and ensuring all 4 baseline files (AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md) are present.";
      
      const qLower = q.toLowerCase();
      if (qLower.includes('parity') || qLower.includes('agents') || qLower.includes('file')) {
        responseText = "To achieve 100% 4-File Parity health: Ensure your project root contains AGENTS.md (system prompt constitution), ROADMAP.md (task milestones), CLAUDE.md (execution commands), and CONTRIBUTING.md (PR guidelines). Use the My Projects tab to audit status automatically.";
      } else if (qLower.includes('launch') || qLower.includes('upvote') || qLower.includes('product')) {
        responseText = "To launch your product: Click '+ Launch Product' in the left sidebar. Provide your product title, tagline, category, and demo URL. Your listing will appear on the StartupOS Launchpad Feed where makers can upvote and discuss.";
      } else if (qLower.includes('prompt') || qLower.includes('antigravity') || qLower.includes('stack')) {
        responseText = "For optimal AI prompt engineering: Specify exact component boundaries, state structures, and API contracts. In AI Academy, you can copy verified prompt templates pre-tuned for AntiGravity, Claude Code, and Replit.";
      }

      setAiResponse(responseText);
      setLoading(false);
    }, 600);
  };

  const faqs = [
    {
      q: "How does 100% 4-File Parity score work?",
      a: "StartupOS automatically audits your project workspace for 4 core files: AGENTS.md, ROADMAP.md, CLAUDE.md, and CONTRIBUTING.md. Having all 4 files ensures AI coding agents adhere strictly to your project rules."
    },
    {
      q: "Which AI coding tool should I use for my app?",
      a: "Use AntiGravity for autonomous multi-file multi-agent execution, Emergent for quick full-stack prototypes, Replit for instant browser hosting, and Claude Code for deep refactoring."
    },
    {
      q: "How do I submit my shipped app to the Launchpad?",
      a: "Click '+ Launch Product' in the top header or sidebar. Enter your product details, category, and GitHub or Live Demo URL. Your app will immediately be listed for community upvotes."
    },
    {
      q: "What is the difference between AI Academy and Help Center?",
      a: "AI Academy provides structured 8-part courses and course authoring suites. The Help Center provides instant 1-on-1 AI assistance, governance troubleshooting, and quick setup answers."
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 relative space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 uppercase tracking-widest flex items-center gap-1.5 w-fit">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> StartupOS AI Assistance & Support
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">How Can We Help You Build Today?</h2>
            <p className="text-xs text-slate-300 font-medium">Get instant 1-on-1 AI guidance on scoping ideas, 4-file governance, tech stack selection, and product launches.</p>
          </div>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1">
          {/* AI CONCIERGE ASSISTANT INTERACTIVE INPUT */}
          <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Ask StartupOS AI Concierge</span>
            </div>

            <form onSubmit={handleAskAi} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything (e.g. 'How do I fix 4-file parity?', 'Which AI tool to use?')..."
                className="flex-1 px-4 py-3 bg-white rounded-xl border border-indigo-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Thinking...' : 'Ask AI'}
              </button>
            </form>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "How do I achieve 100% 4-File Parity?",
                "Which AI coding tool to choose?",
                "How to launch on StartupOS feed?"
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={(e) => handleAskAi(e, chip)}
                  className="text-[11px] font-medium bg-white hover:bg-indigo-100/80 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-200/80 transition-colors"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>

            {/* AI Response Output */}
            {aiResponse && (
              <div className="p-4 rounded-xl bg-white border border-indigo-200 text-xs text-slate-800 space-y-2 animate-in fade-in slide-in-from-bottom-2 shadow-xs">
                <span className="font-bold text-indigo-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> StartupOS AI Assistant Response:
                </span>
                <p className="leading-relaxed font-medium text-slate-700">{aiResponse}</p>
              </div>
            )}
          </div>

          {/* 4 SPECIALIZED SUPPORT PILLARS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 transition-all shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Tech Stack & Tooling Selection</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Learn how to pair AntiGravity, Emergent, Replit, and Claude for your app type.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition-all shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Governance & 4-File Parity</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Troubleshoot AGENTS.md, ROADMAP.md, CLAUDE.md, and CONTRIBUTING.md rules.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-amber-300 transition-all shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Rocket className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Product Launchpad & Upvotes</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Learn how to feature your shipped product and gain community maker engagement.
              </p>
            </div>

            <div 
              onClick={() => {
                onClose();
                onNavigateToAcademy();
              }}
              className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800 hover:border-indigo-600 transition-all shadow-xs space-y-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1">
                Explore AI Academy Courses <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take deep structured 8-part build courses for founders and non-coders.
              </p>
            </div>
          </div>

          {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Frequently Asked Builder Questions
            </h3>

            <div className="space-y-2">
              {faqs.map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-slate-800 flex justify-between items-center hover:bg-slate-100/80 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-90 text-indigo-600' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white font-medium">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Need live human support? Reach out at <strong>support@startupos.io</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 rounded-xl transition-all"
          >
            Close Help Center
          </button>
        </div>
      </div>
    </div>
  );
}
