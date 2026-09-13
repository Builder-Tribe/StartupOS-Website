import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LaunchSubmissionModal from './components/LaunchSubmissionModal';
import BlueprintStudio from './components/BlueprintStudio';
import MakerProfileStudio from './components/MakerProfileStudio';
import AdminConsole from './components/AdminConsole';
import MarketingLander from './components/MarketingLander';
import AuthModal from './components/AuthModal';
import HelpCenterModal from './components/HelpCenterModal';
import CoBuilderStudio from './components/CoBuilderStudio';
import TestStudio from './components/TestStudio';
import Phase1Wrapper from './components/Phase1Wrapper';
import Phase4Wrapper from './components/Phase4Wrapper';
import Phase5Wrapper from './components/Phase5Wrapper';
import LMSHub from './components/LMSHub';

// Route Parsing Helper: extracts 'website' | 'builder' | 'admin'
const parseRouteFromLocation = () => {
  if (typeof window === 'undefined') return 'website';
  const pathname = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
  if (pathname === '/admin') return 'admin';
  if (pathname === '/builder' || pathname === '/portal') return 'builder';
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  if (viewParam === 'admin') return 'admin';
  if (viewParam === 'portal' || viewParam === 'builder') return 'builder';
  return 'website';
};

// Safe LocalStorage User Loader
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('startup_os_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored user:', e);
  }
  return null;
};

