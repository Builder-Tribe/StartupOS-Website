import React, { useState } from 'react';
import { 
  BookOpen, Plus, Sparkles, Award, UserCheck, Layers, Cpu, 
  Terminal, CheckCircle2, Github, Globe, ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

export default function CreatorStudio({ courses, submissions, onPublishNewCourse, onSaveHumanReview }) {
  const [creatorTab, setCreatorTab] = useState('authoring'); // 'authoring' | 'evaluation'

  // New Course Authoring Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [category, setCategory] = useState('Full-Stack AI SaaS');
  const [level, setLevel] = useState('Beginner Non-Coder');
  const [duration, setDuration] = useState('45 mins');
  const [problem, setProblem] = useState('');
  const [useCase, setUseCase] = useState('');
  const [antigravityPrompt, setAntigravityPrompt] = useState('');

  // Evaluation Form State
  const [selectedSubId, setSelectedSubId] = useState(submissions[0]?.id);
  const [feedbackText, setFeedbackText] = useState('');
  const [pmScore, setPmScore] = useState(94);

  const selectedSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!courseTitle) return;

    sound.playSuccess();
    const newCourse = {
      id: `course-${Date.now()}`,
      title: courseTitle,
      slug: courseTitle.toLowerCase().replace(/\s+/g, '-'),
      subtitle: useCase || 'Learn how to build AI products with structured prompt workflows.',
      creatorId: 'creator-1',
      creatorName: 'Dr. Evelyn Vance (Chief AI Architect)',
      category: category,
      level: level,
      duration: duration,
      status: 'LIVE',
      enrolledCount: 1,
      toolsSupported: ['Antigravity', 'Claude Code', 'Cursor', 'Replit'],
      structure: {
        problem: problem || 'Solving key friction in rapid software creation.',
        useCase: useCase || 'Automated AI SaaS tool pipeline.',
        prd: {
          targetUser: 'Product Managers, Solo Founders',
          coreFeatures: ['Prompt engineering workflow', 'Database integration', 'One-click deployment']
        }
      },
      modules: [
        {
          id: `mod-${Date.now()}`,
          title: 'Module 1: AI Prompt Architecture & Setup',
          lessons: [
            {
              id: `les-${Date.now()}`,
              title: 'Lesson 1.1: Executing AI Tool Instructions',
              lessonType: 'STEP_BUILDER',
              description: 'Copy and execute structured prompt blocks in your preferred AI tool.',
              tools: {
                Antigravity: {
                  promptToCopy: antigravityPrompt || 'Act as a senior software architect. Create a database migration script for user feedback processing.',
                  expectedOutput: 'migration.sql created with clean schema definitions.',
                  validationHint: 'Verify valid SQL syntax.'
                }
              }
            }
          ]
        }
      ]
    };

    onPublishNewCourse(newCourse);
    confetti({ particleCount: 80, spread: 60 });
    setCourseTitle('');
    setProblem('');
    setUseCase('');
    setAntigravityPrompt('');
  };

  const handlePublishReview = () => {
    if (!feedbackText) return;
    sound.playSuccess();

    onSaveHumanReview(selectedSub.id, {
      reviewerName: 'Dr. Evelyn Vance (Lead PM Examiner)',
      feedbackText: feedbackText,
      score: Number(pmScore),
      date: new Date().toISOString().split('T')[0]
    });

    confetti({ particleCount: 90, spread: 70 });
    setFeedbackText('');
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 lg:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4 text-purple-500" />
            <span>SYSTEM 2: COURSE CREATOR & EXAMINER PORTAL</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-slate-900">
            Course Creator & Evaluation Studio
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Author standardized AI courses following the 8-part PRD template and evaluate learner project submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setCreatorTab('authoring');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
              creatorTab === 'authoring'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            ➕ Author New Course
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setCreatorTab('evaluation');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
              creatorTab === 'evaluation'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🏆 Evaluate Submissions ({submissions.length})
          </button>
        </div>
      </div>

      {/* TAB 1: COURSE AUTHORING STUDIO (Requirement 2) */}
      {creatorTab === 'authoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Authoring Form */}
          <div className="lg:col-span-6 space-y-6">
            <form onSubmit={handleCreateCourse} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-heading font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Plus className="w-5 h-5 text-purple-600" />
                Standardized Course Authoring Suite
              </h3>

              <div>
                <label className="text-xs font-heading font-bold text-slate-700 block mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build an AI Agent SaaS with Antigravity"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-heading font-bold text-slate-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  >
                    <option value="Full-Stack AI SaaS">Full-Stack AI SaaS</option>
                    <option value="Autonomous Agents">Autonomous Agents</option>
                    <option value="Micro-SaaS Repurposer">Micro-SaaS Repurposer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-heading font-bold text-slate-700 block mb-1">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-slate-700 block mb-1">
                  1. Problem Definition (PRD Section 1)
                </label>
                <textarea
                  rows={2}
                  placeholder="What user pain point does this course solve?"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-slate-700 block mb-1">
                  2. Target Use Case (PRD Section 2)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the end product learners will build..."
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-slate-700 block mb-1">
                  6. AI Prompt Block for Antigravity Tool
                </label>
                <textarea
                  rows={3}
                  placeholder="Act as a senior software architect. Generate migration file..."
                  value={antigravityPrompt}
                  onChange={(e) => setAntigravityPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-purple-700 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-heading font-bold text-xs shadow flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Publish Standardized Course Live
              </button>
            </form>
          </div>

          {/* Right Column: Existing Live Courses List */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-heading font-bold text-slate-900">
                Your Published Standardized Courses ({courses.length})
              </h3>

              <div className="space-y-3">
                {courses.map((c) => (
                  <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">
                        {c.category} • {c.level}
                      </span>
                      <span className="text-xs font-mono text-emerald-600 font-bold">● {c.status}</span>
                    </div>

                    <h4 className="text-sm font-heading font-bold text-slate-900">{c.title}</h4>
                    <p className="text-xs text-slate-600">{c.subtitle}</p>

                    <div className="text-[11px] text-slate-500 font-mono pt-1">
                      Tools Supported: {c.toolsSupported.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: EXAMINER EVALUATION WORKBENCH (Requirement 2) */}
      {creatorTab === 'evaluation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Submissions Queue */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500">
                Submissions Pending PM Review ({submissions.length})
              </h3>

              <div className="space-y-2">
                {submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedSubId(sub.id);
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      sub.id === selectedSubId
                        ? 'bg-purple-50 border-purple-300 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-bold text-slate-900">{sub.projectTitle}</span>
                      <span className="text-[10px] font-mono text-purple-600">{sub.submittedDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Student: {sub.studentName} ({sub.studentRole})</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Evaluation Workspace */}
          <div className="lg:col-span-7 space-y-6">
            {selectedSub && (
              <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-xs font-mono text-purple-600 font-bold">EXAMINER PROJECT EVALUATION</span>
                  <h3 className="text-xl font-heading font-bold text-slate-900 mt-1">{selectedSub.projectTitle}</h3>
                  <div className="text-xs text-slate-500">Student: <strong>{selectedSub.studentName}</strong></div>

                  <div className="flex items-center gap-3 text-xs font-mono pt-2">
                    <a href={selectedSub.githubUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold">
                      <Github className="w-3.5 h-3.5" /> Repository Link
                    </a>
                    {selectedSub.liveDemoUrl && (
                      <a href={selectedSub.liveDemoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold">
                        <Globe className="w-3.5 h-3.5" /> Live Demo Link
                      </a>
                    )}
                  </div>
                </div>

                {/* AI Evaluator Output */}
                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-heading font-bold border-b border-slate-800 pb-2">
                    <span className="text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Evaluator Engine Report
                    </span>
                    <span className="text-emerald-400 font-mono">Score: {selectedSub.aiEvaluation?.score}/100</span>
                  </div>
                  <p><strong>Problem Clarity:</strong> {selectedSub.aiEvaluation?.clarityOfProblem}</p>
                  <p><strong>Code Quality:</strong> {selectedSub.aiEvaluation?.codeQuality}</p>
                </div>

                {/* Human PM Feedback Editor */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wider">
                    Human PM Feedback & Endorsement
                  </h4>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Final PM Score (1-100)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={pmScore}
                      onChange={(e) => setPmScore(e.target.value)}
                      className="w-28 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">PM Feedback & Recommendations</label>
                    <textarea
                      rows={3}
                      placeholder="Write constructive PM advice for the learner..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    />
                  </div>

                  <button
                    onClick={handlePublishReview}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-heading font-bold text-xs shadow flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    Publish Review to Learner Dashboard
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
