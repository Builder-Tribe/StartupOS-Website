import React, { useState } from 'react';
import { 
  Wrench, Bot, Sparkles, Terminal, Play, CheckCircle2, ArrowRight, 
  Settings, Database, Layers, Code, ShieldCheck, Download 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

export default function AIProductBuilder({ tracks, onCompleteTrack }) {
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0].id);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  
  const currentTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];
  const activeStep = currentTrack.steps[activeStepIndex] || currentTrack.steps[0];

  // Editable prompt & input state
  const [promptText, setPromptText] = useState(activeStep.defaultPrompt);
  const [testInput, setTestInput] = useState(activeStep.testInput);
  const [toolEnabled, setToolEnabled] = useState(true);

  // Simulation execution state
  const [isRunning, setIsRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [stepSuccess, setStepSuccess] = useState(false);

  const handleSelectTrack = (trackId) => {
    sound.playClick();
    setSelectedTrackId(trackId);
    setActiveStepIndex(0);
    const track = tracks.find((t) => t.id === trackId);
    setPromptText(track.steps[0].defaultPrompt);
    setTestInput(track.steps[0].testInput);
    setExecutionLog([]);
    setStepSuccess(false);
  };

  const handleStepChange = (idx) => {
    sound.playClick();
    setActiveStepIndex(idx);
    const step = currentTrack.steps[idx];
    setPromptText(step.defaultPrompt);
    setTestInput(step.testInput);
    setExecutionLog([]);
    setStepSuccess(false);
  };

  const handleRunSimulator = () => {
    sound.playSynthesize();
    setIsRunning(true);
    setExecutionLog(['[SYSTEM] Initializing Agent Sandbox Environment...', '[PROMPT] Parsing instructions & persona parameters...']);

    setTimeout(() => {
      setExecutionLog((prev) => [...prev, `[USER INPUT] "${testInput}"`]);
      setTimeout(() => {
        setExecutionLog((prev) => [...prev, activeStep.simulatedOutput]);
        setIsRunning(false);
        setStepSuccess(true);
        sound.playSuccess();
        confetti({ particleCount: 60, spread: 50 });
      }, 1000);
    }, 800);
  };

  const handleNextStep = () => {
    if (activeStepIndex < currentTrack.steps.length - 1) {
      handleStepChange(activeStepIndex + 1);
    } else {
      sound.playLevelUp();
      confetti({ particleCount: 100, spread: 80 });
      onCompleteTrack(currentTrack.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs mb-1">
            <Wrench className="w-4 h-4" />
            <span>PILLAR 3: NON-DEVELOPER AI PRODUCT BUILDER</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-white">
            Learn AI Product Creation by Building
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            No coding background required! Build AI Agents, Micro-SaaS prompt chains, and automated tools with hands-on live sandbox testing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Interactive Visual Workbench
          </span>
        </div>
      </div>

      {/* Main Grid: Track Selector & Step-by-Step Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Track Selector & Steps Overview */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Guided Tracks List */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
              Select AI Product Track
            </h3>

            <div className="space-y-3">
              {tracks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTrack(t.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    t.id === selectedTrackId
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {t.level}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{t.time}</span>
                  </div>

                  <h4 className="text-sm font-heading font-bold text-white mt-2">{t.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Steps Progress Checklist */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
              Track Roadmap: {currentTrack.title}
            </h4>

            <div className="space-y-2">
              {currentTrack.steps.map((st, idx) => (
                <button
                  key={st.step}
                  onClick={() => handleStepChange(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    idx === activeStepIndex
                      ? 'bg-slate-800/90 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      idx === activeStepIndex ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {st.step}
                    </div>
                    <span className="text-xs font-heading font-semibold">{st.title}</span>
                  </div>
                  {idx < activeStepIndex && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Prompt & Agent Workbench */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 space-y-6">
            
            {/* Step Header */}
            <div className="border-b border-slate-800 pb-4 space-y-1">
              <span className="text-xs font-mono text-emerald-400">Step {activeStep.step} of {currentTrack.steps.length}</span>
              <h3 className="text-xl font-heading font-bold text-white">{activeStep.title}</h3>
              <p className="text-xs text-slate-300">{activeStep.instruction}</p>
            </div>

            {/* Config & Prompt Workbench */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-heading font-bold text-slate-200 block mb-1">
                  1. System Prompt / Agent Blueprint:
                </label>
                <textarea
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Tool Integrations Toggle */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-heading font-semibold text-slate-200">Enabled Agent Tooling</div>
                    <div className="text-[11px] font-mono text-slate-400">{activeStep.toolToEnable}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setToolEnabled(!toolEnabled);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    toolEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {toolEnabled ? 'Tool Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Non-Developer Hint Box */}
              <div className="text-xs text-slate-300 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800">
                💡 <span className="text-emerald-400 font-semibold">Learning Insight:</span> {activeStep.hint}
              </div>

              {/* Test Input & Live Sandbox Trigger */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-heading font-bold text-slate-200 block">
                  2. Test Input Query (Simulate User Interaction):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    disabled={isRunning}
                    onClick={handleRunSimulator}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-heading font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    {isRunning ? 'Running...' : 'Run Simulation'}
                  </button>
                </div>
              </div>

            </div>

            {/* Live Terminal Output Simulator */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Terminal className="w-3.5 h-3.5" /> Agent Live Sandbox Execution Log
                </span>
                <span>Status: {isRunning ? 'EXECUTING' : stepSuccess ? 'PASSED' : 'IDLE'}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 min-h-[120px] font-mono text-xs space-y-2 text-slate-300">
                {executionLog.length === 0 ? (
                  <span className="text-slate-600">Click "Run Simulation" above to test your agent configuration...</span>
                ) : (
                  executionLog.map((log, idx) => (
                    <div key={idx} className={log.includes('PASSED') || log.includes('called tool') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Next Step / Complete Action */}
            {stepSuccess && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-heading font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                >
                  {activeStepIndex < currentTrack.steps.length - 1 ? (
                    <>
                      Proceed to Step {activeStep.step + 1} <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Complete Track & Earn Badge <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
