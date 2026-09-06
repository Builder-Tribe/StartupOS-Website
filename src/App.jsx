import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LaunchpadFeed from './components/LaunchpadFeed';
import LaunchSubmissionModal from './components/LaunchSubmissionModal';
import BlueprintStudio from './components/BlueprintStudio';
import IdeaLab from './components/IdeaLab';
import LMSHub from './components/LMSHub';
import AdminConsole from './components/AdminConsole';
import MarketingLander from './components/MarketingLander';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('launchpad'); // 'launchpad' | 'blueprints' | 'idealab' | 'lms' | 'admin' | 'landing'
  const [ideas, setIdeas] = useState([]);
  const [activeIdea, setActiveIdea] = useState(null);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    id: 'user-harshita',
    name: 'Harshita G',
    email: 'harshita@vibe-coding.io',
    role: 'user',
    avatar: '👩‍💻',
    badge: 'Pro Builder',
    workspaceName: "Harshita's Studio"
  });

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

  useEffect(() => {
    fetchIdeas();
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
    if (userData.role === 'admin') {
      setActiveTab('admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white relative overflow-x-hidden flex">
      {/* Ambient Floating Background Mesh Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-orb-1 absolute -top-40 -left-20 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-300/30 to-violet-300/30 rounded-full blur-3xl opacity-70"></div>
        <div className="animate-orb-2 absolute top-1/3 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-sky-300/30 rounded-full blur-3xl opacity-60"></div>
        <div className="animate-orb-3 absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/30 to-indigo-200/40 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Desktop Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLaunchModal={() => setShowLaunchModal(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onOpenLaunchModal={() => setShowLaunchModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
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
                onOpenLaunchModal={() => {
                  setShowLaunchModal(true);
                  setMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        )}

        <main className="flex-1 pb-16 px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl w-full mx-auto">
          {activeTab === 'launchpad' && (
            <LaunchpadFeed
              currentUser={currentUser}
              onOpenLaunchModal={() => setShowLaunchModal(true)}
            />
          )}

          {activeTab === 'blueprints' && (
            <BlueprintStudio
              currentUser={currentUser}
              userIdeas={ideas}
              onNavigateToIdeaLab={() => setActiveTab('idealab')}
            />
          )}

          {activeTab === 'idealab' && (
            <IdeaLab
              ideas={ideas}
              activeIdea={activeIdea}
              setActiveIdea={setActiveIdea}
              onSaveIdea={handleSaveIdea}
              onNewIdea={handleNewIdea}
            />
          )}

          {activeTab === 'lms' && (
            <LMSHub />
          )}

          {activeTab === 'admin' && (
            <AdminConsole currentUser={currentUser} />
          )}

          {activeTab === 'landing' && (
            <MarketingLander
              onGetStarted={() => setActiveTab('launchpad')}
              onOpenLms={() => setActiveTab('lms')}
            />
          )}
        </main>

        <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 bg-white/60 backdrop-blur-sm mt-auto">
          StartupOS 2026 — Universal Launchpad, My Projects Workspace, AI Builder Studio & LMS Academy.
        </footer>
      </div>

      {/* Launch Submission Modal */}
      <LaunchSubmissionModal
        isOpen={showLaunchModal}
        onClose={() => setShowLaunchModal(false)}
        onLaunchSubmitted={handleLaunchSubmitted}
        currentUser={currentUser}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
