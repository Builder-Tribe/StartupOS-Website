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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
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
              <span className="text-xs text-indigo-400 uppercase tracking-widest font-mono font-semibold">
                Community Gallery
              </span>
              <h1 className="text-3xl font-extrabold text-white mt-1">Shipped AI Products</h1>
              <p className="text-slate-400 text-sm mt-2">
                Explore real AI products built by founders using Antigravity, Gemini 2.0, and Vibe Coding.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PUBLIC_SHOWCASE.map((proj) => (
                <div key={proj.id} className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                      Shipped
                    </span>
                    <span className="text-xs text-amber-400 font-bold">★ {proj.stars}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                    <p className="text-xs text-slate-300 mt-1">{proj.tagline}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.tools.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono bg-slate-950 text-indigo-300 border border-slate-800 px-2 py-0.5 rounded">
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

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        StartupOS — Learn. Architect. Ship. Unifying Idea Lab, PRD Studio, My Projects, and AI Builder Academy.
      </footer>
    </div>
  );
}
