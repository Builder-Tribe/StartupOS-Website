import React, { useState } from 'react';
import { 
  Upload, Github, Globe, CheckCircle2, Clock, Sparkles, 
  ExternalLink, Layers, Plus, Code, Award 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

export default function ProjectSubmission({ submissions, onSubmitNewProject }) {
  const [title, setTitle] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [selectedTools, setSelectedTools] = useState(['Antigravity', 'Supabase']);

  const availableToolsList = ['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent', 'Supabase', 'Gemini 2.0 API'];

  const toggleToolTag = (tool) => {
    sound.playClick();
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter((t) => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !githubUrl) return;

    sound.playSynthesize();

    const newSub = {
      id: `sub-${Date.now()}`,
      studentName: 'Learner Champion',
      studentRole: 'PM & Founder',
      projectTitle: title,
      problemSolved: problemSolved || 'Solves key workflow friction using AI product building tools.',
      githubUrl: githubUrl,
      liveDemoUrl: liveDemoUrl || 'https://demo-app.vercel.app',
      toolsUsed: [...selectedTools],
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'AI_EVALUATED', // Auto triggers AI Evaluator Engine simulation!
      aiEvaluation: {
        score: Math.floor(Math.random() * 15) + 84, // 84-98 score
        completeness: 'VERIFIED',
        clarityOfProblem: 'Clear problem definition and tool architecture alignment.',
        codeQuality: 'Well-structured GitHub repository with prompt documentation notes.',
        uxSuggestions: ['Include video demo link in repository header', 'Add automated test scripts'],
        overallSummary: 'High-potential product submission meeting PRD criteria.'
      },
      humanReview: null
    };

    onSubmitNewProject(newSub);
    sound.playSuccess();
    confetti({ particleCount: 90, spread: 70 });

    setTitle('');
    setProblemSolved('');
    setGithubUrl('');
    setLiveDemoUrl('');
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs mb-1">
            <Upload className="w-4 h-4" />
            <span>PHASE 3: PROJECT SUBMISSION SYSTEM</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-white">
            Submit Your AI Product Project
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Ship your code to GitHub, share your repository link, and trigger immediate AI Evaluation & Expert PM feedback.
          </p>
        </div>

        <span className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
          {submissions.length} Total Submissions
        </span>
      </div>

      {/* Main Grid: Submission Form & Submissions Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Project Submission Form (PRD Section 3.3.1) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Plus className="w-5 h-5 text-purple-400" />
              New Project Submission
            </h3>

            <div>
              <label className="text-xs font-heading font-bold text-slate-200 block mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FeedbackPulse AI - Customer Insight SaaS"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-heading font-bold text-slate-200 block mb-1">
                Problem Solved & Key Features
              </label>
              <textarea
                rows={3}
                placeholder="Describe target user pain points and how your AI tool workflow solves it..."
                value={problemSolved}
                onChange={(e) => setProblemSolved(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-heading font-bold text-slate-200 block mb-1">
                GitHub Repository URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://github.com/your-username/your-repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <Github className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-heading font-bold text-slate-200 block mb-1">
                Live Demo / Deployment Link (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://your-app.vercel.app"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            {/* Tools Used Multi-Tag Selection */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-heading font-bold text-slate-200 block">
                Tools Used in Product Building:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableToolsList.map((tool) => {
                  const isSelected = selectedTools.includes(tool);
                  return (
                    <button
                      type="button"
                      key={tool}
                      onClick={() => toggleToolTag(tool)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-heading font-semibold transition-all ${
                        isSelected
                          ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tool} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              Submit Project & Run AI Evaluator
            </button>
          </form>
        </div>

        {/* Right Column: Submission Dashboard & AI Evaluator Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="w-5 h-5 text-purple-400" />
              Learner Submission Dashboard
            </h3>

            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Submitted {sub.submittedDate}
                      </span>
                      <h4 className="text-base font-heading font-bold text-white mt-1">{sub.projectTitle}</h4>
                    </div>

                    {/* Status Badge */}
                    <span className="text-xs font-heading font-bold px-3 py-1 rounded-xl border text-purple-300 bg-purple-500/20 border-purple-500/30">
                      ⚡ {sub.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800 font-sans">
                    {sub.problemSolved}
                  </p>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                      <Github className="w-3.5 h-3.5" /> Repository Link
                    </a>
                    {sub.liveDemoUrl && (
                      <a href={sub.liveDemoUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> Live Demo
                      </a>
                    )}
                  </div>

                  {/* AI Evaluation Card Box */}
                  {sub.aiEvaluation && (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-heading font-bold border-b border-slate-800/80 pb-2">
                        <span className="text-purple-400 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> AI Automated Evaluator Report
                        </span>
                        <span className="text-emerald-400 font-mono text-sm">Score: {sub.aiEvaluation.score}/100</span>
                      </div>

                      <div className="text-xs text-slate-300 font-sans space-y-1">
                        <div><strong>Problem & PRD Clarity:</strong> {sub.aiEvaluation.clarityOfProblem}</div>
                        <div><strong>Code & Repo Structure:</strong> {sub.aiEvaluation.codeQuality}</div>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 pt-1">
                        💡 AI Suggestions: {sub.aiEvaluation.uxSuggestions.join(' • ')}
                      </div>
                    </div>
                  )}

                  {/* Human Creator / Examiner Review Box */}
                  {sub.humanReview ? (
                    <div className="bg-amber-950/20 p-4 rounded-2xl border border-amber-500/30 space-y-1 text-xs">
                      <div className="font-heading font-bold text-amber-400 flex items-center gap-1.5">
                        <Award className="w-4 h-4" /> Human Examiner Review ({sub.humanReview.reviewerName}):
                      </div>
                      <p className="text-slate-200">{sub.humanReview.feedbackText}</p>
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono text-slate-500 italic">
                      ⏳ Pending Human Examiner Review & Endorsement...
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
