import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import IdeaLab from './components/IdeaLab';
import BlueprintStudio from './components/BlueprintStudio';
import PRDGeneratorStudio from './components/PRDGeneratorStudio';
import LMSHub from './components/LMSHub';
import { PUBLIC_SHOWCASE, STANDARDIZED_COURSES } from './data/abLmsData';

export default function App() {
  const [activeTab, setActiveTab] = useState('idealab'); // 'idealab' | 'blueprints' | 'prdgenerator' | 'lms' | 'showcase'
  const [ideas, setIdeas] = useState([]);
  const [activeIdea, setActiveIdea] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    id: 'user-harshita',
    name: 'Harshita G (Founder)',
    email: 'harshita@vibe-coding.io',
    avatar: '👩‍💻'
  });

  // Load saved ideas from backend API
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

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white relative overflow-hidden bg-grid-light">
      {/* Ambient Floating Background Mesh Orbs (OpenAI Astra & Razorpay 2026 Style) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-orb-1 absolute -top-40 -left-20 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-300/30 to-violet-300/30 rounded-full blur-3xl opacity-70"></div>
        <div className="animate-orb-2 absolute top-1/3 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-sky-300/30 rounded-full blur-3xl opacity-60"></div>
        <div className="animate-orb-3 absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/30 to-indigo-200/40 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedCount={ideas.length}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />

        <main className="pb-16">
          {activeTab === 'idealab' && (
            <IdeaLab
              ideas={ideas}
              activeIdea={activeIdea}
              setActiveIdea={setActiveIdea}
              onSaveIdea={handleSaveIdea}
              onNewIdea={handleNewIdea}
            />
          )}

          {activeTab === 'blueprints' && (
            <BlueprintStudio
              currentUser={currentUser}
              userIdeas={ideas}
              onNavigateToIdeaLab={() => setActiveTab('idealab')}
            />
          )}

          {activeTab === 'prdgenerator' && (
            <PRDGeneratorStudio
              ideas={ideas}
              activeIdea={activeIdea}
              setActiveIdea={setActiveIdea}
            />
          )}

          {activeTab === 'lms' && (
            <LMSHub />
          )}

          {activeTab === 'showcase' && (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <span className="text-xs text-indigo-600 uppercase tracking-widest font-mono font-bold bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full">
                  Community Gallery
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Shipped AI Products</h1>
                <p className="text-slate-600 text-sm mt-2">
                  Explore real AI products built by founders using Antigravity, Gemini 2.0, and Vibe Coding.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PUBLIC_SHOWCASE.map((proj) => (
                  <div key={proj.id} className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                        Shipped
                      </span>
                      <span className="text-xs text-amber-500 font-bold">★ {proj.stars}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{proj.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{proj.tagline}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.tools.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono bg-slate-100 text-indigo-700 border border-slate-200 px-2 py-0.5 rounded font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 bg-white/60 backdrop-blur-sm">
          StartupOS — Learn. Architect. Ship. Unifying Idea Lab, PRD Studio, My Projects, and AI Builder Academy.
        </footer>
      </div>
    </div>
  );
}
