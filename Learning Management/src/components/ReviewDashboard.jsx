import React, { useState } from 'react';
import { Award, Sparkles, CheckCircle2, UserCheck, MessageSquare, ExternalLink, Github, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

export default function ReviewDashboard({ submissions, onSaveHumanReview, currentRole }) {
  const [selectedSubId, setSelectedSubId] = useState(submissions[0]?.id);
  const [feedbackText, setFeedbackText] = useState('');
  const [humanScore, setHumanScore] = useState(94);

  const selectedSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];

  const handlePublishReview = () => {
    if (!feedbackText) return;
    sound.playSuccess();

    onSaveHumanReview(selectedSub.id, {
      reviewerName: 'Dr. Evelyn Vance (Lead PM Examiner)',
      feedbackText: feedbackText,
      score: Number(humanScore),
      date: new Date().toISOString().split('T')[0]
    });

    confetti({ particleCount: 80, spread: 60 });
    setFeedbackText('');
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs mb-1">
            <Award className="w-4 h-4" />
            <span>PHASE 4: HYBRID AI + CREATOR REVIEW SYSTEM</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-white">
            Examiner & Reviewer Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Inspect AI evaluation metrics, refine scores, and provide strategic PM feedback to learners.
          </p>
        </div>

        {currentRole !== 'CREATOR' && (
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            Switch role to "Creator / Examiner" in top header to evaluate submissions!
          </span>
        )}
      </div>

      {/* Main Grid: Submissions List & Examiner Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Submissions Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
              Submissions Pending Review ({submissions.length})
            </h3>

            <div className="space-y-2">
              {submissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedSubId(sub.id);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    sub.id === selectedSubId
                      ? 'bg-amber-950/30 border-amber-500/40 shadow-lg'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold text-white">{sub.projectTitle}</span>
                    <span className="text-[10px] font-mono text-amber-400">{sub.submittedDate}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1">By: {sub.studentName} ({sub.studentRole})</div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                    <span className="text-purple-400">AI Score: {sub.aiEvaluation?.score}/100</span>
                    <span className={sub.humanReview ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {sub.humanReview ? '✓ Reviewed' : '⏳ Needs Review'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Examiner Review Workspace */}
        <div className="lg:col-span-7 space-y-6">
          {selectedSub && (
            <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
              
              {/* Project Header */}
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  EXAMINER EVALUATION WORKSPACE
                </span>
                <h3 className="text-xl font-heading font-bold text-white mt-2">{selectedSub.projectTitle}</h3>
                <div className="text-xs text-slate-400">Student: <strong className="text-slate-200">{selectedSub.studentName}</strong> ({selectedSub.studentRole})</div>

                <div className="flex items-center gap-3 text-xs font-mono pt-2">
                  <a href={selectedSub.githubUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                    <Github className="w-3.5 h-3.5" /> Repository URL
                  </a>
                  {selectedSub.liveDemoUrl && (
                    <a href={selectedSub.liveDemoUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> Live Demo URL
                    </a>
                  )}
                </div>
              </div>

              {/* AI Evaluator Output (PRD Section 3.4.3) */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-heading font-bold border-b border-slate-800 pb-2">
                  <span className="text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> AI Evaluator Layer Report
                  </span>
                  <span className="text-emerald-400 font-mono text-sm">AI Score: {selectedSub.aiEvaluation?.score}/100</span>
                </div>

                <div className="text-xs text-slate-300 font-sans space-y-2">
                  <p><strong>Clarity of Problem:</strong> {selectedSub.aiEvaluation?.clarityOfProblem}</p>
                  <p><strong>Code Quality & Architecture:</strong> {selectedSub.aiEvaluation?.codeQuality}</p>
                  <p><strong>Overall Summary:</strong> {selectedSub.aiEvaluation?.overallSummary}</p>
                </div>
              </div>

              {/* Human Review Form (PRD Section 3.4.2) */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-heading font-bold text-amber-400 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Human PM / Creator Endorsement & Feedback
                </h4>

                <div>
                  <label className="text-xs font-heading font-bold text-slate-200 block mb-1">
                    Final PM Score (1-100)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={humanScore}
                    onChange={(e) => setHumanScore(e.target.value)}
                    className="w-32 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-heading font-bold text-slate-200 block mb-1">
                    Strategic Feedback & Improvement Checklist
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide constructive feedback on architecture, UX clarity, and product strategy..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <button
                  onClick={handlePublishReview}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-heading font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Publish Final Review to Student
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
