import React from 'react';

export function Rocket({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.26-1.5 1.26-1.5l-4.26-4.26s-.79.55-1.5 1.26z"/>
      <path d="M12 15l-3-3 7.5-7.5c1.5-1.5 4-2 4-2s-.5 2.5-2 4L12 15z"/>
    </svg>
  );
}

export function Lightbulb({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/>
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
    </svg>
  );
}

export function BookOpen({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

export function GraduationCap({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}

export function FileCode({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="m10 13-2 2 2 2"/>
      <path d="m14 13 2 2-2 2"/>
    </svg>
  );
}

export function ShoppingBag({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
      <path d="M3 6h18"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

export function Compass({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  );
}

export function Users({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

export function FolderKanban({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
      <path d="M8 10v4"/>
      <path d="M12 10v2"/>
      <path d="M16 10v6"/>
    </svg>
  );
}

export function FileText({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      <path d="M10 9H8"/>
      <path d="M16 13H8"/>
      <path d="M16 17H8"/>
    </svg>
  );
}

export function CheckCircle2({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

export function CheckCircle({ className = "w-5 h-5", style }) {
  return <CheckCircle2 className={className} style={style} />;
}

export function ArrowRight({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
      <path d="m12 5 7 7-7 7"/>
    </svg>
  );
}

export function Copy({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  );
}

export function Check({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}

export function Plus({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
      <path d="M12 5v14"/>
    </svg>
  );
}

export function AlertCircle({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" x2="12" y1="8" y2="12"/>
      <line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
  );
}

export function Sparkles({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}

export function ExternalLink({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6"/>
      <path d="M10 14 21 3"/>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    </svg>
  );
}

export function Code2({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 16 4-4-4-4"/>
      <path d="m6 8-4 4 4 4"/>
      <path d="m14.5 4-5 16"/>
    </svg>
  );
}

export function Layers({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
      <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 12.5"/>
      <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L3.18 17.5"/>
    </svg>
  );
}

export function Target({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

export function Folder({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
    </svg>
  );
}

export function ShieldCheck({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

export function Trophy({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}

export function HelpCircle({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>
  );
}

export function RefreshCw({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  );
}

export function Award({ className = "w-5 h-5", style }) {
  return (
    <svg className={className} style={{ width: '1.25rem', height: '1.25rem', ...style }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  );
}
