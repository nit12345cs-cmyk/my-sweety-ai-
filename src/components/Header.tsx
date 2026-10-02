import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Globe,
  ChevronDown,
  Palette,
  Menu,
  Search,
  X,
  Wand2,
  Film,
  Mic,
  Sun,
  Moon,
  LogOut,
  ArrowRight,
  CornerDownLeft,
  FileText,
  Keyboard,
  Flame,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import { LanguageCode, LanguageOption, ThemeType, ModuleType } from '../types';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  activeModuleTitle: string;
  currentUserEmail?: string | null;
  onLogout?: () => void;
  currentTheme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void;
  onSelectModule?: (module: ModuleType) => void;
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

interface PaletteItem {
  id: string;
  type: 'module' | 'action';
  title: string;
  subtitle?: string;
  snippet?: string;
  icon: React.FC<any>;
  iconGradient?: string;
  iconColor?: string;
  badge?: string;
  timestamp?: string;
  onSelect: () => void;
}

interface ShortcutDefinition {
  id: string;
  category: 'nav' | 'system';
  keys: string[];
  title: string;
  desc: string;
  badge?: string;
  onExecute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  activeModuleTitle,
  currentUserEmail,
  onLogout,
  currentTheme = 'dark',
  onThemeChange,
  onSelectModule,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Modal Mode: 'shortcuts' (cheat sheet) or 'search' (command palette)
  const [modalMode, setModalMode] = useState<'shortcuts' | 'search'>('shortcuts');
  const [searchQuery, setSearchQuery] = useState('');
  const [shortcutCategory, setShortcutCategory] = useState<'all' | 'nav' | 'system'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'modules' | 'actions'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const selectedLang = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[1];
  const isTamil = currentLanguage === 'ta';

