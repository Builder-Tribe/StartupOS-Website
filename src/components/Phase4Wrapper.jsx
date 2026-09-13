import React, { useState } from 'react';
import { Rocket, Trophy, Cloud } from 'lucide-react';
import DeployStudio from './DeployStudio';
import LaunchpadFeed from './LaunchpadFeed';

export default function Phase4Wrapper({ currentUser, onOpenLaunchModal, ideas = [] }) {
  const [subTab, setSubTab] = useState('deploy'); // 'deploy' | 'launchpad'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Sub-Navigation Tabs for Phase 4 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('deploy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'deploy' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>1-Click Cloud Deploy Recipes</span>
          </button>

          <button
            onClick={() => setSubTab('launchpad')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'launchpad' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Product Hunt Launchpad & Demos</span>
          </button>
        </div>

        <span className="hidden md:inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Ship & Deploy
        </span>
      </div>

      {subTab === 'deploy' && (
        <DeployStudio currentUser={currentUser} ideas={ideas} />
      )}

      {subTab === 'launchpad' && (
        <LaunchpadFeed currentUser={currentUser} onOpenLaunchModal={onOpenLaunchModal} />
      )}
    </div>
  );
}
