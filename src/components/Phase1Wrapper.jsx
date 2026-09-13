import React, { useState } from 'react';
import { Sparkles, FileCode, Terminal, GraduationCap } from 'lucide-react';
import IdeaLab from './IdeaLab';
import PRDGeneratorStudio from './PRDGeneratorStudio';
import PromptVaultStudio from './PromptVaultStudio';
import LMSHub from './LMSHub';

export default function Phase1Wrapper({
  ideas,
  activeIdea,
  setActiveIdea,
  onSaveIdea,
  onNewIdea,
  promptVaultInitialCategory,
  promptVaultConfiguredStack,
  setPromptVaultInitialCategory,
  setPromptVaultConfiguredStack
}) {
  const [subTab, setSubTab] = useState('idealab'); // 'idealab' | 'prd' | 'vault' | 'academy'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Sub-Navigation Tabs for Phase 1 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('idealab')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'idealab' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Idea Lab & Opportunity Score</span>
          </button>

          <button
            onClick={() => setSubTab('prd')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'prd' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>PRD & 4-File Constitution</span>
          </button>

          <button
            onClick={() => setSubTab('vault')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'vault' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Battle-Tested Prompt Vault</span>
          </button>

          <button
            onClick={() => setSubTab('academy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              subTab === 'academy' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>AI Builder Academy</span>
          </button>
        </div>

        <span className="hidden md:inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          Phase 1: Founder Foundation
        </span>
      </div>

      {/* Content Rendering */}
      {subTab === 'idealab' && (
        <IdeaLab
          ideas={ideas}
          activeIdea={activeIdea}
          setActiveIdea={setActiveIdea}
          onSaveIdea={onSaveIdea}
          onNewIdea={onNewIdea}
          onOpenSpecStudio={(idea) => {
            if (idea) setActiveIdea(idea);
            setSubTab('prd');
          }}
        />
      )}

      {subTab === 'prd' && (
        <PRDGeneratorStudio
          ideas={ideas}
          activeIdea={activeIdea}
          setActiveIdea={setActiveIdea}
          onNavigateToIdeaLab={() => setSubTab('idealab')}
          onNavigateToPromptVault={(idea, stackName) => {
            if (idea) setActiveIdea(idea);
            setPromptVaultInitialCategory('autonomous-pipeline');
            setPromptVaultConfiguredStack(stackName);
            setSubTab('vault');
          }}
        />
      )}

      {subTab === 'vault' && (
        <PromptVaultStudio
          ideas={ideas}
          activeIdea={activeIdea}
          setActiveIdea={setActiveIdea}
          initialCategory={promptVaultInitialCategory}
          configuredStack={promptVaultConfiguredStack}
        />
      )}

      {subTab === 'academy' && (
        <LMSHub />
      )}
    </div>
  );
}
