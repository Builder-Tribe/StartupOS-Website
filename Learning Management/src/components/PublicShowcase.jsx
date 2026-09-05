import React, { useState } from 'react';
import { Globe, ThumbsUp, Github, ExternalLink, Sparkles, Flame, Rocket } from 'lucide-react';
import { sound } from '../utils/sound';

export default function PublicShowcase({ showcaseProjects }) {
  const [projectsList, setProjectsList] = useState(showcaseProjects);

  const handleUpvote = (id) => {
    sound.playClick();
    setProjectsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs mb-1">
            <Globe className="w-4 h-4" />
            <span>PHASE 5: PUBLIC SHOWCASE & BUILDER ECOSYSTEM</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-white">
            Shipped AI Product Discovery Feed
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Explore real-world products built by non-coders, founders, and PMs using AI tool workflows.
          </p>
        </div>

        <span className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
          🚀 Builder Ecosystem Active
        </span>
      </div>

      {/* AI Growth Outreach Banner (PRD Section 3.5.4) */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xl shrink-0">
            🤖
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Automated AI Growth Engine
            </div>
            <h3 className="text-base font-heading font-bold text-white mt-0.5">
              "Your project has potential. Want help scaling?"
            </h3>
            <p className="text-xs text-slate-300">
              High-scoring student projects automatically receive distribution guides and GTM mentorship recommendations.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playSuccess();
            alert('Growth Accelerator requested! Our team will reach out with distribution templates.');
          }}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading font-bold text-xs shadow-lg shadow-cyan-500/20 shrink-0"
        >
          Apply for Growth Support
        </button>
      </div>

      {/* Projects Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectsList.map((project) => (
          <div key={project.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all group">
            
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {project.aiGrowthBadge}
                </span>
                <h3 className="text-lg font-heading font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">
                  {project.projectTitle}
                </h3>
                <div className="text-xs text-slate-400">Built by <strong className="text-slate-200">{project.creatorName}</strong></div>
              </div>

              <button
                onClick={() => handleUpvote(project.id)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-heading font-bold text-emerald-400 flex items-center gap-1.5 transition-all shadow"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{project.upvotes}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              "{project.tagline}"
            </p>

            <div className="flex items-center justify-between pt-2 text-xs font-mono">
              <div className="flex flex-wrap gap-1.5">
                {project.tools.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                  <Github className="w-3.5 h-3.5" /> Repo
                </a>
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Demo
                  </a>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
