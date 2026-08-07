import React from 'react';
import { Cpu, Server, Activity, ShieldCheck, Flame } from 'lucide-react';

export const FooterBar: React.FC = () => {
  return (
    <footer className="hidden lg:flex bg-slate-950/90 border-t border-slate-800/80 text-slate-400 px-4 py-2 text-[11px] font-mono items-center justify-between gap-3 shrink-0 backdrop-blur-md z-30">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-black text-slate-100 tracking-wide">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>SWATEA AI OS</span>
        </span>
        <span className="text-slate-700">•</span>
        <span className="text-slate-300 font-bold">Port 3000 Active</span>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800/80 px-2 py-0.5 rounded-md">
          <Cpu className="w-3 h-3 text-amber-400" />
          <span className="text-slate-200">Gemini 3.6 Flash (Resilient)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800/80 px-2 py-0.5 rounded-md">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-300">28ms Latency</span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800/80 px-2 py-0.5 rounded-md">
          <ShieldCheck className="w-3 h-3 text-indigo-400" />
          <span className="text-indigo-300">OAuth & API Key Protected</span>
        </div>
      </div>
    </footer>
  );
};
