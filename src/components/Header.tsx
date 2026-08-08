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
  Palette,
  Menu
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
  { id: 'dark', name: 'Dark Mode', nativeName: '🌙 டார்க் மோட்', icon: '🌙' },
  { id: 'light', name: 'Light Mode', nativeName: '☀️ லைட் மோட்', icon: '☀️' },
];

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  activeModuleTitle,
  currentUserEmail,
  isAdmin = false,
  onLogout,
  currentTheme = 'dark',
  onThemeChange,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const selectedLang = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[1];
  const isTamil = currentLanguage === 'ta';
  const initial = currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : 'S';

  return (
    <>
      <header className="glass-header bg-slate-950/85 border-b border-slate-800/80 text-slate-100 sticky top-0 z-40 backdrop-blur-xl shadow-xl">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('swatea:open_menu'))}
              className="lg:hidden p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md"
              title={isTamil ? 'மெனு & வரலாறு' : 'Menu & History'}
            >
              <Menu className="w-5 h-5" />
              <span className="text-xs font-bold hidden xs:inline">{isTamil ? 'மெனு' : 'Menu'}</span>
            </button>

            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 p-[1.5px] shadow-lg shadow-amber-950/40 hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-lg text-white font-mono">
                  SWATEA <span className="text-amber-400">AI</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                {activeModuleTitle}
              </p>
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setThemeMenuOpen(!themeMenuOpen);
                  setLangMenuOpen(false);
                }}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                title="AI Theme & Appearance"
              >
                <Palette className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">
                  {THEMES.find((t) => t.id === currentTheme)?.icon || '🌙'}{' '}
                  {currentLanguage === 'ta'
                    ? THEMES.find((t) => t.id === currentTheme)?.nativeName
                    : THEMES.find((t) => t.id === currentTheme)?.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    {currentLanguage === 'ta' ? 'AI தீம் தேர்ந்தெடு' : 'Select AI Theme'}
                  </div>
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        if (onThemeChange) onThemeChange(theme.id);
                        setThemeMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 ${
                        currentTheme === theme.id ? 'text-amber-400 font-semibold bg-amber-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{theme.icon}</span>
                        <span>{currentLanguage === 'ta' ? theme.nativeName : theme.name}</span>
                      </span>
                      {currentTheme === theme.id && <Sparkles className="w-3 h-3 text-amber-400" />}
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
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedLang.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    Select OS Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 ${
                        currentLanguage === lang.code ? 'text-amber-400 font-semibold bg-amber-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      {currentLanguage === lang.code && <Sparkles className="w-3 h-3 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </header>
    </>
  );
};

