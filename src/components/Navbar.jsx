import React from 'react';
import { 
  Search, ShieldCheck, Crown, Plus, Sparkles, Building2, Bell, Menu, X, Command,
  Globe, LayoutGrid, UserCheck, ArrowRight
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, onOpenLaunchModal, onOpenAuthModal, mobileMenuOpen, setMobileMenuOpen }) {
  const isWebsiteView = activeTab === 'landing';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle, Brand Logo & Workspace / View Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Mobile Brand Indicator */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab(isWebsiteView ? 'landing' : 'launchpad')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-md">
              S
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">StartupOS</span>
              <span className="text-[10px] text-slate-500 font-medium block">
                {isWebsiteView ? 'Marketing Website' : 'AI Builder Portal'}
              </span>
            </div>
          </div>

          {/* View Switcher Pill: Public Website vs Portal */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 ml-2">
            <button
              onClick={() => setActiveTab('landing')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                isWebsiteView
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </button>
            <button
              onClick={() => setActiveTab('launchpad')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                !isWebsiteView
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Portal</span>
            </button>
          </div>
        </div>

        {/* Center: Global Search Bar (Only shown in Portal mode) */}
        {!isWebsiteView && (
          <div className="flex-1 max-w-md hidden md:block relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search AI products, blueprints, rules, or community..."
              className="w-full pl-9 pr-12 py-2 bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white text-slate-800 transition-all"
            />
            <kbd className="absolute right-3 top-2.5 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white rounded border border-slate-200 shadow-2xs flex items-center gap-0.5 pointer-events-none">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        )}

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-3">
          {/* Website View: Direct Sign Up / Enter Portal CTA */}
          {isWebsiteView ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Sign In / Register
              </button>
              <button
                onClick={() => setActiveTab('launchpad')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Enter Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              {/* Launch Product CTA */}
              <button
                onClick={onOpenLaunchModal}
                className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Launch Product
              </button>

              {/* Profile Trigger */}
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition-all group"
              >
                <span className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform">
                  {currentUser.avatar}
                </span>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-slate-800 block leading-tight group-hover:text-indigo-600 transition-colors">
                    {currentUser.name}
                  </span>
                  <span className={`text-[10px] font-medium flex items-center gap-1 ${currentUser.role === 'admin' ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                    {currentUser.role === 'admin' ? <Crown className="w-3 h-3 text-amber-500" /> : <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                    {currentUser.badge}
                  </span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
