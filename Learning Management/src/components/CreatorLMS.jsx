import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Play, Lock, Award, Clock, Sparkles, HelpCircle, 
  ChevronRight, RotateCcw, Zap, BookOpen, Star, Users, Flame, Layers 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

export default function CreatorLMS({ courses, onCompleteModule, onOpenCertificate }) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0].id);
  const [activeModuleId, setActiveModuleId] = useState(courses[0].modules[0].id);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(900); // 15 min focus timer
  const [timerActive, setTimerActive] = useState(false);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const activeModule = selectedCourse.modules.find((m) => m.id === activeModuleId) || selectedCourse.modules[0];

  // Focus Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const toggleTimer = () => {
    sound.playClick();
    setTimerActive(!timerActive);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectModule = (modId) => {
    sound.playClick();
    setActiveModuleId(modId);
    setFlashcardIndex(0);
    setIsFlipped(false);
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const handleQuizAnswer = (qIdx, optIdx) => {
    sound.playClick();
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    activeModule.quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) correctCount++;
    });

    if (correctCount === activeModule.quiz.length) {
      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onCompleteModule(selectedCourse.id, activeModule.id, activeModule.xp);
    } else {
      sound.playClick();
    }
  };

  const nextFlashcard = () => {
    sound.playClick();
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % activeModule.flashcards.length);
  };

  // Calculate course overall completion
  const completedModulesCount = selectedCourse.modules.filter((m) => m.completed).length;
  const courseProgress = Math.round((completedModulesCount / selectedCourse.modules.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Course Catalog Switcher Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>PILLAR 1: ARTICULATED CREATOR LMS</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-white">
            {selectedCourse.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Instructor: <span className="text-slate-200">{selectedCourse.creator}</span> • {selectedCourse.duration} total
          </p>
        </div>

        {/* Course Progress & Certificate Button */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Course Progress</div>
            <div className="text-lg font-heading font-bold text-cyan-400">{courseProgress}% Completed</div>
          </div>

          {courseProgress === 100 ? (
            <button
              onClick={() => onOpenCertificate(selectedCourse)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-heading font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Award className="w-4 h-4" />
              Get Certificate
            </button>
          ) : (
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${courseProgress}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Skill Tree / Modules Navigation & Interactive Module View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Skill Tree & Module List */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Focus Mode Timer Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Time-Box Focus Session</div>
                <div className="text-lg font-mono font-bold text-white">{formatTime(timerSeconds)}</div>
              </div>
            </div>
            <button
              onClick={toggleTimer}
              className={`px-3 py-1.5 rounded-xl font-heading font-semibold text-xs transition-all ${
                timerActive
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
              }`}
            >
              {timerActive ? 'Pause' : 'Start Focus (2x XP)'}
            </button>
          </div>

          {/* Module Nodes (Skill Tree) */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-heading font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Curriculum Skill Tree
              </h3>
              <span className="text-xs text-slate-400 font-mono">{selectedCourse.modules.length} Modules</span>
            </div>

            <div className="space-y-3 relative">
              {/* Connecting line background */}
              <div className="absolute top-4 bottom-4 left-6 w-[2px] bg-slate-800 -z-0" />

              {selectedCourse.modules.map((mod, idx) => {
                const isActive = mod.id === activeModuleId;
                const isLocked = idx > 0 && !selectedCourse.modules[idx - 1].completed && !mod.completed;

                return (
                  <button
                    key={mod.id}
                    disabled={isLocked}
                    onClick={() => handleSelectModule(mod.id)}
                    className={`relative z-10 w-full flex items-start gap-3 p-3.5 rounded-2xl transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-slate-800/90 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : mod.completed
                        ? 'bg-slate-900/60 border border-emerald-500/30 hover:bg-slate-800/50'
                        : isLocked
                        ? 'opacity-50 cursor-not-allowed bg-slate-950/40 border border-slate-900'
                        : 'bg-slate-900/40 border border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Status Circle Node */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono transition-colors ${
                        mod.completed
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : isLocked
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {mod.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isLocked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-heading font-bold truncate ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {mod.title}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> {mod.duration}
                        </span>
                        <span className="text-amber-400 font-mono flex items-center gap-0.5">
                          <Zap className="w-3 h-3" /> +{mod.xp} XP
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Browse Other Courses Card */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
              Other Creator Courses
            </h4>
            {courses
              .filter((c) => c.id !== selectedCourseId)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCourseId(c.id);
                    setActiveModuleId(c.modules[0].id);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 text-left transition-all group"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-heading font-semibold text-slate-200 group-hover:text-cyan-400 truncate">
                      {c.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{c.creator}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
          </div>
        </div>

        {/* Right Column: Active Articulated Module View */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Module Content Box */}
          <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
            
            {/* Header Title & Status */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                  {activeModule.duration} • {activeModule.xp} XP Reward
                </span>
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-white mt-3">
                  {activeModule.title}
                </h3>
              </div>
              {activeModule.completed && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
              )}
            </div>

            {/* Video Player Mockup / Stream */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex items-center justify-center">
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-cyan-400 ml-1" />
                  </div>
                  <p className="text-sm text-slate-300 font-medium max-w-md">
                    Articulated Video Chapter: <span className="text-white font-semibold">{activeModule.title}</span>
                  </p>
                  <div className="flex justify-center gap-2">
                    <span className="text-[11px] font-mono bg-slate-900/80 px-2 py-0.5 rounded text-cyan-400 border border-slate-800">
                      02:15 - Key Concept
                    </span>
                    <span className="text-[11px] font-mono bg-slate-900/80 px-2 py-0.5 rounded text-cyan-400 border border-slate-800">
                      08:40 - Interactive Quiz
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Articulated Summary & Key Takeaways */}
            <div className="space-y-4">
              <h4 className="text-sm font-heading font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Articulated Summary & Takeaways
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
                {activeModule.summary}
              </p>

              <div className="space-y-2">
                {activeModule.keyTakeaways.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-300 bg-slate-900/30 p-3 rounded-xl border border-slate-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Gamified Flashcards Flip Widget */}
            {activeModule.flashcards && activeModule.flashcards.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-heading font-bold text-purple-300 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    Interactive Concept Flashcard ({flashcardIndex + 1}/{activeModule.flashcards.length})
                  </h4>
                  <button
                    onClick={nextFlashcard}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                  >
                    Next Card <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div
                  onClick={() => {
                    sound.playClick();
                    setIsFlipped(!isFlipped);
                  }}
                  className="cursor-pointer min-h-[120px] glass-card p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-center items-center text-center group"
                >
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-2">
                    {isFlipped ? 'Answer (Click to Flip)' : 'Question (Click to Flip)'}
                  </span>
                  <p className="text-sm lg:text-base font-heading font-semibold text-white">
                    {isFlipped ? activeModule.flashcards[flashcardIndex].a : activeModule.flashcards[flashcardIndex].q}
                  </p>
                </div>
              </div>
            )}

            {/* Checkpoint Quiz */}
            {activeModule.quiz && activeModule.quiz.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-heading font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-cyan-400" />
                    Module Checkpoint Quiz
                  </h4>
                  <span className="text-xs font-mono text-slate-400">Pass to earn +{activeModule.xp} XP</span>
                </div>

                <div className="space-y-6">
                  {activeModule.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <p className="text-sm font-heading font-semibold text-slate-100">
                        {qIdx + 1}. {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswers[qIdx] === optIdx;
                          const isCorrect = optIdx === q.answer;

                          let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';
                          if (quizSubmitted) {
                            if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold';
                            else if (isSelected) btnStyle = 'bg-red-500/20 border-red-500/50 text-red-300';
                          } else if (isSelected) {
                            btnStyle = 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleQuizAnswer(qIdx, optIdx)}
                              className={`p-3 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                          💡 <span className="text-slate-300 font-medium">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={submitQuiz}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-heading font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                  >
                    Submit Answers & Claim XP
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
