import React, { useState } from 'react';
import {
  GraduationCap, Plus, Sparkles, BookOpen, Edit3, Trash2, Copy, Eye,
  CheckCircle2, AlertTriangle, Search, Filter, RefreshCw, X, ChevronRight,
  ChevronDown, ChevronUp, Layers, Check, ExternalLink, Sliders, Award,
  Code2, Clock, Users, Star, ArrowUpRight, Zap, Target, FileText, Send
} from 'lucide-react';

const CATEGORIES = [
  'Full-Stack AI SaaS',
  'Personal Branding & Launch',
  'Startup & AI',
  'Agentic Architecture',
  'Prompt Engineering',
  'DevOps & 4-File Parity',
  'B2B GTM & Sales'
];

const DIFFICULTY_LEVELS = [
  'Beginner Non-Coder',
  'All Levels (PMs & Founders)',
  'Intermediate Builder',
  'Advanced Systems Architect'
];

const LESSON_TYPES = [
  { id: 'STEP_BUILDER', label: 'Step Builder (Hands-on Prompt)', icon: Code2 },
  { id: 'CONCEPT', label: 'Conceptual Architecture', icon: BookOpen },
  { id: 'HANDS_ON_CODE', label: 'Hands-on Coding & Verification', icon: Zap },
  { id: 'QUIZ', label: 'Knowledge & Edge-Case Check', icon: Award },
  { id: 'CAPSTONE', label: 'Capstone Project Audit', icon: Target }
];

const AI_PROMPT_TEMPLATES = [
  {
    id: 'agentic_finops',
    title: 'Autonomous Multi-Agent FinOps Gateway',
    category: 'Agentic Architecture',
    level: 'Intermediate Builder',
    prompt: 'Create a comprehensive 4-module masterclass on building an enterprise token FinOps gateway and AST pruner using FastAPI, React 19, and autonomous tool calling agents. Include deterministic prompts for Antigravity and Claude Code.'
  },
  {
    id: 'saas_rapid',
    title: '0-to-1 AI Micro-SaaS in 48 Hours',
    category: 'Full-Stack AI SaaS',
    level: 'Beginner Non-Coder',
    prompt: 'Design a high-yield course teaching non-technical founders how to build, test, and deploy a customer insights AI micro-SaaS with Supabase PostgreSQL, Gemini 2.0 API, and automated GitHub CI/CD.'
  },
  {
    id: 'developer_brand',
    title: 'Founder Personal Brand & High-Converting Repos',
    category: 'Personal Branding & Launch',
    level: 'All Levels (PMs & Founders)',
    prompt: 'Build a step-by-step course on developer branding: crafting monochrome GitHub profile READMEs, achieving 100% 4-file parity, and using the 5-part hook framework to drive 50k+ LinkedIn impressions.'
  },
  {
    id: 'rag_vector',
    title: 'Production RAG & Hybrid Vector Retrieval',
    category: 'Startup & AI',
    level: 'Advanced Systems Architect',
    prompt: 'Architect an advanced course covering semantic caching, reciprocal rank fusion (RRF), Qdrant vector databases, and multi-tenant RAG pipelines with rigorous automated testing.'
  }
];

