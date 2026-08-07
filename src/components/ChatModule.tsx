import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Code2,
  FileSpreadsheet,
  Zap,
  Globe,
  Trash2,
  Paperclip,
  Wand2,
  X,
  Download,
  Mic,
  MicOff,
  Cpu,
  Compass,
  Plus,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Eye,
  ArrowDown,
  Pencil,
  RotateCcw,
  History,
  Clock,
  Search,
  MessageSquare,
  ChevronRight,
  Maximize2,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { ChatMessage, ChatSession, LanguageCode, ThemeType } from '../types';
import { safeFetchJson } from '../lib/api';
import { speakNaturalText, stopSpeech } from '../lib/tts';
import { AiOrb } from './AiOrb';

interface ChatModuleProps {
  language: LanguageCode;
  currentUserEmail?: string;
  currentTheme?: ThemeType;
}

interface InteractiveWebsiteBlockProps {
  htmlCode: string;
  sectionKey: string;
  isTamil: boolean;
  onFullscreen: (html: string) => void;
  onOpenSidePreview?: (html: string) => void;
  onCopy: (code: string) => void;
  isCopied: boolean;
}

const InteractiveWebsiteBlock: React.FC<InteractiveWebsiteBlockProps> = ({
  htmlCode,
  sectionKey,
  isTamil,
  onFullscreen,
  onOpenSidePreview,
  onCopy,
  isCopied,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const getViewportClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px] h-[540px] mx-auto shadow-2xl rounded-2xl border-4 border-slate-800';
      case 'tablet':
        return 'max-w-[768px] h-[540px] mx-auto shadow-xl rounded-xl border-2 border-slate-800';
      default:
        return 'w-full h-[540px] rounded-xl border border-slate-800';
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swatea-website-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Interactive Website Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
            <Globe className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>{isTamil ? '🌐 நேரலை இணையதளம்' : '🌐 Live Interactive Website'}</span>
          </div>

          {onOpenSidePreview && (
            <button
              onClick={() => onOpenSidePreview(htmlCode)}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-extrabold text-[11px] transition-all flex items-center gap-1 shadow-md"
              title={isTamil ? 'பக்கவாட்டில் நேரலை திரை திறக்கவும்' : 'Open Edge Side-by-Side Panel'}
            >
              <Globe className="w-3.5 h-3.5 text-slate-950" />
              <span>{isTamil ? 'பக்கவாட்டுத் திரை (Side Panel)' : 'Open Side Panel'}</span>
            </button>
          )}

          {/* Viewport Toggles */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1 rounded transition-colors ${viewport === 'desktop' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1 rounded transition-colors ${viewport === 'tablet' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1 rounded transition-colors ${viewport === 'mobile' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors flex items-center gap-1 ${
                activeTab === 'preview' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isTamil ? 'முன்னோட்டம்' : 'Preview'}</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors flex items-center gap-1 ${
                activeTab === 'code' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{isTamil ? 'மூலக்குறியீடு' : 'Code'}</span>
            </button>
          </div>

          <button
            onClick={() => onFullscreen(htmlCode)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
            title={isTamil ? 'முழுத்திரையில் காண்க' : 'Open Fullscreen Website'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors"
            title={isTamil ? 'HTML பதிவிறக்கு' : 'Download HTML File'}
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => onCopy(htmlCode)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
            title="Copy Code"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Frame Body */}
      <div className="p-2 bg-slate-950">
        {activeTab === 'preview' ? (
          <div className="transition-all duration-300 bg-slate-900 rounded-xl overflow-hidden p-1 shadow-inner">
            <iframe
              srcDoc={htmlCode}
              title="Swatea AI Live Interactive Website"
              className={`bg-white transition-all duration-300 ${getViewportClass()}`}
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            />
          </div>
        ) : (
          <pre className="p-4 overflow-x-auto text-xs text-emerald-300 leading-relaxed font-mono max-h-[500px]">
            <code>{htmlCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export const ChatModule: React.FC<ChatModuleProps> = ({
  language,
  currentUserEmail = 'guest@swatea.ai',
  currentTheme = 'chatgpt',
}) => {
  const isTamil = language === 'ta';
  const isLightMode = currentTheme === 'chatgpt' || currentTheme === 'light';
  const userKey = currentUserEmail.toLowerCase().trim();
  const storageKey = `swatea_chats_${userKey}`;
  const historyKey = `swatea_history_${userKey}`;
  const activeSessionKey = `swatea_active_session_${userKey}`;

  // Helper to deduplicate chat sessions by ID and content fingerprint
  const deduplicateSessions = (sessions: ChatSession[]): ChatSession[] => {
    const seenIds = new Set<string>();
    const seenFingerprints = new Set<string>();
    const result: ChatSession[] = [];

    for (const session of sessions) {
      if (!session || !session.id) continue;
      if (seenIds.has(session.id)) continue;

      const msgs = session.messages || [];
      const firstUserMsg = msgs.find((m) => m.role === 'user')?.content || '';
      const lastMsg = msgs[msgs.length - 1]?.content || '';
      const fingerprint = `${session.title}_${msgs.length}_${firstUserMsg.slice(0, 50)}_${lastMsg.slice(0, 50)}`;

      if (msgs.length > 0 && seenFingerprints.has(fingerprint)) {
        continue;
      }

      seenIds.add(session.id);
      if (msgs.length > 0) {
        seenFingerprints.add(fingerprint);
      }
      result.push(session);
    }
    return result;
  };

  // Active session ID initialized from localStorage if available
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(activeSessionKey);
      if (savedId) return savedId;
    } catch (err) {
      console.error('Error loading active session id:', err);
    }
    return `session_${Date.now()}`;
  });

  // Input & UI States
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<'general' | 'coder' | 'analyst' | 'workflow' | 'image'>('general');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.6-flash');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string; type?: string; isImage?: boolean } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [fullscreenHtml, setFullscreenHtml] = useState<string | null>(null);

  // Side-by-Side Edge Live Website Preview Panel State
  const [sidePreviewHtml, setSidePreviewHtml] = useState<string | null>(null);
  const [isSidePreviewOpen, setIsSidePreviewOpen] = useState(false);
  const [sidePreviewViewport, setSidePreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [sideRefactorInput, setSideRefactorInput] = useState('');
  const [sideRefactorLoading, setSideRefactorLoading] = useState(false);

  // Message Editing & Resending state
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Saved Chat Sessions Archive with auto-deduplication
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = deduplicateSessions(parsed);
          if (clean.length !== parsed.length) {
            safeStorageSet(historyKey, clean);
          }
          return clean;
        }
      }
    } catch (err) {
      console.error('Error loading chat history sessions:', err);
    }
    return [];
  });

  // History Drawer & Search
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Speech synthesis states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const defaultWelcomeMessage: ChatMessage = useMemo(() => ({
    id: 'welcome',
    role: 'assistant',
    content: isTamil
      ? `வணக்கம்! நான் **ஸ்வாதியா ஏஐ (Swatea AI)**. உங்களுக்கு எவ்வாறு உதவ முடியும்?`
      : `Welcome! I am **Swatea AI**. How can I assist you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }), [isTamil]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading stored chats:', err);
    }
    return [defaultWelcomeMessage];
  });

  // Re-load chats whenever user email changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (err) {
      console.error('Error loading stored chats:', err);
    }
    setMessages([defaultWelcomeMessage]);
  }, [currentUserEmail, storageKey, defaultWelcomeMessage]);

  // Helper to sanitize chat sessions and messages for localStorage without exceeding browser quota
  const sanitizeMessages = (msgs: ChatMessage[], maxLen = 2000): ChatMessage[] => {
    return msgs.map((m) => {
      let content = m.content || '';
      // Strip base64 data URLs
      if (content.includes('data:')) {
        content = content.replace(/data:[^;]+;base64,[^"'\s\)]+/g, '[Media Data]');
      }
      return {
        ...m,
        content: content.length > maxLen ? content.substring(0, maxLen) + '... [Truncated]' : content,
        imageUrl: m.imageUrl && m.imageUrl.startsWith('data:') ? undefined : m.imageUrl,
      };
    });
  };

  const safeStorageSet = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(`[LocalStorage Quota Safeguard] Storage quota reached for ${key}. Applying compact compression...`);
      try {
        // First fallback: Aggressively compact the data
        let compacted: any = data;
        if (Array.isArray(data)) {
          if (data.length > 0 && 'messages' in data[0]) {
            // It's an array of ChatSession
            compacted = data.slice(0, 5).map((session: ChatSession) => ({
              ...session,
              messages: sanitizeMessages(session.messages.slice(-5), 300),
            }));
          } else {
            // It's an array of ChatMessage
            compacted = sanitizeMessages(data.slice(-10), 500);
          }
        }
        localStorage.setItem(key, JSON.stringify(compacted));
      } catch (retryErr) {
        // Second fallback: Clear stale keys and try again with minimal data
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k !== key && (k.startsWith('swatea_') || k.startsWith('temp_'))) {
              keysToRemove.push(k);
            }
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));

          // Try storing minimal representation
          if (Array.isArray(data) && data.length > 0 && 'messages' in data[0]) {
            const minimalSessions = data.slice(0, 3).map((s: ChatSession) => ({
              ...s,
              messages: sanitizeMessages(s.messages.slice(-3), 200),
            }));
            localStorage.setItem(key, JSON.stringify(minimalSessions));
          } else if (Array.isArray(data)) {
            localStorage.setItem(key, JSON.stringify(sanitizeMessages(data.slice(-5), 300)));
          }
        } catch (finalErr) {
          // Gracefully degrade: keep session in RAM without throwing error
          console.warn('[LocalStorage] Memory quota exceeded. Session will remain active in current browser tab.');
        }
      }
    }
  };

  // Auto-save messages and sync active session ID to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(activeSessionKey, activeSessionId);
    } catch (e) {}

    if (messages.length > 0) {
      const sanitizedCurrent = sanitizeMessages(messages);
      safeStorageSet(storageKey, sanitizedCurrent);
    }

    // Auto-archive thread into saved sessions history if user has chatted and streaming is finished
    const hasUserMsg = messages.some((m) => m.role === 'user');
    if (!hasUserMsg || loading) return;

    const firstUserMsg = messages.find((m) => m.role === 'user')?.content || 'Swatea AI Conversation';
    const cleanTitle = firstUserMsg.replace(/\s*📎 \[Attached:.*\]$/, '').trim();
    const sessionTitle = cleanTitle.length > 38 ? cleanTitle.substring(0, 38) + '...' : cleanTitle;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSavedSessions((prev) => {
      const sanitizedCurrentMsgs = sanitizeMessages(messages);
      let idx = prev.findIndex((s) => s.id === activeSessionId);

      // Fallback deduplication: check if an identical conversation is already saved
      if (idx === -1) {
        const firstUserContent = sanitizedCurrentMsgs.find((m) => m.role === 'user')?.content || '';
        const lastContent = sanitizedCurrentMsgs[sanitizedCurrentMsgs.length - 1]?.content || '';

        idx = prev.findIndex((s) => {
          if (!s.messages || s.messages.length !== sanitizedCurrentMsgs.length) return false;
          const sFirstUser = s.messages.find((m) => m.role === 'user')?.content || '';
          const sLast = s.messages[s.messages.length - 1]?.content || '';
          return sFirstUser === firstUserContent && sLast === lastContent;
        });

        if (idx >= 0) {
          setActiveSessionId(prev[idx].id);
        }
      }

      if (idx >= 0) {
        const existing = prev[idx];
        if (
          existing.messages.length === sanitizedCurrentMsgs.length &&
          existing.messages[existing.messages.length - 1]?.content ===
            sanitizedCurrentMsgs[sanitizedCurrentMsgs.length - 1]?.content
        ) {
          return prev; // Same content, prevent duplicate update
        }

        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          title: updated[idx].title || sessionTitle,
          updatedAt: nowStr,
          messages: sanitizedCurrentMsgs,
        };
        const clean = deduplicateSessions(updated).slice(0, 15);
        safeStorageSet(historyKey, clean);
        return clean;
      } else {
        const newSession: ChatSession = {
          id: activeSessionId,
          title: sessionTitle,
          createdAt: nowStr,
          updatedAt: nowStr,
          messages: sanitizedCurrentMsgs,
        };
        const updated = [newSession, ...prev];
        const clean = deduplicateSessions(updated).slice(0, 15);
        safeStorageSet(historyKey, clean);
        return clean;
      }
    });
  }, [messages, storageKey, activeSessionId, historyKey, activeSessionKey, loading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isTamil ? 'ta-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isTamil]);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert(
        isTamil
          ? 'உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.'
          : 'Voice dictation is not supported in this browser.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const starterPrompts = [
    {
      icon: <ImageIcon className="w-5 h-5 text-rose-400" />,
      title: isTamil ? '🎨 படம் வரைதல் (AI Image)' : '🎨 AI Image Generator',
      prompt: isTamil ? 'வரைந்து தா: ஒரு அழகான தாமரை மலர் மற்றும் அமைதியான குளம்' : 'Generate an image of a serene lotus pond surrounded by glowing cyan crystals at dusk',
    },
    {
      icon: <Code2 className="w-5 h-5 text-sky-400" />,
      title: isTamil ? '💻 REST API கோடிங்' : '💻 Express REST API',
      prompt: isTamil ? 'ஒரு Express + TypeScript REST API உருவாக்கு' : 'Create an Express + TypeScript REST API microservice',
    },
    {
      icon: <Globe className="w-5 h-5 text-amber-400" />,
      title: isTamil ? '🌐 ஆழமான தேடல்' : '🌐 Deep Web Search',
      prompt: isTamil ? '2026 ஏஐ தொழில்நுட்ப மாற்றங்களை தேடித் தருக' : 'Summarize key enterprise AI architectural trends in 2026',
    },
    {
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      title: isTamil ? '⚡ தானியங்கி வொர்க்ஃப்ளோ' : '⚡ Agent Workflow',
      prompt: isTamil ? 'வாடிக்கையாளர் ஆதரவு தானியங்கி ஏஜென்ட் திட்டம் அமை' : 'Design an automated customer support agent workflow',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setAttachedFile({
        name: file.name,
        content,
        type: file.type,
        isImage: isImg,
      });
    };

    if (isImg) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const checkImageGenIntent = (text: string) => {
    if (persona === 'image') return true;
    const lower = text.toLowerCase();
    return (
      lower.startsWith('image:') ||
      lower.startsWith('/image') ||
      lower.includes('generate image') ||
      lower.includes('create image') ||
      lower.includes('draw a') ||
      lower.includes('draw an') ||
      lower.includes('picture of') ||
      lower.includes('photo of') ||
      lower.includes('படத்தை உருவாக்கு') ||
      lower.includes('படம் வரை') ||
      lower.includes('வரைந்து தா') ||
      lower.includes('படம் உருவாக்கு') ||
      lower.includes('வரையவும்') ||
      lower.includes('genarat') ||
      lower.includes('generat') ||
      lower.includes('draw') ||
      lower.includes('வரைந்து') ||
      lower.includes('படம்') ||
      lower.includes('போட்டோ') ||
      lower.includes('illustration') ||
      lower.includes('poster') ||
      lower.includes('logo')
    );
  };

  const checkWebsiteGenIntent = (text: string) => {
    const lower = text.toLowerCase();
    if (persona === 'coder' && (lower.includes('website') || lower.includes('webpage') || lower.includes('html') || lower.includes('site'))) return true;
    return (
      lower.includes('website') ||
      lower.includes('websait') ||
      lower.includes('web sait') ||
      lower.includes('web site') ||
      lower.includes('webpage') ||
      lower.includes('landing page') ||
      lower.includes('வெப்சைட்') ||
      lower.includes('இணையதளம்') ||
      lower.includes('build site') ||
      lower.includes('create site') ||
      lower.includes('design site') ||
      lower.includes('app ui') ||
      lower.includes('web app') ||
      lower.includes('saat creat') ||
      lower.includes('site creat') ||
      lower.includes('websait creat') ||
      lower.includes('websait build') ||
      lower.includes('build website') ||
      lower.includes('create website') ||
      lower.includes('design website') ||
      lower.includes('website உருவாக்கு') ||
      lower.includes('website பண்ணு') ||
      lower.includes('website செய்') ||
      lower.includes('full website') ||
      lower.includes('wrbsait')
    );
  };

  const streamBotResponse = (
    fullText: string,
    botMsgId: string,
    extraProps: Partial<ChatMessage> = {}
  ) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Split full text into lines/chunks for top-down line-by-line rendering
    const rawLines = fullText.split('\n');
    const chunks: string[] = [];
    
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (line.length > 70) {
        const words = line.split(' ');
        let currentChunk = '';
        for (const word of words) {
          if ((currentChunk + ' ' + word).length > 40) {
            chunks.push(currentChunk + ' ');
            currentChunk = word;
          } else {
            currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
          }
        }
        if (currentChunk) chunks.push(currentChunk);
        if (i < rawLines.length - 1) chunks.push('\n');
      } else {
        chunks.push(line + (i < rawLines.length - 1 ? '\n' : ''));
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        role: 'assistant',
        content: '',
        timestamp,
        ...extraProps,
      },
    ]);

    let accumulatedText = '';
    let index = 0;

    const interval = setInterval(() => {
      if (index < chunks.length) {
        // Render 2 chunks per tick for ultra-fast response speed
        accumulatedText += chunks[index] + (chunks[index + 1] || '');
        index += 2;
        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulatedText } : m))
        );
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, content: fullText } : m))
        );
        setLoading(false);
      }
    }, 12);
  };

  const handleSend = async (e?: React.FormEvent, customPrompt?: string, baseMessagesList?: ChatMessage[]) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const activeBase = baseMessagesList || messages;
    const currentAttached = attachedFile;
    const isImageGen = checkImageGenIntent(promptToSend);

    let fullPrompt = promptToSend;
    if (currentAttached && !currentAttached.isImage) {
      fullPrompt = `[Attached File: ${currentAttached.name}]\n\nFile Content:\n${currentAttached.content}\n\nUser Question: ${promptToSend}`;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptToSend + (currentAttached ? ` 📎 [Attached: ${currentAttached.name}]` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userImage: currentAttached?.isImage ? currentAttached.content : undefined,
    };

    const updatedMessages = [...activeBase, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setAttachedFile(null);
    setLoading(true);

    const customApiKey = localStorage.getItem('swatea_custom_api_key') || '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (customApiKey) {
      headers['x-custom-api-key'] = customApiKey;
    }

    try {
      if (isImageGen) {
        // --- 1. AI Image Generation Route ---
        const cleanPrompt = promptToSend.replace(/^(\/image|image:|வரைந்து தா:|படத்தை உருவாக்கு:)/i, '').trim();
        const data = await safeFetchJson('/api/generate-image', {
          method: 'POST',
          body: JSON.stringify({ prompt: cleanPrompt || promptToSend }),
        });

        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: isTamil
            ? `🎨 **ஸ்வாதியா ஏஐ படம் உருவாக்கப்பட்டது!**\n\nவினவல்: *"${cleanPrompt || promptToSend}"*`
            : `🎨 **Swatea AI Image Generated Successfully!**\n\nPrompt: *"${cleanPrompt || promptToSend}"*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          persona: 'image',
          imageUrl: data.imageUrl,
        };
        setMessages((prev) => [...prev, botMsg]);
        setLoading(false);
      } else if (checkWebsiteGenIntent(promptToSend)) {
        // --- 2. AI Full Interactive Website Generation Route ---
        const data = await safeFetchJson('/api/website', {
          method: 'POST',
          body: JSON.stringify({
            prompt: promptToSend,
            language: isTamil ? 'Tamil' : 'English',
          }),
        });

        const htmlCode = data.html || '<!DOCTYPE html><html><body><h1>Swatea AI Website</h1></body></html>';
        
        // Auto-open Side-by-Side Edge Live Website Preview Panel
        setSidePreviewHtml(htmlCode);
        setIsSidePreviewOpen(true);

        const websiteReply = isTamil
          ? `🌐 **ஸ்வாதியா ஏஐ நேரலை இணையதளம் வெற்றிகரமாக உருவாக்கப்பட்டது!**\n\nவலது புறத்தில் நேரலை முன்னோட்டம் திறக்கப்பட்டுள்ளது (Edge Live Web Studio). இதோ உங்களுக்கான மூலக்குறியீடு:\n\n\`\`\`html\n${htmlCode}\n\`\`\``
          : `🌐 **Swatea AI Full Interactive Website Built Successfully!**\n\nThe live website is now running in the Edge Side-by-Side panel on the right. Here is your full source code:\n\n\`\`\`html\n${htmlCode}\n\`\`\``;

        streamBotResponse(websiteReply, (Date.now() + 1).toString(), { persona: 'coder' });
      } else if (currentAttached?.isImage) {
        // --- 2. Vision AI Analysis for Uploaded Images ---
        const data = await safeFetchJson('/api/vision', {
          method: 'POST',
          body: JSON.stringify({
            imageBase64: currentAttached.content,
            mimeType: currentAttached.type || 'image/png',
            prompt: promptToSend,
          }),
        });

        streamBotResponse(data.analysis || '', (Date.now() + 1).toString(), { persona: 'analyst' });
      } else {
        // --- 3. Standard Text / Code / General Question Answering ---
        const data = await safeFetchJson('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            message: fullPrompt,
            history: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
            persona,
            model: selectedModel,
            useWebSearch,
            language: isTamil ? 'Tamil' : 'English',
          }),
        });

        streamBotResponse(data.reply || '', (Date.now() + 1).toString(), {
          persona,
          sources: data.sources,
        });
      }
    } catch (err: any) {
      const errorText = `⚠️ **${isTamil ? 'பிழை' : 'Error'}:** ${err?.message || 'Failed to connect to Swatea AI Server.'}`;
      streamBotResponse(errorText, (Date.now() + 1).toString());
    }
  };

  // --- Message Edit & Resend Handlers ---
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    const cleanContent = msg.content.replace(/\s*📎 \[Attached:.*\]$/, '');
    setEditingText(cleanContent);
  };

  const handleSaveAndResendEdit = async (msgId: string) => {
    if (!editingText.trim() || loading) return;

    const msgIndex = messages.findIndex((m) => m.id === msgId);
    if (msgIndex === -1) return;

    // Slice history up to before this message
    const sliced = messages.slice(0, msgIndex);

    const promptToResend = editingText.trim();
    setEditingMsgId(null);
    setEditingText('');

    await handleSend(undefined, promptToResend, sliced);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedContent = (content: string, msgId: string) => {
    // Split into code blocks and normal text blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-2.5 font-sans text-slate-200 select-text cursor-text selection:bg-amber-500/30 selection:text-amber-100 leading-relaxed">
        {parts.map((part, partIdx) => {
          if (!part) return null;

          // Code block
          if (part.startsWith('```') && part.endsWith('```')) {
            const inner = part.slice(3, -3).trim();
            const lines = inner.split('\n');
            let lang = 'code';
            let codeContent = inner;
            if (lines.length > 0 && lines[0].trim().match(/^[a-zA-Z0-9_#-]+$/)) {
              lang = lines[0].trim().toLowerCase();
              codeContent = lines.slice(1).join('\n');
            }
            const sectionKey = `${msgId}_code_${partIdx}`;
            const isCopied = copiedId === sectionKey;

            const isHtmlWeb =
              lang === 'html' ||
              codeContent.toLowerCase().includes('<!doctype html>') ||
              codeContent.toLowerCase().includes('<html');

            if (isHtmlWeb) {
              return (
                <InteractiveWebsiteBlock
                  key={sectionKey}
                  htmlCode={codeContent}
                  sectionKey={sectionKey}
                  isTamil={isTamil}
                  onFullscreen={(html) => setFullscreenHtml(html)}
                  onOpenSidePreview={(html) => {
                    setSidePreviewHtml(html);
                    setIsSidePreviewOpen(true);
                  }}
                  onCopy={(code) => handleCopy(code, sectionKey)}
                  isCopied={isCopied}
                />
              );
            }

            return (
              <div key={sectionKey} className="group/code relative my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl font-mono">
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-bold text-amber-400 uppercase tracking-wider font-mono">{lang}</span>
                  <button
                    onClick={() => handleCopy(codeContent, sectionKey)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-sans font-semibold transition-colors shadow-sm"
                    title={isTamil ? 'கோடு பிரதியை எடு' : 'Copy Code Block'}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{isCopied ? (isTamil ? 'காப்பிட்!' : 'Copied!') : (isTamil ? 'கோடு காப்பி' : 'Copy Code')}</span>
                  </button>
                </div>
                <pre className="p-3.5 overflow-x-auto text-xs text-emerald-300 leading-relaxed whitespace-pre font-mono select-text cursor-text">
                  <code>{codeContent}</code>
                </pre>
              </div>
            );
          }

          // Paragraphs with inline image support and rich markdown formatting
          const parseInlineMarkdown = (text: string): React.ReactNode[] => {
            const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
            return tokens.map((token, idx) => {
              if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
                return <strong key={idx} className="font-bold text-cyan-200">{token.slice(2, -2)}</strong>;
              }
              if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
                return <code key={idx} className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-cyan-300 text-[11px]">{token.slice(1, -1)}</code>;
              }
              if (token.startsWith('*') && token.endsWith('*') && token.length >= 2 && !token.startsWith('**')) {
                return <em key={idx} className="italic text-slate-300">{token.slice(1, -1)}</em>;
              }
              return token;
            });
          };

          const renderStyledLine = (line: string, lineKey: string): React.ReactNode => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lineKey} className="h-1" />;

            if (trimmed.startsWith('####')) {
              return (
                <h4 key={lineKey} className="text-xs sm:text-sm font-bold text-cyan-300 mt-2 mb-1 font-mono">
                  {parseInlineMarkdown(trimmed.replace(/^####\s*/, ''))}
                </h4>
              );
            }
            if (trimmed.startsWith('###')) {
              return (
                <h3 key={lineKey} className="text-sm sm:text-base font-black text-cyan-300 mt-2.5 mb-1 font-mono tracking-tight">
                  {parseInlineMarkdown(trimmed.replace(/^###\s*/, ''))}
                </h3>
              );
            }
            if (trimmed.startsWith('##')) {
              return (
                <h2 key={lineKey} className="text-base sm:text-lg font-black text-white mt-3 mb-1.5 font-mono tracking-tight border-b border-white/10 pb-1">
                  {parseInlineMarkdown(trimmed.replace(/^##\s*/, ''))}
                </h2>
              );
            }
            if (trimmed.startsWith('# ')) {
              return (
                <h1 key={lineKey} className="text-lg sm:text-xl font-black text-cyan-200 mt-3.5 mb-2 font-mono">
                  {parseInlineMarkdown(trimmed.replace(/^#\s*/, ''))}
                </h1>
              );
            }

            if (/^[-*•]\s+/.test(trimmed)) {
              const itemText = trimmed.replace(/^[-*•]\s+/, '');
              return (
                <div key={lineKey} className="flex items-start gap-2 my-1 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {parseInlineMarkdown(itemText)}
                  </span>
                </div>
              );
            }

            if (/^\d+\.\s+/.test(trimmed)) {
              const match = trimmed.match(/^(\d+\.)\s+(.*)$/);
              if (match) {
                return (
                  <div key={lineKey} className="flex items-start gap-2 my-1 pl-1">
                    <span className="font-mono font-bold text-cyan-400 text-xs shrink-0 mt-0.5">{match[1]}</span>
                    <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {parseInlineMarkdown(match[2])}
                    </span>
                  </div>
                );
              }
            }

            return (
              <div key={lineKey} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {parseInlineMarkdown(line)}
              </div>
            );
          };

          const paragraphs = part.split(/\n\n+/);
          return (
            <div key={`part_${partIdx}`} className="space-y-2">
              {paragraphs.map((para, paraIdx) => {
                if (!para.trim()) return null;
                const sectionKey = `${msgId}_para_${partIdx}_${paraIdx}`;

                const lines = para.split('\n');
                return (
                  <div key={sectionKey} className="space-y-1 font-sans select-text cursor-text">
                    {lines.map((line, lIdx) => renderStyledLine(line, `${sectionKey}_line_${lIdx}`))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const stopSpeaking = () => {
    stopSpeech();
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  };

  const handleSpeak = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      alert(isTamil ? 'உங்கள் உலாவி குரல் வெளியீட்டை ஆதரிக்கவில்லை.' : 'Text to Speech not supported in this browser.');
      return;
    }

    // Toggle OFF if already speaking this exact message
    if (isSpeaking && speakingMsgId === msgId) {
      stopSpeaking();
      return;
    }

    // Stop previous speech
    stopSpeaking();

    speakNaturalText(text, {
      isTamilUI: isTamil,
      onStart: () => {
        setIsSpeaking(true);
        setSpeakingMsgId(msgId);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      },
    });
  };

  const clearChat = () => {
    stopSpeaking();
    startNewChat();
  };

  const startNewChat = () => {
    stopSpeaking();
    const newSessionId = `session_${Date.now()}`;
    setActiveSessionId(newSessionId);
    setMessages([defaultWelcomeMessage]);
    safeStorageSet(storageKey, [defaultWelcomeMessage]);
    try {
      localStorage.setItem(activeSessionKey, newSessionId);
    } catch (e) {}
  };

  const loadSession = (session: ChatSession) => {
    stopSpeaking();
    setActiveSessionId(session.id);
    setMessages(session.messages);
    safeStorageSet(storageKey, session.messages);
    try {
      localStorage.setItem(activeSessionKey, session.id);
    } catch (e) {}
    setShowHistoryDrawer(false);
  };

  const deleteSession = (sessionId: string) => {
    stopSpeaking();
    setSavedSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      const clean = deduplicateSessions(updated);
      safeStorageSet(historyKey, clean);
      return clean;
    });

    if (activeSessionId === sessionId) {
      startNewChat();
    }
  };

  const clearAllHistory = () => {
    stopSpeaking();
    setSavedSessions([]);
    try {
      localStorage.removeItem(historyKey);
      localStorage.removeItem(activeSessionKey);
    } catch (err) {
      console.error('Error clearing history:', err);
    }
    startNewChat();
  };

  const exportChat = () => {
    const textContent = messages
      .map((m) => `### ${m.role === 'user' ? 'User' : 'Swatea AI'} (${m.timestamp})\n\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([textContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swatea-chat-export-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const magicEnhancePrompt = () => {
    if (!input.trim()) {
      setInput(
        isTamil
          ? 'நிறுவனத் தேவைகளுக்கான பாதுகாப்பான TypeScript மைக்ரோசர்வீஸ் ஆர்கிடெக்ச்சர் தயாரித்து தா.'
          : 'Provide a detailed, enterprise-grade microservice architecture with complete TypeScript types, error bounds, and caching strategy.'
      );
      return;
    }
    const enhanced = isTamil
      ? `${input.trim()} - தயவுசெய்து இதை நிறுவன பயன்பாட்டிற்கு ஏற்றவாறு, தெளிவான படிகள், டைப்-சேஃபிட்டி (TypeScript) மற்றும் செயல்பாட்டு விரிவுரையுடன் விளக்கு.`
      : `Comprehensive Enterprise Request: ${input.trim()}. Please provide an in-depth analysis, structured step-by-step framework, production-ready code blocks with type safety, and potential operational risk considerations.`;
    setInput(enhanced);
  };

  return (
    <div className={`h-full flex flex-col rounded-2xl border overflow-hidden relative transition-colors duration-300 ${
      isLightMode
        ? 'bg-white border-slate-200/90 text-slate-900 shadow-xl'
        : 'glass-panel border-slate-800/80 text-slate-100 shadow-2xl'
    }`}>
      {/* Top Header / Model Switcher Bar */}
      <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 backdrop-blur-md transition-colors ${
        isLightMode
          ? 'bg-slate-50/90 border-slate-200 text-slate-800'
          : 'bg-slate-900/80 border-slate-800/80 text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-md ${
              isLightMode ? 'bg-slate-900' : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600'
            }`}>
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <span className={`font-extrabold text-sm tracking-wide ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              Swatea AI Studio
            </span>
          </div>

          {/* AI Model Switcher */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer shadow-xs max-w-[260px] sm:max-w-none truncate border ${
              isLightMode
                ? 'bg-white border-slate-300 text-slate-800 focus:border-slate-400'
                : 'bg-slate-950 border-slate-800 text-emerald-300 font-mono focus:border-emerald-500'
            }`}
          >
            <option value="gemini-3.6-flash">⚡ Gemini 3.6 Flash</option>
            <option value="gemini-3.6-pro">🔬 Gemini 3.6 Pro</option>
            <option value="gemini-3.6-vision">👁️ Gemini 3.6 Vision</option>
            <option value="gpt-4o">🤖 OpenAI GPT-4o</option>
            <option value="gpt-4o-mini">⚡ OpenAI GPT-4o Mini</option>
            <option value="claude-3-5-sonnet">🎨 Claude 3.5 Sonnet</option>
            <option value="claude-3-opus">🏛️ Claude 3 Opus</option>
            <option value="deepseek-r1">🚀 DeepSeek R1</option>
            <option value="llama-3-3-70b">🦙 Meta Llama 3.3 70B</option>
            <option value="mistral-large">🌪️ Mistral Large 2</option>
          </select>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className={`px-2.5 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1.5 text-xs shadow-xs ${
              showHistoryDrawer
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : isLightMode
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-amber-500/50'
            }`}
            title={isTamil ? 'சாட் வரலாறு' : 'Chat History Archive'}
          >
            <History className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{isTamil ? 'வரலாறு' : 'History'}</span>
            {savedSessions.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {savedSessions.length}
              </span>
            )}
          </button>

          <button
            onClick={startNewChat}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 text-xs shadow-xs ${
              isLightMode
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
            title={isTamil ? 'புதிய உரையாடல்' : 'Start New Chat'}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">{isTamil ? 'புதிய சாட்' : 'New Chat'}</span>
          </button>
          <button
            onClick={clearChat}
            className={`p-1.5 rounded-lg transition-colors ${
              isLightMode
                ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            }`}
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Speaking Status Banner */}
      {isSpeaking && (
        <div className="bg-gradient-to-r from-indigo-950 via-rose-950 to-slate-950 border-b border-rose-500/40 px-4 py-2 flex items-center justify-between text-xs text-rose-200 shrink-0 z-10 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
            <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="font-semibold">
              {isTamil ? '🔊 AI பதிலைப் உரக்கப் படிக்கிறது...' : '🔊 Swatea AI is reading response aloud...'}
            </span>
          </div>
          <button
            onClick={stopSpeaking}
            className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center gap-1 shadow-md transition-all text-xs"
            title={isTamil ? 'குரல் வாசிப்பை நிறுத்து' : 'Stop Reading'}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>{isTamil ? '⏹️ நிறுத்து' : '⏹️ Stop Reading'}</span>
          </button>
        </div>
      )}

      {/* Main Container Area - Flex Split Row for Chat + Edge Live Web Studio */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Chat Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Main Stream Area (Scrollable Messages Container) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* ChatGPT Style Empty State Greeting */}
              {messages.length <= 1 && (
                <div className="py-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[320px]">
                  <div className="my-1">
                    <AiOrb state="idle" size="lg" />
                  </div>
                  <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                    isLightMode
                      ? 'text-slate-900'
                      : 'text-white bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent'
                  }`}>
                    {isTamil ? 'நீங்கள் தயார் என்றால் தொடங்குங்கள்.' : 'Ready when you are.'}
                  </h1>

                  {/* ChatGPT Style Prompt Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto pt-2">
                    <button
                      type="button"
                      onClick={() => setInput(isTamil ? 'எனக்கு ஒரு புதிய படம் உருவாக்கித் தா' : 'Create an image of ')}
                      className={`px-3.5 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isLightMode
                          ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-sky-500" />
                      <span>{isTamil ? 'படம் உருவாக்கு' : 'Create an image'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInput(isTamil ? 'எனக்கு ஒரு கட்டுரை அல்லது கவிதை எழுது' : 'Write or edit ')}
                      className={`px-3.5 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isLightMode
                          ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      }`}
                    >
                      <Pencil className="w-4 h-4 text-emerald-500" />
                      <span>{isTamil ? 'எழுது அல்லது திருத்து' : 'Write or edit'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUseWebSearch(true);
                        setInput(isTamil ? 'இன்றைய முக்கிய செய்திகள் என்ன?' : 'Search the web for ');
                      }}
                      className={`px-3.5 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isLightMode
                          ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-amber-500" />
                      <span>{isTamil ? 'இணையத்தில் தேடு' : 'Search the web'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Stream */}
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'ml-auto flex-row-reverse max-w-xl' : 'max-w-3xl'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-md ${
                        isUser
                          ? isLightMode
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                          : isLightMode
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 text-white'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-amber-100" />}
                    </div>

                    {/* Message Box */}
                    <div
                      className={`group relative rounded-2xl p-4 text-xs sm:text-sm leading-relaxed border ${
                        isUser
                          ? isLightMode
                            ? 'bg-slate-100 border-slate-200 text-slate-900 rounded-tr-none'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-50 rounded-tr-none'
                          : isLightMode
                          ? 'bg-white border-slate-200/90 text-slate-800 rounded-tl-none shadow-sm'
                          : 'bg-slate-900/90 border-slate-800/90 text-slate-200 rounded-tl-none shadow-xl'
                      }`}
                    >
                      {/* Message Meta */}
                      <div className={`flex items-center justify-between gap-4 mb-1.5 text-[10px] border-b pb-1 ${
                        isLightMode ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-slate-800/60'
                      }`}>
                        <span className={`font-bold font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                          {isUser ? (isTamil ? 'நீங்கள்' : 'You') : 'Swatea AI'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* User Uploaded Image Preview */}
                      {msg.userImage && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 max-w-xs shadow-md">
                          <img
                            src={msg.userImage}
                            alt="Uploaded preview"
                            className="w-full h-auto object-cover max-h-56 cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => setPreviewModalImage(msg.userImage || null)}
                          />
                        </div>
                      )}

                      {/* Body Content or Inline Editor */}
                      {isUser && editingMsgId === msg.id ? (
                        <div className="space-y-2 py-1">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveAndResendEdit(msg.id);
                              }
                            }}
                            className="w-full bg-slate-950 border border-amber-500/80 rounded-xl p-2.5 text-xs text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-y min-h-[60px]"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex items-center justify-end gap-2 text-[11px]">
                            <button
                              onClick={() => {
                                setEditingMsgId(null);
                                setEditingText('');
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                            >
                              {isTamil ? 'ரத்து' : 'Cancel'}
                            </button>
                            <button
                              onClick={() => handleSaveAndResendEdit(msg.id)}
                              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 text-slate-950 font-black rounded-lg flex items-center gap-1 shadow-md transition-all"
                            >
                              <Send className="w-3 h-3 text-slate-950" />
                              <span>{isTamil ? 'சேமி & மீண்டும் அனுப்பு' : 'Save & Resend'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        renderFormattedContent(msg.content, msg.id)
                      )}

                      {/* AI Generated Image Card */}
                      {msg.imageUrl && (
                        <div className="mt-3 bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-2 max-w-md group/img">
                          <div className="relative overflow-hidden rounded-xl">
                            <img
                              src={msg.imageUrl}
                              alt="AI Generated Result"
                              className="w-full h-auto object-contain max-h-80 bg-slate-900 cursor-pointer hover:scale-102 transition-transform duration-300"
                              onClick={() => setPreviewModalImage(msg.imageUrl || null)}
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button
                                onClick={() => setPreviewModalImage(msg.imageUrl || null)}
                                className="p-2 bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl shadow border border-slate-700 font-bold flex items-center gap-1.5 text-xs transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span>{isTamil ? 'பெரிதாக்கு' : 'Zoom'}</span>
                              </button>
                              <a
                                href={msg.imageUrl}
                                download={`swatea-ai-image-${Date.now()}.png`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-slate-900/90 hover:bg-rose-500 hover:text-white text-white rounded-xl shadow border border-slate-700 font-bold flex items-center gap-1.5 text-xs transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                <span>{isTamil ? 'பதிவிறக்கு' : 'Download'}</span>
                              </a>
                            </div>
                          </div>
                          <div className="mt-2 px-2 py-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="text-amber-400 font-bold">✨ Swatea AI Canvas</span>
                            <span className="text-slate-500">1024x1024 / SVG</span>
                          </div>
                        </div>
                      )}

                      {/* User Edit Button on hover */}
                      {isUser && editingMsgId !== msg.id && (
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-700 shadow-md">
                          <button
                            onClick={() => handleStartEdit(msg)}
                            className="p-1 text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1 text-[10px] font-mono"
                            title={isTamil ? 'செய்தியை திருத்தி மீண்டும் அனுப்பு' : 'Edit & Resend Message'}
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isTamil ? 'திருத்து' : 'Edit'}</span>
                          </button>
                        </div>
                      )}

                      {/* Copy & Speak Bottom Toolbar for Assistant */}
                      {!isUser && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-semibold flex items-center gap-1.5 transition-all shadow-sm border border-slate-700/60"
                              title={isTamil ? 'முழு பதிலையும் காப்பி செய்க' : 'Copy Full Response'}
                            >
                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                              <span>
                                {copiedId === msg.id
                                  ? (isTamil ? 'முழுவதும் காப்பிட்!' : 'Full Response Copied!')
                                  : (isTamil ? '📋 முழு பதில் காப்பி' : '📋 Copy Full Response')}
                              </span>
                            </button>

                            <button
                              onClick={() => handleSpeak(msg.content, msg.id)}
                              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all shadow-sm border ${
                                isSpeaking && speakingMsgId === msg.id
                                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 animate-pulse'
                                  : 'bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-300 border-slate-700/60'
                              }`}
                              title={
                                isSpeaking && speakingMsgId === msg.id
                                  ? (isTamil ? 'வாசிப்பை நிறுத்து (Stop Reading)' : 'Stop Reading Aloud')
                                  : (isTamil ? 'குரலில் படிக்கவும் (Read Aloud)' : 'Read Response Aloud')
                              }
                            >
                              {isSpeaking && speakingMsgId === msg.id ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-white animate-bounce" />
                                  <span>{isTamil ? '⏹️ நிறுத்து' : '⏹️ Stop Reading'}</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>{isTamil ? '🔊 குரலில் கேட்க' : '🔊 Listen'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading Animation */}
              {loading && (
                <div className="flex gap-3 max-w-xl">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-amber-300 flex items-center gap-2 shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></div>
                    <span className="font-mono text-[11px] text-slate-400 ml-2">
                      {isTamil ? 'ஸ்வாதியா ஏஐ சிந்திக்கிறது...' : 'Swatea AI is thinking...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* STICKY BOTTOM TYPING DASHBOARD */}
          <div className={`shrink-0 sticky bottom-0 left-0 right-0 p-3 sm:p-4 border-t backdrop-blur-xl z-20 transition-colors ${
            isLightMode
              ? 'bg-white/90 border-slate-200'
              : 'bg-slate-950/80 border-slate-800/80'
          }`}>
            <div className="max-w-3xl mx-auto space-y-2">
              {/* Attached File Preview Badge */}
              {attachedFile && (
                <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono shadow-xs border ${
                  isLightMode
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                }`}>
                  <span className="truncate max-w-[300px]">📎 {attachedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ChatGPT Style Capsule Form */}
              <form
                onSubmit={handleSend}
                className={`rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border transition-all ${
                  isLightMode
                    ? 'bg-white border-slate-300 shadow-lg shadow-slate-200/60 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100'
                    : 'glass-card bg-slate-900/80 border-slate-800 focus-within:border-amber-500/80 shadow-2xl focus-within:shadow-amber-500/10'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.js,.ts,.json,.md,.py,.doc,.csv,image/*"
                />

                {/* Input Field */}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder={
                    isTamil
                      ? 'எதையும் கேளுங்கள் (उदा. "ஒரு REST API உருவாக்கு")...'
                      : 'Ask anything...'
                  }
                  className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none px-3 py-1.5 resize-none max-h-32 min-h-[40px] ${
                    isLightMode
                      ? 'text-slate-900 placeholder-slate-400'
                      : 'text-slate-100 placeholder-slate-500'
                  }`}
                />

                {/* Bottom Controls Bar inside Capsule */}
                <div className={`flex items-center justify-between pt-2 border-t mt-1 px-1 ${
                  isLightMode ? 'border-slate-200' : 'border-slate-800/60'
                }`}>
                  {/* Left Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 rounded-xl transition-all flex items-center justify-center text-xs ${
                        isLightMode
                          ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                      }`}
                      title="Attach File"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <button
                      type="button"
                      onClick={magicEnhancePrompt}
                      className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-mono ${
                        isLightMode
                          ? 'text-purple-600 hover:bg-purple-50'
                          : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
                      }`}
                      title={isTamil ? 'வினவலை மேம்படுத்து' : 'Magic Prompt Enhancer'}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px] font-bold">Enhance</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const defaultPrompt = isTamil
                          ? 'எனக்கு ஒரு நவீன நேரலை இணையதளம் உருவாக்கு (Hero, Features, Pricing, Form)'
                          : 'Create a modern, responsive landing page website with hero section, features grid, pricing table, and contact form';
                        setInput(defaultPrompt);
                      }}
                      className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-mono ${
                        isLightMode
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800'
                      }`}
                      title={isTamil ? 'இணையதளம் உருவாக்கு' : 'Build Instant Website'}
                    >
                      <Globe className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px] font-bold">Build Web</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleVoiceListening}
                      className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs ${
                        isListening
                          ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50 animate-pulse'
                          : isLightMode
                          ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                      }`}
                      title={isTamil ? 'குரல் உள்ளீடு' : 'Voice Dictation'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isListening && <span className="text-[10px] font-bold">Listening...</span>}
                    </button>
                  </div>

                  {/* Right Send Capsule Button */}
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className={`px-4 py-2 font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 text-xs ${
                      isLightMode
                        ? 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400'
                        : 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-slate-950 hover:brightness-110 disabled:opacity-40'
                    }`}
                  >
                    <span>{isTamil ? 'அனுப்பு' : 'Send'}</span>
                    <Send className={`w-3.5 h-3.5 ${isLightMode ? 'text-white' : 'text-slate-950'}`} />
                  </button>
                </div>
              </form>

              {/* Gemini Disclaimer */}
              <div className={`text-center text-[10px] font-mono ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isTamil
                  ? 'ஸ்வாதியா ஏஐ தவறான தகவல்களைத் தரக்கூடும். முக்கியமான விபரங்களைச் சரிபார்க்கவும்.'
                  : 'Swatea AI may display inaccurate info. Double-check responses.'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Edge Side-by-Side Live Website Preview Studio Panel */}
        {isSidePreviewOpen && sidePreviewHtml && (
          <div className="w-full lg:w-[540px] xl:w-[660px] shrink-0 border-l border-slate-800 bg-slate-950 flex flex-col h-full z-20 shadow-2xl relative transition-all animate-fadeIn">
            {/* Edge Panel Header */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-extrabold text-amber-300 truncate">
                  {isTamil ? '🌐 நேரலை இணையதளம் (Edge Studio)' : '🌐 Edge Live Web Studio'}
                </span>
                <span className="hidden sm:inline text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-1.5 py-0.5 rounded">
                  Port 3000
                </span>
              </div>

              {/* Viewport Toggles & Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setSidePreviewViewport('desktop')}
                    className={`p-1 rounded transition-colors ${sidePreviewViewport === 'desktop' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    title="Desktop View"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSidePreviewViewport('tablet')}
                    className={`p-1 rounded transition-colors ${sidePreviewViewport === 'tablet' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    title="Tablet View"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSidePreviewViewport('mobile')}
                    className={`p-1 rounded transition-colors ${sidePreviewViewport === 'mobile' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    title="Mobile View"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setFullscreenHtml(sidePreviewHtml)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
                  title={isTamil ? 'முழுத்திரை' : 'Fullscreen'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([sidePreviewHtml], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `swatea-website-${Date.now()}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors"
                  title={isTamil ? 'HTML பதிவிறக்கு' : 'Download HTML'}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsSidePreviewOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-300 transition-colors"
                  title={isTamil ? 'மூடு' : 'Close Studio'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* URL Browser Bar */}
            <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg flex-1 mr-2 text-slate-300 truncate">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate text-emerald-300 font-bold">https://swatea-app.preview/live-site</span>
              </div>
              <button
                onClick={() => {
                  const temp = sidePreviewHtml;
                  setSidePreviewHtml('');
                  setTimeout(() => setSidePreviewHtml(temp), 50);
                }}
                className="p-1 text-slate-400 hover:text-amber-400 rounded transition-colors"
                title={isTamil ? 'மீண்டும் ஏற்று' : 'Reload Web Page'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live iFrame Sandbox */}
            <div className="flex-1 bg-slate-900/90 p-2 overflow-auto flex items-center justify-center relative">
              <iframe
                srcDoc={sidePreviewHtml}
                title="Swatea Edge Live Interactive Website Studio"
                className={`bg-white transition-all duration-300 ${
                  sidePreviewViewport === 'mobile'
                    ? 'w-[375px] h-[667px] shadow-2xl rounded-2xl border-4 border-slate-800'
                    : sidePreviewViewport === 'tablet'
                    ? 'w-[768px] h-[800px] max-w-full shadow-xl rounded-xl border-2 border-slate-800'
                    : 'w-full h-full rounded-xl border border-slate-800'
                }`}
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
              />
            </div>

            {/* Bottom Instant Refactor Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!sideRefactorInput.trim() || sideRefactorLoading) return;
                  setSideRefactorLoading(true);
                  try {
                    const data = await safeFetchJson('/api/website', {
                      method: 'POST',
                      body: JSON.stringify({
                        prompt: `Modify website: ${sideRefactorInput}`,
                        currentHtml: sidePreviewHtml,
                        language: isTamil ? 'Tamil' : 'English',
                      }),
                    });
                    if (data.html) {
                      setSidePreviewHtml(data.html);
                      setSideRefactorInput('');
                    }
                  } catch (err: any) {
                    alert(`Refactor Error: ${err.message}`);
                  } finally {
                    setSideRefactorLoading(false);
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={sideRefactorInput}
                  onChange={(e) => setSideRefactorInput(e.target.value)}
                  placeholder={
                    isTamil
                      ? 'இணையதளத்தில் மாற்றங்களைக் கூறவும் (उदा. "டார்க் மோட் சேர்க்கவும்")...'
                      : 'Request website edits (e.g. "Add dark mode toggle & contact form")...'
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!sideRefactorInput.trim() || sideRefactorLoading}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:brightness-110 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-md shrink-0"
                >
                  {sideRefactorLoading ? (
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5 text-slate-950" />
                  )}
                  <span>{isTamil ? 'மாற்று' : 'Refactor'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Chat History Sidebar / Overlay Drawer */}
      {showHistoryDrawer && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex justify-end transition-all animate-fadeIn">
          <div
            className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl z-40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {isTamil ? 'சாட் வரலாறு (Chat History)' : 'Saved Chat History'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {isTamil ? `${savedSessions.length} உரையாடல்கள் சேமிக்கப்பட்டுள்ளன` : `${savedSessions.length} total saved conversations`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={startNewChat}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                  title={isTamil ? 'புதிய உரையாடல் தொடங்குக' : 'New Chat'}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isTamil ? 'புதிய சாட்' : 'New Chat'}</span>
                </button>
                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* History Search Bar */}
            <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder={isTamil ? 'வரலாற்றில் தேடுக...' : 'Search chat history...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {savedSessions.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-500">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {isTamil
                      ? 'இன்னும் பழைய உரையாடல்கள் எதுவுமில்லை. புதிய சாட் தொடங்கி பேசவும்!'
                      : 'No saved chat history yet. Start asking questions to save!'}
                  </p>
                </div>
              ) : (
                savedSessions
                  .filter((s) =>
                    s.title.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                    s.messages.some((m) => m.content.toLowerCase().includes(historySearchQuery.toLowerCase()))
                  )
                  .map((session) => {
                    const isActive = session.id === activeSessionId;
                    const msgCount = session.messages.filter((m) => m.role === 'user').length;

                    return (
                      <div
                        key={session.id}
                        onClick={() => loadSession(session)}
                        className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isActive
                            ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-950/30'
                            : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                                {isTamil ? 'தற்போது' : 'Active'}
                              </span>
                            )}
                            <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-300">
                              {session.title || (isTamil ? 'தலைப்பற்ற சாட்' : 'Untitled Chat')}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {session.updatedAt || session.createdAt}
                            </span>
                            <span>•</span>
                            <span>{msgCount} {isTamil ? 'கேள்விகள்' : 'prompts'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                            title={isTamil ? 'இந்த சாட்டை நீக்குக' : 'Delete Session'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Drawer Footer / Clear All */}
            {savedSessions.length > 0 && (
              <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  {isTamil ? 'வரலாறு கணினியில் உள்ளூர் சேமிப்பில் உள்ளது' : 'History is saved in local browser storage'}
                </span>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        isTamil
                          ? 'நிச்சயமாக அனைத்து சாட் வரலாற்றையும் நீக்க வேண்டுமா?'
                          : 'Are you sure you want to clear all saved chat history?'
                      )
                    ) {
                      clearAllHistory();
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 font-semibold text-[11px] transition-colors"
                >
                  {isTamil ? 'அனைத்தையும் நீக்கு' : 'Clear All History'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-amber-400">
                {isTamil ? '🎨 ஸ்வாதியா ஏஐ கேன்வாஸ் (HD View)' : '🎨 Swatea AI HD Image Viewer'}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewModalImage}
                  download={`swatea-ai-image-${Date.now()}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'பதிவிறக்கு' : 'Download'}</span>
                </a>
                <button
                  onClick={() => setPreviewModalImage(null)}
                  className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-2 flex items-center justify-center bg-slate-950 max-h-[80vh] overflow-auto">
              <img
                src={previewModalImage}
                alt="Enlarged view"
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Interactive Website Preview Modal */}
      {fullscreenHtml && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-3 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400 animate-spin-slow" />
              <span className="font-extrabold text-sm">
                {isTamil ? '🌐 ஸ்வாதியா ஏஐ நேரலை இணையதளம் (முழுத்திரை)' : '🌐 Swatea AI Live Website Preview (Fullscreen)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const blob = new Blob([fullscreenHtml], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `swatea-website-${Date.now()}.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{isTamil ? 'HTML பதிவிறக்கு' : 'Download HTML'}</span>
              </button>
              <button
                onClick={() => setFullscreenHtml(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 mt-3 bg-white rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              srcDoc={fullscreenHtml}
              title="Fullscreen Website Preview"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
};


