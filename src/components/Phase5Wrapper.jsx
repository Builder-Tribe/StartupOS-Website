import React, { useState } from 'react';
import { Users, Presentation, Sparkles } from 'lucide-react';
import CoBuilderStudio from './CoBuilderStudio';
import DemoDayStudio from './DemoDayStudio';
import FounderPresenceGuide from './FounderPresenceGuide';

export default function Phase5Wrapper({ currentUser, onNavigateToIdeaLab, onOpenSpecStudio }) {
  const [subTab, setSubTab] = useState('cobuilders'); // 'cobuilders' | 'presence' | 'demoday'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('cobuilders')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'cobuilders' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Co-Builder Network</span>
          </button>

          <button
            onClick={() => setSubTab('presence')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'presence' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Founder Brand (GitHub & LinkedIn)</span>
          </button>

          <button
            onClick={() => setSubTab('demoday')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'demoday' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Demo Day Studio</span>
          </button>
        </div>

        <span className="hidden md:inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          Co-Builders & Scale
        </span>
      </div>

      {/* Content Rendering */}
      {subTab === 'cobuilders' && (
        <CoBuilderStudio
          currentUser={currentUser}
          onNavigateToIdeaLab={onNavigateToIdeaLab}
          onOpenSpecStudio={onOpenSpecStudio}
        />
      )}

      {subTab === 'presence' && (
        <FounderPresenceGuide currentUser={currentUser} />
      )}

      {subTab === 'demoday' && (
        <DemoDayStudio currentUser={currentUser} />
      )}
    </div>
  );
}
