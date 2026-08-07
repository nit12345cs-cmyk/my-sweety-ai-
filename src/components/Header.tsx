import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Globe,
  Shield,
  Activity,
  Cpu,
  UserCheck,
  ChevronDown,
  Command,
  Flame,
  LogOut,
  Mail,
  Key,
  Infinity as InfinityIcon,
  CheckCircle2,
  X,
  ExternalLink,
  Zap,
  Download,
  Github,
  FileCode,
  Palette
} from 'lucide-react';
import { LanguageCode, LanguageOption, ThemeType } from '../types';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  activeModuleTitle: string;
  currentUserEmail?: string;
  isAdmin?: boolean;
  onLogout?: () => void;
  currentTheme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ் 🇮🇳', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English 🇺🇸', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español 🇪🇸', flag: '🇪🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語 🇯🇵', flag: '🇯🇵' },
  { code: 'de', name: 'German', nativeName: 'Deutsch 🇩🇪', flag: '🇩🇪' },
];

const THEMES: { id: ThemeType; name: string; nativeName: string; icon: string }[] = [
  { id: 'chatgpt', name: 'ChatGPT Classic', nativeName: '🤖 ChatGPT கிளாசிக் (Light)', icon: '🤖' },
  { id: 'light', name: 'Pearl Minimal', nativeName: '☀️ பியர்ல் மினிமல்', icon: '☀️' },
  { id: 'cyberpunk', name: 'Cyber Amber', nativeName: '⚡ சைபர் ஆம்பர்', icon: '⚡' },
  { id: 'obsidian', name: 'Obsidian Mint', nativeName: '🌌 அப்சிடியன் எமரால்டு', icon: '🌌' },
  { id: 'violet', name: 'Quantum Violet', nativeName: '🔮 குவாண்டம் வயலட்', icon: '🔮' },
  { id: 'cyan', name: 'Neon Cyan', nativeName: '💠 நியான் சையான்', icon: '💠' },
];

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  activeModuleTitle,
  currentUserEmail,
  isAdmin = false,
  onLogout,
  currentTheme = 'cyberpunk',
  onThemeChange,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [backendModalOpen, setBackendModalOpen] = useState(false);
  const [backendData, setBackendData] = useState<any>(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchBackendHealth = async () => {
    setBackendLoading(true);
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setBackendData(data);
    } catch (err: any) {
      setBackendData({ status: 'ERROR', error: err?.message || 'Failed to connect to backend port 3000' });
    } finally {
      setBackendLoading(false);
    }
  };

  useEffect(() => {
    const key = localStorage.getItem('swatea_custom_api_key');
    if (key) {
      setSavedKey(key);
      setCustomKey(key);
    }
  }, []);

  const handleSaveKey = () => {
    if (customKey.trim()) {
      localStorage.setItem('swatea_custom_api_key', customKey.trim());
      setSavedKey(customKey.trim());
    } else {
      localStorage.removeItem('swatea_custom_api_key');
      setSavedKey(null);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const selectedLang = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[1];
  const isTamil = currentLanguage === 'ta';
  const initial = currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : 'S';

  const isLightMode = currentTheme === 'chatgpt' || currentTheme === 'light';

  return (
    <>
      <header className={`sticky top-0 z-40 backdrop-blur-2xl transition-colors duration-300 ${
        isLightMode
          ? 'bg-white/90 border-b border-slate-200 text-slate-800 shadow-sm'
          : 'bg-[#080a14]/75 border-b border-white/10 text-slate-100 shadow-2xl'
      }`}>
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-all">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden ${
                isLightMode ? 'bg-slate-900' : 'bg-[#050711]'
              }`}>
                <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
                <Flame className="w-5 h-5 text-cyan-400 animate-pulse relative z-10" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black tracking-wider text-lg font-mono ${
                  isLightMode
                    ? 'text-slate-900'
                    : 'bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent'
                }`}>
                  SWATEA <span className="text-cyan-600">AI</span>
                </span>
                <span className={`hidden md:inline-block px-2 py-0.5 text-[9px] font-extrabold font-mono rounded-full tracking-wider uppercase border ${
                  isLightMode
                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                }`}>
                  {currentTheme === 'chatgpt' ? 'SWATEA OS (Classic)' : 'ANTIGRAVITY OS'}
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {activeModuleTitle}
              </p>
            </div>
          </div>

          {/* Key Settings Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setKeyModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-indigo-500/10 border border-cyan-500/30 hover:border-cyan-400/70 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all text-cyan-300 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer"
              title={isTamil ? 'AI சாவி அமைப்புகள்' : 'API Key Config'}
            >
              <InfinityIcon className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span className="hidden sm:inline">
                {savedKey
                  ? isTamil
                    ? 'சுய API சாவி இணைக்கப்பட்டது'
                    : 'Custom Key Active'
                  : isTamil
                  ? 'API சாவி அமைப்புகள்'
                  : 'API Key Config'}
              </span>
            </button>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* System Status Pill */}
            <button
              onClick={() => {
                setBackendModalOpen(true);
                fetchBackendHealth();
              }}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs shadow-inner transition-all cursor-pointer group"
              title={isTamil ? 'பின்னணி சேவை நிலையை பரிசோதிக்க (Backend Health)' : 'Inspect Backend Server Status'}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Activity className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 font-mono text-[11px] font-semibold group-hover:text-emerald-300">
                Backend 3000 {isTamil ? 'இயங்குகிறது' : 'OK'}
              </span>
            </button>

            {/* Theme Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setThemeMenuOpen(!themeMenuOpen);
                  setLangMenuOpen(false);
                }}
                className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                title="AI Theme & Appearance"
              >
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">
                  {THEMES.find((t) => t.id === currentTheme)?.icon || '⚡'}{' '}
                  {currentLanguage === 'ta'
                    ? THEMES.find((t) => t.id === currentTheme)?.nativeName
                    : THEMES.find((t) => t.id === currentTheme)?.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0a0d1d] border border-white/15 rounded-xl shadow-2xl py-1 z-50 text-xs backdrop-blur-xl">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">
                    {currentLanguage === 'ta' ? 'AI தீம் தேர்ந்தெடு' : 'Select AI Theme'}
                  </div>
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        if (onThemeChange) onThemeChange(theme.id);
                        setThemeMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/10 transition-colors ${
                        currentTheme === theme.id ? 'text-cyan-300 font-semibold bg-cyan-500/15' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{theme.icon}</span>
                        <span>{currentLanguage === 'ta' ? theme.nativeName : theme.name}</span>
                      </span>
                      {currentTheme === theme.id && <Sparkles className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setThemeMenuOpen(false);
                }}
                className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedLang.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#0a0d1d] border border-white/15 rounded-xl shadow-2xl py-1 z-50 text-xs backdrop-blur-xl">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">
                    Select OS Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/10 transition-colors ${
                        currentLanguage === lang.code ? 'text-cyan-300 font-semibold bg-cyan-500/15' : 'text-slate-300'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      {currentLanguage === lang.code && <Sparkles className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile & Enterprise Tag */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-cyan-950/50">
                {initial}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                  {currentUserEmail || 'Swatea User'}
                </div>
                <div className={`text-[10px] flex items-center gap-1 font-bold ${isAdmin ? 'text-cyan-400' : 'text-slate-400'}`}>
                  <Shield className="w-3 h-3" /> {isAdmin ? (isTamil ? 'சூப்பர் அட்மின் (Admin Owner)' : 'Super Admin') : (isTamil ? 'பயனர் (User Session)' : 'Standard User')}
                </div>
              </div>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 ml-1 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-1 text-xs font-mono"
                  title={isTamil ? 'வெளியேறு (Log Out)' : 'Log Out'}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{isTamil ? 'வெளியேறு' : 'Logout'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Unlimited Token & Custom API Key Modal */}
      {keyModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setKeyModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setKeyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{isTamil ? 'Swatea AI சாவி அமைப்புகள்' : 'Swatea AI Key Config'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isTamil
                    ? 'சொந்த API சாவியைப் பயன்படுத்தி அதிகவேக AI சேவையை அணுகவும்.'
                    : 'Use your custom API key for high-throughput AI execution.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              {/* Status Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {isTamil ? 'இயல்புநிலை சர்வர் சாவி' : 'Built-in Server Engine Status'}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono">
                      ONLINE • Swatea High Performance AI Ready
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-lg font-mono">
                  ACTIVE
                </span>
              </div>

              {/* BYOK Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isTamil ? 'சொந்த Google Gemini API சாவி (Bring Your Own Key)' : 'Custom Gemini API Key (BYOK)'}</span>
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>{isTamil ? 'இலவச சாவி பெற' : 'Get Free Key'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500/70"
                />
                <p className="text-[11px] text-slate-500">
                  {isTamil
                    ? 'உங்கள் சாவி பிரவுசரின் உள்ளூர் சேமிப்பில் (localStorage) பாதுகாப்பாக சேமிக்கப்படும்.'
                    : 'Your key stays safely stored in local browser storage and overrides default quota restrictions.'}
                </p>
              </div>

              {savedSuccess && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isTamil ? 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!' : 'API Key settings updated successfully!'}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              {savedKey && (
                <button
                  onClick={() => {
                    setCustomKey('');
                    localStorage.removeItem('swatea_custom_api_key');
                    setSavedKey(null);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  {isTamil ? 'சாவியை நீக்கு' : 'Remove Custom Key'}
                </button>
              )}
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all"
              >
                {isTamil ? 'சேமி & செயல்படுத்தவும்' : 'Save & Activate Lifetime Mode'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backend Health & API Diagnostics Inspector Modal */}
      {backendModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setBackendModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setBackendModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{isTamil ? 'ஸ்வாதியா ஏஐ பேக்கெண்ட் சேவையக நிலை (Backend Server)' : 'Swatea Express Backend Health Monitor'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isTamil
                    ? 'போர்ட் 3000-ல் இயங்கும் Node.js Express சர்வர் நிலையின் நேரலை பரிசோதனை'
                    : 'Real-time operational status of Node.js Express server on Port 3000'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 my-2 pr-1">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{isTamil ? 'சேவையக இயக்கம் (Server Status)' : 'Express Server Status'}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs rounded-lg border border-emerald-500/30">
                      200 OK • ONLINE
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">{isTamil ? 'போர்ட்' : 'Port'}</div>
                    <div className="text-xs font-bold text-amber-400 font-mono">3000 (Express)</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">{isTamil ? 'சேவை வகை' : 'Architecture'}</div>
                    <div className="text-xs font-bold text-purple-400 font-mono">Full-Stack Node.js</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 font-medium">{isTamil ? 'API சாவி நிலை' : 'API Key Status'}</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      {backendData?.apiKeySet ? 'READY' : 'BYOK / Fallback Ready'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active API Routes Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>{isTamil ? 'செயலில் உள்ள பேக்கெண்ட் API பாதைகள்' : 'Active Express REST API Endpoints'}</span>
                  <span className="text-[10px] font-mono text-amber-400">12 Routes Active</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-emerald-400 font-bold">GET</span>
                    <span className="text-slate-300">/api/health</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-emerald-400 font-bold">GET</span>
                    <span className="text-slate-300">/api/status</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-indigo-400 font-bold">POST</span>
                    <span className="text-slate-300">/api/chat</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-indigo-400 font-bold">POST</span>
                    <span className="text-slate-300">/api/search</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-indigo-400 font-bold">POST</span>
                    <span className="text-slate-300">/api/code</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-indigo-400 font-bold">POST</span>
                    <span className="text-slate-300">/api/vision</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-indigo-400 font-bold">POST</span>
                    <span className="text-slate-300">/api/website</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-indigo-400 font-bold">POST</span>
                    <span className="text-slate-300">/api/tts</span>
                  </div>
                </div>
              </div>

              {/* JSON Payload Inspection */}
              {backendData && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between font-mono">
                    <span>LIVE BACKEND RESPONSE JSON</span>
                    <span className="text-emerald-400">{backendData.timestamp}</span>
                  </div>
                  <pre className="text-[11px] text-amber-300 font-mono bg-slate-900/80 p-2.5 rounded-lg overflow-x-auto max-h-36">
                    {JSON.stringify(backendData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={fetchBackendHealth}
                disabled={backendLoading}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Activity className={`w-3.5 h-3.5 text-emerald-400 ${backendLoading ? 'animate-spin' : ''}`} />
                <span>{backendLoading ? (isTamil ? 'பரிசோதிக்கிறது...' : 'Pinging Backend...') : (isTamil ? 'மீண்டும் சோதிக்க (Ping)' : 'Ping Backend Now')}</span>
              </button>
              <button
                onClick={() => setBackendModalOpen(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {isTamil ? 'மூடு' : 'Close Monitor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

