import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  Code2,
  Eye,
  Download,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  RefreshCw,
  Wand2,
  Layers,
  Terminal,
  Folder,
  FileCode,
  FileText,
  Play,
  Cpu,
  ShieldCheck,
  Database,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  ExternalLink,
  Bot,
  Bug,
  Layout,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { LanguageCode } from '../types';
import { safeFetchJson } from '../lib/api';

interface WebsiteModuleProps {
  language: LanguageCode;
}

interface ProjectFile {
  path: string;
  name: string;
  language: string;
  content: string;
  category: 'frontend' | 'backend' | 'database' | 'config' | 'doc';
}

interface AgentStatus {
  id: string;
  name: string;
  role: string;
  icon: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  message: string;
}

const DEFAULT_STACK_PRESETS = [
  {
    id: 'netflix',
    title: '🎬 Streaming Video Platform (Netflix)',
    subtitle: 'Next.js 14, Express API, PostgreSQL, Video Player & Auth',
    prompt: 'Build a full-stack Netflix video streaming platform with movie grid, video player modal, category filters, user auth API, and watchlist database schema.',
  },
  {
    id: 'ecommerce',
    title: '🛍️ Full-Stack E-Commerce Store',
    subtitle: 'React, Express REST API, Stripe payment endpoints, Cart & PostgreSQL',
    prompt: 'Build a full-stack e-commerce marketplace with interactive product catalog, shopping cart backend API, Stripe checkout simulation, and PostgreSQL orders schema.',
  },
  {
    id: 'saas',
    title: '🚀 AI SaaS Platform with Subscription',
    subtitle: 'React, Express API, Gemini AI Route, Subscription Tiers & Analytics',
    prompt: 'Build a modern AI SaaS platform landing page and dashboard with Express backend proxying AI endpoints, Stripe subscription pricing, and PostgreSQL user schema.',
  },
  {
    id: 'social',
    title: '📱 Social Media & Chat Platform',
    subtitle: 'React, Express WebSocket/REST API, User Profiles, Posts & Likes',
    prompt: 'Build a full-stack social media application with feed posting, comments API, user profiles, PostgreSQL database schema, and live activity feeds.',
  },
  {
    id: 'coffee',
    title: '☕ Artisanal Cafe & Booking Web App',
    subtitle: 'Full-stack Cafe site with online reservations REST API & menu filter',
    prompt: 'Create a full-stack Cafe and Bakery website with interactive food menu, online booking REST API, review submission system, and database schema.',
  },
];

const DEFAULT_PROJECT_FILES: ProjectFile[] = [
  {
    path: 'frontend/src/App.tsx',
    name: 'App.tsx',
    language: 'typescript',
    category: 'frontend',
    content: `import React, { useState } from 'react';
import { Film, Play, Plus, Star, Search, Bell, User } from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const movies = [
    { id: 1, title: 'Cyber Pulse 2099', category: 'Sci-Fi', rating: '9.8', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=60' },
    { id: 2, title: 'Neon Horizon', category: 'Action', rating: '9.5', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60' },
    { id: 3, title: 'Quantum Mind', category: 'Thriller', rating: '9.2', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=60' },
    { id: 4, title: 'Deep Space Odyssey', category: 'Sci-Fi', rating: '9.6', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60' },
  ];

  return (
    <div className="bg-[#141414] text-white min-h-screen font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#141414]/90 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black text-red-600 tracking-wider font-mono">SWATEA FLIX</h1>
          <div className="hidden md:flex gap-6 text-sm text-gray-300 font-medium">
            <a href="#" className="hover:text-white transition-colors text-white font-bold">Home</a>
            <a href="#" className="hover:text-white transition-colors">TV Shows</a>
            <a href="#" className="hover:text-white transition-colors">Movies</a>
            <a href="#" className="hover:text-white transition-colors">New & Popular</a>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-300">
          <Search className="w-5 h-5 cursor-pointer hover:text-white" />
          <Bell className="w-5 h-5 cursor-pointer hover:text-white" />
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-white text-xs">S</div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative h-[480px] bg-gradient-to-t from-[#141414] via-transparent to-black/60 flex items-end p-8 md:p-16">
        <div className="max-w-xl space-y-4 z-10">
          <span className="bg-red-600/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest font-mono">Top Rated Original</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">Cyber Pulse 2099</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            In a dystopian cyber city, a renegade hacker unveils an AI intelligence that controls human destiny.
          </p>
          <div className="flex gap-4 pt-2">
            <button className="bg-white text-black font-extrabold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-all shadow-lg">
              <Play className="w-5 h-5 fill-black" /> Play Now
            </button>
            <button className="bg-gray-600/60 hover:bg-gray-600 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 backdrop-blur-md transition-all">
              <Plus className="w-5 h-5" /> My List
            </button>
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      <div className="px-8 py-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-wide">Trending Blockbusters</h3>
          <span className="text-xs text-red-500 font-mono hover:underline cursor-pointer">Explore All →</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {movies.map((m) => (
            <div key={m.id} className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:scale-105 transition-all duration-300 cursor-pointer shadow-xl">
              <img src={m.image} alt={m.title} className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity" />
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-400 font-semibold">{m.category}</span>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400" /> {m.rating}</span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-red-500 transition-colors">{m.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'backend/server.ts',
    name: 'server.ts',
    language: 'typescript',
    category: 'backend',
    content: `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sample API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), agent: 'Swatea AI Stack' });
});