export default function App() {
  // Top-level View Mode: 'website' | 'builder' | 'admin'
  const [viewMode, setViewMode] = useState(parseRouteFromLocation);
  
  // 5 Master Founder Phases: 'idealab' (1) | 'blueprints' (2) | 'testing' (3) | 'launchpad' (4) | 'cobuilders' (5)
  const [activeTab, setActiveTab] = useState('idealab');

  // Auth session initialization with LocalStorage persistence
  const initialUser = getStoredUser();
  const [currentUser, setCurrentUser] = useState(
    initialUser || {
      id: 'user-harshita',
      name: 'Harshita G',
      email: 'harshita@vibe-coding.io',
      role: 'user',
      avatar: '👩‍💻',
      badge: 'Pro Builder',
      workspaceName: "Harshita's Studio"
    }
  );
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(initialUser));
  
  const [ideas, setIdeas] = useState([]);
  const [activeIdea, setActiveIdea] = useState(null);
  const [promptVaultInitialCategory, setPromptVaultInitialCategory] = useState('all');
  const [promptVaultConfiguredStack, setPromptVaultConfiguredStack] = useState(null);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchIdeas = async () => {
    try {
      const res = await fetch('/api/ideas');
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    }
  };

  // Coordinated Routing Navigator: keeps viewMode and browser URL in sync
  const navigateTo = (targetMode, targetTab = null) => {
    setViewMode(targetMode);
    if (targetTab) {
      setActiveTab(targetTab);
    }
    const targetPath = targetMode === 'admin' ? '/admin' : targetMode === 'builder' ? '/builder' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ mode: targetMode, tab: targetTab || activeTab }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchIdeas();
    
    // Browser Back / Forward button navigation
    const handlePopState = () => {
      const route = parseRouteFromLocation();
      setViewMode(route);
    };
    window.addEventListener('popstate', handlePopState);

    // Normalize legacy query param ?view= to clean paths
    const initialMode = parseRouteFromLocation();
    const cleanPath = initialMode === 'admin' ? '/admin' : initialMode === 'builder' ? '/builder' : '/';
    if (window.location.search && (window.location.pathname === '/' || window.location.pathname === '')) {
      window.history.replaceState({ mode: initialMode }, '', cleanPath);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleSaveIdea = async (formData) => {
    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save idea.');
    
    setIdeas([data, ...ideas]);
    setActiveIdea(data);
    return data;
  };

  const handleNewIdea = () => {
    setActiveIdea(null);
  };

  const handleLaunchSubmitted = () => {
    setActiveTab('launchpad');
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('startup_os_user', JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to store user session:', e);
    }
    setShowAuthModal(false);
    if (userData?.role === 'admin') {
      navigateTo('admin');
    } else {
      navigateTo('builder', 'idealab');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('startup_os_user');
    } catch (e) {
      console.error('Failed to clear user session:', e);
    }
    setIsLoggedIn(false);
    setCurrentUser({
      id: 'guest',
      name: 'Guest Builder',
      email: '',
      role: 'user',
      avatar: '🚀',
      badge: 'Visitor',
      workspaceName: 'Guest Studio'
    });
    navigateTo('website');
  };

  // 1. IF VIEW MODE IS 'WEBSITE': Render Standalone Marketing Landing Page
  if (viewMode === 'website') {
    return (
      <>
        <MarketingLander
          onEnterPortal={(targetTab = 'idealab') => navigateTo('builder', targetTab)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onOpenCommandCenter={() => navigateTo('admin')}
        />

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  // 2. IF VIEW MODE IS 'ADMIN': Render Dedicated Admin & Team Command Center
  if (viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <AdminConsole
          currentUser={currentUser}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onLogout={handleLogout}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // 3. IF VIEW MODE IS 'BUILDER' (or legacy 'portal'): Render Dedicated 5-Phase Builder Workspace Layout
  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white relative overflow-x-hidden flex">
      {/* Subtle clean background tint */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-50 via-white to-slate-50"></div>

      {/* Desktop Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        onOpenLaunchModal={() => setShowLaunchModal(true)}
        onOpenHelpCenter={() => setShowHelpCenter(true)}
        onOpenCommandCenter={() => navigateTo('admin')}
        onLogout={handleLogout}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          onOpenLaunchModal={() => setShowLaunchModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenCommandCenter={() => navigateTo('admin')}
          onLogout={handleLogout}
        />

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs md:hidden flex" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-64 bg-slate-900 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                currentUser={currentUser}
                isLoggedIn={isLoggedIn}
                onOpenLaunchModal={() => {
                  setShowLaunchModal(true);
                  setMobileMenuOpen(false);
                }}
                onOpenHelpCenter={() => {
                  setShowHelpCenter(true);
                  setMobileMenuOpen(false);
                }}
                onOpenCommandCenter={() => {
                  navigateTo('admin');
                  setMobileMenuOpen(false);
                }}
                onLogout={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                onOpenAuthModal={() => {
                  setShowAuthModal(true);
                  setMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        )}

        <main className="flex-1 pb-16 px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl w-full mx-auto">
          {/* AI BUILDER ACADEMY (Cross-Stage Global Learning Hub) */}
          {(activeTab === 'academy' || activeTab === 'lms') && (
            <LMSHub />
          )}

          {/* IDEATE & VALIDATE (Idea Lab, PRD Generator, Prompt Vault, Creator Studio, Tool Matrix) */}
          {(activeTab === 'idealab' || activeTab === 'specstudio' || activeTab === 'promptvault' || activeTab === 'creator' || activeTab === 'toolmatrix') && (
            <Phase1Wrapper
              ideas={ideas}
              activeIdea={activeIdea}
              setActiveIdea={setActiveIdea}
              onSaveIdea={handleSaveIdea}
              onNewIdea={handleNewIdea}
              promptVaultInitialCategory={promptVaultInitialCategory}
              promptVaultConfiguredStack={promptVaultConfiguredStack}
              setPromptVaultInitialCategory={setPromptVaultInitialCategory}
              setPromptVaultConfiguredStack={setPromptVaultConfiguredStack}
            />
          )}

          {/* BUILD & SCAFFOLD (My Projects Blueprints, Parity Governance) */}
          {activeTab === 'blueprints' && (
            <BlueprintStudio
              currentUser={currentUser}
              userIdeas={ideas}
              onNavigateToIdeaLab={() => setActiveTab('idealab')}
              onNavigateToSpecStudio={(idea) => {
                if (idea) setActiveIdea(idea);
                setActiveTab('idealab');
              }}
            />
          )}

          {/* TEST & PRE-FLIGHT QA (Pre-Flight Sandbox QA, 100-Point Audit Rubric, API Contract Tester) */}
          {activeTab === 'testing' && (
            <TestStudio
              currentUser={currentUser}
              ideas={ideas}
            />
          )}

          {/* SHIP & DEPLOY (1-Click Cloud Deploy Recipes & Product Hunt Launchpad) */}
          {activeTab === 'launchpad' && (
            <Phase4Wrapper
              currentUser={currentUser}
              onOpenLaunchModal={() => setShowLaunchModal(true)}
              ideas={ideas}
            />
          )}

          {/* CO-BUILDERS & DEMO DAY (Co-Builder Network + Demo Day Studio) */}
          {activeTab === 'cobuilders' && (
            <Phase5Wrapper
              currentUser={currentUser}
              onNavigateToIdeaLab={() => setActiveTab('idealab')}
              onOpenSpecStudio={(idea) => {
                if (idea) setActiveIdea(idea);
                setActiveTab('idealab');
              }}
            />
          )}

          {/* Standalone Maker Profile */}
          {activeTab === 'makerprofile' && (
            <MakerProfileStudio
              currentUser={currentUser}
              ideas={ideas}
            />
          )}
        </main>

        <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 bg-white/60 backdrop-blur-sm mt-auto">
          StartupOS 2026 — The All-in-One AI Founder Operating System (Learn • Build • Test • Ship • Scale).
        </footer>
      </div>

      {/* Launch Submission Modal */}
      <LaunchSubmissionModal
        isOpen={showLaunchModal}
        onClose={() => setShowLaunchModal(false)}
        onLaunchSubmitted={handleLaunchSubmitted}
        currentUser={currentUser}
        ideas={ideas}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Dedicated Help Center AI Assistance Modal */}
      <HelpCenterModal
        isOpen={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
        onNavigateToAcademy={() => setActiveTab('idealab')}
        currentUser={currentUser}
      />
    </div>
  );
}
