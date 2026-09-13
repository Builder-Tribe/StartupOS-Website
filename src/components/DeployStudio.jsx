import React, { useState } from 'react';
import { 
  Rocket, Cloud, Copy, Check, Terminal, ExternalLink, ShieldCheck, 
  Server, Database, Globe, ArrowRight, Sparkles, CheckCircle2, Zap,
  Cpu, Lock
} from 'lucide-react';

export default function DeployStudio({ currentUser, ideas = [] }) {
  const [selectedProvider, setSelectedProvider] = useState('vercel'); // 'vercel' | 'railway' | 'render' | 'cloudflare' | 'supabase'
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const providers = [
    { 
      id: 'vercel', 
      name: 'Vercel', 
      type: 'Frontend & Next.js SPA', 
      badge: 'Recommended for React',
      cli: 'npm i -g vercel && vercel deploy --prod',
      freeTier: '100 GB Bandwidth, Unlimited Edge Functions',
      description: 'Zero-config global deployment for Vite, React 19, and Next.js static applications with instant SSL and automatic preview URLs.',
      steps: [
        'Push your repository to GitHub.',
        'Import project into Vercel Dashboard or run `npx vercel` in terminal.',
        'Set Framework Preset to "Vite" and Root Directory to `./`.',
        'Configure build command: `npm run build` and output directory: `dist`.',
        'Deploy with 1-click automatic HTTPS on your custom domain.'
      ]
    },
    { 
      id: 'railway', 
      name: 'Railway', 
      type: 'Full-Stack & Backend API', 
      badge: 'Best for Node + Python',
      cli: 'railway up',
      freeTier: '$5 / mo trial credit (Runs Node.js + Postgres)',
      description: 'Instant full-stack hosting for Node.js REST servers (`server.mjs`), FastAPI microservices, and managed PostgreSQL databases.',
      steps: [
        'Install Railway CLI: `npm i -g @railway/cli`.',
        'Run `railway login` and `railway init`.',
        'Railway auto-detects `server.mjs` and sets start command: `node server.mjs`.',
        'Add a PostgreSQL database service in 1-click from the Railway canvas.',
        'Connect your custom API subdomain with automated Let\'s Encrypt SSL.'
      ]
    },
    { 
      id: 'render', 
      name: 'Render', 
      type: 'Managed Cloud Services', 
      badge: 'Zero DevOps',
      cli: 'render blueprint launch',
      freeTier: 'Free Web Services + Static Sites + 90-day DB',
      description: 'Cloud hosting for modern web applications. Auto-deploys on every git push to `main` with health checks and zero downtime rollouts.',
      steps: [
        'Connect your GitHub repository at dashboard.render.com.',
        'Select "Web Service" with Environment: "Node".',
        'Build Command: `npm install && npm run build`.',
        'Start Command: `node server.mjs`.',
        'Set environment variables (PORT=8081, NODE_ENV=production).'
      ]
    },
    { 
      id: 'cloudflare', 
      name: 'Cloudflare Pages', 
      type: 'Hyper-Fast Global Edge', 
      badge: 'Edge CDN',
      cli: 'npx wrangler pages deploy dist',
      freeTier: 'Unlimited requests & 500 builds / mo',
      description: 'Blazing fast frontend CDN deployed across 300+ global cities with built-in DDoS protection and free custom domains.',
      steps: [
        'Run `npm run build` to generate the `/dist` production bundle.',
        'Deploy directly via CLI: `npx wrangler pages deploy dist`.',
        'Or link GitHub repo with Framework Preset: Vite.',
        'Enjoy sub-20ms latency worldwide with Cloudflare\'s Anycast network.'
      ]
    },
    { 
      id: 'supabase', 
      name: 'Supabase + Neon', 
      type: 'Serverless Vector Database', 
      badge: 'AI Vector Search',
      cli: 'npx supabase init',
      freeTier: '2 Free Projects, 500MB DB, pgvector included',
      description: 'Managed PostgreSQL with pgvector for storing AI embeddings, semantic search, and user authentication.',
      steps: [
        'Create a free Supabase or Neon PostgreSQL project.',
        'Enable the `pgvector` extension: `CREATE EXTENSION vector;`.',
        'Copy your connection string into your `.env` as `DATABASE_URL`.',
        'Run migrations directly via CLI or database dashboard.'
      ]
    }
  ];

  const currentRecipe = providers.find(p => p.id === selectedProvider);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-600" />
              <span>1-Click Cloud Deployment Recipes</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Phase 4 • Ship to Production
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Zero-DevOps production recipes for deploying your frontend, backend, and vector database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pre-Flight Passed: Ready to Ship</span>
          </span>
        </div>
      </div>

      {/* Provider Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProvider(p.id)}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedProvider === p.id 
                ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs' 
                : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                {p.type.split(' ')[0]}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">{p.type}</p>
          </button>
        ))}
      </div>

      {/* Selected Provider Recipe Details */}
      {currentRecipe && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recipe Steps (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{currentRecipe.name} Deployment Guide</h3>
                  <p className="text-xs text-slate-500">{currentRecipe.description}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentRecipe.badge}
                </span>
              </div>

              {/* Free Tier Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Free Tier Allowance:</span>
                <strong className="text-slate-900 font-bold">{currentRecipe.freeTier}</strong>
              </div>

              {/* Step by Step Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-Step Procedure</h4>
                {currentRecipe.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick CLI & Environment Helper (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1-Click Terminal Command */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-lg text-slate-300 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 text-[11px]">
                <span>1-Click CLI Deployment Command</span>
                <button
                  onClick={() => copyToClipboard(currentRecipe.cli, 'cli')}
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cli' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto">
                <code>$ {currentRecipe.cli}</code>
              </div>
            </div>

            {/* Standard Environment Variables (.env.example) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Standard Environment Variables</h4>
                <button
                  onClick={() => copyToClipboard(`PORT=8081\nNODE_ENV=production\nVITE_APP_NAME="StartupOS App"\nDATABASE_URL="postgresql://user:pass@host:5432/dbname"`, 'env')}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'env' ? 'Copied' : 'Copy .env.example'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
                <p>PORT=8081</p>
                <p>NODE_ENV=production</p>
                <p>VITE_APP_NAME="StartupOS App"</p>
                <p>DATABASE_URL="postgresql://user:pass@host:5432/dbname"</p>
              </div>
              <p className="text-[11px] text-slate-500">
                Never commit live secret keys to GitHub. Add secrets directly in your provider's environment variables console.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
