import React from 'react';

// Royal Educational Academy Crest Emblem
export function SchoolCrest({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="30" className="fill-slate-900 stroke-amber-400/40" strokeWidth="2"/>
      <circle cx="32" cy="32" r="26" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 3"/>
      {/* Laurels */}
      <path d="M16 38C15 32 18 24 23 20M48 38C49 32 46 24 41 20" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="17" cy="28" r="1.5" fill="#fcd34d"/>
      <circle cx="20" cy="22" r="1.5" fill="#fcd34d"/>
      <circle cx="47" cy="28" r="1.5" fill="#fcd34d"/>
      <circle cx="44" cy="22" r="1.5" fill="#fcd34d"/>
      {/* Book & Feather */}
      <path d="M22 41C27 39 31 40 32 42C33 40 37 39 42 41V28C37 26 33 27 32 29C31 27 27 26 22 28V41Z" fill="#ffffff" fillOpacity="0.95" stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M32 29V42" stroke="#d97706" strokeWidth="1.5"/>
      {/* Star of Excellence */}
      <polygon points="32,15 33.5,19 37.5,19 34.2,21.5 35.5,25.5 32,23 28.5,25.5 29.8,21.5 26.5,19 30.5,19" fill="#f59e0b"/>
    </svg>
  );
}

// Circular Animated Gauge for Attendance Rate
export function CircularGauge({ percentage = 0, size = 160, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  let colorClass = 'text-emerald-500';
  let bgGlow = 'rgba(16, 185, 129, 0.15)';
  let label = 'ممتاز';

  if (validPercentage < 75) {
    colorClass = 'text-rose-500';
    bgGlow = 'rgba(244, 63, 94, 0.15)';
    label = 'يحتاج متابعة';
  } else if (validPercentage < 90) {
    colorClass = 'text-amber-500';
    bgGlow = 'rgba(245, 158, 11, 0.15)';
    label = 'جيد';
  }

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={`${colorClass} transition-all duration-1000 ease-out`}
          style={{
            filter: `drop-shadow(0 2px 6px ${bgGlow})`
          }}
        />
      </svg>

      {/* Center Percentage Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
          {validPercentage}%
        </span>
        <span className="text-[11px] font-bold text-slate-500 mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}

// Proportional Horizontal Breakdown Bar
export function DistributionBar({ present = 0, absent = 0, late = 0, excused = 0, total = 0 }) {
  const sum = total || (present + absent + late + excused);
  if (sum === 0) {
    return (
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden" />
    );
  }

  const pPct = Math.round((present / sum) * 100);
  const aPct = Math.round((absent / sum) * 100);
  const lPct = Math.round((late / sum) * 100);
  const ePct = Math.round((excused / sum) * 100);

  return (
    <div className="space-y-2">
      {/* Segmented Bar */}
      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {pPct > 0 && (
          <div 
            style={{ width: `${pPct}%` }} 
            className="bg-emerald-500 transition-all duration-700" 
            title={`حاضر: ${present} (${pPct}%)`}
          />
        )}
        {lPct > 0 && (
          <div 
            style={{ width: `${lPct}%` }} 
            className="bg-amber-400 transition-all duration-700" 
            title={`متأخر: ${late} (${lPct}%)`}
          />
        )}
        {ePct > 0 && (
          <div 
            style={{ width: `${ePct}%` }} 
            className="bg-sky-400 transition-all duration-700" 
            title={`مبرر: ${excused} (${ePct}%)`}
          />
        )}
        {aPct > 0 && (
          <div 
            style={{ width: `${aPct}%` }} 
            className="bg-rose-500 transition-all duration-700" 
            title={`غائب: ${absent} (${aPct}%)`}
          />
        )}
      </div>

      {/* Legend & Count Badges */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>حاضر: <strong className="text-slate-900 tabular-nums">{present}</strong> ({pPct}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>غائب: <strong className="text-slate-900 tabular-nums">{absent}</strong> ({aPct}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>متأخر: <strong className="text-slate-900 tabular-nums">{late}</strong> ({lPct}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span>مبرر: <strong className="text-slate-900 tabular-nums">{excused}</strong> ({ePct}%)</span>
        </div>
      </div>
    </div>
  );
}

// Student Avatar Badge with deterministic tasteful colors
const AVATAR_PALETTES = [
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' }
];

export function StudentAvatar({ name = '', className = "w-9 h-9" }) {
  const clean = name.trim();
  const firstLetter = clean ? clean[0] : 'ط';
  
  // Hash name for consistent color
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];

  return (
    <div className={`${className} ${palette.bg} ${palette.text} ${palette.border} border rounded-full font-bold flex items-center justify-center shrink-0 shadow-xs select-none text-xs`}>
      {firstLetter}
    </div>
  );
}