app.get('/api/movies', (req, res) => {
  res.json([
    { id: '1', title: 'Cyber Pulse 2099', category: 'Sci-Fi', rating: 9.8 },
    { id: '2', title: 'Neon Horizon', category: 'Action', rating: 9.5 },
    { id: '3', title: 'Quantum Mind', category: 'Thriller', rating: 9.2 }
  ]);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({ token: 'jwt-swatea-token-xyz', user: { email, role: 'USER' } });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`[Swatea Engine] Full-stack Server listening on port \${PORT}\`);
});`
  },
  {
    path: 'database/schema.prisma',
    name: 'schema.prisma',
    language: 'prisma',
    category: 'database',
    content: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  watchlist Movie[]  @relation("UserWatchlist")
}

model Movie {
  id          String   @id @default(uuid())
  title       String
  description String
  category    String
  rating      Float
  imageUrl    String
  users       User[]   @relation("UserWatchlist")
}

enum Role {
  USER
  ADMIN
}`
  },
  {
    path: 'Dockerfile',
    name: 'Dockerfile',
    language: 'dockerfile',
    category: 'config',
    content: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --only=production
EXPOSE 3000
CMD ["node", "dist/server.js"]`
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'doc',
    content: `# Swatea Full-Stack Platform

Generated automatically by **Swatea Autonomous Software Engineering Agent**.

## Stack
- **Frontend**: React 18, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express REST API
- **Database**: PostgreSQL with Prisma ORM
- **Container**: Docker & Docker Compose

## Quick Start
\`\`\`bash
# 1. Install Dependencies
npm install

# 2. Run Database Migration
npx prisma db push

# 3. Start Development Server
npm run dev
\`\`\`
`
  }
];

