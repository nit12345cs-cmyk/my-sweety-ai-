import React, { useState } from 'react';
import {
  MessageSquare,
  Globe,
  Mic,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  Menu,
  X,
  Plus,
  Image as ImageIcon,
  Library,
  Puzzle,
  FolderKanban,
  Code2,
  MoreHorizontal,
  Pin,
  Clock,
  User
} from 'lucide-react';
import { ModuleType, ThemeType } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  language: string;
  isAdmin?: boolean;
  currentTheme?: ThemeType;
  currentUserEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  language,
  isAdmin = false,
  currentTheme = 'chatgpt',
  currentUserEmail = 'Sathishkumar',
}) => {
  const isTamil = language === 'ta';
  const isLightMode = currentTheme === 'chatgpt' || currentTheme === 'light';
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const ALL_MODULES: { id: ModuleType; title: string; subtitle: string; icon: React.FC<any>; badge?: string }[] = [
    {
      id: 'chat',
      title: isTamil ? 'AI சாட் ஹப்' : 'AI Chat Hub',
      subtitle: isTamil ? 'மாடல் சாட் & பதில்கள்' : 'Multimodal Conversational AI',
      icon: MessageSquare,
      badge: '2000+',
    },
    {
      id: 'website',
      title: isTamil ? 'AI வெப்சைட் பில்டர்' : 'AI Website Studio',
      subtitle: isTamil ? 'Prompt கொடுத்து வெப்சைட் உருவாக்கு' : 'Generate Responsive Websites',
      icon: Globe,
      badge: 'HOT',
    },
    {
      id: 'voice',
      title: isTamil ? 'குரல் & ஆடியோ' : 'Voice & Audio Assistant',
      subtitle: isTamil ? 'டெக்ஸ்ட்-டு-ஸ்பீச் குரல்' : 'Text-to-Speech & Speech AI',
      icon: Mic,
      badge: 'TTS',
    },
    {
      id: 'admin',
      title: isTamil ? 'நிர்வாக போர்ட்டல்' : 'Enterprise Admin',
      subtitle: isTamil ? 'பயன்பாடு & பாதுகாப்பு' : 'Metrics, RBAC & Security',
      icon: ShieldCheck,
      badge: 'SUPER',
    },
  ];

  const MODULES = isAdmin ? ALL_MODULES : ALL_MODULES.filter((m) => m.id !== 'admin');

  const userName = currentUserEmail ? currentUserEmail.split('@')[0] : 'Sathishkumar';

  return (
    <>
      {/* Mobile Fixed Bottom Navigation Dashboard (< lg) */}
      <div className={`flex lg:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl px-2 py-1.5 gap-1 overflow-x-auto scrollbar-none items-center justify-around z-40 shadow-2xl border-t ${
        isLightMode ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-950/95 border-slate-800/90 text-slate-200'
      }`}>
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 text-amber-500 hover:text-amber-600 font-bold rounded-xl text-[10px] shrink-0 min-w-[50px] active:scale-95 transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="mt-0.5 whitespace-nowrap">{isTamil ? 'மெனு' : 'Menu'}</span>
        </button>

        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all shrink-0 min-w-[54px] cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md scale-105'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-[58px]">
                {mod.id === 'chat'
                  ? (isTamil ? 'சாட்' : 'Chat')
                  : mod.id === 'website'
                  ? (isTamil ? 'வெப்சைட்' : 'Website')
                  : mod.id === 'voice'
                  ? (isTamil ? 'குரல்' : 'Voice')
                  : (isTamil ? 'நிர்வாகம்' : 'Admin')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Full Drawer Modal */}
      {mobileDrawerOpen && (
        <div className={`fixed inset-0 backdrop-blur-md z-50 flex flex-col p-4 lg:hidden ${
          isLightMode ? 'bg-white/95 text-slate-900' : 'bg-slate-950/90 text-white'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 font-extrabold text-sm">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>{isTamil ? 'இயக்கத் தொகுதிகள் (OS Core Modules)' : 'OS Core Modules'}</span>
            </div>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-4">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeModule === mod.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    onSelectModule(mod.id);
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-start gap-3 border min-h-[48px] ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500/50 text-slate-900 font-bold'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${
                      isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{mod.title}</span>
                      {mod.badge && (
                        <span className="text-[10px] font-extrabold font-mono bg-amber-500/20 text-amber-700 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          {mod.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{mod.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Sidebar (lg:flex) */}
      <aside className={`hidden lg:flex w-72 rounded-3xl border p-4 flex-col justify-between shrink-0 transition-all duration-300 relative overflow-hidden ${
        isLightMode
          ? 'bg-[#f0f0f4] border-slate-200/90 text-slate-800 shadow-md'
          : 'bg-[#080a16]/65 backdrop-blur-2xl border-white/10 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
      }`}>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            {/* Top New Chat Button */}
            <button
              onClick={() => onSelectModule('chat')}
              className={`w-full mb-3 py-2.5 px-3.5 rounded-xl border flex items-center justify-between font-bold text-xs transition-all shadow-xs cursor-pointer ${
                isLightMode
                  ? 'bg-white hover:bg-slate-100 border-slate-300/80 text-slate-800 shadow-slate-200'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white shadow-black/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>{isTamil ? 'புதிய உரையாடல்' : 'New chat'}</span>
              </div>
              <span className="text-[10px] font-mono opacity-60">Ctrl + K</span>
            </button>

            {/* Core OS Navigation Modules */}
            <div className="space-y-1 py-1">
              <div className="px-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                <Layers className="w-3 h-3 text-amber-500" />
                <span>{isTamil ? 'செயலி தொகுதிகள்' : 'AI Modules'}</span>
              </div>
              {MODULES.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectModule(mod.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-medium text-xs ${
                      isActive
                        ? isLightMode
                          ? 'bg-white border border-slate-300/80 text-slate-900 font-bold shadow-xs'
                          : 'bg-white/10 border border-white/10 text-white font-bold'
                        : isLightMode
                        ? 'hover:bg-slate-200/70 text-slate-700'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-500'}`} />
                      <span className="truncate max-w-[140px]">{mod.title}</span>
                    </div>
                    {mod.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 font-mono">
                        {mod.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Recent Conversations Section */}
            <div className="mt-4 pt-3 border-t border-slate-300/60 dark:border-white/10">
              <div className="px-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>{isTamil ? 'சமீபத்திய சாட்கள்' : 'Recents'}</span>
              </div>
              <div className="space-y-0.5 text-xs max-h-[180px] overflow-y-auto scrollbar-thin">
                <button
                  onClick={() => onSelectModule('chat')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg truncate transition-colors cursor-pointer flex items-center gap-2 ${
                    isLightMode ? 'hover:bg-slate-200/70 text-slate-700' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{isTamil ? 'தற்போதைய உரையாடல்' : 'Current Active Chat'}</span>
                </button>
                <button
                  onClick={() => onSelectModule('website')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg truncate transition-colors cursor-pointer flex items-center gap-2 ${
                    isLightMode ? 'hover:bg-slate-200/70 text-slate-700' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="truncate">{isTamil ? 'வெப்சைட் பில்டர்' : 'Website Generation'}</span>
                </button>
                <button
                  onClick={() => onSelectModule('voice')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg truncate transition-colors cursor-pointer flex items-center gap-2 ${
                    isLightMode ? 'hover:bg-slate-200/70 text-slate-700' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{isTamil ? 'குரல் உதவியாளர்' : 'Voice Assistant'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Profile Card */}
          <div className="pt-3 border-t border-slate-300/70 dark:border-white/10 mt-auto">
            <div className={`p-2.5 rounded-2xl flex items-center justify-between shadow-xs ${
              isLightMode ? 'bg-white border border-slate-200' : 'bg-white/5 border border-white/10'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                    {userName}
                  </div>
                  <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Free
                  </span>
                </div>
              </div>
              <button
                onClick={() => onSelectModule('admin')}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-105 text-slate-950 text-[10px] font-black shadow-xs transition-all cursor-pointer"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

