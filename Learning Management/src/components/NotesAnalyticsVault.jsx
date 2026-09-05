import React from 'react';
import { 
  BarChart2, Bookmark, Award, Clock, Flame, Zap, CheckCircle2, 
  Sparkles, Layers, BookOpen, Trash2 
} from 'lucide-react';
import { sound } from '../utils/sound';

export default function NotesAnalyticsVault({ userStats, notes, onDeleteNote }) {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs mb-1">
            <BarChart2 className="w-4 h-4" />
            <span>LEARNER DASHBOARD & NOTES VAULT</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-white">
            Knowledge Analytics & Personal Notes
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track your study speed, review smart notes saved from custom synthesized courses, and view earned skill badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {notes.length} Notes Saved
          </span>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Experience</div>
          <div className="text-2xl font-heading font-extrabold text-indigo-400 flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-indigo-400" /> {userStats.xp} XP
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Daily Streak</div>
          <div className="text-2xl font-heading font-extrabold text-amber-400 flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-amber-400" /> {userStats.streak} Days
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Courses Completed</div>
          <div className="text-2xl font-heading font-extrabold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {userStats.completedCoursesCount}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Unlocked Badges</div>
          <div className="text-2xl font-heading font-extrabold text-purple-400 flex items-center gap-1.5">
            <Award className="w-5 h-5 text-purple-400" /> {userStats.badges.length}
          </div>
        </div>
      </div>

      {/* Main Grid: Notes Vault & Badges Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Smart Notes Vault */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                Saved Study Notes ({notes.length})
              </h3>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                No saved notes yet. Take notes while reading custom synthesized courses in Knowledge Forge!
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-heading font-bold text-cyan-400">{note.courseTitle}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{note.date}</span>
                        <button
                          onClick={() => {
                            sound.playClick();
                            onDeleteNote(note.id);
                          }}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-300">{note.chapterTitle}</div>
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono">
                      "{note.text}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Badges Grid & Competency Heatmap */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Unlocked Skill Badges */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Earned Badges & Credentials
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {userStats.badges.map((b, idx) => (
                <div key={idx} className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-heading font-bold text-slate-100">{b.name}</div>
                  <div className="text-[10px] text-slate-400">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Competency Distribution Bar */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-heading font-bold text-slate-200 uppercase tracking-wider">
              Skill Masteries
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>AI Engineering & RAG</span>
                  <span className="font-mono text-cyan-400">85%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Multi-Source AI Synthesis</span>
                  <span className="font-mono text-purple-400">90%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Non-Developer AI Product Building</span>
                  <span className="font-mono text-emerald-400">75%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
