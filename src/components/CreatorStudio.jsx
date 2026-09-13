import React, { useState, useRef } from 'react';
import {
  Sparkles, BookOpen, Plus, Trash2, ChevronDown, ChevronUp,
  Copy, Check, RotateCw, Award, GraduationCap, FileText,
  Lightbulb, Target, Zap, CheckCircle2, Circle, Edit3,
  Download, ArrowRight, X, Users, Code2, Star
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────────────────────────
const COURSE_CATEGORIES = [
  'AI & LLMs', 'Frontend Dev', 'Backend & APIs', 'Product Management',
  'Startup & GTM', 'Data & Analytics', 'DevOps & Cloud', 'Design & UX'
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const MODULE_TYPES = [
  { id: 'concept', label: '📖 Concept Lesson', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'hands_on', label: '🛠️ Hands-On Build', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'quiz', label: '🧠 Knowledge Check', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { id: 'project', label: '🚀 Capstone Project', color: 'bg-amber-50 border-amber-200 text-amber-700' },
];

const PROMPT_TEMPLATES = [
  {
    id: 'ai_product',
    label: 'AI Product Building',
    prompt: 'Create a 5-module course on building AI-powered SaaS products using React 19, FastAPI, and multi-agent LLM workflows. Target audience: non-technical founders with basic coding exposure. Include hands-on exercises for each module.',
  },
  {
    id: 'prompt_eng',
    label: 'Prompt Engineering',
    prompt: 'Design a beginner-friendly course on advanced prompt engineering for entrepreneurs. Cover system prompts, context management, few-shot examples, and autonomous agent pipelines. 4 modules with real-world examples.',
  },
  {
    id: 'startup_gtm',
    label: 'Startup GTM',
    prompt: 'Build a 6-module Go-To-Market masterclass for AI-era founders. Include product-market fit discovery, pricing strategy, community-led growth, and Product Hunt launch playbooks. Intermediate level.',
  },
  {
    id: 'fullstack',
    label: 'Full-Stack Dev',
    prompt: 'Create a comprehensive full-stack development course for indie hackers: Vite + React frontend, Node.js/Express backend, PostgreSQL database, and Vercel deployment. 8 modules, beginner to intermediate.',
  },
];

// ──────────────────────────────────────────────────────────────────
// COURSE GENERATOR ENGINE (deterministic from prompt keywords)
// ──────────────────────────────────────────────────────────────────
function generateCourseFromPrompt(prompt, title, category, difficulty) {
  const words = prompt.toLowerCase();
  const moduleCount = words.includes('8 module') ? 8 : words.includes('6 module') ? 6 : words.includes('4 module') ? 4 : 5;

  const archetypes = [
    {
      title: 'Foundations & Mental Models',
      type: 'concept',
      duration: '45 min',
      lessons: ['Why this matters in 2026', 'Core vocabulary & concepts', 'The landscape & tools you need'],
      exercise: 'Write a 200-word problem statement for a product you want to build in this domain.',
      rubric: 'Clarity of problem (4pts), specificity of target user (3pts), market awareness (3pts)',
    },
    {
      title: 'Setting Up Your Environment',
      type: 'hands_on',
      duration: '60 min',
      lessons: ['Installing & configuring tools', 'Project scaffold & folder structure', 'Hello World → your first output'],
      exercise: 'Set up the environment end-to-end and share a screenshot of your first working output.',
      rubric: 'Environment running (5pts), clean structure (3pts), first output correct (2pts)',
    },
    {
      title: 'Core Patterns & Building Blocks',
      type: 'concept',
      duration: '50 min',
      lessons: ['Pattern 1: The simplest possible implementation', 'Pattern 2: Adding complexity safely', 'Common pitfalls & how to avoid them'],
      exercise: 'Implement Pattern 1 from scratch without looking at the example. Time yourself.',
      rubric: 'Implementation correct (5pts), code readable (3pts), no copy-paste (2pts)',
    },
    {
      title: 'Knowledge Check: Foundations',
      type: 'quiz',
      duration: '20 min',
      lessons: ['10-question multiple choice quiz', 'Explain-it-back challenges', 'Edge case scenarios'],
      exercise: 'Pass all 10 questions with a score ≥ 80% before proceeding to the next module.',
      rubric: 'Score ≥ 80% to pass (10pts)',
    },
    {
      title: 'Real-World Application',
      type: 'hands_on',
      duration: '75 min',
      lessons: ['Anatomy of a production-grade example', 'Adapting the template to your use case', 'Debugging & iteration loop'],
      exercise: 'Take the provided template and build a working version for your own startup idea.',
      rubric: 'Working demo (4pts), customised for their use case (3pts), no placeholder content (3pts)',
    },
    {
      title: 'Advanced Techniques',
      type: 'concept',
      duration: '55 min',
      lessons: ['Edge cases & scale considerations', 'Performance & optimisation', 'Integration with the broader stack'],
      exercise: 'Identify 3 ways your current implementation could fail at scale and propose fixes.',
      rubric: 'Identifies real edge cases (4pts), solutions are practical (4pts), clarity (2pts)',
    },
    {
      title: 'Team & Collaboration Patterns',
      type: 'hands_on',
      duration: '40 min',
      lessons: ['How to onboard a co-founder or contractor', 'Documentation standards for your stack', 'Git hygiene & PR conventions'],
      exercise: 'Write a CONTRIBUTING.md for your project using the 4-file parity standard.',
      rubric: 'CONTRIBUTING.md complete (5pts), covers commit standards (3pts), readable (2pts)',
    },
    {
      title: 'Capstone: Ship It',
      type: 'project',
      duration: '3 hrs',
      lessons: ['End-to-end project brief', 'Evaluation criteria walkthrough', 'Submission & peer review instructions'],
      exercise: 'Build and deploy a fully working version of your project. Record a 3-min Loom walkthrough.',
      rubric: 'Working deployment link (4pts), feature complete (3pts), video walkthrough (3pts)',
    },
  ];

  const selectedModules = archetypes.slice(0, moduleCount).map((m, i) => ({
    id: `mod-${i + 1}`,
    number: i + 1,
    ...m,
  }));

  const totalHours = selectedModules.reduce((acc, m) => {
    const mins = parseInt(m.duration) || 60;
    return acc + mins;
  }, 0);

  return {
    id: `course-${Date.now()}`,
    title: title || 'Generated Course',
    category,
    difficulty,
    modules: selectedModules,
    totalModules: selectedModules.length,
    totalDuration: `${Math.round(totalHours / 60)} hrs ${totalHours % 60 > 0 ? `${totalHours % 60} min` : ''}`.trim(),
    targetAudience: prompt.includes('founder') ? 'Founders & Entrepreneurs' : prompt.includes('engineer') ? 'Software Engineers' : 'Builders & Makers',
    learningOutcomes: [
      `Master the core concepts of ${category}`,
      'Build a working project from scratch',
      'Apply best practices used in production-grade startups',
      'Ship and present your work confidently',
    ],
    generatedAt: new Date().toISOString(),
  };
}

// ──────────────────────────────────────────────────────────────────
// MODULE CARD
// ──────────────────────────────────────────────────────────────────
function ModuleCard({ module, index, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(module.title);
  const typeInfo = MODULE_TYPES.find(t => t.id === module.type) || MODULE_TYPES[0];

  const saveTitle = () => { onUpdate({ ...module, title: localTitle }); setEditing(false); };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Module Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-black text-indigo-700 shrink-0">
          {module.number}
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={localTitle}
              onChange={e => setLocalTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => e.key === 'Enter' && saveTitle()}
              autoFocus
              onClick={e => e.stopPropagation()}
              className="w-full text-xs font-bold text-slate-900 bg-white border border-indigo-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          ) : (
            <p className="text-xs font-bold text-slate-900 truncate">{module.title}</p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className="text-[10px] text-slate-400">⏱ {module.duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(module.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 space-y-3 pt-3">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lessons</p>
            <ul className="space-y-1.5">
              {module.lessons.map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  {l}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">✍️ Exercise</p>
            <p className="text-xs text-amber-900 leading-relaxed">{module.exercise}</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">📊 Grading Rubric</p>
            <p className="text-xs text-emerald-900 leading-relaxed">{module.rubric}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────
export default function CreatorStudio() {
  const [step, setStep] = useState('form'); // 'form' | 'preview'
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('AI & LLMs');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [prompt, setPrompt] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handlePromptTemplate = (tpl) => {
    setPrompt(tpl.prompt);
    setCharCount(tpl.prompt.length);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    // Simulate AI processing time (real integration would call an LLM API here)
    setTimeout(() => {
      const course = generateCourseFromPrompt(prompt, title || undefined, category, difficulty);
      setGenerated(course);
      setGenerating(false);
      setStep('preview');
    }, 1800);
  };

  const handleModuleUpdate = (updated) => {
    setGenerated(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === updated.id ? updated : m),
    }));
  };

  const handleModuleDelete = (id) => {
    setGenerated(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== id),
      totalModules: prev.modules.filter(m => m.id !== id).length,
    }));
  };

  const handleAddModule = () => {
    const newModule = {
      id: `mod-${Date.now()}`,
      number: (generated?.modules?.length || 0) + 1,
      title: 'New Module — Click to rename',
      type: 'concept',
      duration: '45 min',
      lessons: ['Lesson 1', 'Lesson 2', 'Lesson 3'],
      exercise: 'Describe your exercise here.',
      rubric: 'Define grading criteria (10 pts total)',
    };
    setGenerated(prev => ({ ...prev, modules: [...prev.modules, newModule], totalModules: prev.totalModules + 1 }));
  };

  const handleCopyOutline = () => {
    if (!generated) return;
    const text = [
      `# ${generated.title}`,
      `**Category:** ${generated.category} | **Difficulty:** ${generated.difficulty} | **Duration:** ${generated.totalDuration}`,
      `**Target Audience:** ${generated.targetAudience}`,
      '',
      '## Learning Outcomes',
      ...generated.learningOutcomes.map((o, i) => `${i + 1}. ${o}`),
      '',
      '## Course Outline',
      ...generated.modules.map(m => [
        `### Module ${m.number}: ${m.title}`,
        `**Type:** ${m.type} | **Duration:** ${m.duration}`,
        '',
        '**Lessons:**',
        ...m.lessons.map(l => `- ${l}`),
        '',
        `**Exercise:** ${m.exercise}`,
        `**Rubric:** ${m.rubric}`,
        '',
      ].join('\n')),
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep('form');
    setGenerated(null);
    setPrompt('');
    setTitle('');
    setCharCount(0);
    setCategory('AI & LLMs');
    setDifficulty('Intermediate');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Creator Studio</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-violet-100 text-violet-700 border border-violet-200 rounded-full uppercase tracking-wider">AI Course Builder</span>
          </div>
          <p className="text-xs text-slate-500 ml-11">Generate complete 11-step AI course outlines with exercises, rubrics & lesson plans — from a single prompt.</p>
        </div>
        {step === 'preview' && (
          <button onClick={handleReset} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
            <RotateCw className="w-3.5 h-3.5" /> New Course
          </button>
        )}
      </div>

      {/* STEP 1: FORM */}
      {step === 'form' && (
        <div className="grid grid-cols-3 gap-5">
          {/* Left: Form */}
          <div className="col-span-2 space-y-4">
            {/* Quick Config */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900">Course Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Course Title (optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. AI Product Building Masterclass"
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all">
                    {COURSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Difficulty Level</label>
                  <div className="flex gap-2 flex-wrap">
                    {DIFFICULTY_LEVELS.map(d => (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${difficulty === d ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">Course Prompt</h3>
                <span className="text-[10px] text-slate-400">{charCount} chars</span>
              </div>
              <textarea
                rows={7}
                value={prompt}
                onChange={e => { setPrompt(e.target.value); setCharCount(e.target.value.length); }}
                placeholder="Describe the course you want to create. Be specific about the topic, target audience, number of modules, tools/tech stack, and learning level. The more detail you give, the better the output.

e.g. Create a 5-module course on building AI-powered SaaS products using React 19 and FastAPI for non-technical founders..."
                className="w-full text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white resize-none transition-all placeholder:text-slate-400 leading-relaxed"
              />
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {generating ? (
                  <><RotateCw className="w-4 h-4 animate-spin" /> Generating Course Outline...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Full Course Outline</>
                )}
              </button>
            </div>
          </div>

          {/* Right: Templates */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black text-slate-900">Quick Templates</h3>
              </div>
              <p className="text-[10px] text-slate-500">Click any template to pre-fill your prompt instantly.</p>
              <div className="space-y-2">
                {PROMPT_TEMPLATES.map(tpl => (
                  <button key={tpl.id} onClick={() => handlePromptTemplate(tpl)}
                    className="w-full text-left px-3.5 py-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">{tpl.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{tpl.prompt.slice(0, 80)}...</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Module type legend */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module Types</p>
              {MODULE_TYPES.map(t => (
                <div key={t.id} className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${t.color}`}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PREVIEW */}
      {step === 'preview' && generated && (
        <div className="space-y-5">
          {/* Course Info Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">{generated.category}</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">{generated.difficulty}</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">⏱ {generated.totalDuration}</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">👥 {generated.targetAudience}</span>
                </div>
                <h2 className="text-lg font-black text-slate-900">{generated.title}</h2>
                <p className="text-xs text-slate-500 mt-1">{generated.totalModules} modules generated</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleCopyOutline}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Outline</>}
                </button>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {generated.learningOutcomes.map((o, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  {o}
                </div>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Course Modules</h3>
              <button onClick={handleAddModule}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3.5 py-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-all">
                <Plus className="w-3.5 h-3.5" /> Add Module
              </button>
            </div>
            {generated.modules.map((mod, i) => (
              <ModuleCard key={mod.id} module={mod} index={i} onUpdate={handleModuleUpdate} onDelete={handleModuleDelete} />
            ))}
          </div>

          {/* Footer CTA */}
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-slate-900">Course outline ready!</h4>
              <p className="text-xs text-slate-600 mt-0.5">Copy the full outline and paste it into AntiGravity, Claude, or Cursor to generate the actual course content.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleCopyOutline}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Full Outline</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
