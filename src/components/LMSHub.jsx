import React, { useState } from 'react';

// Lightweight fallback confetti to ensure zero external dependency failure
const triggerConfetti = (opts = {}) => {
  try {
    if (typeof window !== 'undefined' && window.confetti) {
      window.confetti(opts);
      return;
    }
  } catch (e) {}
};
import { 
  CREATORS_DATABASE, 
  LEARNERS_DATABASE, 
  STANDARDIZED_COURSES, 
  INITIAL_SUBMISSIONS,
  PUBLIC_SHOWCASE,
  EIGHT_PART_FRAMEWORK,
  generateAiEvaluatorReport,
  generateProfileReadmeMarkdown,
  generateAiCourseDraft
} from '../data/abLmsData';
import { 
  GraduationCap, Award, BookOpen, CheckCircle, Sparkles, HelpCircle, 
  RefreshCw, Trophy, ArrowRight, ShieldCheck, ExternalLink, 
  Copy, Check, FileCode, Users, Plus, Code2, Rocket
} from './icons';

export default function LMSHub() {
  // Current System Role View: 'LEARNER' | 'SHOWCASE' | 'CREATOR' | 'ADMIN'
  const [currentRole, setCurrentRole] = useState('LEARNER');
  
  // Datasets state
  const [courses, setCourses] = useState(STANDARDIZED_COURSES);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [showcaseProjects, setShowcaseProjects] = useState(PUBLIC_SHOWCASE);
  const [selectedTool, setSelectedTool] = useState('Antigravity'); // 'Antigravity' | 'Claude Code' | 'Cursor' | 'Replit' | 'Emergent'
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  // Stepper & Gamification State (PRD §7 & §9)
  const [activeStep, setActiveStep] = useState(1); // 1 to 8
  const [learnerXP, setLearnerXP] = useState(7250);
  const [completedSteps, setCompletedSteps] = useState({ 'les-brand-1-1': [1, 2] });
  const [streakDays, setStreakDays] = useState(14);

  // AI Evaluation & Certificate Modal State (PRD §7 Phase 3 & 4)
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgressText, setEvaluationProgressText] = useState('');
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // One-Click Profile README Generator Modal (PRD §7 Phase 5)
  const [isReadmeModalOpen, setIsReadmeModalOpen] = useState(false);
  const [readmeName, setReadmeName] = useState('Harshit Agarwal');
  const [readmeRole, setReadmeRole] = useState('AI Product Manager & 0-to-1 Systems Builder');
  const [readmeGithub, setReadmeGithub] = useState('1997agarwal');
  const [readmeLinkedin, setReadmeLinkedin] = useState('1997agarwal');
  const [readmeEmail, setReadmeEmail] = useState('agarwal.harshit97@gmail.com');
  const [copiedReadme, setCopiedReadme] = useState(false);

  // AI Course Generator State for Creators (PRD §10)
  const [creatorTopic, setCreatorTopic] = useState('');
  const [creatorAudience, setCreatorAudience] = useState('Non-coders & Product Managers');
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);

  // AI Tutor Interactive Conversation State (PRD §8)
  const [tutorMessages, setTutorMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 Hi! I'm your AI Academy Mentor. I'm here to help you navigate this build step, debug prompts, or explain complex technical concepts in plain English. What are you building right now?"
    }
  ]);
  const [tutorInput, setTutorInput] = useState('');

  // Course & Lesson Selection State
  const [selectedCourseId, setSelectedCourseId] = useState(courses[1]?.id || courses[0]?.id);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const currentModule = currentCourse?.modules?.[selectedModuleIndex] || currentCourse?.modules?.[0];
  const activeLesson = currentModule?.lessons?.[selectedLessonIndex] || currentModule?.lessons?.[0];

  // New course authoring state
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Full-Stack AI SaaS');

  // New project submission state
  const [subTitle, setSubTitle] = useState('');
  const [subProblem, setSubProblem] = useState('');
  const [subGithub, setSubGithub] = useState('');
  const [subDemo, setSubDemo] = useState('');

  const handleCopyPrompt = (promptText) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCompleteStep = (stepNum) => {
    const lessonKey = activeLesson?.id || 'default-lesson';
    const currentCompleted = completedSteps[lessonKey] || [];
    if (!currentCompleted.includes(stepNum)) {
      setCompletedSteps({
        ...completedSteps,
        [lessonKey]: [...currentCompleted, stepNum]
      });
      setLearnerXP(prev => prev + 50);
      try {
        triggerConfetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (err) {}
    }
    if (stepNum < 8) {
      setActiveStep(stepNum + 1);
    }
  };

  const handleEvaluateAndSubmit = (e) => {
    e.preventDefault();
    if (!subTitle || !subGithub) return;
    setIsEvaluating(true);
    setEvaluationProgressText('🔍 Scanning GitHub repository structure...');

    setTimeout(() => {
      setEvaluationProgressText('🛡️ Auditing 4-File Code Parity (AGENTS.md, ROADMAP.md, CLAUDE.md)...');
    }, 600);

    setTimeout(() => {
      setEvaluationProgressText('⚡ Evaluating prompt specifications & live demo connectivity...');
    }, 1200);

    setTimeout(() => {
      const subObj = {
        id: `sub-${Date.now()}`,
        studentName: readmeName || 'Harshit Agarwal',
        studentRole: readmeRole || 'AI Product Manager & Founder',
        projectTitle: subTitle,
        problemSolved: subProblem || 'Automated workflow execution',
        githubUrl: subGithub,
        liveDemoUrl: subDemo || 'https://demo.vercel.app',
        toolsUsed: [selectedTool, 'Supabase', 'Node.js'],
        submittedDate: new Date().toISOString().split('T')[0],
        status: 'AI_EVALUATED'
      };
      const report = generateAiEvaluatorReport(subObj);
      subObj.aiEvaluation = report;
      setLatestEvaluation({ ...report, project: subObj });
      setSubmissions([subObj, ...submissions]);
      setIsEvaluating(false);
      setIsCertModalOpen(true);
      try {
        triggerConfetti({
          particleCount: 90,
          spread: 90,
          origin: { y: 0.5 }
        });
      } catch (err) {}
    }, 1800);
  };

  const handleSendTutorMessage = (userText) => {
    const textToSend = userText || tutorInput;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setTutorMessages(prev => [...prev, userMsg]);
    setTutorInput('');

    setTimeout(() => {
      let replyText = `Great question regarding **${activeLesson?.title || 'this lesson'}**! `;
      const lower = textToSend.toLowerCase();

      if (lower.includes('analogy') || lower.includes('simple') || lower.includes('5')) {
        replyText += `Think of this like building a restaurant: The PRD is your menu specifying what dishes you serve. The architecture is your kitchen layout (where the stove and fridge sit). And **${selectedTool}** is your master chef that prepares the dish when you hand them the exact recipe prompt!`;
      } else if (lower.includes('debug') || lower.includes('error') || lower.includes('prompt')) {
        replyText += `To debug prompts in **${selectedTool}**, enforce constraints: 1) Specify exact filenames and directory paths, 2) Ask for production TypeScript/JS without placeholder ellipses (\`...\`), and 3) Explicitly instruct the model to verify imports before returning code.`;
      } else if (lower.includes('parity') || lower.includes('checklist')) {
        replyText += `Your pre-flight 4-File Parity checklist: Ensure your repository root has **AGENTS.md** (constitution), **ROADMAP.md** (living milestones), **CLAUDE.md** (standards pointer), and **CONTRIBUTING.md** (rules). Also make sure \`.env\` is in your \`.gitignore\`!`;
      } else {
        replyText += `When using **${selectedTool}** for this step, ensure you copy the prompt block directly from the Tool Abstraction Workbench. It's pre-configured with the exact schema and validation hints so the agent produces deterministic code without hallucinations.`;
      }

      setTutorMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: replyText }]);
    }, 400);
  };

  const handleGenerateCourseAI = () => {
    if (!creatorTopic) return;
    setIsGeneratingCourse(true);
    setTimeout(() => {
      const generatedCourse = generateAiCourseDraft(creatorTopic, creatorAudience);
      setCourses([generatedCourse, ...courses]);
      setSelectedCourseId(generatedCourse.id);
      setSelectedModuleIndex(0);
      setSelectedLessonIndex(0);
      setIsGeneratingCourse(false);
      setCreatorTopic('');
      try {
        triggerConfetti({ particleCount: 70, spread: 80 });
      } catch (e) {}
    }, 900);
  };

  const handlePublishCourse = (e) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    const courseObj = {
      id: `course-${Date.now()}`,
      title: newCourseTitle,
      category: newCourseCategory,
      creatorName: 'Harshit Agarwal',
      duration: '45 mins',
      enrolledCount: 1,
      status: 'LIVE',
      toolsSupported: ['Antigravity', 'Claude Code', 'Cursor']
    };
    setCourses([courseObj, ...courses]);
    setNewCourseTitle('');
    alert('Course published successfully to AI Academy Registry!');
  };

  const currentLessonCompletedSteps = completedSteps[activeLesson?.id || ''] || [];
  const lessonProgressPercent = Math.min(100, Math.round((currentLessonCompletedSteps.length / 8) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Academy Header & Role Switcher */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-indigo-600 font-mono font-bold uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit">
              <GraduationCap className="w-3.5 h-3.5" /> AI Academy — 360° AI Product Builder School
            </span>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              🔥 {streakDays} Day Streak • {learnerXP} XP
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">How To Build, Architect & Launch AI Products</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Master ideation, prompt engineering, 4-file parity governance, and post-launch growth.</p>
        </div>

        {/* System Role Selector */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 flex-wrap gap-1">
          {[
            { id: 'LEARNER', label: '1. Builder Academy', icon: GraduationCap },
            { id: 'SHOWCASE', label: '2. Public Showcase', icon: Trophy },
            { id: 'CREATOR', label: '3. Course Studio', icon: FileCode },
            { id: 'ADMIN', label: '4. Academy Audit', icon: ShieldCheck }
          ].map((roleTab) => {
            const Icon = roleTab.icon;
            const isActive = currentRole === roleTab.id;
            return (
              <button
                key={roleTab.id}
                onClick={() => setCurrentRole(roleTab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                1
              </div>
              <h3 className="text-xs font-bold text-slate-900">How to Build</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Step-by-step 0-to-1 build recipes, problem formulation, and MVP scoping.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                2
              </div>
              <h3 className="text-xs font-bold text-slate-900">Tools to Use</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                AntiGravity, Claude Code, Cursor, Replit, Emergent tool selection matrix.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                3
              </div>
              <h3 className="text-xs font-bold text-slate-900">Prompts & PRD Spec</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Battle-tested system prompts and deterministic PRD architecture specs.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                4
              </div>
              <h3 className="text-xs font-bold text-slate-900">Push Code & Parity</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Safe Git push workflows, .gitignore hygiene, and 4-File Parity standard.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                5
              </div>
              <h3 className="text-xs font-bold text-slate-900">Branding & Eyeballs</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                username/username GitHub Profile README & viral LinkedIn launch loops.
              </p>
            </div>
          </div>

          {/* Interactive Course Selection Tabs */}
          <div className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-2.5 px-1">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-600">
                Academy Courses & Masterclasses ({courses.length})
              </span>
              <span className="text-[11px] text-indigo-600 font-semibold">Select a course to view lessons & prompts ↓</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    setSelectedModuleIndex(0);
                    setSelectedLessonIndex(0);
                  }}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    currentCourse.id === course.id
                      ? 'bg-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {course.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{course.duration} • {course.enrolledCount} enrolled</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{course.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{course.subtitle}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tool Abstraction Workbench */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-6 mb-6">
              <div>
                <span className="text-xs font-mono text-emerald-700 font-bold uppercase bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {currentCourse.category} • {currentCourse.level}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">{currentCourse.title}</h2>
                <p className="text-xs text-slate-600 mt-1">{currentCourse.subtitle}</p>
              </div>

              {/* Floating AI Tutor Button */}
              <button
                onClick={() => setIsAITutorOpen(!isAITutorOpen)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-amber-500/20 self-start md:self-auto"
              >
                <Sparkles className="w-4 h-4" /> Ask AI Academy Tutor
              </button>
            </div>

            {/* Module & Lesson Navigator */}
            {currentCourse?.modules && currentCourse.modules.length > 0 && (
              <div className="mb-6 bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-500 mr-1">Modules:</span>
                  {currentCourse.modules.map((mod, mIdx) => (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setSelectedModuleIndex(mIdx);
                        setSelectedLessonIndex(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedModuleIndex === mIdx
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mod.title.split(':')[0]}
                    </button>
                  ))}
                </div>

                {currentModule?.lessons && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-500 mr-1">Lessons:</span>
                    {currentModule.lessons.map((les, lIdx) => (
                      <button
                        key={les.id}
                        onClick={() => setSelectedLessonIndex(lIdx)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedLessonIndex === lIdx
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {les.title}
                      </button>
                    ))}
                  </div>
                )}

                {activeLesson?.description && (
                  <p className="text-xs text-slate-600 italic pt-1 border-t border-slate-200/60">
                    💡 <strong>Lesson Focus:</strong> {activeLesson.description}
                  </p>
                )}
              </div>
            )}

            {/* Standardized 8-Part Builder Stepper Tabs (PRD §9) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-mono font-bold uppercase text-slate-600">
                  Standardized 8-Part Builder Journey (PRD Framework)
                </label>
                <span className="text-[11px] text-slate-500 font-medium">Step {activeStep} of 8</span>
              </div>

              {/* Step Navigation Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {EIGHT_PART_FRAMEWORK.map((fStep) => {
                  const isCompleted = currentLessonCompletedSteps.includes(fStep.step);
                  const isCurrent = activeStep === fStep.step;
                  return (
                    <button
                      key={fStep.step}
                      onClick={() => setActiveStep(fStep.step)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                          : isCompleted
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                        <span>{fStep.step}</span>
                        {isCompleted && <span>✓</span>}
                      </div>
                      <div className="text-xs font-bold mt-1 line-clamp-1">{fStep.title}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Content Showcase */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                {activeStep === 1 && (
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Step 1: Problem Definition
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">What Friction Are We Solving?</h3>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                      {currentCourse.structure?.problem || "Builders struggle with fragmented tooling, complex deployment, and missing governance."}
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Step 2: Target User & Persona
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Who Are We Building For?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <strong className="block text-slate-900 font-bold mb-1">Target Personas:</strong>
                        <p className="text-slate-600">{currentCourse.structure?.prd?.targetUser || 'Product Managers, Solo Founders, Student Builders'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <strong className="block text-slate-900 font-bold mb-1">Target Use Case:</strong>
                        <p className="text-slate-600">{currentCourse.structure?.useCase || 'Transforming messy manual workflows into automated AI apps.'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Step 3: PRD Specifications & Boundaries
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Core Feature Requirements</h3>
                    <ul className="space-y-2 text-xs">
                      {currentCourse.structure?.prd?.coreFeatures?.map((feat, idx) => (
                        <li key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      )) || <li className="text-slate-500">Standard production features defined in PRD.</li>}
                    </ul>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Step 4: System & Schema Architecture
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Data Contracts & Storage Schemas</h3>
                    <pre className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
{`[Frontend UI: React 18 / Vite]
       │
       ▼ (REST API / JSON Payload)
[Node.js Hub / Express Server (Port 8081)]
       │
       ▼ (SQL Schemas & 4-File Parity Governance)
[Database Datastores: SQLite / PostgreSQL / JSON]
       │
       ▼ (Agentic Layer)
[AI Model / Tool Calling APIs: Gemini 2.0 / OpenAI]`}
                    </pre>
                  </div>
                )}

                {activeStep === 5 && (
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Step 5: Tool Abstraction Layer
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Zero Tool Lock-in: Pick Your Coding Agent</h3>
                    <p className="text-xs text-slate-600">
                      StartupOS ensures you can build this exact product regardless of which AI coding tool you prefer.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent'].map((tool) => (
                        <button
                          key={tool}
                          onClick={() => setSelectedTool(tool)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            selectedTool === tool
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeStep === 6 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Step 6: {selectedTool} Prompt & Architecture Specification
                      </span>
                      <button
                        onClick={() => handleCopyPrompt(activeLesson?.tools[selectedTool]?.promptToCopy || `Generate code using ${selectedTool}`)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                      >
                        {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedPrompt ? 'Copied!' : 'Copy Prompt Block'}
                      </button>
                    </div>

                    <pre className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {activeLesson?.tools[selectedTool]?.promptToCopy || `Act as a senior AI architect. Generate application code using ${selectedTool}.`}
                    </pre>
                  </div>
                )}

                {activeStep === 7 && (
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Step 7: Verification Checkpoint
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Pre-Flight Output Inspection</h3>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
                      <div><strong>Expected Output:</strong> {activeLesson?.tools[selectedTool]?.expectedOutput || 'Schema and source files generated cleanly.'}</div>
                      <div className="text-emerald-700"><strong>Verification Checkpoint:</strong> {activeLesson?.tools[selectedTool]?.validationHint || 'Verify npm run build passes without syntax errors.'}</div>
                    </div>
                  </div>
                )}

                {activeStep === 8 && (
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Step 8: Ship, Push Code & Claim XP
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Deploy & 4-File Parity Audit</h3>
                    <p className="text-xs text-slate-600">
                      Commit your changes, verify your 4 constitutional files (AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md), and claim your +50 Builder XP.
                    </p>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Ready to complete this milestone!
                      </span>
                    </div>
                  </div>
                )}

                {/* Step Action Buttons */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                  <button
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Previous Step
                  </button>

                  <button
                    onClick={() => handleCompleteStep(activeStep)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {currentLessonCompletedSteps.includes(activeStep) ? 'Marked Complete (+50 XP Claimed)' : 'Mark Step Complete (+50 XP)'}
                  </button>

                  <button
                    disabled={activeStep === 8}
                    onClick={() => setActiveStep(prev => Math.min(8, prev + 1))}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Project Submission Form & AI Evaluator Engine (PRD §7 Phase 3 & 4) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-indigo-600" /> Submit Shipped Product to Launchpad & Evaluator
                </h3>
                <p className="text-xs text-slate-600">
                  Submit your repository and live demo to trigger the automated AI Evaluator Report and earn your Verified Builder Certificate.
                </p>
              </div>
            </div>

            <form onSubmit={handleEvaluateAndSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-mono">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="e.g. DupeScout AI or FeedbackPulse"
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
                    placeholder="https://github.com/1997agarwal/my-project"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-mono font-semibold">Problem Solved</label>
                  <input
                    type="text"
                    value={subProblem}
                    onChange={(e) => setSubProblem(e.target.value)}
                    placeholder="e.g. Solves manual customer feedback analysis"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isEvaluating}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{evaluationProgressText}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Automated AI Evaluation & Generate Certificate →</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SYSTEM 2: PUBLIC BUILDER SHOWCASE & REPUTATION HUB (PRD §7 Phase 5) */}
      {currentRole === 'SHOWCASE' && (
        <div className="space-y-8">
          {/* Portfolio Export Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-2.5 py-0.5 rounded-full">
                Personal Branding Engine
              </span>
              <h2 className="text-xl font-extrabold mt-2">Turn Your Shipped Projects Into an Irresistible GitHub Profile</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Recruiters and hiring managers judge you by your GitHub landing page. Generate a recruiter-converting profile README with sleek monochrome CTAs in 1 click.
              </p>
            </div>

            <button
              onClick={() => setIsReadmeModalOpen(true)}
              className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 shrink-0"
            >
              <FileCode className="w-4 h-4" /> Generate My GitHub Profile README
            </button>
          </div>

          {/* Showcase Cards Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Shipped Projects by AI Academy Builders ({showcaseProjects.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showcaseProjects.map((proj) => (
                <div key={proj.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">By {proj.author}</p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                      ⭐ {proj.stars || 48} • ▲ {proj.upvotes || 140}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{proj.tagline}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tools?.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold">
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                      <span>View GitHub Code</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a href={proj.liveDemoUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1">
                      <span>Test Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM 3: COURSE CREATOR STUDIO (PRD §10) */}
      {currentRole === 'CREATOR' && (
        <div className="space-y-8">
          {/* AI Course Outline Generator (PRD §10) */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-indigo-400/20 border border-indigo-300/30 text-indigo-200 px-2.5 py-0.5 rounded-full">
                PRD §10 AI Course Architect
              </span>
              <h2 className="text-xl font-extrabold mt-2">Generate an 8-Part PRD Course Outline with AI</h2>
              <p className="text-xs text-indigo-200 mt-1">
                Enter your startup product idea. The AI Course Architect will automatically generate problem definitions, PRD specs, architecture schemas, and prompt blocks for all 5 tools.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-indigo-200 mb-1 font-mono">Course / Product Topic *</label>
                <input
                  type="text"
                  value={creatorTopic}
                  onChange={(e) => setCreatorTopic(e.target.value)}
                  placeholder="e.g. Build an Autonomous Real Estate AI Agent"
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-xl p-3 text-xs text-white placeholder:text-indigo-300/60 focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-indigo-200 mb-1 font-mono">Target Audience</label>
                <input
                  type="text"
                  value={creatorAudience}
                  onChange={(e) => setCreatorAudience(e.target.value)}
                  placeholder="e.g. Non-coders & Product Managers"
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-xl p-3 text-xs text-white placeholder:text-indigo-300/60 focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isGeneratingCourse || !creatorTopic}
              onClick={handleGenerateCourseAI}
              className="px-6 py-3 bg-white text-indigo-950 font-bold text-xs rounded-xl shadow hover:bg-indigo-50 disabled:opacity-50 flex items-center gap-2"
            >
              {isGeneratingCourse ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-900" />
                  <span>Synthesizing 8-Part PRD Course Outline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Auto-Generate 8-Part PRD Course Blueprint →</span>
                </>
              )}
            </button>
          </div>

          {/* Standard Course Authoring Suite */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-600" /> Manual Course Authoring Form
            </h2>
            <p className="text-xs text-slate-600 mb-6">
              Create standardized PRD-backed courses manually for the AI Academy registry.
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
                    <option value="Personal Branding & Launch">Personal Branding & Launch</option>
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
                      Score: {sub.aiEvaluation?.score || 96}/100
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">{sub.problemSolved}</p>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <strong>AI Evaluator Summary:</strong> {sub.aiEvaluation?.overallSummary || 'Solid MVP execution with verified 4-File Parity.'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM 4: ADMIN CONSOLE & ECOSYSTEM ENGINE */}
      {currentRole === 'ADMIN' && (
        <div className="space-y-8">
          {/* Executive Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Instructors</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{CREATORS_DATABASE.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Live Courses</span>
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

      {/* MODAL 1: VERIFIED BUILDER CERTIFICATE MODAL (PRD §7 Phase 4) */}
      {isCertModalOpen && latestEvaluation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                StartupOS Verified AI Product Builder
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">Certificate of Shipped Product</h2>
              <p className="text-xs text-slate-500 font-medium">Verification Hash: <span className="font-mono text-slate-700">{latestEvaluation.certificateId}</span></p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600">Product Title:</span>
                <strong className="text-slate-900">{latestEvaluation.project?.projectTitle}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600">AI Evaluation Score:</span>
                <strong className="text-emerald-600 font-mono font-bold">{latestEvaluation.score} / 100 (Top 5%)</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Governance Parity:</span>
                <strong className="text-indigo-600">100% 4-File Parity Standard</strong>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const bragText = `🚀 Proud to share that I just built and shipped ${latestEvaluation.project?.projectTitle}! Scored ${latestEvaluation.score}/100 with full 4-File Parity on StartupOS AI Builder Academy. Live Demo: ${latestEvaluation.project?.liveDemoUrl} | GitHub: ${latestEvaluation.project?.githubUrl} #AIBuilder #StartupOS #ProductManagement`;
                  navigator.clipboard.writeText(bragText);
                  alert('Copied LinkedIn brag post to clipboard!');
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-teal-700"
              >
                <Copy className="w-4 h-4" /> Copy LinkedIn Brag Post & Share
              </button>

              <button
                onClick={() => setIsCertModalOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ONE-CLICK GITHUB PROFILE README GENERATOR (PRD §7 Phase 5) */}
      {isReadmeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  1-Click Personal Brand Export
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">Recruiter-Ready GitHub Profile README</h2>
                <p className="text-xs text-slate-500">Generates clean markdown with minimalist monochrome CTAs and project tables.</p>
              </div>
              <button onClick={() => setIsReadmeModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>

            {/* Config Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1 font-mono text-[10px]">Your Name</label>
                <input
                  type="text"
                  value={readmeName}
                  onChange={(e) => setReadmeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1 font-mono text-[10px]">Your Role / Positioning</label>
                <input
                  type="text"
                  value={readmeRole}
                  onChange={(e) => setReadmeRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1 font-mono text-[10px]">GitHub Username</label>
                <input
                  type="text"
                  value={readmeGithub}
                  onChange={(e) => setReadmeGithub(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1 font-mono text-[10px]">LinkedIn Slug</label>
                <input
                  type="text"
                  value={readmeLinkedin}
                  onChange={(e) => setReadmeLinkedin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            {/* Generated Markdown Preview */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Generated Markdown Code:</span>
                <button
                  onClick={() => {
                    const md = generateProfileReadmeMarkdown({
                      name: readmeName,
                      role: readmeRole,
                      github: readmeGithub,
                      linkedin: readmeLinkedin,
                      email: readmeEmail,
                      projects: showcaseProjects
                    });
                    navigator.clipboard.writeText(md);
                    setCopiedReadme(true);
                    setTimeout(() => setCopiedReadme(false), 2000);
                  }}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                >
                  {copiedReadme ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedReadme ? 'Copied to Clipboard!' : 'Copy Markdown'}
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono max-h-60 overflow-y-auto whitespace-pre-wrap">
                {generateProfileReadmeMarkdown({
                  name: readmeName,
                  role: readmeRole,
                  github: readmeGithub,
                  linkedin: readmeLinkedin,
                  email: readmeEmail,
                  projects: showcaseProjects
                })}
              </pre>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              💡 <strong>Next Step:</strong> Paste this into your <code>{readmeGithub}/{readmeGithub}/README.md</code> repository on GitHub. It will instantly render on your profile overview.
            </p>
          </div>
        </div>
      )}

      {/* FLOATING CONTEXT-AWARE AI TUTOR DRAWER (PRD §8) */}
      {isAITutorOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white border border-indigo-200 rounded-3xl p-5 shadow-2xl z-50 space-y-3 animate-in fade-in slide-in-from-bottom-4 flex flex-col max-h-[500px]">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> AI Academy Mentor
              </span>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                Active: {selectedTool} • Step {activeStep} of 8
              </span>
            </div>
            <button onClick={() => setIsAITutorOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕</button>
          </div>

          {/* Tutor Messages Conversation */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
            {tutorMessages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-2xl leading-relaxed ${
                  m.sender === 'ai'
                    ? 'bg-indigo-50/70 border border-indigo-100 text-slate-800'
                    : 'bg-slate-900 text-white ml-6'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
            {[
              "💡 Non-coder analogy",
              "🐛 Debug my prompt",
              "🛡️ 4-File Parity checklist",
              `⚡ Why ${selectedTool}?`
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendTutorMessage(chip)}
                className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendTutorMessage();
            }}
            className="flex gap-2 pt-1"
          >
            <input
              type="text"
              value={tutorInput}
              onChange={(e) => setTutorInput(e.target.value)}
              placeholder="Ask mentor a question..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
