import React from 'react';
import { Lightbulb, BookOpen, GraduationCap, FileCode, Rocket, Trophy, Users } from './icons';

export default function Navbar({ activeTab, setActiveTab, savedCount, currentUser, setCurrentUser }) {
  const workflowTabs = [
    { id: 'idealab', label: '1. Idea Lab & Scoring', icon: Lightbulb },
    { id: 'blueprints', label: '2. My Projects', icon: BookOpen },
    { id: 'prdgenerator', label: '3. PRD & Spec Studio', icon: FileCode },
    { id: 'showcase', label: '4. Shipped Showcase', icon: Trophy },
  ];

  const userProfiles = [
    { id: 'user-harshita', name: 'Harshita G (Founder)', email: 'harshita@vibe-coding.io', avatar: '👩‍💻' },
    { id: 'user-alex', name: 'Alex Rivera (New Builder)', email: 'alex@productlead.io', avatar: '👨‍🚀' },
    { id: 'user-[new]', name: '+ Create New Account', email: 'newuser@startup-os.io', avatar: '✨' }
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('idealab')}>
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                StartupOS
              </span>
              <span className="text-[11px] text-indigo-400 font-mono font-semibold ml-2 hidden sm:inline-block">Learn. Architect. Ship.</span>
            </div>
          </div>

          {/* Navigation Area */}
          <div className="flex items-center space-x-2">
            {/* Step-by-Step Incubator Workflow Links */}
            <nav className="flex space-x-1 sm:space-x-1.5">
              {workflowTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="h-6 w-px bg-slate-800 hidden lg:block mx-1"></div>

            {/* Standalone Learning Tool Button */}
            <button
              onClick={() => setActiveTab('lms')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeTab === 'lms'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-violet-500'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
              title="Standalone Learning Tool for AI Product Development"
            >
              <GraduationCap className="w-4 h-4 text-violet-400" />
              <span className="hidden sm:inline">AI Builder Academy</span>
              <span className="text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-800 px-1.5 py-0.5 rounded">
                Learning Tool
              </span>
            </button>
          </div>

          {/* User Auth Profile Switcher */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-sm">{currentUser?.avatar || '👤'}</span>
              <select
                value={currentUser?.id}
                onChange={(e) => {
                  const found = userProfiles.find((u) => u.id === e.target.value);
                  if (found) setCurrentUser(found);
                }}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
              >
                {userProfiles.map((user) => (
                  <option key={user.id} value={user.id} className="bg-slate-900 text-white">
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
