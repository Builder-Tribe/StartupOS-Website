import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Mail, 
  Check, 
  Copy, 
  ExternalLink, 
  Github, 
  Linkedin, 
  ShieldCheck, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export default function FounderConnectModal({ isOpen, onClose, intent = 'demo' }) {
  const [copied, setCopied] = useState(false);
  const founderName = 'Harshit Agarwal';
  const founderRole = 'AI Product Manager & 0-to-1 Systems Builder';
  const founderEmail = 'agarwal.harshit97@gmail.com';
  const githubUser = 'https://github.com/1997agarwal';
  const githubRepo = 'https://github.com/Builder-Tribe/StartupOS';
  const linkedinUrl = 'https://www.linkedin.com/in/1997agarwal';
  const xUrl = 'https://x.com/1997agarwal';

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(founderEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const mailtoSubject = intent === 'academy' 
    ? encodeURIComponent('StartupOS Academy & Builder Inquiry - Harshit Agarwal')
    : encodeURIComponent('StartupOS Architecture Demo & Walkthrough - Harshit Agarwal');
  
  const mailtoBody = encodeURIComponent(
    `Hi Harshit,\n\nI was exploring the StartupOS platform showcase and would love to schedule a 1-on-1 walkthrough / discuss product opportunities.\n\nBest,\n`
  );

  const mailtoLink = `mailto:${founderEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl max-h-[90vh] overflow-y-auto z-10 p-6 sm:p-8 space-y-6">
        
        {/* Header with Close */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-bold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Private Preview • Founder Showcase</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {intent === 'academy' ? 'Access the AI Builder Academy' : 'Schedule a Founder Walkthrough'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative */}
        <p className="text-sm text-slate-600 leading-relaxed">
          StartupOS is currently in <strong>private preview</strong>. We are conducting 1-on-1 walkthroughs with engineering leaders, product builders, and recruiters to demonstrate our 4-file constitution, autonomous agent runbooks, and 100-point architecture audits.
        </p>

        {/* Primary Action Blocks */}
        <div className="space-y-3 pt-1">
          
          {/* Option 1: Book / Mail Walkthrough */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/50 border border-indigo-100/90 space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-950">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm font-extrabold text-slate-900">1. Book a 1-on-1 Architecture Walkthrough</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal pl-9.5">
              See the live prompt-to-PRD engine in action and explore how the 4-file parity standard keeps autonomous agents aligned.
            </p>
            <div className="pl-9.5 pt-1">
              <a
                href={mailtoLink}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Request Walkthrough Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Option 2: Direct Contact / Copy Email */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs text-xs font-black">
                  HA
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block">{founderName}</span>
                  <span className="text-[11px] text-slate-500 font-medium block">{founderRole}</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Active & Fast Response
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-xs font-mono font-medium text-slate-700 truncate select-all">
                {founderEmail}
              </span>
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 3: Verified Founder Profiles */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Founder & Platform Profiles
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-xs group"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
              </a>

              <a
                href={githubUser}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-xs group"
              >
                <Github className="w-3.5 h-3.5 text-slate-900" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
              </a>

              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-xs group"
              >
                <span className="text-xs font-black text-slate-900">𝕏</span>
                <span>Twitter</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
              </a>
            </div>
          </div>

        </div>

        {/* Security / Architecture Guarantee Notice */}
        <div className="pt-2 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 leading-normal">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            <strong>Architectural Guarantee:</strong> StartupOS is built upon the <em>Universal Parent Monorepo & Satellite Architecture</em>. All product intellectual property and database connections remain strictly isolated from this public preview.
          </span>
        </div>

      </div>
    </div>
  );
}
