import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Globe,
  Mic,
  ShieldCheck,
  Zap,
  Layers,
  Menu,
  X,
  Plus,
  History,
  Search,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  LogOut,
  User
} from 'lucide-react';
import { ModuleType, ChatSession } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  language: string;
  isAdmin?: boolean;
  currentUserEmail?: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  language,
  isAdmin = false,
  currentUserEmail = 'guest@swatea.ai',
  onLogout
}) => {
  const isTamil = language === 'ta';
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  const userKey = currentUserEmail.toLowerCase().trim();
  const historyKey = `swatea_history_${userKey}`;
  const activeSessionKey = `swatea_active_session_id_${userKey}`;

  // Local state for chat history & active session sync
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(activeSessionKey);
      if (saved) return saved;
    } catch (e) {}
    return '';
  });

  // Listen for history updates & open menu events
  useEffect(() => {
    const handleHistorySync = (e: any) => {
      if (e.detail) {
        if (Array.isArray(e.detail.savedSessions)) {
          setSavedSessions(e.detail.savedSessions);
        }
        if (e.detail.activeSessionId) {
          setActiveSessionId(e.detail.activeSessionId);
        }
      }
    };

    const handleOpenMenu = () => {
      setMobileDrawerOpen(true);
      if (isCollapsed) setIsCollapsed(false);
    };

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem(historyKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setSavedSessions(parsed);
        }
        const activeId = localStorage.getItem(activeSessionKey);
        if (activeId) setActiveSessionId(activeId);
      } catch (e) {}
    };

    window.addEventListener('swatea:history_updated', handleHistorySync);
    window.addEventListener('swatea:open_menu', handleOpenMenu);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('swatea:history_updated', handleHistorySync);
      window.removeEventListener('swatea:open_menu', handleOpenMenu);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [historyKey, activeSessionKey, isCollapsed]);

  const handleStartNewChat = () => {
    onSelectModule('chat');
    window.dispatchEvent(new CustomEvent('swatea:new_chat'));
    setMobileDrawerOpen(false);
  };

  const handleLoadSession = (session: ChatSession) => {
    onSelectModule('chat');
    window.dispatchEvent(new CustomEvent('swatea:load_session', { detail: session }));
    setActiveSessionId(session.id);
    setMobileDrawerOpen(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('swatea:delete_session', { detail: sessionId }));
    setSavedSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleClearAllHistory = () => {
    if (
      window.confirm(
        isTamil
          ? 'நிச்சயமாக அனைத்து சாட் வரலாற்றையும் நீக்க வேண்டுமா?'
          : 'Are you sure you want to clear all saved chat history?'
      )
    ) {
      window.dispatchEvent(new CustomEvent('swatea:clear_history'));
      setSavedSessions([]);
    }
  };

  const ALL_MODULES: { id: ModuleType; title: string; subtitle: string; icon: React.FC<any>; badge?: string }[] = [
    {
      id: 'admin',
      title: isTamil ? 'நிர்வாக போர்ட்டல்' : 'Enterprise Admin',
      subtitle: isTamil ? 'பயன்பாடு & பாதுகாப்பு' : 'Metrics & Security',
      icon: ShieldCheck,
      badge: 'SUPER',
    },
  ];

  const MODULES = isAdmin ? ALL_MODULES : [];

  const filteredSessions = savedSessions.filter(
    (s) =>
      s.title?.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      s.messages?.some((m) => m.content?.toLowerCase().includes(historySearchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Mobile Slide-Out ChatGPT Drawer (< lg) */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex lg:hidden transition-all animate-fadeIn"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 h-full flex flex-col p-3 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header & Close */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                  <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                </div>
                <span className="font-mono tracking-tight text-amber-400">SWATEA AI</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 bg-slate-900 rounded-xl text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Action: + New Chat */}
            <button
              onClick={handleStartNewChat}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isTamil ? '+ புதிய உரையாடல்' : '+ New Chat'}</span>
            </button>

            {/* OS Modules Switcher (Only shown if admin or modules present) */}
            {MODULES.length > 0 && (
              <div className="space-y-1">
                <span className="px-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  {isTamil ? 'நிர்வாக பகுதி' : 'Admin Portal'}
                </span>
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
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-2.5 border cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs truncate font-bold">{mod.title}</span>
                          {mod.badge && (
                            <span className="text-[9px] font-extrabold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 rounded">
                              {mod.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Chat History Section */}
            <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-slate-800/80 space-y-2">
              <div className="px-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTamil ? 'சாட் வரலாறு' : 'Chat History'}</span>
                </span>
                <span className="text-slate-500 font-mono text-[9px]">{savedSessions.length}</span>
              </div>

              {/* History Search Box - Fixed Sticky Top */}
              <div className="relative shrink-0 sticky top-0 z-20 bg-slate-950/95 pt-0.5 pb-1 backdrop-blur-md">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder={isTamil ? 'தேடுக...' : 'Search history...'}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>

              {/* History Item List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 min-h-0">
                {savedSessions.length === 0 ? (
                  <div className="text-center py-6 px-2 text-slate-500 space-y-1">
                    <MessageSquare className="w-5 h-5 text-slate-600 mx-auto" />
                    <p className="text-[11px]">
                      {isTamil ? 'சாட் வரலாறு இல்லை' : 'No saved chat history.'}
                    </p>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleLoadSession(session)}
                      className={`group p-2 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        session.id === activeSessionId && activeModule === 'chat'
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate text-xs">{session.title || (isTamil ? 'தலைப்பற்ற சாட்' : 'Untitled Chat')}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer shrink-0"
                        title={isTamil ? 'நீக்கு' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Clear History */}
              {savedSessions.length > 0 && (
                <div className="pt-2 border-t border-slate-800 shrink-0 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-mono">{savedSessions.length} sessions</span>
                  <button
                    onClick={handleClearAllHistory}
                    className="text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                  >
                    {isTamil ? 'வரலாறை நீக்கு' : 'Clear History'}
                  </button>
                </div>
              )}

              {/* Mobile Drawer Logout */}
              {onLogout && (
                <div className="pt-2 border-t border-slate-800/90 shrink-0 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-bold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 truncate">{currentUserEmail}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{isAdmin ? 'Admin' : 'User'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onLogout();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
                    title={isTamil ? 'வெளியேறு' : 'Log Out'}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'வெளியேறு' : 'Logout'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop ChatGPT Style Left Sidebar (lg:flex) */}
      <aside
        className={`hidden lg:flex flex-col glass-panel rounded-2xl border border-slate-800/80 p-3 shrink-0 shadow-2xl relative overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'w-16 items-center' : 'w-72'
        }`}
      >
        {/* Top Header & Sidebar Toggle Button */}
        <div className={`flex items-center justify-between mb-3 w-full pb-2 border-b border-slate-800/80 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 text-xs font-black text-slate-100">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              </div>
              <span className="font-mono tracking-tight text-amber-400">SWATEA AI</span>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors border border-slate-800 cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsed Compact View */}
        {isCollapsed ? (
          <div className="flex-1 flex flex-col items-center gap-3 w-full py-2">
            <button
              onClick={handleStartNewChat}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg hover:scale-105 transition-all cursor-pointer"
              title={isTamil ? 'புதிய சாட்' : 'New Chat'}
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>

            {MODULES.length > 0 && (
              <>
                <div className="w-8 h-px bg-slate-800 my-1" />
                {MODULES.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = activeModule === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => onSelectModule(mod.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-md scale-105'
                          : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                      title={mod.title}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </>
            )}

            <div className="w-8 h-px bg-slate-800 my-1" />

            <div className="p-2 text-slate-500 font-mono text-[10px] text-center" title="Saved History Count">
              <History className="w-4 h-4 mx-auto text-slate-500 mb-0.5" />
              <span>{savedSessions.length}</span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="mt-auto p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer hover:scale-105"
                title={isTamil ? 'வெளியேறு' : 'Log Out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Expanded Full ChatGPT View */
          <div className="flex-1 flex flex-col min-h-0 w-full space-y-3">
            {/* Primary Action: + New Chat */}
            <button
              onClick={handleStartNewChat}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 transition-all cursor-pointer transform active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isTamil ? '+ புதிய உரையாடல்' : '+ New Chat'}</span>
            </button>

            {/* AI Apps / OS Modules Switcher (Only shown if admin or modules present) */}
            {MODULES.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-0.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>{isTamil ? 'நிர்வாக பகுதி' : 'Admin Portal'}</span>
                </div>

                <div className="space-y-1">
                  {MODULES.map((mod) => {
                    const Icon = mod.icon;
                    const isActive = activeModule === mod.id;

                    return (
                      <button
                        key={mod.id}
                        onClick={() => onSelectModule(mod.id)}
                        className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2.5 group border cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold shadow-md shadow-amber-950/20'
                            : 'bg-slate-900/30 hover:bg-slate-800/80 border-slate-800/50 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs truncate">{mod.title}</span>
                            {mod.badge && (
                              <span className="text-[9px] font-extrabold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 rounded">
                                {mod.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat History Section */}
            <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-slate-800/80 space-y-2">
              <div className="px-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1">
                  <History className="w-3 h-3 text-amber-400" />
                  <span>{isTamil ? 'சாட் வரலாறு' : 'Chat History'}</span>
                </span>
                <span className="text-slate-600 font-mono text-[9px]">{savedSessions.length}</span>
              </div>

              {/* History Search Box - Fixed Sticky Top */}
              <div className="relative shrink-0 px-0.5 sticky top-0 z-20 bg-slate-950/95 pt-0.5 pb-1 backdrop-blur-md">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder={isTamil ? 'தேடுக...' : 'Search chats...'}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>

              {/* Chat Session List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin min-h-0">
                {savedSessions.length === 0 ? (
                  <div className="text-center py-6 px-2 text-slate-500 space-y-1">
                    <MessageSquare className="w-5 h-5 text-slate-600 mx-auto" />
                    <p className="text-[11px]">
                      {isTamil ? 'சாட் வரலாறு இல்லை' : 'No saved chat history.'}
                    </p>
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const isActive = session.id === activeSessionId && activeModule === 'chat';

                    return (
                      <div
                        key={session.id}
                        onClick={() => handleLoadSession(session)}
                        className={`group relative px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold shadow-xs'
                            : 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span className="truncate text-xs">
                            {session.title || (isTamil ? 'தலைப்பற்ற சாட்' : 'Untitled Chat')}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-400 hover:bg-slate-800 shrink-0 cursor-pointer"
                          title={isTamil ? 'நீக்கு' : 'Delete'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Clear History */}
              {savedSessions.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 shrink-0 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-mono">
                    {savedSessions.length} {isTamil ? 'சாட்கள்' : 'sessions'}
                  </span>
                  <button
                    onClick={handleClearAllHistory}
                    className="text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                  >
                    {isTamil ? 'வரலாறை நீக்கு' : 'Clear History'}
                  </button>
                </div>
              )}

              {/* Desktop Expanded User Profile & Logout */}
              {onLogout && (
                <div className="pt-2.5 border-t border-slate-800/80 shrink-0 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-bold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 truncate">{currentUserEmail}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{isAdmin ? 'Admin' : 'Active Account'}</p>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer hover:scale-105 shrink-0"
                    title={isTamil ? 'வெளியேறு' : 'Log Out'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
