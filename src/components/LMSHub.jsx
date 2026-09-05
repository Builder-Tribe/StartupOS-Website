import React, { useState } from 'react';
import { 
  CREATORS_DATABASE, 
  LEARNERS_DATABASE, 
  STANDARDIZED_COURSES, 
  INITIAL_SUBMISSIONS, 
  PUBLIC_SHOWCASE 
} from '../data/abLmsData';
import { 
  GraduationCap, Award, BookOpen, CheckCircle, Sparkles, HelpCircle, 
  RefreshCw, Trophy, ArrowRight, ShieldCheck, ExternalLink, 
  Copy, Check, FileCode, Users, Plus
} from './icons';

export default function LMSHub() {
  // Current System Role View: 'LEARNER' | 'CREATOR' | 'ADMIN'
  const [currentRole, setCurrentRole] = useState('LEARNER');
  
  // Datasets state
  const [courses, setCourses] = useState(STANDARDIZED_COURSES);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [selectedTool, setSelectedTool] = useState('Antigravity'); // 'Antigravity' | 'Claude Code' | 'Cursor' | 'Replit' | 'Emergent'
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  // New course authoring state (Creator Studio)
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Full-Stack AI SaaS');

  // New project submission state (Learner)
  const [subTitle, setSubTitle] = useState('');
  const [subProblem, setSubProblem] = useState('');
  const [subGithub, setSubGithub] = useState('');
  const [subDemo, setSubDemo] = useState('');

  const currentCourse = courses[0];
  const activeLesson = currentCourse?.modules[0]?.lessons[0];

  const handleCopyPrompt = (promptText) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handlePublishCourse = (e) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    const courseObj = {
      id: `course-${Date.now()}`,
      title: newCourseTitle,
      category: newCourseCategory,
      creatorName: 'Dr. Evelyn Vance',
      duration: '45 mins',
      enrolledCount: 1,
      status: 'LIVE',
      toolsSupported: ['Antigravity', 'Claude Code', 'Cursor']
    };
    setCourses([courseObj, ...courses]);
    setNewCourseTitle('');
    alert('Course published successfully to Live Registry!');
  };

  const handleSubmitProject = (e) => {
    e.preventDefault();
    if (!subTitle || !subGithub) return;
    const subObj = {
      id: `sub-${Date.now()}`,
      studentName: 'Alex Rivera',
      studentRole: 'Product Manager & Founder',
      projectTitle: subTitle,
      problemSolved: subProblem || 'Automated workflow execution',
      githubUrl: subGithub,
      liveDemoUrl: subDemo || 'https://demo.vercel.app',
      toolsUsed: ['Antigravity', 'Supabase', 'Gemini 2.0'],
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'AI_EVALUATED',
      aiEvaluation: {
        score: 94,
        completeness: 'EXCELLENT',
        clarityOfProblem: 'Exceptional breakdown of target user pain points.',
        codeQuality: 'Clean modular repository structure.',
        overallSummary: 'High-quality MVP ready for user testing.'
      }
    };
    setSubmissions([subObj, ...submissions]);
    setSubTitle('');
    setSubProblem('');
    setSubGithub('');
    setSubDemo('');
    alert('Project submitted! AI Evaluator report generated.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* 3-System Role Switcher Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
        <div>
          <span className="text-xs text-indigo-400 font-mono uppercase font-semibold">
            AB-LMS Engine: Learn → Build → Ship AI Products
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">AI Builder LMS Platform</h1>
        </div>

        {/* System Role Selector */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'LEARNER', label: '1. Learner LMS Portal', icon: GraduationCap },
            { id: 'CREATOR', label: '2. Creator & Examiner Studio', icon: FileCode },
            { id: 'ADMIN', label: '3. Admin Ecosystem Console', icon: ShieldCheck }
          ].map((roleTab) => {
            const Icon = roleTab.icon;
            const isActive = currentRole === roleTab.id;
            return (
              <button
                key={roleTab.id}
                onClick={() => setCurrentRole(roleTab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{roleTab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SYSTEM 1: LEARNER LMS PORTAL */}
      {currentRole === 'LEARNER' && (
        <div className="space-y-8">
          {/* Tool Abstraction Workbench */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase">Standardized 8-Part Course Architecture</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">{currentCourse.title}</h2>
                <p className="text-xs text-slate-300 mt-1">{currentCourse.subtitle}</p>
              </div>

              {/* AI Tutor Button */}
              <button
                onClick={() => setIsAITutorOpen(!isAITutorOpen)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4" /> Floating AI Tutor Layer
              </button>
            </div>

            {/* Tool Selector Tabs */}
            <div className="mb-6">
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                Tool Abstraction Workbench (Select AI Coding Agent)
              </label>
              <div className="flex flex-wrap gap-2">
                {['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent'].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedTool === tool
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300 font-bold shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tool Copyable Prompt Box */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-indigo-400 font-bold">
                  {selectedTool} Execution Prompt & Schema Specification
                </span>
                <button
                  onClick={() => handleCopyPrompt(activeLesson?.tools[selectedTool]?.promptToCopy || `Generate code using ${selectedTool}`)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  {copiedPrompt ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedPrompt ? 'Copied to Clipboard' : 'Copy Prompt Block'}
                </button>
              </div>

              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                {activeLesson?.tools[selectedTool]?.promptToCopy || `Act as a senior AI architect. Generate application code using ${selectedTool}.`}
              </pre>

              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between text-[11px] text-slate-400 gap-2">
                <div><strong>Expected Output:</strong> {activeLesson?.tools[selectedTool]?.expectedOutput || 'Schema file generated.'}</div>
                <div className="text-emerald-400"><strong>Verification Checkpoint:</strong> {activeLesson?.tools[selectedTool]?.validationHint || 'Valid syntax confirmed.'}</div>
              </div>
            </div>
          </div>

          {/* Learner Project Submission Form */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Ship Product & Submit Link
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Submit your live demo and GitHub repository link to trigger automated AI Evaluator scoring and Examiner review.
            </p>

            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="e.g. FeedbackPulse AI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">GitHub Repository URL *</label>
                  <input
                    type="url"
                    required
                    value={subGithub}
                    onChange={(e) => setSubGithub(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">Live Demo URL</label>
                <input
                  type="url"
                  value={subDemo}
                  onChange={(e) => setSubDemo(e.target.value)}
                  placeholder="https://my-ai-product.vercel.app"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20"
              >
                Submit Shipped Product for AI Evaluation →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SYSTEM 2: COURSE CREATOR & EXAMINER STUDIO */}
      {currentRole === 'CREATOR' && (
        <div className="space-y-8">
          {/* Course Authoring Suite */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-400" /> Course Authoring Suite (8-Part PRD Template)
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Create standardized PRD-backed courses for founders and non-coders.
            </p>

            <form onSubmit={handlePublishCourse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Build an AI Agent with Antigravity"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Category</label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    <option value="Full-Stack AI SaaS">Full-Stack AI SaaS</option>
                    <option value="AI Agents & RAG">AI Agents & RAG</option>
                    <option value="Vibe Coding">Vibe Coding</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/30"
              >
                Publish Course to Live Registry
              </button>
            </form>
          </div>

          {/* Examiner Evaluation Workspace */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">Examiner Evaluation Workspace</h2>
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white">{sub.projectTitle}</h4>
                      <p className="text-xs text-slate-400">{sub.studentName} • {sub.studentRole}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                      AI Score: {sub.aiEvaluation?.score || 90}/100
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{sub.problemSolved}</p>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <strong>AI Evaluator Summary:</strong> {sub.aiEvaluation?.overallSummary || 'Solid MVP execution.'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM 3: ADMIN CONSOLE & ECOSYSTEM ENGINE */}
      {currentRole === 'ADMIN' && (
        <div className="space-y-8">
          {/* Executive Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Creators</span>
              <div className="text-2xl font-bold text-white mt-1">{CREATORS_DATABASE.length}</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Live Courses</span>
              <div className="text-2xl font-bold text-indigo-400 mt-1">{courses.length}</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Learners</span>
              <div className="text-2xl font-bold text-white mt-1">{LEARNERS_DATABASE.length}</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Submissions</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{submissions.length}</div>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Products Shipped</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">4</div>
            </div>
          </div>

          {/* Learners Activity Audit Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 overflow-x-auto">
            <h3 className="text-lg font-bold text-white mb-4">Learner Activity & Shipped Products Audit Table</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="pb-3">Learner</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Streak & XP</th>
                  <th className="pb-3">Shipped Product</th>
                  <th className="pb-3">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {LEARNERS_DATABASE.map((learner) => (
                  <tr key={learner.id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-semibold text-white">{learner.name}</td>
                    <td className="py-3 text-slate-400">{learner.role}</td>
                    <td className="py-3 font-mono text-amber-400">{learner.streakDays}d 🔥 • {learner.xp} XP</td>
                    <td className="py-3 font-semibold text-indigo-300">{learner.shippedProjects[0]?.title || 'FeedbackPulse AI'}</td>
                    <td className="py-3 space-x-2">
                      <a href={learner.shippedProjects[0]?.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                        GitHub
                      </a>
                      <span>•</span>
                      <a href={learner.shippedProjects[0]?.demoUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                        Demo
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Context-Aware AI Tutor Drawer */}
      {isAITutorOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-slate-900 border border-indigo-500 rounded-2xl p-4 shadow-2xl z-50 space-y-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> AI Tutor Layer
            </span>
            <button onClick={() => setIsAITutorOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
          <p className="text-xs text-slate-300">
            Need help debugging your prompt or understanding database migration schemas? Ask me anything!
          </p>
          <input
            type="text"
            placeholder="Type your question..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
