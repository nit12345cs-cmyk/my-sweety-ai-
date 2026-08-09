import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
import { ChatMessage, ChatSession, LanguageCode } from '../types';
import { safeFetchJson } from '../lib/api';
import { speakNaturalText, stopSpeech } from '../lib/tts';

interface ChatModuleProps {
  language: LanguageCode;
  currentUserEmail?: string;
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

export const ChatModule: React.FC<ChatModuleProps> = ({ language, currentUserEmail = 'guest@swatea.ai' }) => {
  const isTamil = language === 'ta';
  const userKey = currentUserEmail.toLowerCase().trim();
  const storageKey = `swatea_chats_${userKey}`;
  const historyKey = `swatea_history_${userKey}`;
  const activeSessionKey = `swatea_active_session_id_${userKey}`;

  // Active session ID persisted across page reloads to prevent duplicate history sessions
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(activeSessionKey);
      if (saved) return saved;
    } catch (e) {}
    return `session_${Date.now()}`;
  });

  useEffect(() => {
    try {
      localStorage.setItem(activeSessionKey, activeSessionId);
    } catch (e) {}
  }, [activeSessionId, activeSessionKey]);

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

  // Saved Chat Sessions Archive (Deduplicated on initial load)
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seenIds = new Set<string>();
          const seenTitles = new Set<string>();
          const deduplicated: ChatSession[] = [];
          for (const item of parsed) {
            if (item && item.id && !seenIds.has(item.id)) {
              const cleanTitle = (item.title || '').trim().toLowerCase();
              if (cleanTitle && seenTitles.has(cleanTitle)) {
                continue; // Skip duplicate session with same title
              }
              if (cleanTitle) seenTitles.add(cleanTitle);
              seenIds.add(item.id);
              deduplicated.push(item);
            }
          }
          return deduplicated;
        }
      }
    } catch (err) {
      console.error('Error loading chat history sessions:', err);
    }
    return [];
  });

  // Dispatch custom event to keep Left Sidebar synced with ChatModule history
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('swatea:history_updated', {
        detail: { savedSessions, activeSessionId },
      })
    );
  }, [savedSessions, activeSessionId]);

  // Listen for actions dispatched from Left Sidebar
  useEffect(() => {
    const handleNewChat = () => {
      startNewChat();
    };
    const handleLoadSession = (e: any) => {
      if (e.detail) {
        loadSession(e.detail);
      }
    };
    const handleDeleteSession = (e: any) => {
      if (e.detail) {
        deleteSession(e.detail);
      }
    };
    const handleClearHistory = () => {
      clearAllHistory();
    };

    window.addEventListener('swatea:new_chat', handleNewChat);
    window.addEventListener('swatea:load_session', handleLoadSession);
    window.addEventListener('swatea:delete_session', handleDeleteSession);
    window.addEventListener('swatea:clear_history', handleClearHistory);

    return () => {
      window.removeEventListener('swatea:new_chat', handleNewChat);
      window.removeEventListener('swatea:load_session', handleLoadSession);
      window.removeEventListener('swatea:delete_session', handleDeleteSession);
      window.removeEventListener('swatea:clear_history', handleClearHistory);
    };
  }, []);

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

  // Auto-save messages to localStorage whenever messages change
  useEffect(() => {
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
      
      // Look for existing session by activeSessionId OR identical title
      const existingIdx = prev.findIndex(
        (s) => s.id === activeSessionId || (s.title && s.title.toLowerCase() === sessionTitle.toLowerCase())
      );

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        if (
          existing.id === activeSessionId &&
          existing.messages.length === sanitizedCurrentMsgs.length &&
          existing.messages[existing.messages.length - 1]?.content ===
            sanitizedCurrentMsgs[sanitizedCurrentMsgs.length - 1]?.content
        ) {
          return prev; // Same content, prevent unnecessary state update and re-render
        }

        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          id: activeSessionId, // unify ID
          title: existing.title || sessionTitle,
          updatedAt: nowStr,
          messages: sanitizedCurrentMsgs,
        };
        const limited = updated.slice(0, 20);
        safeStorageSet(historyKey, limited);
        return limited;
      } else {
        const newSession: ChatSession = {
          id: activeSessionId,
          title: sessionTitle,
          createdAt: nowStr,
          updatedAt: nowStr,
          messages: sanitizedCurrentMsgs,
        };
        const updated = [newSession, ...prev];
        const limited = updated.slice(0, 20);
        safeStorageSet(historyKey, limited);
        return limited;
      }
    });
  }, [messages, storageKey, activeSessionId, historyKey, loading]);

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
    return (
      <div className="space-y-2.5 font-sans text-slate-200 select-text cursor-text selection:bg-amber-500/30 selection:text-amber-100 leading-relaxed text-xs sm:text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1({ children }) {
              return (
                <h1 className="text-base sm:text-lg font-extrabold text-amber-300 mt-3 mb-1.5 border-b border-slate-800 pb-1 flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-amber-400 inline-block shrink-0"></span>
                  {children}
                </h1>
              );
            },
            h2({ children }) {
              return (
                <h2 className="text-sm sm:text-base font-bold text-amber-200 mt-2.5 mb-1 flex items-center gap-1.5">
                  <span className="w-1 h-3.5 rounded-full bg-rose-400 inline-block shrink-0"></span>
                  {children}
                </h2>
              );
            },
            h3({ children }) {
              return (
                <h3 className="text-xs sm:text-sm font-semibold text-emerald-300 mt-2 mb-1">
                  {children}
                </h3>
              );
            },
            p({ children }) {
              return <p className="leading-relaxed my-1.5 text-slate-200">{children}</p>;
            },
            strong({ children }) {
              return <strong className="font-extrabold text-amber-300">{children}</strong>;
            },
            em({ children }) {
              return <em className="italic text-slate-200">{children}</em>;
            },
            ul({ children }) {
              return <ul className="list-none my-2 space-y-1 pl-1">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal my-2 space-y-1 pl-5 text-slate-200">{children}</ol>;
            },
            li({ children }) {
              return (
                <li className="flex items-start gap-2 my-0.5 leading-relaxed text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div className="flex-1">{children}</div>
                </li>
              );
            },
            blockquote({ children }) {
              return (
                <blockquote className="border-l-3 border-amber-500 bg-slate-900/80 px-3 py-2 rounded-r-xl my-2 text-slate-300 italic">
                  {children}
                </blockquote>
              );
            },
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : '';
              const codeStr = String(children).replace(/\n$/, '');

              if (!inline && (lang || codeStr.includes('\n') || codeStr.startsWith('<!DOCTYPE') || codeStr.startsWith('<html'))) {
                const sectionKey = `${msgId}_code_${Math.random()}`;
                const isCopied = copiedId === sectionKey;
                const isHtmlWeb =
                  lang === 'html' ||
                  codeStr.toLowerCase().includes('<!doctype html>') ||
                  codeStr.toLowerCase().includes('<html');

                if (isHtmlWeb) {
                  return (
                    <InteractiveWebsiteBlock
                      key={sectionKey}
                      htmlCode={codeStr}
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
                      <span className="font-bold text-amber-400 uppercase tracking-wider font-mono">{lang || 'CODE'}</span>
                      <button
                        onClick={() => handleCopy(codeStr, sectionKey)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-sans font-semibold transition-colors shadow-sm"
                        title={isTamil ? 'கோடு பிரதியை எடு' : 'Copy Code Block'}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{isCopied ? (isTamil ? 'காப்பிட்!' : 'Copied!') : (isTamil ? 'கோடு காப்பி' : 'Copy Code')}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 overflow-x-auto text-xs text-emerald-300 leading-relaxed whitespace-pre font-mono select-text cursor-text">
                      <code>{codeStr}</code>
                    </pre>
                  </div>
                );
              }

              return (
                <code className="bg-slate-900 border border-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono text-[11px]" {...props}>
                  {children}
                </code>
              );
            },
            img({ src, alt }) {
              if (!src) return null;
              return (
                <div className="my-3 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-2 max-w-lg group/img">
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={src}
                      alt={alt || 'Swatea AI Image'}
                      className="w-full h-auto object-contain max-h-80 bg-slate-900 cursor-pointer hover:scale-102 transition-transform duration-300"
                      onClick={() => setPreviewModalImage(src)}
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => setPreviewModalImage(src)}
                        className="p-2 bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl shadow border border-slate-700 font-bold flex items-center gap-1.5 text-xs transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{isTamil ? 'பெரிதாக்கு' : 'Zoom'}</span>
                      </button>
                      <a
                        href={src}
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
                </div>
              );
            },
            table({ children }) {
              return (
                <div className="overflow-x-auto my-3 border border-slate-800 rounded-xl bg-slate-950 shadow-md">
                  <table className="w-full text-left text-xs text-slate-200 border-collapse">{children}</table>
                </div>
              );
            },
            th({ children }) {
              return <th className="bg-slate-900 px-3 py-2 border-b border-slate-800 text-amber-300 font-bold">{children}</th>;
            },
            td({ children }) {
              return <td className="px-3 py-2 border-b border-slate-800/60">{children}</td>;
            },
            a({ href, children }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 underline hover:text-amber-300 font-semibold"
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
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
    setMessages([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error('Error clearing chat:', err);
    }
  };

  const startNewChat = () => {
    stopSpeaking();
    const newSessionId = `session_${Date.now()}`;
    setActiveSessionId(newSessionId);
    setMessages([defaultWelcomeMessage]);
    safeStorageSet(storageKey, [defaultWelcomeMessage]);
  };

  const loadSession = (session: ChatSession) => {
    stopSpeaking();
    setActiveSessionId(session.id);
    setMessages(session.messages);
  };

  const deleteSession = (sessionId: string) => {
    stopSpeaking();
    setSavedSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      safeStorageSet(historyKey, updated);
      return updated;
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
    <div className="h-full flex flex-col glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl relative">
      {/* Top Header / Gemini Model Picker Bar */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4 text-amber-100" />
            </div>
            <span className="font-extrabold text-sm text-white tracking-wide">
              Swatea AI
            </span>
          </div>

          {/* AI Model Switcher */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-inner max-w-[260px] sm:max-w-none truncate"
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
              {/* Welcome Greeting on clean start */}
              {messages.length <= 1 && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-xl mx-auto">
                    <Sparkles className="w-6 h-6 text-amber-100" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {isTamil ? 'வணக்கம்! நான் ஸ்வாதியா ஏஐ' : 'Hello! I am Swatea AI'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    {isTamil
                      ? 'உங்களுக்குத் தேவையான கேள்விகள், தகவல்கள் அல்லது உதவிகளைக் கேட்கலாம்.'
                      : 'Ask any question or request help with coding, writing, research, and website building.'}
                  </p>
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
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 text-white'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-amber-200" />}
                    </div>

                    {/* Message Box */}
                    <div
                      className={`group relative rounded-2xl p-4 text-xs sm:text-sm leading-relaxed border ${
                        isUser
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-50 rounded-tr-none'
                          : 'bg-slate-900/90 border-slate-800/90 text-slate-200 rounded-tl-none shadow-xl'
                      }`}
                    >
                      {/* Message Meta */}
                      <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                        <span className="font-bold text-slate-300 font-mono">
                          {isUser ? (isTamil ? 'நீங்கள்' : 'You') : 'Swatea AI'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* User Uploaded Image Preview */}
                      {msg.userImage && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-w-xs shadow-md">
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

          {/* FIXED / STICKY GEMINI-STYLE BOTTOM TYPING DASHBOARD */}
          <div className="shrink-0 sticky bottom-0 left-0 right-0 p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-xl z-20">
            <div className="max-w-3xl mx-auto space-y-2">
              {/* Attached File Preview Badge */}
              {attachedFile && (
                <div className="flex items-center justify-between bg-amber-500/15 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-mono shadow-sm">
                  <span className="truncate max-w-[300px]">📎 {attachedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-slate-400 hover:text-rose-400 p-0.5 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Gemini Capsule Form */}
              <form
                onSubmit={handleSend}
                className="glass-card bg-slate-900/80 border border-slate-800 focus-within:border-amber-500/80 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-2xl transition-all focus-within:shadow-amber-500/10"
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
                      ? 'ஸ்வாதியா ஜெமினியிடம் ஏதேனும் கேளுங்கள் (उदा. "ஒரு REST API உருவாக்கு")...'
                      : 'Ask Swatea Gemini anything (e.g. "Draft an enterprise REST API")...'
                  }
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-3 py-1.5 resize-none max-h-32 min-h-[40px]"
                />

                {/* Bottom Controls Bar inside Capsule */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1 px-1">
                  {/* Left Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1 text-xs"
                      title="Attach File"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={magicEnhancePrompt}
                      className="p-2 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1 text-xs font-mono"
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
                      className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1 text-xs font-mono"
                      title={isTamil ? 'இணையதளம் உருவாக்கு' : 'Build Instant Website'}
                    >
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline text-[11px] font-bold">Build Web</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleVoiceListening}
                      className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs ${
                        isListening
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse'
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
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-slate-950 font-extrabold rounded-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 text-xs"
                  >
                    <span>{isTamil ? 'அனுப்பு' : 'Send'}</span>
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                </div>
              </form>

              {/* Gemini Disclaimer */}
              <div className="text-center text-[10px] text-slate-500 font-mono">
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
                  LIVE STUDIO
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


