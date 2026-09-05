import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle2, Copy, Sparkles, Layers, Cpu, Code, 
  Terminal, ShieldCheck, ArrowRight, Upload, Github, Globe, ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

export default function LearnerPortal({ 
  courses, 
  submissions, 
  onToggleAITutor, 
  onSubmitProject,
  userStats 
}) {
  const [learnerSubTab, setLearnerSubTab] = useState('courses'); // 'courses' | 'builder' | 'submit'
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0].id);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  // Tool Abstraction Layer
  const [selectedTool, setSelectedTool] = useState('Antigravity');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [stepValidated, setStepValidated] = useState(false);

  // Submission Form State
  const [subTitle, setSubTitle] = useState('');
  const [subProblem, setSubProblem] = useState('');
  const [subGithubUrl, setSubGithubUrl] = useState('');
  const [subDemoUrl, setSubDemoUrl] = useState('');
  const [selectedTools, setSelectedTools] = useState(['Antigravity', 'Supabase']);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const activeModule = selectedCourse.modules[activeModuleIdx] || selectedCourse.modules[0];
  const activeLesson = activeModule.lessons[activeLessonIdx] || activeModule.lessons[0];

  const lessonTools = activeLesson.tools || {};
  const currentToolData = lessonTools[selectedTool] || lessonTools['Antigravity'] || Object.values(lessonTools)[0];

  const handleCopyPrompt = (text) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleValidateStep = () => {
    sound.playSuccess();
    setStepValidated(true);
    confetti({ particleCount: 70, spread: 60 });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!subTitle || !subGithubUrl) return;

    sound.playSynthesize();
    const newSub = {
      id: `sub-${Date.now()}`,
      studentName: 'Alex Rivera',
      studentEmail: 'alex.rivera@productlead.io',
      studentRole: 'Product Manager & Founder',
      projectTitle: subTitle,
      problemSolved: subProblem || 'Solves key workflow friction using AI product building tools.',
      githubUrl: subGithubUrl,
      liveDemoUrl: subDemoUrl || 'https://demo-app.vercel.app',
      toolsUsed: [...selectedTools],
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'AI_EVALUATED',
      aiEvaluation: {
        score: Math.floor(Math.random() * 15) + 84,
        completeness: 'VERIFIED',
        clarityOfProblem: 'Clear problem definition and tool architecture alignment.',
        codeQuality: 'Well-structured GitHub repository with prompt documentation notes.',
        uxSuggestions: ['Include video demo link in repository header', 'Add automated test scripts'],
        overallSummary: 'High-potential product submission meeting PRD criteria.'
      },
      humanReview: null
    };

    onSubmitProject(newSub);
    confetti({ particleCount: 90, spread: 70 });
    setSubTitle('');
    setSubProblem('');
    setSubGithubUrl('');
    setSubDemoUrl('');
    setLearnerSubTab('submit');
  };

  return (
    <div className="space-y-8">
      
      {/* Learner Sub-Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setLearnerSubTab('courses');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
              learnerSubTab === 'courses'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📚 Course Catalog
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setLearnerSubTab('builder');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
              learnerSubTab === 'builder'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🛠️ Guided AI Builder Workbench
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setLearnerSubTab('submit');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
              learnerSubTab === 'submit'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🚀 Submit Project & Dashboard ({submissions.length})
          </button>
        </div>

        <button
          onClick={onToggleAITutor}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-heading font-bold text-xs shadow flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Ask AI Tutor Layer
        </button>
      </div>

      {/* SUB-TAB 1: MARKET-LEADING COURSE CATALOG */}
      {learnerSubTab === 'courses' && (
        <div className="space-y-6">
          <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-600 font-bold uppercase tracking-wider">SYSTEM 1: LEARNER LMS PORTAL</span>
              <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-slate-900 mt-1">
                Explore Market-Leading AI Building Courses
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Learn how non-coders, PMs, and founders build production AI SaaS products end-to-end.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-cyan-500/40 transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold">
                    {c.category} • {c.level}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{c.duration}</span>
                </div>

                <h3 className="text-lg font-heading font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{c.subtitle}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono">
                  <span className="text-slate-500">Author: {c.creatorName}</span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedCourseId(c.id);
                      setLearnerSubTab('builder');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-heading font-bold text-xs shadow flex items-center gap-1.5"
                  >
                    Start Course <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GUIDED AI BUILDER WORKBENCH */}
      {learnerSubTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Standardized Structure & Lessons */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers className="w-4 h-4 text-cyan-600" />
                Standardized Course Architecture
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-heading font-bold text-cyan-700">1. Problem Definition</div>
                  <div className="text-slate-700 mt-1">{selectedCourse.structure.problem}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-heading font-bold text-purple-700">2. Target Use Case</div>
                  <div className="text-slate-700 mt-1">{selectedCourse.structure.useCase}</div>
                </div>
              </div>
            </div>

            {/* Lesson Picker */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500">
                Curriculum Steps
              </h3>

              <div className="space-y-2">
                {selectedCourse.modules.map((mod, mIdx) => (
                  <div key={mod.id} className="space-y-2">
                    <div className="text-xs font-heading font-bold text-slate-900">{mod.title}</div>
                    {mod.lessons.map((les, lIdx) => (
                      <button
                        key={les.id}
                        onClick={() => {
                          sound.playClick();
                          setActiveModuleIdx(mIdx);
                          setActiveLessonIdx(lIdx);
                        }}
                        className={`w-full p-3 rounded-xl border text-left transition-all ${
                          mIdx === activeModuleIdx && lIdx === activeLessonIdx
                            ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs">{les.title}</div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Workbench & Tool Abstraction */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="border-b border-slate-200 pb-4 space-y-1">
                <span className="text-xs font-mono text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 font-bold">
                  GUIDED BUILDER WORKBENCH
                </span>
                <h3 className="text-xl font-heading font-bold text-slate-900 mt-2">{activeLesson.title}</h3>
                <p className="text-xs text-slate-600">{activeLesson.description}</p>
              </div>

              {/* Tool Abstraction Selector */}
              <div className="space-y-3">
                <div className="text-xs font-heading font-bold text-slate-800">
                  Select Your Preferred AI Coding Tool (Zero Tool Lock-In):
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedCourse.toolsSupported.map((toolName) => {
                    const isSelected = selectedTool === toolName;
                    return (
                      <button
                        key={toolName}
                        onClick={() => {
                          sound.playClick();
                          setSelectedTool(toolName);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
                          isSelected
                            ? 'bg-cyan-600 text-white font-bold shadow'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {toolName} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Copyable Prompt */}
              {currentToolData && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-heading font-bold text-slate-800">
                      Copyable AI Prompt Block for <span className="text-purple-600">{selectedTool}</span>:
                    </span>
                    <button
                      onClick={() => handleCopyPrompt(currentToolData.promptToCopy)}
                      className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100"
                    >
                      {copiedPrompt ? 'Copied to Clipboard!' : 'Copy Prompt'}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-purple-300 font-mono text-xs leading-relaxed">
                    {currentToolData.promptToCopy}
                  </div>
                </div>
              )}

              {/* Step Validation */}
              {currentToolData && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-heading font-bold text-emerald-700">
                    🛡️ Expected Output Verification:
                  </div>
                  <p className="text-xs text-slate-700 font-sans">{currentToolData.expectedOutput}</p>
                  
                  <button
                    onClick={handleValidateStep}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs shadow flex items-center gap-2"
                  >
                    Verify Step Execution & Claim +150 XP
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: PROJECT SUBMISSION FORM & DASHBOARD */}
      {learnerSubTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Submission Form */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleSubmitForm} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-heading font-bold text-slate-900 border-b border-slate-100 pb-3">
                Submit Your AI Product Project
              </h3>

              <div>
                <label className="text-xs font-heading font-bold text-slate-700 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FeedbackPulse AI - Insight Engine"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-slate-700 block mb-1">Problem Solved</label>
                <textarea
                  rows={3}
                  placeholder="What problem does your product solve using AI?"
                  value={subProblem}
                  onChange={(e) => setSubProblem(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-slate-700 block mb-1">GitHub Repository URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/username/repo"
                  value={subGithubUrl}
                  onChange={(e) => setSubGithubUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-heading font-bold text-xs shadow flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Submit Project & Run AI Evaluator
              </button>
            </form>
          </div>

          {/* Submissions Dashboard */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-heading font-bold text-slate-900 border-b border-slate-100 pb-3">
                Learner Submission Dashboard ({submissions.length})
              </h3>

              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-heading font-bold text-slate-900">{sub.projectTitle}</h4>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold">
                        {sub.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-sans">{sub.problemSolved}</p>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold">
                        <Github className="w-3.5 h-3.5" /> Repository Link
                      </a>
                    </div>

                    {/* AI Evaluation Report Box */}
                    {sub.aiEvaluation && (
                      <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-1">
                        <div className="font-heading font-bold text-purple-400 flex justify-between">
                          <span>✨ AI Automated Evaluator Report</span>
                          <span className="text-emerald-400">Score: {sub.aiEvaluation.score}/100</span>
                        </div>
                        <p className="text-slate-300">{sub.aiEvaluation.overallSummary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