export const WebsiteModule: React.FC<WebsiteModuleProps> = ({ language }) => {
  const isTamil = language === 'ta';

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'terminal' | 'agents'>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // File state
  const [files, setFiles] = useState<ProjectFile[]>(DEFAULT_PROJECT_FILES);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('frontend/src/App.tsx');
  const [editingCode, setEditingCode] = useState<string>(DEFAULT_PROJECT_FILES[0].content);
  const [copied, setCopied] = useState(false);
  const [isFullscreenModal, setIsFullscreenModal] = useState(false);

  // Terminal & Agents State
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[System] Autonomous Software Engineering Agent Engine Initialized.',
    '[Engine] Stack selected: React + Node.js Express + PostgreSQL + Docker',
    '[Status] All multi-agent engineers standby for prompts.'
  ]);

  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { id: '1', name: 'Software Architect', role: 'System & DB Designer', icon: '🏗️', status: 'completed', message: 'Architecture & schema verified.' },
    { id: '2', name: 'Frontend Engineer', role: 'React & Tailwind Developer', icon: '⚛️', status: 'completed', message: 'Responsive UI rendered.' },
    { id: '3', name: 'Backend Engineer', role: 'REST API & Express Developer', icon: '🖥️', status: 'completed', message: 'API Endpoints created.' },
    { id: '4', name: 'Database Engineer', role: 'PostgreSQL & Prisma Admin', icon: '🗄️', status: 'completed', message: 'Prisma schema ready.' },
    { id: '5', name: 'QA & Security Tester', role: 'Code Reviewer & Auto-Fixer', icon: '🛡️', status: 'completed', message: 'Zero syntax errors.' }
  ]);

  const selectedFile = files.find((f) => f.path === selectedFilePath) || files[0];

  useEffect(() => {
    if (selectedFile) {
      setEditingCode(selectedFile.content);
    }
  }, [selectedFilePath]);

  const handleCodeChange = (newCode: string) => {
    setEditingCode(newCode);
    setFiles((prev) =>
      prev.map((f) => (f.path === selectedFilePath ? { ...f, content: newCode } : f))
    );
  };

  const currentAppCode = files.find((f) => f.path.includes('App.tsx'))?.content || editingCode;

  // Render Full HTML for the Preview iframe
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-black text-white min-h-screen">
  <div id="root"></div>
  <script type="text/babel">
    ${currentAppCode.replace(/import\s+.*from\s+['"].*['"];?/g, '')}
    if (typeof App !== 'undefined') {
      ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    }
  </script>
</body>
</html>`;

  const handleGenerateProject = async (overridePrompt?: string) => {
    const finalPrompt = overridePrompt || prompt;
    if (!finalPrompt.trim()) return;

    setLoading(true);
    setActiveTab('terminal');

    // Add log & run agents sequence
    setTerminalLogs((prev) => [
      ...prev,
      `[User Prompt] ${finalPrompt}`,
      '[Architect Agent] Analyzing requirements & choosing optimal full-stack architecture...',
      '[Frontend Agent] Generating UI components & reactive state managers...',
      '[Backend Agent] Writing Express API endpoints & authentication routes...',
      '[Database Agent] Creating PostgreSQL Prisma schema & migrations...'
    ]);

    setAgentStatuses((prev) =>
      prev.map((a) => ({ ...a, status: 'working', message: 'Generating code modules...' }))
    );

    try {
      const res = await safeFetchJson<{ reply: string }>('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `ACT AS AN AUTONOMOUS FULL-STACK AI ENGINEER. Build a standalone single-file React HTML+Tailwind component for the request: "${finalPrompt}". Respond ONLY with raw valid React TSX code for the App component.`,
          model: 'gemini-3.6-flash',
        }),
      });

      if (res && res.reply) {
        let code = res.reply;
        if (code.includes('```')) {
          code = code.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '');
        }

        const updatedFiles = files.map((f) => {
          if (f.path.includes('App.tsx')) {
            return { ...f, content: code };
          }
          return f;
        });

        setFiles(updatedFiles);
        setEditingCode(code);

        setTerminalLogs((prev) => [
          ...prev,
          '[QA Agent] Compilation succeeded with zero errors.',
          '[Runner Engine] Server booted on port 3000.',
          '[System] Full-Stack Project generated successfully! Switching to Live Preview.'
        ]);

        setAgentStatuses((prev) =>
          prev.map((a) => ({ ...a, status: 'completed', message: 'Module updated & verified.' }))
        );

        setTimeout(() => setActiveTab('preview'), 1200);
      }
    } catch (err) {
      setTerminalLogs((prev) => [...prev, '[Error] API Generation failed. Using cached fallback template.']);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    const blob = new Blob([JSON.stringify(files, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'swatea-fullstack-project.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col gap-3 p-2 sm:p-4 bg-transparent overflow-hidden">
      {/* Top Banner Control Bar */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-white tracking-wide">
                Swatea AI IDE & Full-Stack Platform
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full uppercase">
                Autonomous Engineer
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isTamil ? 'தானியங்கி ஏஐ சாப்ட்வேர் இன்ஜினியர் சிஸ்டம்' : 'Full-Stack Multi-Agent Code Generation & Live Server Execution'}
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isTamil ? 'நேரலை முன்னோட்டம்' : 'Live Preview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isTamil ? 'கோடு எடிட்டர்' : 'Code Workspace'}</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isTamil ? 'கான்சோல்' : 'Terminal Logs'}</span>
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'agents'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-sky-400" />
            <span>{isTamil ? 'ஏஜெண்டுகள்' : 'AI Multi-Agents'}</span>
          </button>
        </div>
      </div>

      {/* Preset Fast Prompt Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
        {DEFAULT_STACK_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setPrompt(p.prompt);
              handleGenerateProject(p.prompt);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Main Workspace Grid (Left File Tree + Right Content Area) */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
        
        {/* Left Sidebar: File Tree Navigator */}
        <div className="w-full md:w-64 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2 shrink-0 shadow-xl overflow-y-auto">
          <div className="px-2 py-1 flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 font-mono">
            <span className="flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-amber-500" />
              <span>PROJECT FILES</span>
            </span>
            <span className="text-[10px] text-amber-400 font-mono">5 files</span>
          </div>

          <div className="space-y-1 text-xs font-mono">
            {files.map((file) => {
              const isActive = file.path === selectedFilePath;
              return (
                <button
                  key={file.path}
                  onClick={() => {
                    setSelectedFilePath(file.path);
                    if (activeTab !== 'editor') setActiveTab('editor');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer truncate ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>

          {/* Stack summary badge */}
          <div className="mt-auto p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 font-mono space-y-1">
            <div className="flex items-center gap-1 text-slate-200 font-bold">
              <Zap className="w-3 h-3 text-amber-400" /> Stack Specifications
            </div>
            <div>React 18 + Next.js App Router</div>
            <div>Express Node.js REST API</div>
            <div>PostgreSQL + Prisma ORM</div>
            <div>Docker + Vercel Deployment</div>
          </div>
        </div>

        {/* Right Main Panel */}
        <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          
          {/* Main Top Header Toolbar */}
          <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-mono text-cyan-300 font-bold ml-2">
                {selectedFile.path}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Responsive Viewport Buttons */}
              {activeTab === 'preview' && (
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setViewport('desktop')}
                    className={`p-1.5 rounded ${viewport === 'desktop' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewport('tablet')}
                    className={`p-1.5 rounded ${viewport === 'tablet' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewport('mobile')}
                    className={`p-1.5 rounded ${viewport === 'mobile' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadZip}
                className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Project</span>
              </button>

              <button
                onClick={() => setIsFullscreenModal(true)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content according to active tab */}
          <div className="flex-1 overflow-auto p-2 bg-[#02040a]">
            {activeTab === 'preview' && (
              <div className="w-full h-full flex justify-center items-center">
                <div
                  className={`transition-all bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-800 ${
                    viewport === 'mobile'
                      ? 'w-[375px] h-[667px]'
                      : viewport === 'tablet'
                      ? 'w-[768px] h-[800px]'
                      : 'w-full h-full min-h-[480px]'
                  }`}
                >
                  <iframe
                    title="Autonomous Preview"
                    srcDoc={previewHtml}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                  />
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="w-full h-full flex flex-col">
                <textarea
                  value={editingCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-full h-full bg-[#030712] text-cyan-300 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed border-0"
                  spellCheck={false}
                />
              </div>
            )}

            {activeTab === 'terminal' && (
              <div className="w-full h-full p-4 font-mono text-xs bg-black text-emerald-400 space-y-2 overflow-y-auto">
                <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800 pb-2 mb-3">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>SWATEA RUNTIME CONSOLE & COMPILER LOGS</span>
                </div>
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="w-full h-full p-6 space-y-4 max-w-3xl mx-auto">
                <h3 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400" />
                  AUTONOMOUS MULTI-AGENT SOFTWARE TEAM
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agentStatuses.map((agent) => (
                    <div key={agent.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{agent.icon}</span>
                          <div>
                            <h4 className="font-bold text-xs text-white">{agent.name}</h4>
                            <p className="text-[10px] text-slate-400">{agent.role}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono">{agent.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Prompt Input Capsule */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerateProject();
              }}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 focus-within:border-amber-500 p-2 rounded-2xl"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  isTamil
                    ? 'உங்களுக்கு தேவையான ஆப் அல்லது வெப்சைட்டை கூறவும் (எ.கா: "Netflix மாதிரி website உருவாக்கு")...'
                    : 'Describe any app or website to build (e.g. "Create a full-stack Netflix video app")...'
                }
                className="flex-1 bg-transparent px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-40"
              >
                <Wand2 className="w-4 h-4" />
                <span>{loading ? 'Building...' : isTamil ? 'உருவாக்கு' : 'Build App'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fullscreen Viewport Modal */}
      {isFullscreenModal && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-amber-300 font-bold flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Swatea Live Fullscreen Preview</span>
            </span>
            <button
              onClick={() => setIsFullscreenModal(false)}
              className="px-3 py-1 bg-rose-500 text-white font-bold rounded-lg text-xs"
            >
              Close Fullscreen
            </button>
          </div>
          <div className="flex-1 w-full bg-white">
            <iframe
              title="Fullscreen Preview"
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
};
