import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle2, Copy, Sparkles, Layers, Cpu, Code, 
  Terminal, ShieldCheck, ArrowRight, HelpCircle, ChevronRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

export default function GuidedBuilder({ courses, onToggleAITutor }) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0].id);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  
  // Tool Abstraction Layer state (PRD Section 3.2.3)
  const [selectedTool, setSelectedTool] = useState('Antigravity');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [stepValidated, setStepValidated] = useState(false);

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

  return (
    <div className="space-y-8">
      
      {/* Course Banner */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <BookOpen className="w-4 h-4" />
            <span>STANDARDIZED COURSE: {selectedCourse.category}</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-white">
            {selectedCourse.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            {selectedCourse.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400 font-mono">
            <span>Instructor: <strong className="text-slate-200">{selectedCourse.creator}</strong></span>
            <span>•</span>
            <span>Level: <strong className="text-cyan-400">{selectedCourse.level}</strong></span>
            <span>•</span>
            <span>Duration: <strong className="text-amber-400">{selectedCourse.duration}</strong></span>
          </div>
        </div>

        <button
          onClick={onToggleAITutor}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-heading font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Ask AI Tutor Layer
        </button>
      </div>

      {/* Main Grid: Standardized Structure & Tool Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Standardized Course Overview & Module Navigator */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* PRD Standardized 8-Part Structure Accordion */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Standardized Course Architecture
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="font-heading font-bold text-cyan-400">1. Problem Definition</div>
                <div className="text-slate-300 mt-1">{selectedCourse.structure.problem}</div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="font-heading font-bold text-purple-400">2. Target Use Case</div>
                <div className="text-slate-300 mt-1">{selectedCourse.structure.useCase}</div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="font-heading font-bold text-emerald-400">3. Target PRD Features</div>
                <ul className="list-disc list-inside text-slate-300 mt-1 space-y-1">
                  {selectedCourse.structure.prd.coreFeatures.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Module & Lesson Selector */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
              Curriculum Lessons
            </h3>

            <div className="space-y-3">
              {selectedCourse.modules.map((mod, mIdx) => (
                <div key={mod.id} className="space-y-2">
                  <div className="text-xs font-heading font-bold text-slate-200">{mod.title}</div>
                  {mod.lessons.map((les, lIdx) => {
                    const isActive = mIdx === activeModuleIdx && lIdx === activeLessonIdx;
                    return (
                      <button
                        key={les.id}
                        onClick={() => {
                          sound.playClick();
                          setActiveModuleIdx(mIdx);
                          setActiveLessonIdx(lIdx);
                          setStepValidated(false);
                        }}
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-slate-800/90 border-cyan-500/40 text-cyan-300 shadow-md'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-heading font-semibold truncate">{les.title}</div>
                          <div className="text-[10px] font-mono text-slate-500">{les.lessonType}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Guided Builder Workbench with Tool Abstraction Layer */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
            
            {/* Lesson Title & Overview */}
            <div className="border-b border-slate-800 pb-4 space-y-1">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                GUIDED BUILDER MODE
              </span>
              <h3 className="text-xl font-heading font-bold text-white mt-2">{activeLesson.title}</h3>
              <p className="text-xs text-slate-300">{activeLesson.description}</p>
            </div>

            {/* PRD Section 3.2.3: Tool Abstraction Layer Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-heading">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Select Your Preferred AI Coding Tool:
                </span>
                <span className="text-[11px] font-mono text-slate-400">Zero Tool Lock-In</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedCourse.toolsSupported.map((toolName) => {
                  const isSelected = selectedTool === toolName;
                  const isAvailable = !!lessonTools[toolName];
                  return (
                    <button
                      key={toolName}
                      disabled={!isAvailable}
                      onClick={() => {
                        sound.playClick();
                        setSelectedTool(toolName);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-bold shadow'
                          : isAvailable
                          ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-slate-950/40 border border-slate-900 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {toolName} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Copyable AI Prompt Block tailored to selected tool */}
            {currentToolData && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-heading font-bold text-slate-200 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    Copyable Prompt for <span className="text-purple-400">{selectedTool}</span>:
                  </span>
                  <button
                    onClick={() => handleCopyPrompt(currentToolData.promptToCopy)}
                    className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedPrompt ? 'Copied to Clipboard!' : 'Copy Prompt'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 leading-relaxed relative group">
                  {currentToolData.promptToCopy}
                </div>
              </div>
            )}

            {/* Expected Output & Step Validation Checkpoint */}
            {currentToolData && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs font-heading font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Expected Output Verification:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {currentToolData.expectedOutput}
                  </p>
                  <div className="text-[11px] text-slate-400 font-mono pt-1">
                    💡 Checkpoint Hint: {currentToolData.validationHint}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {stepValidated ? (
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> Step Verified! You earned +150 XP
                    </div>
                  ) : (
                    <button
                      onClick={handleValidateStep}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-heading font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                      Verify Step Execution & Claim XP
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
