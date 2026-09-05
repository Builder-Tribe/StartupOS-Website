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
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('idealab')}>
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-900">
                StartupOS
              </span>
              <span className="text-[11px] text-indigo-600 font-mono font-semibold ml-2 hidden sm:inline-block">Learn. Architect. Ship.</span>
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
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-500'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="h-6 w-px bg-slate-200 hidden lg:block mx-1"></div>

            {/* Standalone Learning Tool Button */}
            <button
              onClick={() => setActiveTab('lms')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeTab === 'lms'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
              title="Standalone Learning Tool for AI Product Development"
            >
              <GraduationCap className={`w-4 h-4 ${activeTab === 'lms' ? 'text-white' : 'text-violet-600'}`} />
              <span className="hidden sm:inline">AI Builder Academy</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'lms' ? 'bg-violet-800 text-violet-100' : 'bg-violet-50 text-violet-700 border border-violet-200'}`}>
                Learning Tool
              </span>
            </button>
          </div>

          {/* User Auth Profile Switcher */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-sm">{currentUser?.avatar || '👤'}</span>
              <select
                value={currentUser?.id}
                onChange={(e) => {
                  const found = userProfiles.find((u) => u.id === e.target.value);
                  if (found) setCurrentUser(found);
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {userProfiles.map((user) => (
                  <option key={user.id} value={user.id} className="bg-white text-slate-900">
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
