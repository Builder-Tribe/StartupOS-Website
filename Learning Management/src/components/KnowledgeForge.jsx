import React, { useState } from 'react';
import { 
  Cpu, Youtube, MessageSquare, Globe, Sparkles, Plus, Trash2, ArrowRight, 
  BookOpen, Check, Copy, Share2, Tag, Layers, CheckCircle2, Bookmark 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

export default function KnowledgeForge({ presetCourses, onSaveNewCourse, onSaveNote }) {
  const [selectedCourseId, setSelectedCourseId] = useState(presetCourses[0]?.id || 'self-1');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Ingestion form state
  const [courseTitle, setCourseTitle] = useState('');
  const [sourceType, setSourceType] = useState('YouTube');
  const [sourceUrl, setSourceUrl] = useState('');
  const [rawTextContent, setRawTextContent] = useState('');
  const [sourcesList, setSourcesList] = useState([
    { type: 'YouTube', name: 'AI Engineering 2026 Keynote', url: 'https://youtube.com/watch?v=sample-keynote' },
    { type: 'ChatGPT', name: 'Claude 3.5 & Gemini 2.0 Architectural Prompts', url: 'ChatGPT Export #8912' }
  ]);

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState('');

  // AI Assistant side query
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [savedNoteText, setSavedNoteText] = useState('');

  const currentCourse = presetCourses.find((c) => c.id === selectedCourseId) || presetCourses[0];
  const activeChapter = currentCourse?.modules[activeChapterIndex] || currentCourse?.modules[0];

  const handleAddSource = () => {
    if (!sourceUrl && !rawTextContent) return;
    sound.playClick();
    setSourcesList((prev) => [
      ...prev,
      {
        type: sourceType,
        name: sourceUrl || 'Raw Notes Entry',
        url: sourceUrl || 'Direct text snippet'
      }
    ]);
    setSourceUrl('');
    setRawTextContent('');
  };

  const handleRemoveSource = (idx) => {
    sound.playClick();
    setSourcesList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSynthesizeCourse = () => {
    if (!courseTitle && sourcesList.length === 0) return;
    sound.playSynthesize();
    setIsSynthesizing(true);
    setSynthesisStep('Extracting key themes from multi-source links...');

    setTimeout(() => {
      setSynthesisStep('Formatting transcripts & removing noise...');
      setTimeout(() => {
        setSynthesisStep('Articulating bite-sized modules & generating quizzes...');
        setTimeout(() => {
          setIsSynthesizing(false);
          sound.playSuccess();
          confetti({ particleCount: 70, spread: 60 });

          // Create new course object
          const newCourse = {
            id: `self-${Date.now()}`,
            title: courseTitle || 'Synthesized Knowledge Digest',
            createdDate: new Date().toISOString().split('T')[0],
            sources: [...sourcesList],
            status: 'Articulated & Ready',
            estimatedTime: '30 mins',
            tags: ['Self-Articulated', 'AI Digest', 'Custom'],
            modules: [
              {
                id: `smod-new-1`,
                title: 'Chapter 1: Multi-Source Insights Overview',
                summary: `Synthesized key findings from ${sourcesList.length} sources including ${sourcesList.map(s => s.type).join(', ')}.`,
                content: `### Executive Knowledge Summary\n\nBased on your aggregated research sources, here are the key articulated takeaways:\n\n1. **Core Concept Synthesis**: Combining video transcripts and LLM conversations highlights high execution speed over complex manual coding.\n2. **Actionable Blueprints**: Focus on modular tools, strict prompt parameters, and continuous evaluation loops.\n3. **Practical Implementation**: Use standardized JSON structures to interface custom AI models directly into your workflow.`,
                flashcards: [
                  { q: 'What is the main advantage of self-driven course synthesis?', a: 'Converts unstructured, scattered content into structured, bite-sized learning modules.' }
                ],
                quiz: [
                  {
                    question: 'How does multi-source aggregation improve learning retention?',
                    options: ['By copying text blindly', 'By synthesizing cross-platform perspectives into a cohesive curriculum', 'By deleting original links', 'By limiting reading time'],
                    answer: 1,
                    explanation: 'Synthesizing inputs from video, chat, and articles forces high-density comprehension.'
                  }
                ]
              }
            ]
          };

          onSaveNewCourse(newCourse);
          setSelectedCourseId(newCourse.id);
          setActiveChapterIndex(0);
          setCourseTitle('');
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const handleAskAI = (promptType) => {
    sound.playClick();
    if (promptType === 'simpler') {
      setAiResponse('💡 **Simplified Analogy**: Think of KV Cache like a chef’s pre-cut ingredients box. Instead of chopping onions from scratch for every order, the chef grabs pre-chopped onions to assemble dishes 10x faster!');
    } else if (promptType === 'examples') {
      setAiResponse('💻 **Practical Implementation Example**:\n```js\n// Example: Calling AWQ Quantized Model\nconst response = await aiEngine.generate({\n  model: "llama-3-70b-awq",\n  prompt: "Synthesize transcript",\n  temperature: 0.2\n});\n```');
    }
  };

  const handleSaveNoteAction = () => {
    if (!savedNoteText) return;
    sound.playClick();
    onSaveNote({
      id: `note-${Date.now()}`,
      courseTitle: currentCourse.title,
      chapterTitle: activeChapter?.title,
      text: savedNoteText,
      date: new Date().toLocaleDateString()
    });
    setSavedNoteText('');
    sound.playSuccess();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs mb-1">
            <Cpu className="w-4 h-4" />
            <span>PILLAR 2: PERSONAL AI KNOWLEDGE FORGE</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-white">
            Self-Driven Course Builder & Synthesizer
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Turn scattered YouTube videos, ChatGPT transcripts, Grok/Claude notes, and Substack posts into structured, gamified courses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {presetCourses.length} Personal Courses In Vault
          </span>
        </div>
      </div>

      {/* Main Grid: Multi-Source Creator & Interactive Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Create New Course / Input Collector & Course Picker */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* New Course Ingestor Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              Synthesize New Custom Course
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. LLM Quantization & Inference Deep Dive"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Source Input Row */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">Add Research Source Link or Text</label>
                <div className="flex gap-2">
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-purple-400 font-medium focus:outline-none"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="ChatGPT">ChatGPT</option>
                    <option value="Claude">Claude</option>
                    <option value="Substack">Substack</option>
                    <option value="Web">Web Link</option>
                  </select>

                  <input
                    type="text"
                    placeholder="URL or link reference..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />

                  <button
                    onClick={handleAddSource}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Staged Sources List */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] text-slate-400 font-mono">Aggregated Sources ({sourcesList.length}):</div>
                {sourcesList.map((src, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {src.type}
                      </span>
                      <span className="text-slate-300 truncate">{src.name}</span>
                    </div>
                    <button onClick={() => handleRemoveSource(idx)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Synthesize Action Button */}
              <button
                disabled={isSynthesizing || sourcesList.length === 0}
                onClick={handleSynthesizeCourse}
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSynthesizing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    {synthesisStep}
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Articulate & Build Custom Course
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Personal Course Vault List */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
              Your Synthesized Courses Vault
            </h4>
            {presetCourses.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCourseId(c.id);
                  setActiveChapterIndex(0);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                  c.id === selectedCourseId
                    ? 'bg-purple-950/30 border-purple-500/40 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold text-white">{c.title}</span>
                  <span className="text-[10px] font-mono text-purple-400">{c.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-500" /> {c.modules.length} Chapters
                  </span>
                  <span>• {c.sources?.length || 1} Sources</span>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* Right Column: Articulated Course Reader & Smart Notebook */}
        <div className="lg:col-span-7 space-y-6">
          
          {currentCourse && (
            <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
              
              {/* Header Title & Source Tags */}
              <div className="border-b border-slate-800 pb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    Created {currentCourse.createdDate}
                  </span>
                  <button
                    onClick={() => {
                      sound.playSuccess();
                      alert('Course packaged! You can now share this course link or list it on the marketplace.');
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Package & Export Course
                  </button>
                </div>

                <h3 className="text-2xl font-heading font-extrabold text-white">
                  {currentCourse.title}
                </h3>

                {/* Sources Used Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Aggregated from:</span>
                  {currentCourse.sources?.map((src, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {src.type}: {src.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chapter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/60">
                {currentCourse.modules.map((mod, idx) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveChapterIndex(idx);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold shrink-0 transition-all ${
                      idx === activeChapterIndex
                        ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mod.title}
                  </button>
                ))}
              </div>

              {/* Articulated Text Body */}
              {activeChapter && (
                <div className="space-y-6">
                  <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-sans space-y-4">
                    <p className="font-medium text-slate-200 text-base">{activeChapter.summary}</p>
                    <div className="whitespace-pre-line">{activeChapter.content}</div>
                  </div>

                  {/* AI Quick Actions Toolbar */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-heading font-semibold">
                      <span className="flex items-center gap-1.5 text-cyan-400">
                        <Sparkles className="w-4 h-4" /> AI Instant Study Assistant
                      </span>
                      <span>Click to elaborate context</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAskAI('simpler')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800"
                      >
                        💡 Explain Simpler (Analogy)
                      </button>
                      <button
                        onClick={() => handleAskAI('examples')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800"
                      >
                        💻 Generate Code Examples
                      </button>
                    </div>

                    {aiResponse && (
                      <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-200 font-mono whitespace-pre-line animate-fade-in">
                        {aiResponse}
                      </div>
                    )}
                  </div>

                  {/* Smart Note-taking Drawer */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-heading font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-amber-400" />
                      Take Smart Note on this Chapter
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type key takeaway note..."
                        value={savedNoteText}
                        onChange={(e) => setSavedNoteText(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={handleSaveNoteAction}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-heading font-bold shadow-md shadow-amber-500/20"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