export default function AcademyLmsStudio({ courses = [], onRefresh, currentUser }) {
  // Course Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'live' | 'draft'
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Editor Drawer / Modal
  const [editingCourse, setEditingCourse] = useState(null);
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [editorTab, setEditorTab] = useState('details'); // 'details' | 'modules' | 'rubric'
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [activeToolTab, setActiveToolTab] = useState('Antigravity');
  const [saving, setSaving] = useState(false);

  // AI Generator Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiSelectedCategory, setAiSelectedCategory] = useState(CATEGORIES[0]);
  const [aiSelectedLevel, setAiSelectedLevel] = useState(DIFFICULTY_LEVELS[1]);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Preview Modal
  const [previewCourse, setPreviewCourse] = useState(null);
  const [previewModuleIdx, setPreviewModuleIdx] = useState(0);
  const [previewLessonIdx, setPreviewLessonIdx] = useState(0);
  const [previewTool, setPreviewTool] = useState('Antigravity');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Telemetry computation
  const totalCourses = courses.length;
  const liveCount = courses.filter(c => c.status === 'LIVE').length;
  const draftCount = courses.filter(c => c.status === 'DRAFT').length;
  const totalLessons = courses.reduce((acc, c) => {
    return acc + (c.modules || []).reduce((mAcc, m) => mAcc + (m.lessons || []).length, 0);
  }, 0);
  const totalStudents = courses.reduce((acc, c) => acc + (Number(c.enrolledCount) || 0), 0);

  // Filtered courses
  const filteredCourses = courses.filter(c => {
    const matchesSearch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'live' && c.status === 'LIVE') ||
                          (statusFilter === 'draft' && c.status === 'DRAFT');
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Action: Toggle Publish
  const handleTogglePublish = async (courseId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/publish`, { method: 'POST' });
      if (res.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  // Action: Duplicate Course
  const handleDuplicate = async (courseId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (onRefresh) onRefresh();
        setEditingCourse(data);
        setIsNewCourse(false);
      }
    } catch (err) {
      console.error('Failed to duplicate course:', err);
    }
  };

  // Action: Delete Course
  const handleDelete = async (courseId, title, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' });
      if (res.ok) {
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  // Action: Create New Course Boilerplate
  const handleStartCreateNew = () => {
    const freshCourse = {
      id: `course-${Date.now()}`,
      title: 'New AI Builder Course',
      slug: `new-ai-course-${Date.now().toString().slice(-4)}`,
      subtitle: 'A practical, hands-on masterclass for AI founders and product engineers.',
      creatorId: 'creator-admin',
      creatorName: currentUser?.name || 'StartupOS Core Team',
      creatorRole: 'Academy Course Lead',
      category: 'Full-Stack AI SaaS',
      level: 'All Levels (PMs & Founders)',
      duration: '60 mins',
      status: 'DRAFT',
      badge: 'New',
      rating: 5.0,
      enrolledCount: 0,
      toolsSupported: ['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent'],
      structure: {
        problem: 'Founders spend weeks on boilerplate code instead of validating customer value.',
        useCase: 'Deploy a production-ready AI app with automated tool calling and 4-file parity.',
        prd: {
          targetUser: 'Product Managers, Solo Founders, Full-Stack Engineers',
          coreFeatures: [
            'Interactive LLM tool calling schema',
            'Full-stack PostgreSQL database connection',
            'Automated 4-file parity compliance',
            '1-Click cloud deployment'
          ]
        },
        rubric: {
          problemClarity: 25,
          fourFileParity: 25,
          codeArchitecture: 25,
          uxCompleteness: 25
        }
      },
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          title: 'Module 1: Problem Definition & Architecture',
          description: 'Define the user persona, system boundaries, and database contracts.',
          lessons: [
            {
              id: `les-${Date.now()}-1`,
              title: 'Lesson 1.1: Drafting the AI Prompt Architecture',
              lessonType: 'STEP_BUILDER',
              duration: '15 mins',
              xpReward: 50,
              description: 'Learn how to write deterministic prompts for AI coding agents.',
              tools: {
                Antigravity: {
                  promptToCopy: 'Act as a senior software architect. Generate the full project specification and database schema for our new AI product.',
                  expectedOutput: 'Clean architecture specification and database schema files.',
                  validationHint: 'Verify all table relationships and RLS policies.'
                },
                'Claude Code': {
                  promptToCopy: 'claude "Create AGENTS.md, ROADMAP.md, and database migrations for the new AI project."',
                  expectedOutput: 'Constitutional files and migrations created.',
                  validationHint: 'Run git status to verify clean staging area.'
                }
              }
            }
          ]
        }
      ]
    };
    setEditingCourse(freshCourse);
    setIsNewCourse(true);
    setEditorTab('details');
    setActiveModuleIndex(0);
    setActiveLessonIndex(0);
  };

  // Action: Save Course (PUT or POST)
  const handleSaveCourse = async () => {
    if (!editingCourse || !editingCourse.title) {
      alert('Course title is required.');
      return;
    }
    setSaving(true);
    try {
      const url = isNewCourse 
        ? '/api/admin/courses' 
        : `/api/admin/courses/${editingCourse.id}`;
      const method = isNewCourse ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCourse)
      });

      if (res.ok) {
        if (onRefresh) onRefresh();
        setEditingCourse(null);
        setIsNewCourse(false);
      } else {
        const errData = await res.json();
        alert(`Error saving course: ${errData.error || 'Server rejected request'}`);
      }
    } catch (err) {
      console.error('Failed to save course:', err);
      alert('Network error while saving course.');
    } finally {
      setSaving(false);
    }
  };

  // Action: AI Course Generator Algorithm
  const handleGenerateAiCurriculum = () => {
    if (!aiCustomPrompt.trim()) {
      alert('Please enter a prompt or select a template.');
      return;
    }

    setAiGenerating(true);
    setTimeout(() => {
      const promptLower = aiCustomPrompt.toLowerCase();
      const timestamp = Date.now();
      const slugTitle = aiCustomPrompt
        .split(' ')
        .slice(0, 5)
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');

      const generated = {
        id: `course-${timestamp}`,
        title: aiCustomPrompt.slice(0, 70).replace(/\.$/, ''),
        slug: `${slugTitle}-${timestamp.toString().slice(-4)}`,
        subtitle: `Master ${aiSelectedCategory} with deterministic prompts, 4-file parity governance, and hands-on capstones.`,
        creatorId: 'creator-admin',
        creatorName: 'StartupOS AI Architect',
        creatorRole: 'Automated Curriculum Synthesis',
        category: aiSelectedCategory,
        level: aiSelectedLevel,
        duration: '90 mins',
        status: 'DRAFT',
        badge: 'AI Synthesized',
        rating: 5.0,
        enrolledCount: 0,
        toolsSupported: ['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent'],
        structure: {
          problem: `Builders in ${aiSelectedCategory} frequently encounter friction setting up architecture, deterministic prompts, and validation test suites.`,
          useCase: `End-to-end hands-on build implementing ${aiCustomPrompt.slice(0, 60)}.`,
          prd: {
            targetUser: 'Founders, Product Managers, Full-Stack Engineers',
            coreFeatures: [
              'System specification and deterministic AI prompt design',
              '4-File Parity Constitution (AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md)',
              'Live multi-surface execution with automated sandbox verification',
              'Public demo day showcase and co-builder pitch matching'
            ]
          },
          rubric: {
            problemClarity: 25,
            fourFileParity: 25,
            codeArchitecture: 25,
            uxCompleteness: 25
          }
        },
        modules: [
          {
            id: `mod-${timestamp}-1`,
            title: 'Module 1: Problem Discovery & System Architecture',
            description: 'Deconstruct the domain requirements and generate clean data contracts.',
            lessons: [
              {
                id: `les-${timestamp}-1-1`,
                title: 'Lesson 1.1: Specifying Data Contracts & Agent Prompts',
                lessonType: 'STEP_BUILDER',
                duration: '20 mins',
                xpReward: 50,
                description: 'Craft unambiguous system prompts for autonomous AI coding agents.',
                tools: {
                  Antigravity: {
                    promptToCopy: `Act as a principal engineer. Design the modular architecture for: "${aiCustomPrompt}". Specify REST endpoints, state models, and component boundaries.`,
                    expectedOutput: 'Structured architecture spec with data flow diagrams and contracts.',
                    validationHint: 'Verify no ambiguous API types or missing edge cases.'
                  },
                  'Claude Code': {
                    promptToCopy: `claude "Generate an AGENTS.md and CLAUDE.md for ${aiCustomPrompt} with explicit boundaries."`,
                    expectedOutput: 'Living governance documentation in repository root.',
                    validationHint: 'Ensure 4 constitutional files exist.'
                  }
                }
              }
            ]
          },
          {
            id: `mod-${timestamp}-2`,
            title: 'Module 2: Implementation & 4-File Parity Scaffolding',
            description: 'Scaffold the full-stack codebase with strict governance and automated test suites.',
            lessons: [
              {
                id: `les-${timestamp}-2-1`,
                title: 'Lesson 2.1: Full-Stack Code Generation & Integration',
                lessonType: 'HANDS_ON_CODE',
                duration: '35 mins',
                xpReward: 75,
                description: 'Build and verify the core business logic and responsive user interface.',
                tools: {
                  Antigravity: {
                    promptToCopy: `Generate the full-stack implementation for "${aiCustomPrompt}". Include backend routes, frontend UI, and end-to-end integration tests.`,
                    expectedOutput: 'Functional codebase with passing smoke tests.',
                    validationHint: 'Run npm run build to verify zero TypeScript or syntax errors.'
                  }
                }
              }
            ]
          },
          {
            id: `mod-${timestamp}-3`,
            title: 'Module 3: Capstone Evaluation & Public Showcase',
            description: 'Run automated sandbox tests, verify 4-file parity score, and publish to demo day.',
            lessons: [
              {
                id: `les-${timestamp}-3-1`,
                title: 'Lesson 3.1: Final Capstone Audit & Certification',
                lessonType: 'CAPSTONE',
                duration: '35 mins',
                xpReward: 100,
                description: 'Submit your live deployment and repository for AI + examiner evaluation.',
                tools: {
                  Antigravity: {
                    promptToCopy: 'Verify repository 4-file parity, test coverage, and create a recruiter-converting GitHub Profile README.',
                    expectedOutput: '100% 4-File Parity score and certified audit report.',
                    validationHint: 'Check that demo URL returns HTTP 200 OK.'
                  }
                }
              }
            ]
          }
        ]
      };

      setEditingCourse(generated);
      setIsNewCourse(true);
      setIsAiModalOpen(false);
      setAiGenerating(false);
      setEditorTab('details');
      setActiveModuleIndex(0);
      setActiveLessonIndex(0);
    }, 600);
  };

  // Helper: Add Module to currently edited course
  const handleAddModule = () => {
    if (!editingCourse) return;
    const newMod = {
      id: `mod-${Date.now()}`,
      title: `Module ${(editingCourse.modules || []).length + 1}: Core Implementation`,
      description: 'Actionable workflows and hands-on exercises.',
      lessons: [
        {
          id: `les-${Date.now()}`,
          title: `Lesson ${(editingCourse.modules || []).length + 1}.1: Hands-on Execution`,
          lessonType: 'STEP_BUILDER',
          duration: '20 mins',
          xpReward: 50,
          description: 'Step-by-step instructions for agentic coding.',
          tools: {
            Antigravity: {
              promptToCopy: 'Act as a senior software architect. Implement the core functionality for this step.',
              expectedOutput: 'Clean implementation files generated.',
              validationHint: 'Ensure test passes cleanly.'
            }
          }
        }
      ]
    };
    const updated = {
      ...editingCourse,
      modules: [...(editingCourse.modules || []), newMod]
    };
    setEditingCourse(updated);
    setActiveModuleIndex((updated.modules.length) - 1);
    setActiveLessonIndex(0);
  };

  // Helper: Delete Module
  const handleDeleteModule = (modIdx) => {
    if (!editingCourse) return;
    if ((editingCourse.modules || []).length <= 1) {
      alert('A course must contain at least one module.');
      return;
    }
    const updatedModules = editingCourse.modules.filter((_, idx) => idx !== modIdx);
    setEditingCourse({ ...editingCourse, modules: updatedModules });
    setActiveModuleIndex(0);
    setActiveLessonIndex(0);
  };

  // Helper: Add Lesson to current module
  const handleAddLesson = (modIdx) => {
    if (!editingCourse) return;
    const currentMod = editingCourse.modules[modIdx];
    const newLesson = {
      id: `les-${Date.now()}`,
      title: `Lesson ${modIdx + 1}.${(currentMod.lessons || []).length + 1}: Actionable Build Step`,
      lessonType: 'STEP_BUILDER',
      duration: '15 mins',
      xpReward: 50,
      description: 'Execute deterministic coding prompts with your AI assistant.',
      tools: {
        Antigravity: {
          promptToCopy: 'Act as a senior software architect. Execute this build step with precision.',
          expectedOutput: 'Verified artifact produced.',
          validationHint: 'Verify code compiles cleanly.'
        }
      }
    };
    const updatedModules = [...editingCourse.modules];
    updatedModules[modIdx] = {
      ...currentMod,
      lessons: [...(currentMod.lessons || []), newLesson]
    };
    setEditingCourse({ ...editingCourse, modules: updatedModules });
    setActiveLessonIndex((updatedModules[modIdx].lessons.length) - 1);
  };

  // Helper: Delete Lesson
  const handleDeleteLesson = (modIdx, lesIdx) => {
    if (!editingCourse) return;
    const currentMod = editingCourse.modules[modIdx];
    if ((currentMod.lessons || []).length <= 1) {
      alert('Each module must contain at least one lesson.');
      return;
    }
    const updatedLessons = currentMod.lessons.filter((_, idx) => idx !== lesIdx);
    const updatedModules = [...editingCourse.modules];
    updatedModules[modIdx] = { ...currentMod, lessons: updatedLessons };
    setEditingCourse({ ...editingCourse, modules: updatedModules });
    setActiveLessonIndex(0);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP TELEMETRY BAR FOR AI ACADEMY LMS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Curriculum Portfolio</span>
            <GraduationCap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalCourses}</span>
            <span className="text-[10px] text-indigo-400 font-bold">Total Courses</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Standardized tracks in Academy</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Live to Founders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{liveCount}</span>
            <span className="text-[10px] text-emerald-500/80 font-bold">Published</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Accessible to all students</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">In Staging & Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{draftCount}</span>
            <span className="text-[10px] text-amber-500/80 font-bold">Drafts</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Under curation by StartupOS</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Modules & Lessons</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalLessons}</span>
            <span className="text-[10px] text-blue-400 font-bold">Active Steps</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Multi-tool hands-on lessons</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Learner Reach</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{(totalStudents).toLocaleString()}</span>
            <span className="text-[10px] text-purple-400 font-bold">Enrolled</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Founders leveling up skills</p>
        </div>
      </div>

      {/* 2. CREATOR ACTIONS TOOLBAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, slug, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({courses.length})
            </button>
            <button
              onClick={() => setStatusFilter('live')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'live' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live ({liveCount})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'draft' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Course Generator</span>
          </button>

          <button
            onClick={handleStartCreateNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Author Course</span>
          </button>
        </div>
      </div>

      {/* 3. COURSES CATALOG GRID / CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-bold">
          <span>Active Academy Courses ({filteredCourses.length})</span>
          <span>Click any card to edit syllabus, prompts, and rubrics</span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-white font-extrabold text-sm">No courses match your filter</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Try modifying your search or author a new course using the buttons above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCourses.map((course) => {
              const isLive = course.status === 'LIVE';
              const moduleCount = (course.modules || []).length;
              const lessonCount = (course.modules || []).reduce((acc, m) => acc + (m.lessons || []).length, 0);

              return (
                <div
                  key={course.id}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all space-y-4 group"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={(e) => handleTogglePublish(course.id, e)}
                          title="Click to toggle publish status"
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isLive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {isLive ? 'LIVE IN ACADEMY' : 'DRAFT (UNPUBLISHED)'}
                        </button>

                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {course.category}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {course.level}
                        </span>

                        {course.badge && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            ★ {course.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">
                        {course.subtitle || course.structure?.problem || 'No description provided.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{course.duration || '60 mins'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-bold text-white">{moduleCount}</span> modules
                          <span className="text-slate-600">({lessonCount} lessons)</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-bold text-white">{(course.enrolledCount || 0).toLocaleString()}</span> enrolled
                        </span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{course.rating || 4.9}</span>
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          By: <strong className="text-slate-300">{course.creatorName || 'StartupOS Core Team'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => {
                          setPreviewCourse(course);
                          setPreviewModuleIdx(0);
                          setPreviewLessonIdx(0);
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                        title="Preview as Student"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDuplicate(course.id, e)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                        title="Duplicate Course (Draft)"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingCourse(JSON.parse(JSON.stringify(course)));
                          setIsNewCourse(false);
                          setEditorTab('details');
                          setActiveModuleIndex(0);
                          setActiveLessonIndex(0);
                        }}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold px-3 py-2 rounded-xl shadow transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Syllabus</span>
                      </button>

                      <button
                        onClick={(e) => handleDelete(course.id, course.title, e)}
                        className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Supported Tools Tags */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-500">Multi-Tool Prompts:</span>
                      {(course.toolsSupported || ['Antigravity', 'Claude Code', 'Cursor']).map(tool => (
                        <span key={tool} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px]">
                          {tool}
                        </span>
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">Slug: /{course.slug}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. FULL-FEATURED COURSE CREATOR & PUBLISHER DRAWER/MODAL
         ───────────────────────────────────────────────────────────── */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-white">
                      {isNewCourse ? 'Author New Academy Course' : 'Course Creator & Publisher Studio'}
                    </h2>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      editingCourse.status === 'LIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {editingCourse.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure syllabus, multi-agent prompt blueprints, validation rubrics & publishing status
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newStatus = editingCourse.status === 'LIVE' ? 'DRAFT' : 'LIVE';
                    setEditingCourse({ ...editingCourse, status: newStatus });
                  }}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                    editingCourse.status === 'LIVE'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {editingCourse.status === 'LIVE' ? 'Switch to Draft' : 'Mark as Live (Publish)'}
                </button>

                <button
                  onClick={handleSaveCourse}
                  disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-extrabold px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
                </button>

                <button
                  onClick={() => setEditingCourse(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Studio Navigation Tabs */}
            <div className="border-b border-slate-800 px-6 bg-slate-900/90 flex gap-6 text-xs font-bold">
              <button
                onClick={() => setEditorTab('details')}
                className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  editorTab === 'details'
                    ? 'border-indigo-500 text-white font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>1. Course Details & GTM</span>
              </button>

              <button
                onClick={() => setEditorTab('modules')}
                className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  editorTab === 'modules'
                    ? 'border-indigo-500 text-white font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>2. Syllabus & Lesson Builder ({(editingCourse.modules || []).length} Modules)</span>
              </button>

              <button
                onClick={() => setEditorTab('rubric')}
                className={`py-3.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  editorTab === 'rubric'
                    ? 'border-indigo-500 text-white font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>3. Capstone Spec & 100-Pt Rubric</span>
              </button>
            </div>

            {/* Studio Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: DETAILS */}
              {editorTab === 'details' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={editingCourse.title || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                      placeholder="e.g. Build a Full-Stack AI SaaS in 60 Mins with Antigravity & Supabase"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        URL Slug *
                      </label>
                      <input
                        type="text"
                        value={editingCourse.slug || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, slug: e.target.value })}
                        placeholder="build-ai-saas-antigravity"
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Category
                      </label>
                      <select
                        value={editingCourse.category || CATEGORIES[0]}
                        onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Subtitle / One-Line Hook
                    </label>
                    <textarea
                      rows={2}
                      value={editingCourse.subtitle || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, subtitle: e.target.value })}
                      placeholder="Learn how to transform a simple PRD into a production-ready AI product without manual coding."
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Difficulty Level
                      </label>
                      <select
                        value={editingCourse.level || DIFFICULTY_LEVELS[1]}
                        onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {DIFFICULTY_LEVELS.map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Estimated Duration
                      </label>
                      <input
                        type="text"
                        value={editingCourse.duration || '60 mins'}
                        onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                        placeholder="e.g. 60 mins or 4 hrs"
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Highlight Badge
                      </label>
                      <input
                        type="text"
                        value={editingCourse.badge || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, badge: e.target.value })}
                        placeholder="e.g. Bestseller, Essential, New"
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Instructor / Author Name
                      </label>
                      <input
                        type="text"
                        value={editingCourse.creatorName || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, creatorName: e.target.value })}
                        placeholder="e.g. StartupOS Core Team"
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Instructor Role / Title
                      </label>
                      <input
                        type="text"
                        value={editingCourse.creatorRole || ''}
                        onChange={(e) => setEditingCourse({ ...editingCourse, creatorRole: e.target.value })}
                        placeholder="e.g. Chief AI Architect & Course Lead"
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Supported Tools Selection */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Target AI Coding Tools Supported
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent'].map((tool) => {
                        const isSelected = (editingCourse.toolsSupported || []).includes(tool);
                        return (
                          <button
                            key={tool}
                            type="button"
                            onClick={() => {
                              const cur = editingCourse.toolsSupported || [];
                              const next = isSelected 
                                ? cur.filter(t => t !== tool) 
                                : [...cur, tool];
                              setEditingCourse({ ...editingCourse, toolsSupported: next });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                            {tool}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MODULES & LESSON BUILDER */}
              {editorTab === 'modules' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Modules List & Add */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                      <span>Modules ({editingCourse.modules?.length || 0})</span>
                      <button
                        onClick={handleAddModule}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-extrabold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Module</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {(editingCourse.modules || []).map((mod, modIdx) => {
                        const isModActive = activeModuleIndex === modIdx;
                        return (
                          <div
                            key={mod.id || modIdx}
                            onClick={() => {
                              setActiveModuleIndex(modIdx);
                              setActiveLessonIndex(0);
                            }}
                            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isModActive
                                ? 'bg-indigo-600/15 border-indigo-500/60 shadow'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-extrabold text-white truncate">
                                {mod.title || `Module ${modIdx + 1}`}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteModule(modIdx);
                                }}
                                className="text-slate-500 hover:text-red-400 p-1 rounded"
                                title="Delete Module"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                              {(mod.lessons || []).length} lesson(s)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Active Module & Lessons Details */}
                  <div className="lg:col-span-8 space-y-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                    {editingCourse.modules?.[activeModuleIndex] ? (
                      <div className="space-y-6">
                        {/* Module Meta */}
                        <div className="space-y-3 pb-4 border-b border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                              Editing Module {activeModuleIndex + 1}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase">Module Title</label>
                            <input
                              type="text"
                              value={editingCourse.modules[activeModuleIndex].title || ''}
                              onChange={(e) => {
                                const nextMods = [...editingCourse.modules];
                                nextMods[activeModuleIndex].title = e.target.value;
                                setEditingCourse({ ...editingCourse, modules: nextMods });
                              }}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase">Module Description / Goal</label>
                            <input
                              type="text"
                              value={editingCourse.modules[activeModuleIndex].description || ''}
                              onChange={(e) => {
                                const nextMods = [...editingCourse.modules];
                                nextMods[activeModuleIndex].description = e.target.value;
                                setEditingCourse({ ...editingCourse, modules: nextMods });
                              }}
                              placeholder="Summary of what the learner will accomplish in this module"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
                            />
                          </div>
                        </div>

                        {/* Lessons in this module */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-white">Lessons in this Module</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                                {(editingCourse.modules[activeModuleIndex].lessons || []).length}
                              </span>
                            </div>
                            <button
                              onClick={() => handleAddLesson(activeModuleIndex)}
                              className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Lesson</span>
                            </button>
                          </div>

                          {/* Lesson Selector Chips */}
                          <div className="flex flex-wrap gap-2">
                            {(editingCourse.modules[activeModuleIndex].lessons || []).map((les, lesIdx) => {
                              const isLesActive = activeLessonIndex === lesIdx;
                              return (
                                <button
                                  key={les.id || lesIdx}
                                  onClick={() => setActiveLessonIndex(lesIdx)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                                    isLesActive
                                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                  }`}
                                >
                                  <span>{les.title || `Lesson ${activeModuleIndex + 1}.${lesIdx + 1}`}</span>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteLesson(activeModuleIndex, lesIdx);
                                    }}
                                    className="hover:text-red-300"
                                    title="Delete Lesson"
                                  >
                                    ×
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Active Lesson Deep Editor */}
                          {editingCourse.modules[activeModuleIndex].lessons?.[activeLessonIndex] && (
                            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                              {(() => {
                                const currentLes = editingCourse.modules[activeModuleIndex].lessons[activeLessonIndex];
                                const updateCurrentLesson = (patch) => {
                                  const nextMods = [...editingCourse.modules];
                                  nextMods[activeModuleIndex].lessons[activeLessonIndex] = {
                                    ...currentLes,
                                    ...patch
                                  };
                                  setEditingCourse({ ...editingCourse, modules: nextMods });
                                };

                                return (
                                  <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div className="space-y-1 md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Lesson Title</label>
                                        <input
                                          type="text"
                                          value={currentLes.title || ''}
                                          onChange={(e) => updateCurrentLesson({ title: e.target.value })}
                                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                                        <select
                                          value={currentLes.lessonType || 'STEP_BUILDER'}
                                          onChange={(e) => updateCurrentLesson({ lessonType: e.target.value })}
                                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                                        >
                                          {LESSON_TYPES.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Duration</label>
                                        <input
                                          type="text"
                                          value={currentLes.duration || '15 mins'}
                                          onChange={(e) => updateCurrentLesson({ duration: e.target.value })}
                                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">XP Reward</label>
                                        <input
                                          type="number"
                                          value={currentLes.xpReward || 50}
                                          onChange={(e) => updateCurrentLesson({ xpReward: Number(e.target.value) })}
                                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Student Task</label>
                                      <textarea
                                        rows={2}
                                        value={currentLes.description || ''}
                                        onChange={(e) => updateCurrentLesson({ description: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                                      />
                                    </div>

                                    {/* Multi-Tool Prompt Editor */}
                                    <div className="pt-3 border-t border-slate-800 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black uppercase text-indigo-400">
                                          Deterministic Coding Prompts
                                        </span>
                                        <div className="flex gap-1">
                                          {['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent'].map((tool) => (
                                            <button
                                              key={tool}
                                              type="button"
                                              onClick={() => setActiveToolTab(tool)}
                                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                                activeToolTab === tool
                                                  ? 'bg-indigo-600 text-white'
                                                  : 'bg-slate-950 text-slate-400 hover:text-white'
                                              }`}
                                            >
                                              {tool}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      {(() => {
                                        const toolsObj = currentLes.tools || {};
                                        const toolData = toolsObj[activeToolTab] || {
                                          promptToCopy: '',
                                          expectedOutput: '',
                                          validationHint: ''
                                        };

                                        const updateTool = (field, val) => {
                                          const nextTools = {
                                            ...toolsObj,
                                            [activeToolTab]: {
                                              ...toolData,
                                              [field]: val
                                            }
                                          };
                                          updateCurrentLesson({ tools: nextTools });
                                        };

                                        return (
                                          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                            <div className="space-y-1">
                                              <label className="text-[10px] font-bold text-slate-400 uppercase">
                                                {activeToolTab} Copy-Paste Prompt Blueprint
                                              </label>
                                              <textarea
                                                rows={3}
                                                value={toolData.promptToCopy || ''}
                                                onChange={(e) => updateTool('promptToCopy', e.target.value)}
                                                placeholder={`Enter deterministic system prompt formatted for ${activeToolTab}...`}
                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-indigo-200"
                                              />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Expected Output File / Result</label>
                                                <input
                                                  type="text"
                                                  value={toolData.expectedOutput || ''}
                                                  onChange={(e) => updateTool('expectedOutput', e.target.value)}
                                                  placeholder="e.g. migration.sql generated with RLS"
                                                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
                                                />
                                              </div>

                                              <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Validation Hint / Smoke Test</label>
                                                <input
                                                  type="text"
                                                  value={toolData.validationHint || ''}
                                                  onChange={(e) => updateTool('validationHint', e.target.value)}
                                                  placeholder="e.g. Verify syntax and RLS policies"
                                                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 text-slate-500 text-xs">
                        No module selected. Click Add Module on the left.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CAPSTONE SPEC & RUBRIC */}
              {editorTab === 'rubric' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Target ICP & User Persona
                    </label>
                    <input
                      type="text"
                      value={editingCourse.structure?.prd?.targetUser || ''}
                      onChange={(e) => {
                        const cur = editingCourse.structure || {};
                        const curPrd = cur.prd || {};
                        setEditingCourse({
                          ...editingCourse,
                          structure: {
                            ...cur,
                            prd: { ...curPrd, targetUser: e.target.value }
                          }
                        });
                      }}
                      placeholder="e.g. Product Managers, Solo Founders, Growth Marketers"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Problem Formulation
                    </label>
                    <textarea
                      rows={2}
                      value={editingCourse.structure?.problem || ''}
                      onChange={(e) => {
                        const cur = editingCourse.structure || {};
                        setEditingCourse({
                          ...editingCourse,
                          structure: { ...cur, problem: e.target.value }
                        });
                      }}
                      placeholder="Describe the real-world friction founders solve in this course."
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Capstone Use Case & Solution
                    </label>
                    <textarea
                      rows={2}
                      value={editingCourse.structure?.useCase || ''}
                      onChange={(e) => {
                        const cur = editingCourse.structure || {};
                        setEditingCourse({
                          ...editingCourse,
                          structure: { ...cur, useCase: e.target.value }
                        });
                      }}
                      placeholder="Describe the flagship deliverable students will build and ship."
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                    />
                  </div>

                  {/* 100-Point Rubric Breakdown */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                        100-Point Capstone Grading Rubric
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        Total 100 Pts
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'problemClarity', label: '1. Problem & ICP Clarity', defaultPts: 25 },
                        { key: 'fourFileParity', label: '2. 4-File Parity Governance', defaultPts: 25 },
                        { key: 'codeArchitecture', label: '3. Clean Code & API Contracts', defaultPts: 25 },
                        { key: 'uxCompleteness', label: '4. Live Webview & Smoke Tests', defaultPts: 25 }
                      ].map((item) => {
                        const curRubric = editingCourse.structure?.rubric || {};
                        const val = curRubric[item.key] ?? item.defaultPts;
                        return (
                          <div key={item.key} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-white">{item.label}</span>
                              <span className="text-xs font-bold text-indigo-400">{val} pts</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="40"
                              value={val}
                              onChange={(e) => {
                                const nextRubric = { ...curRubric, [item.key]: Number(e.target.value) };
                                setEditingCourse({
                                  ...editingCourse,
                                  structure: {
                                    ...(editingCourse.structure || {}),
                                    rubric: nextRubric
                                  }
                                });
                              }}
                              className="w-full accent-indigo-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. 1-CLICK AI COURSE GENERATOR MODAL
         ───────────────────────────────────────────────────────────── */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">AI Course Generator (1-Click Outline)</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Automatically synthesize a standardized multi-module curriculum with deterministic prompts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Curated Rapid Templates */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Or Choose a Pre-Configured Template</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AI_PROMPT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      setAiCustomPrompt(tmpl.prompt);
                      setAiSelectedCategory(tmpl.category);
                      setAiSelectedLevel(tmpl.level);
                    }}
                    className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-indigo-300">
                      <span>{tmpl.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block mt-1">{tmpl.category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Custom Prompt / Topic Blueprint</label>
              <textarea
                rows={3}
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="e.g. Build an Autonomous Multi-Agent FinOps Gateway in FastAPI and React 19 with 4-file parity..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                <select
                  value={aiSelectedCategory}
                  onChange={(e) => setAiSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Audience Level</label>
                <select
                  value={aiSelectedLevel}
                  onChange={(e) => setAiSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
                >
                  {DIFFICULTY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleGenerateAiCurriculum}
                disabled={aiGenerating}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
                <span>{aiGenerating ? 'Synthesizing Curriculum...' : 'Generate Full Curriculum'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. INTERACTIVE STUDENT PREVIEW MODAL
         ───────────────────────────────────────────────────────────── */}
      {previewCourse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                  👁️
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Learner View Preview</h3>
                  <span className="text-[11px] text-slate-400">How founders experience this course in the AI Academy</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {previewCourse.category}
                  </span>
                  <span className="text-[10px] text-slate-400">⏱️ {previewCourse.duration}</span>
                </div>
                <h2 className="text-lg font-black text-white">{previewCourse.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{previewCourse.subtitle}</p>
              </div>

              {/* Module & Lesson Selectors */}
              <div className="space-y-3">
                <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
                  {(previewCourse.modules || []).map((m, idx) => (
                    <button
                      key={m.id || idx}
                      onClick={() => {
                        setPreviewModuleIdx(idx);
                        setPreviewLessonIdx(0);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                        previewModuleIdx === idx
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.title || `Module ${idx + 1}`}
                    </button>
                  ))}
                </div>

                {(() => {
                  const mod = previewCourse.modules?.[previewModuleIdx];
                  const les = mod?.lessons?.[previewLessonIdx];
                  const toolsObj = les?.tools || {};
                  const toolData = toolsObj[previewTool] || Object.values(toolsObj)[0] || {};

                  return (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white">{les?.title || 'Lesson Title'}</h4>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">+{les?.xpReward || 50} XP</span>
                      </div>
                      <p className="text-xs text-slate-400">{les?.description}</p>

                      {/* Tool Tabs */}
                      <div className="flex gap-2">
                        {['Antigravity', 'Claude Code', 'Cursor'].map(t => (
                          <button
                            key={t}
                            onClick={() => setPreviewTool(t)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              previewTool === t
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {toolData.promptToCopy && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>System Prompt ({previewTool})</span>
                            <button
                              onClick={() => copyToClipboard(toolData.promptToCopy)}
                              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold cursor-pointer"
                            >
                              {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                            </button>
                          </div>
                          <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-indigo-200 whitespace-pre-wrap leading-relaxed">
                            {toolData.promptToCopy}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
