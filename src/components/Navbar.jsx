import React from 'react';
import { 
  Search, ShieldCheck, Crown, Plus, Sparkles, Building2, Bell, Menu, X, Command,
  Globe, LogOut
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  isLoggedIn, 
  onOpenLaunchModal, 
  onOpenAuthModal, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  onExitToWebsite, 
  onOpenCommandCenter,
  onLogout 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle, Brand & Workspace Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Mobile Brand Indicator */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('launchpad')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-md">
              S
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">StartupOS</span>
              <span className="text-[10px] text-indigo-600 font-semibold block">Founder OS</span>
            </div>
          </div>

          {/* Workspace Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-semibold text-slate-700 ml-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>{currentUser?.workspaceName || (currentUser ? `${currentUser.name}'s Studio` : 'Founder Studio')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
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

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Launch CTA */}
          <button
            onClick={onOpenLaunchModal}
            className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Launch Product
          </button>

          {/* Exit to Marketing Website button */}
          <button
            onClick={onExitToWebsite}
            className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
            title="View Public Marketing Website"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Website</span>
          </button>

          {/* Explicit Logout Button in Builder Portal */}
          {isLoggedIn && onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 px-3 py-2 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
              title="Log Out of Builder Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}

          {/* Sign In CTA if guest */}
          {!isLoggedIn && (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          )}

          {/* Profile Trigger (Opens Maker Profile & Credentials) */}
          {currentUser && (
            <button
              onClick={() => {
                if (isLoggedIn) {
                  setActiveTab('makerprofile');
                } else {
                  onOpenAuthModal();
                }
              }}
              className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border transition-all group ${
                activeTab === 'makerprofile'
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200/80 hover:bg-slate-50'
              }`}
              title="View & Export Your Maker Profile"
            >
              <span className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform">
                {currentUser.avatar || '👩‍💻'}
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
          )}
        </div>
      </div>
    </header>
  );
}