  // Global Keyboard Shortcut: Cmd/Ctrl + K & Custom Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape' && paletteOpen) {
        setPaletteOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setPaletteOpen(true);
      setModalMode('shortcuts');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('swatea:open_shortcuts', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('swatea:open_shortcuts', handleCustomOpen);
    };
  }, [paletteOpen]);

  // Focus input when palette opens & reset selection
  useEffect(() => {
    if (paletteOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [paletteOpen]);

  // Keyboard Shortcuts Definitions (Only the 4 core features and system controls)
  const SHORTCUTS: ShortcutDefinition[] = useMemo(() => {
    const list: ShortcutDefinition[] = [
      // 1. Navigation Shortcuts
      {
        id: 'sc_nav_image',
        category: 'nav',
        keys: ['⌘ / Ctrl', '1'],
        title: isTamil ? 'பட உருவாக்கம் & திருத்தம் (Create & Edit Images)' : 'Switch to Image Studio (Create & Edit)',
        desc: isTamil ? 'ஜெமினி 3.1 ஃபிளாஷ் இமேஜ் & அதிவேக புகைப்பட உருவாக்கம்' : 'Gemini 3.1 Flash Image creation, editing & inpainting',
        badge: 'STUDIO 1',
        onExecute: () => {
          onSelectModule?.('image');
          setPaletteOpen(false);
        },
      },
      {
        id: 'sc_nav_video',
        category: 'nav',
        keys: ['⌘ / Ctrl', '2'],
        title: isTamil ? 'வீடியோ அனிமேஷன் (Animate to Video)' : 'Switch to Video Studio (Animate to Video)',
        desc: isTamil ? 'கூகிள் Veo ஏஐ மூலம் படங்களை 1080p வீடியோவாக மாற்றுதல்' : 'Cinematic image-to-video animation powered by Google Veo AI',
        badge: 'STUDIO 2',
        onExecute: () => {
          onSelectModule?.('video');
          setPaletteOpen(false);
        },
      },
      {
        id: 'sc_nav_website',
        category: 'nav',
        keys: ['⌘ / Ctrl', '3'],
        title: isTamil ? 'AI வெப்சைட் ஸ்டுடியோ (AI Website Studio)' : 'Switch to AI Website Studio',
        desc: isTamil ? 'விளக்கக் குறிப்பிலிருந்து முழு நேரடி HTML5 இணையதளங்கள்' : 'Prompt to live HTML5, CSS & interactive responsive website prototypes',
        badge: 'STUDIO 3',
        onExecute: () => {
          onSelectModule?.('website');
          setPaletteOpen(false);
        },
      },
      {
        id: 'sc_nav_voice',
        category: 'nav',
        keys: ['⌘ / Ctrl', '4'],
        title: isTamil ? 'குரல் உதவி (Voice Assistant)' : 'Switch to Voice Assistant',
        desc: isTamil ? 'இயற்கையான AI குரல் ஒலி மற்றும் நேரலை TTS பேச்சு' : 'Real-time Gemini TTS voice synthesis & speech assistant',
        badge: 'STUDIO 4',
        onExecute: () => {
          onSelectModule?.('voice');
          setPaletteOpen(false);
        },
      },
      // 2. System & OS Controls Shortcuts
      {
        id: 'sc_sys_palette',
        category: 'system',
        keys: ['⌘ / Ctrl', 'K'],
        title: isTamil ? 'விசைப்பலகை குறுக்குவழிகள் & தேடல்' : 'Toggle Shortcuts & Command Palette',
        desc: isTamil ? 'கணினி குறுக்குவழிகள் மற்றும் கமாண்ட் பேலட்டை திறக்க' : 'Toggle this modal with power-user shortcuts and search',
        badge: 'SYSTEM',
      },
      {
        id: 'sc_sys_theme',
        category: 'system',
        keys: ['⌘ / Ctrl', 'Shift', 'T'],
        title: isTamil ? 'டார்க் / லைட் தீம் மாற்று' : 'Toggle Dark / Light Theme',
        desc: isTamil ? 'OS முழுமைக்குமான வண்ண அமைப்பை மாற்றுக' : 'Switch OS color appearance between Dark and Light mode',
        badge: 'THEME',
        onExecute: () => {
          onThemeChange?.(currentTheme === 'dark' ? 'light' : 'dark');
          setPaletteOpen(false);
        },
      },
      {
        id: 'sc_sys_lang',
        category: 'system',
        keys: ['⌘ / Ctrl', 'Shift', 'L'],
        title: isTamil ? 'மொழி மாற்று (Tamil / English)' : 'Switch OS Language',
        desc: isTamil ? 'தமிழ் மற்றும் ஆங்கில மொழிக்கு இடையில் மாறுக' : 'Toggle between Tamil and English interface localization',
        badge: 'LANGUAGE',
        onExecute: () => {
          onLanguageChange?.(currentLanguage === 'ta' ? 'en' : 'ta');
          setPaletteOpen(false);
        },
      },
      {
        id: 'sc_sys_esc',
        category: 'system',
        keys: ['Esc'],
        title: isTamil ? 'விண்டோவை மூடு (Dismiss)' : 'Close Modal / Cancel',
        desc: isTamil ? 'திறந்துள்ள எந்தவொரு மாடல் அல்லது பேலட்டையும் உடனடியாக மூட' : 'Close active popup, modal, image zoom or palette',
        badge: 'SYSTEM',
        onExecute: () => setPaletteOpen(false),
      }
    ];

    return list;
  }, [isTamil, currentTheme, currentLanguage, onSelectModule, onThemeChange, onLanguageChange]);

  // Filtered Shortcuts based on search and category
  const filteredShortcuts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let res = SHORTCUTS;

    if (shortcutCategory !== 'all') {
      res = res.filter((s) => s.category === shortcutCategory);
    }

    if (q) {
      res = res.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q) ||
          s.keys.some((k) => k.toLowerCase().includes(q))
      );
    }

    return res;
  }, [SHORTCUTS, shortcutCategory, searchQuery]);

  // Build searchable items for Command Palette view (Only 4 core modules + actions)
  const allItems: PaletteItem[] = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // 1. Modules & Studios
    const modulesList: PaletteItem[] = [
      {
        id: 'mod_image',
        type: 'module',
        title: isTamil ? 'பட உருவாக்கம் & திருத்தம் (Create & Edit Images)' : 'Create & Edit Images',
        subtitle: isTamil
          ? 'ஜெமினி 3.1 ஃபிளாஷ் இமேஜ் & அதிவேக புகைப்பட உருவாக்கம் (⌘+1)'
          : 'Gemini 3.1 Flash Image creation, editing & inpainting (⌘+1)',
        icon: Wand2,
        iconGradient: 'from-amber-500 to-rose-500',
        iconColor: 'text-amber-300',
        badge: '⌘ 1',
        onSelect: () => {
          onSelectModule?.('image');
          setPaletteOpen(false);
        },
      },
      {
        id: 'mod_video',
        type: 'module',
        title: isTamil ? 'வீடியோ அனிமேஷன் (Animate to Video)' : 'Animate to Video',
        subtitle: isTamil
          ? 'கூகிள் Veo ஏஐ மூலம் படங்களை 1080p வீடியோவாக மாற்றுதல் (⌘+2)'
          : 'Google Veo AI cinematic image-to-video generation (1080p) (⌘+2)',
        icon: Film,
        iconGradient: 'from-purple-500 to-indigo-600',
        iconColor: 'text-purple-300',
        badge: '⌘ 2',
        onSelect: () => {
          onSelectModule?.('video');
          setPaletteOpen(false);
        },
      },
      {
        id: 'mod_website',
        type: 'module',
        title: isTamil ? 'AI வெப்சைட் ஸ்டுடியோ (AI Website Studio)' : 'AI Website Studio',
        subtitle: isTamil
          ? 'விளக்கக் குறிப்பிலிருந்து முழு இணையதளங்கள் & நேரலை மாதிரிகள் (⌘+3)'
          : 'Prompt to live HTML5, CSS & interactive responsive websites (⌘+3)',
        icon: Globe,
        iconGradient: 'from-emerald-500 to-teal-600',
        iconColor: 'text-emerald-300',
        badge: '⌘ 3',
        onSelect: () => {
          onSelectModule?.('website');
          setPaletteOpen(false);
        },
      },
      {
        id: 'mod_voice',
        type: 'module',
        title: isTamil ? 'குரல் உதவி (Voice Assistant)' : 'Voice Assistant',
        subtitle: isTamil
          ? 'இயற்கையான குரல் ஒலி மற்றும் நேரலை ஆடியோ பேச்சு (⌘+4)'
          : 'Real-time Gemini TTS natural voice synthesis & audio (⌘+4)',
        icon: Mic,
        iconGradient: 'from-cyan-500 to-blue-600',
        iconColor: 'text-cyan-300',
        badge: '⌘ 4',
        onSelect: () => {
          onSelectModule?.('voice');
          setPaletteOpen(false);
        },
      },
    ];

    // 2. Quick System Actions
    const actionItems: PaletteItem[] = [
      {
        id: 'act_theme',
        type: 'action',
        title:
          currentTheme === 'dark'
            ? isTamil ? 'லைட் மோடுக்கு மாற்று (Switch to Light)' : 'Switch to Light Mode'
            : isTamil ? 'டார்க் மோடுக்கு மாற்று (Switch to Dark)' : 'Switch to Dark Mode',
        subtitle: isTamil ? 'முழு OS வண்ணத் தீமை மாற்றவும்' : 'Toggle OS UI color theme (⌘+Shift+T)',
        icon: currentTheme === 'dark' ? Sun : Moon,
        iconColor: 'text-sky-400',
        badge: '⌘ ⇧ T',
        onSelect: () => {
          onThemeChange?.(currentTheme === 'dark' ? 'light' : 'dark');
          setPaletteOpen(false);
        },
      },
      {
        id: 'act_lang',
        type: 'action',
        title:
          currentLanguage === 'ta'
            ? 'Switch OS Language to English'
            : 'மொழி அமைப்பை தமிழுக்கு மாற்றவும் (Tamil)',
        subtitle: isTamil ? 'ஆங்கிலத்திற்கு மாற்றவும்' : 'Switch OS display language to Tamil (⌘+Shift+L)',
        icon: Globe,
        iconColor: 'text-emerald-400',
        badge: '⌘ ⇧ L',
        onSelect: () => {
          onLanguageChange?.(currentLanguage === 'ta' ? 'en' : 'ta');
          setPaletteOpen(false);
        },
      },
    ];

    if (onLogout) {
      actionItems.push({
        id: 'act_logout',
        type: 'action',
        title: isTamil ? 'வெளியேறு (Logout)' : 'Sign Out of Swatea AI',
        subtitle: currentUserEmail ? `Signed in as ${currentUserEmail}` : 'Log out of current account',
        icon: LogOut,
        iconColor: 'text-rose-400',
        onSelect: () => {
          onLogout();
          setPaletteOpen(false);
        },
      });
    }

    let filteredModules = modulesList;
    let filteredActions = actionItems;

    if (q) {
      filteredModules = modulesList.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.subtitle && m.subtitle.toLowerCase().includes(q))
      );
      filteredActions = actionItems.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.subtitle && a.subtitle.toLowerCase().includes(q))
      );
    }

    if (filterCategory === 'modules') return filteredModules;
    if (filterCategory === 'actions') return filteredActions;

    return [...filteredModules, ...filteredActions];
  }, [
    searchQuery,
    filterCategory,
    isTamil,
    currentTheme,
    currentLanguage,
    currentUserEmail,
    onSelectModule,
    onThemeChange,
    onLanguageChange,
    onLogout,
  ]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [allItems.length, filterCategory]);

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < allItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (modalMode === 'search' && allItems[selectedIndex]) {
        allItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setModalMode((prev) => (prev === 'shortcuts' ? 'search' : 'shortcuts'));
    }
  };

  useEffect(() => {
    if (listContainerRef.current) {
      const activeEl = listContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  return (
    <>
      <header className="glass-header bg-slate-950/85 border-b border-slate-800/80 text-slate-100 sticky top-0 z-40 backdrop-blur-xl shadow-xl">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('swatea:open_menu'))}
              className="lg:hidden p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md"
              title={isTamil ? 'மெனு' : 'Menu'}
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

          {/* Center: Global Shortcuts & Command Palette Trigger */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <button
              onClick={() => {
                setPaletteOpen(true);
                setModalMode('shortcuts');
              }}
              className="w-full flex items-center justify-between gap-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-xl text-xs transition-all shadow-inner group cursor-pointer"
              title="Open Keyboard Shortcuts Modal (Cmd/Ctrl + K)"
            >
              <span className="flex items-center gap-2 truncate">
                <Keyboard className="w-3.5 h-3.5 text-amber-400 transition-colors shrink-0" />
                <span className="truncate text-slate-300 group-hover:text-white font-medium">
                  {isTamil ? 'குறுக்குவழிகள் & தேடல் (Shortcuts)' : 'Keyboard Shortcuts & Commands'}
                </span>
              </span>
              <div className="hidden sm:flex items-center gap-1 font-mono font-bold">
                <kbd className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-amber-300 group-hover:border-amber-500/50">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Direct Shortcuts Icon Trigger */}
            <button
              onClick={() => {
                setPaletteOpen(true);
                setModalMode('shortcuts');
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition-all cursor-pointer shadow-sm hidden xs:flex items-center gap-1.5"
              title="Keyboard Shortcuts (Cmd/Ctrl + K)"
            >
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold hidden md:inline">⌘K</span>
            </button>

            {/* Theme Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setThemeMenuOpen(!themeMenuOpen);
                  setLangMenuOpen(false);
                }}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                title="Theme & Appearance"
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
                    {currentLanguage === 'ta' ? 'தீம் தேர்ந்தெடு' : 'Select Theme'}
                  </div>
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        onThemeChange?.(theme.id);
                        setThemeMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
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
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedLang.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    Select Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
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

      {/* ========================================================================= */}
      {/* KEYBOARD SHORTCUTS & COMMAND PALETTE MODAL (CMD/CTRL + K) */}
      {/* ========================================================================= */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 sm:pt-16 overflow-y-auto"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDownList}
          >
            {/* Header: Title, Search & Mode Switcher */}
            <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2 font-mono">
                      <span>{isTamil ? 'விசைப்பலகை குறுக்குவழிகள் & கமாண்டுகள்' : 'Power-User Keyboard Shortcuts & Commands'}</span>
                      <kbd className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-amber-300 font-bold">
                        ⌘K
                      </kbd>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isTamil
                        ? '4 முதன்மை ஸ்டுடியோக்களை இயக்க விசைப்பலகை குறுக்குவழிகள்.'
                        : 'Navigate the 4 Core Studios, create media, and control Swatea AI OS instantly.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPaletteOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* View Mode Switcher: Shortcuts Guide vs Search Palette */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setModalMode('shortcuts')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalMode === 'shortcuts'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>{isTamil ? '⌨️ குறுக்குவழிகள் பட்டியல்' : '⌨️ Keyboard Shortcuts'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode('search')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      modalMode === 'search'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isTamil ? '⚡ ஸ்டுடியோ தேடல்' : '⚡ Studio Search'}</span>
                  </button>
                </div>

                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">Tab</kbd> to switch
                </span>
              </div>

              {/* Live Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    modalMode === 'shortcuts'
                      ? (isTamil ? 'குறுக்குவழிகளை வடிகட்டவும் (எ.கா: image, video, theme)...' : 'Filter shortcuts by name or keys (e.g. 1, image, video, theme)...')
                      : (isTamil ? 'ஸ்டுடியோக்கள் அல்லது செயல்பாடுகளைத் தேடுங்கள்...' : 'Search studios or actions...')
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 p-0.5 rounded text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* VIEW MODE 1: KEYBOARD SHORTCUTS MATRIX */}
            {/* ========================================================================= */}
            {modalMode === 'shortcuts' && (
              <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 p-2.5 border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto scrollbar-none text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setShortcutCategory('all')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      shortcutCategory === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {isTamil ? 'அனைத்து குறுக்குவழிகள்' : 'All Shortcuts'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShortcutCategory('nav')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      shortcutCategory === 'nav'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {isTamil ? '🌐 4 ஸ்டுடியோக்கள் (1-4)' : '🌐 4 Core Studios (1-4)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShortcutCategory('system')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      shortcutCategory === 'system'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {isTamil ? '⚙️ கணினி & தீம்' : '⚙️ System & Controls'}
                  </button>
                </div>

                {/* Shortcuts Grid List */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
                  {filteredShortcuts.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <Keyboard className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">
                        {isTamil ? 'பொருந்தும் குறுக்குவழிகள் இல்லை' : 'No matching shortcuts found'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Try searching with terms like "image", "video", "website", or "theme".
                      </p>
                    </div>
                  ) : (
                    filteredShortcuts.map((sc) => (
                      <div
                        key={sc.id}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                              {sc.title}
                            </span>
                            {sc.badge && (
                              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                                {sc.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {sc.desc}
                          </p>
                        </div>

                        {/* Keyboard Badge Keys and Optional Action Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 font-mono">
                            {sc.keys.map((k, idx) => (
                              <React.Fragment key={idx}>
                                {idx > 0 && <span className="text-slate-600 text-xs font-bold">+</span>}
                                <kbd className="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-black text-amber-300 shadow-sm">
                                  {k}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>

                          {sc.onExecute && (
                            <button
                              type="button"
                              onClick={() => sc.onExecute?.()}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 opacity-0 group-hover:opacity-100 shadow-sm"
                              title="Execute this command now"
                            >
                              <span>Try</span>
                              <CornerDownLeft className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW MODE 2: COMMAND SEARCH */}
            {/* ========================================================================= */}
            {modalMode === 'search' && (
              <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                {/* Filter Category Segmented Buttons */}
                <div className="flex items-center gap-1 p-2 border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto scrollbar-none text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setFilterCategory('all')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      filterCategory === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {isTamil ? 'அனைத்தும்' : 'All Results'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterCategory('modules')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      filterCategory === 'modules'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {isTamil ? '4 ஸ்டுடியோக்கள்' : '4 Core Studios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterCategory('actions')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      filterCategory === 'actions'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {isTamil ? 'செயல்கள்' : 'Quick Actions'}
                  </button>
                </div>

                {/* Results List */}
                <div
                  ref={listContainerRef}
                  className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 divide-y divide-slate-800/30"
                >
                  {allItems.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">
                        {isTamil ? 'பொருந்தும் முடிவுகள் எதுவும் இல்லை' : 'No matching results found'}
                      </p>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        {isTamil
                          ? `"${searchQuery}" என்ற தேடலுக்கு பொருத்தமான ஸ்டுடியோக்கள் இல்லை.`
                          : `Try searching for words like "image", "video", "website", or "voice".`}
                      </p>
                    </div>
                  ) : (
                    allItems.map((item, idx) => {
                      const isSelected = selectedIndex === idx;
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.id}
                          data-index={idx}
                          onClick={() => item.onSelect()}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-800/90 text-white shadow-sm ring-1 ring-amber-400/30'
                              : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                item.iconGradient
                                  ? `bg-gradient-to-tr ${item.iconGradient} text-slate-950 font-black shadow-md`
                                  : 'bg-slate-900 border border-slate-800 text-amber-400'
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${item.iconColor || 'text-slate-200'}`} />
                            </div>

                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold truncate">{item.title}</span>
                                {item.badge && (
                                  <kbd className="text-[10px] font-mono text-amber-400 font-bold bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                                    {item.badge}
                                  </kbd>
                                )}
                              </div>

                              {item.subtitle && (
                                <p className="text-[11px] text-slate-400 truncate leading-snug">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1">
                            {isSelected && (
                              <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                <span>Open</span>
                                <CornerDownLeft className="w-3 h-3" />
                              </span>
                            )}
                            <ArrowRight
                              className={`w-4 h-4 transition-transform ${
                                isSelected ? 'translate-x-0.5 text-amber-400' : 'text-slate-600'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Modal Bottom Keyboard Shortcuts Hint Bar */}
            <div className="p-2.5 sm:p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px]">
                    Tab
                  </kbd>
                  <span>{isTamil ? 'பயன்முறை மாற்று' : 'Switch Mode'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px]">
                    ↑↓
                  </kbd>
                  <span>{isTamil ? 'நகர்த்த' : 'Navigate'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px]">
                    ↵ Enter
                  </kbd>
                  <span>{isTamil ? 'இயக்க' : 'Execute'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px]">
                    ESC
                  </kbd>
                  <span>{isTamil ? 'மூட' : 'Close'}</span>
                </span>
              </div>

              <span className="text-amber-400 font-bold text-[10px] hidden sm:inline">
                Swatea AI OS Power-User Engine
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
