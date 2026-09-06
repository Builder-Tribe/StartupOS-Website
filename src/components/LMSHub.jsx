import React, { useState } from 'react';
import { 
  CREATORS_DATABASE, 
  LEARNERS_DATABASE, 
  STANDARDIZED_COURSES, 
  INITIAL_SUBMISSIONS 
} from '../data/abLmsData';
import { 
  GraduationCap, Award, BookOpen, CheckCircle, Sparkles, HelpCircle, 
  RefreshCw, Trophy, ArrowRight, ShieldCheck, ExternalLink, 
  Copy, Check, FileCode, Users, Plus, Code2, Rocket
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

  // New course authoring state
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Full-Stack AI SaaS');

  // New project submission state
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
      creatorName: 'Harshita G',
      duration: '45 mins',
      enrolledCount: 1,
      status: 'LIVE',
      toolsSupported: ['Antigravity', 'Claude Code', 'Cursor']
    };
    setCourses([courseObj, ...courses]);
    setNewCourseTitle('');
    alert('Course published successfully to AI Academy Registry!');
  };

  const handleSubmitProject = (e) => {
    e.preventDefault();
    if (!subTitle || !subGithub) return;
    const subObj = {
      id: `sub-${Date.now()}`,
      studentName: 'Harshita G',
      studentRole: 'Founder & Builder',
      projectTitle: subTitle,
      problemSolved: subProblem || 'Automated workflow execution',
      githubUrl: subGithub,
      liveDemoUrl: subDemo || 'https://demo.vercel.app',
      toolsUsed: ['Antigravity', 'Supabase', 'Gemini 2.0'],
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'AI_EVALUATED',
      aiEvaluation: {
        score: 96,
        completeness: 'EXCELLENT',
        clarityOfProblem: 'Exceptional breakdown of target user pain points.',
        codeQuality: 'Clean modular repository structure.',
        overallSummary: 'High-quality MVP ready for Launchpad featuring 4-File Parity.'
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
      {/* Academy Header & Role Switcher */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div>
          <span className="text-xs text-indigo-600 font-mono font-bold uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit">
            <GraduationCap className="w-3.5 h-3.5" /> AI Academy — 360° AI Product Builder School
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">How To Build, Architect & Launch AI Products</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Master ideation, prompt engineering, 4-file parity governance, and post-launch growth.</p>
        </div>

        {/* System Role Selector */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
          {[
            { id: 'LEARNER', label: '1. Builder Academy', icon: GraduationCap },
            { id: 'CREATOR', label: '2. Course Studio', icon: FileCode },
            { id: 'ADMIN', label: '3. Academy Audit', icon: ShieldCheck }
          ].map((roleTab) => {
            const Icon = roleTab.icon;
            const isActive = currentRole === roleTab.id;
            return (
              <button
                key={roleTab.id}
                onClick={() => setCurrentRole(roleTab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{roleTab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SYSTEM 1: BUILDER ACADEMY PORTAL */}
      {currentRole === 'LEARNER' && (
        <div className="space-y-8">
          {/* Core Curriculum Grid: 5 Product Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">How to Build a Product</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step-by-step guidance from problem formulation, target user definition, MVP feature pruning, to initial release.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">What App / Tool to Use</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare Antigravity, Claude Code, Replit, Cursor & Emergent to pick the exact toolchain for your AI stack.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">What Prompts & Spec to Give</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Copy verified prompt templates and PRD architecture specifications to generate robust code without hallucinations.
              </p>
            </div>
          </div>

          {/* Tool Abstraction Workbench */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-6 mb-6">
              <div>
                <span className="text-xs font-mono text-emerald-700 font-bold uppercase bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Standardized 8-Part Course Architecture
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">{currentCourse.title}</h2>
                <p className="text-xs text-slate-600 mt-1">{currentCourse.subtitle}</p>
              </div>

              {/* Floating AI Tutor Button */}
              <button
                onClick={() => setIsAITutorOpen(!isAITutorOpen)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4" /> Ask AI Academy Tutor
              </button>
            </div>

            {/* Tool Selector Tabs */}
            <div className="mb-6">
              <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-2">
                Tool Abstraction Workbench (Select Target AI Coding Agent)
              </label>
              <div className="flex flex-wrap gap-2">
                {['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent'].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedTool === tool
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tool Copyable Prompt Box */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-indigo-400 font-bold">
                  {selectedTool} Prompt & Architecture Specification
                </span>
                <button
                  onClick={() => handleCopyPrompt(activeLesson?.tools[selectedTool]?.promptToCopy || `Generate code using ${selectedTool}`)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  {copiedPrompt ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedPrompt ? 'Copied Prompt' : 'Copy Prompt Block'}
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
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-600" /> Submit Shipped Product to Launchpad
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Submit your live demo and GitHub repository link to trigger automated 4-file parity check and list on the StartupOS Launchpad.
            </p>

            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-mono">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="e.g. DupeScout AI"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-mono">GitHub Repository URL *</label>
                  <input
                    type="url"
                    required
                    value={subGithub}
                    onChange={(e) => setSubGithub(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-mono font-semibold">Live Demo URL</label>
                <input
                  type="url"
                  value={subDemo}
                  onChange={(e) => setSubDemo(e.target.value)}
                  placeholder="https://my-ai-product.vercel.app"
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20"
              >
                Submit Shipped Product for Evaluation →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SYSTEM 2: COURSE CREATOR & EXAMINER STUDIO */}
      {currentRole === 'CREATOR' && (
        <div className="space-y-8">
          {/* Course Authoring Suite */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-600" /> Academy Authoring Suite (8-Part PRD Template)
            </h2>
            <p className="text-xs text-slate-600 mb-6">
              Create standardized PRD-backed courses for founders and non-coders.
            </p>

            <form onSubmit={handlePublishCourse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-mono">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Build an AI Agent with Antigravity"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-mono">Category</label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Full-Stack AI SaaS">Full-Stack AI SaaS</option>
                    <option value="AI Agents & RAG">AI Agents & RAG</option>
                    <option value="Vibe Coding">Vibe Coding</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Publish Course to Academy Registry
              </button>
            </form>
          </div>

          {/* Examiner Evaluation Workspace */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Examiner Evaluation Workspace</h2>
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{sub.projectTitle}</h4>
                      <p className="text-xs text-slate-600">{sub.studentName} • {sub.studentRole}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-mono">
                      AI Score: {sub.aiEvaluation?.score || 96}/100
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">{sub.problemSolved}</p>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Instructors</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{CREATORS_DATABASE.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Academy Courses</span>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1">{courses.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Enrolled Builders</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{LEARNERS_DATABASE.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Submissions</span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{submissions.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Products Shipped</span>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">4</div>
            </div>
          </div>

          {/* Learners Activity Audit Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 overflow-x-auto shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Builder Activity & Shipped Products Audit Table</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                  <th className="pb-3">Builder</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Streak & XP</th>
                  <th className="pb-3">Shipped Product</th>
                  <th className="pb-3">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {LEARNERS_DATABASE.map((learner) => (
                  <tr key={learner.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">{learner.name}</td>
                    <td className="py-3 text-slate-500">{learner.role}</td>
                    <td className="py-3 font-mono font-bold text-amber-600">{learner.streakDays}d 🔥 • {learner.xp} XP</td>
                    <td className="py-3 font-semibold text-indigo-700">{learner.shippedProjects[0]?.title || 'FeedbackPulse AI'}</td>
                    <td className="py-3 space-x-2">
                      <a href={learner.shippedProjects[0]?.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline">
                        GitHub
                      </a>
                      <span>•</span>
                      <a href={learner.shippedProjects[0]?.demoUrl} target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold hover:underline">
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
        <div className="fixed bottom-6 right-6 w-80 bg-white border border-indigo-300 rounded-2xl p-4 shadow-xl z-50 space-y-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> AI Academy Tutor Layer
            </span>
            <button onClick={() => setIsAITutorOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕</button>
          </div>
          <p className="text-xs text-slate-600">
            Need help debugging your prompt or understanding database migration schemas? Ask me anything!
          </p>
          <input
            type="text"
            placeholder="Type your question..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}
    </div>
  );
}
