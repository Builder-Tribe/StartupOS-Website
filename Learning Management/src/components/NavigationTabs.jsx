import React from 'react';
import { BookOpen, Upload, Award, Globe, Cpu } from 'lucide-react';
import { sound } from '../utils/sound';

export default function NavigationTabs({ activeTab, setActiveTab, currentRole }) {
  const handleSelect = (id) => {
    sound.playClick();
    setActiveTab(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
        
        <button
          onClick={() => handleSelect('builder')}
          className={`p-3 rounded-xl text-left transition-all ${
            activeTab === 'builder'
              ? 'bg-slate-800/90 border border-cyan-500/40 text-cyan-300 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-sm font-heading font-bold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Courses & Guided Builder
          </div>
          <div className="text-[11px] text-slate-400">PRD → AI Workflow → Tool Steps</div>
        </button>

        <button
          onClick={() => handleSelect('submit')}
          className={`p-3 rounded-xl text-left transition-all ${
            activeTab === 'submit'
              ? 'bg-slate-800/90 border border-purple-500/40 text-purple-300 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-sm font-heading font-bold flex items-center gap-2">
            <Upload className="w-4 h-4 text-purple-400" />
            Submit Project
          </div>
          <div className="text-[11px] text-slate-400">GitHub Link & Learner Dashboard</div>
        </button>

        <button
          onClick={() => handleSelect('review')}
          className={`p-3 rounded-xl text-left transition-all ${
            activeTab === 'review'
              ? 'bg-slate-800/90 border border-amber-500/40 text-amber-300 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-sm font-heading font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Hybrid Review Center
            </div>
            {currentRole === 'CREATOR' && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Examiner
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">AI Evaluator + Creator Feedback</div>
        </button>

        <button
          onClick={() => handleSelect('showcase')}
          className={`p-3 rounded-xl text-left transition-all ${
            activeTab === 'showcase'
              ? 'bg-slate-800/90 border border-emerald-500/40 text-emerald-300 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-sm font-heading font-bold flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Public Showcase
          </div>
          <div className="text-[11px] text-slate-400">Shipped Projects & Growth Feed</div>
        </button>

      </div>
    </div>
  );
}
