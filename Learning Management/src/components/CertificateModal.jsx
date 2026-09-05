import React from 'react';
import { Award, CheckCircle2, X, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export default function CertificateModal({ course, onClose }) {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel p-8 lg:p-12 rounded-3xl border border-amber-500/30 shadow-2xl space-y-6 text-center">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Watermark Header */}
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400">
            OFFICIAL CERTIFICATE OF COMPLETION
          </span>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-white">
            SynapseAI Platform Credential
          </h2>
        </div>

        <p className="text-xs text-slate-400">This certifies that</p>
        <div className="text-xl lg:text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-300">
          Learner Champion (Alex Vance)
        </div>
        <p className="text-xs text-slate-400">has successfully completed the articulated curriculum for</p>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-base font-heading font-bold text-white">{course.title}</div>
          <div className="text-xs text-slate-400 mt-1">Issued by {course.creator} • 100% Mastery Verified</div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> ID: SYN-2026-98142-VERIFIED
          </div>
          <div>Issued: {new Date().toLocaleDateString()}</div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.playSuccess();
              window.print();
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download / Print Certificate
          </button>
        </div>

      </div>
    </div>
  );
}
