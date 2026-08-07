import React, { useState } from 'react';
import {
  Code2,
  Play,
  Wrench,
  Bug,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  Terminal,
  FileCode,
  Download,
  Eye,
  FileText
} from 'lucide-react';
import { LanguageCode } from '../types';
import { safeFetchJson } from '../lib/api';

interface CodeModuleProps {
  language: LanguageCode;
}

export const CodeModule: React.FC<CodeModuleProps> = ({ language }) => {
  const isTamil = language === 'ta';

  const [task, setTask] = useState('');
  const [code, setCode] = useState(`// Swatea AI Code Studio
// Paste existing code here or select a quick template below.`);
  const [selectedLang, setSelectedLang] = useState('TypeScript');
  const [mode, setMode] = useState<'generate' | 'refactor' | 'debug' | 'explain'>('generate');
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const sampleTemplates = [
    {
      name: isTamil ? 'Express REST API' : 'Express REST API',
      lang: 'TypeScript',
      prompt: isTamil ? 'பாதுகாப்பான Express TypeScript REST API உருவாக்கு' : 'Build a production-ready Express TypeScript REST API with JWT middleware and error handler',
    },
    {
      name: isTamil ? 'React அனிமேஷன் UI' : 'React Interactive Canvas',
      lang: 'React JSX',
      prompt: isTamil ? 'ஒரு நேரலை அனிமேஷன் கடிகாரம் கொண்ட React component உருவாக்கு' : 'Create an interactive HTML5/SVG canvas component with animated particles',
    },
    {
      name: isTamil ? 'SQL டேட்டாபேஸ்' : 'PostgreSQL Schema',
      lang: 'SQL',
      prompt: isTamil ? 'நிறுவன பயனர் மற்றும் கட்டண அட்டவணை DDL எழுதுக' : 'Create an enterprise PostgreSQL database schema with indexes and foreign key constraints',
    },
    {
      name: isTamil ? 'Python AI Model' : 'Python AI Pipeline',
      lang: 'Python',
      prompt: isTamil ? 'FastAPI மூலம் AI prediction endpoint உருவாக்கு' : 'Build a FastAPI async backend service for text sentiment scoring',
    },
  ];

  const handleRun = async () => {
    if (!task.trim() && !code.trim()) return;

    setLoading(true);
    try {
      const data = await safeFetchJson('/api/code', {
        method: 'POST',
        body: JSON.stringify({
          task,
          code,
          language: selectedLang,
          mode,
        }),
      });

      setOutput(data.output);
    } catch (err: any) {
      alert(`Code AI Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      TypeScript: 'ts',
      'React JSX': 'tsx',
      'Node.js': 'js',
      Python: 'py',
      SQL: 'sql',
      Go: 'go',
    };
    const ext = extMap[selectedLang] || 'txt';
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swatea-code-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden">
      {/* Code Header Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-sm text-slate-100">
            {isTamil ? 'ஸ்வாதியா ஏஐ கோடிங் ஸ்டுடியோ' : 'Swatea AI Code Studio'}
          </span>
        </div>

        {/* Modes */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMode('generate')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 font-medium transition-all ${
              mode === 'generate' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate</span>
          </button>
          <button
            onClick={() => setMode('refactor')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 font-medium transition-all ${
              mode === 'refactor' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Refactor</span>
          </button>
          <button
            onClick={() => setMode('debug')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 font-medium transition-all ${
              mode === 'debug' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Debug</span>
          </button>
          <button
            onClick={() => setMode('explain')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 font-medium transition-all ${
              mode === 'explain' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Explain</span>
          </button>
        </div>

        {/* Language selector */}
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
        >
          <option value="TypeScript">TypeScript</option>
          <option value="React JSX">React (TSX)</option>
          <option value="Node.js">Node.js Express</option>
          <option value="Python">Python</option>
          <option value="SQL">PostgreSQL / SQL</option>
          <option value="Go">Golang</option>
        </select>
      </div>

      {/* Workspace split view */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-y-auto">
        {/* Left Input Pane */}
        <div className="flex flex-col space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>{isTamil ? 'தேவை அல்லது பணி விளக்கம்' : 'Task Prompt / Instruction'}</span>
          </label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            rows={3}
            placeholder={
              isTamil
                ? 'உதாரணம்: "ஒரு எக்ஸ்பிரஸ் JWT அத்தண்டிகேஷன் மிடில்வேர் உருவாக்கு"...'
                : 'Example: "Build a resilient Express middleware with JWT authentication and rate limiting"...'
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
          />

          {/* Quick Code Templates */}
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase block mb-1">
              {isTamil ? 'விரைவு டெம்ப்ளேட்டுகள் (Quick Starters):' : 'Enterprise Starters:'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {sampleTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTask(tmpl.prompt);
                    setSelectedLang(tmpl.lang);
                  }}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-lg text-left text-[11px] font-mono text-slate-300 transition-all truncate"
                >
                  ⚡ {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          <label className="text-xs font-bold text-slate-300 flex items-center gap-2 pt-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>{isTamil ? 'மூலக் குறியீடு (Source Code / Context)' : 'Source Code Input (Optional for Refactor/Debug)'}</span>
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={6}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 font-mono focus:outline-none focus:border-amber-500"
          />

          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{loading ? (isTamil ? 'செயலாக்குகிறது...' : 'Synthesizing Code...') : (isTamil ? 'கோட் இயக்கு' : 'Execute Code AI')}</span>
          </button>
        </div>

        {/* Right Output Pane */}
        <div className="flex flex-col bg-slate-900/80 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                  activeTab === 'code' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                  activeTab === 'preview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Canvas</span>
              </button>
            </div>

            {output && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors font-mono"
                  title="Download Code File"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors font-mono"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-y-auto text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
            {activeTab === 'code' ? (
              output || (
                <span className="text-slate-600 italic">
                  {isTamil
                    ? 'வெளியீடு இங்கு தோன்றும். பணிகளை உள்ளிட்டு "கோட் இயக்கு" பொத்தானை அழுத்தவும்.'
                    : 'Generated code, refactored solution, or bug diagnostics will appear here.'}
                </span>
              )
            ) : (
              <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-900/50 rounded-lg border border-slate-800/80 p-4 text-center">
                <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 mb-2 border border-amber-500/20">
                  <Eye className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-bold text-slate-200 text-sm mb-1">Interactive Artifact Canvas</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mb-3">
                  Live preview rendered for HTML5, React, SVG, and UI Component outputs.
                </p>
                {output ? (
                  <div className="w-full h-64 bg-slate-950 rounded-lg border border-slate-800 p-4 overflow-auto text-left font-mono text-[11px] text-emerald-400">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-800 pb-1 mb-2 font-bold">
                      Interactive Code Sandbox Simulation
                    </div>
                    {output}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">Generate code to view interactive preview artifact</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
