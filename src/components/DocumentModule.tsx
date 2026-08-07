import React, { useState } from 'react';
import { FileText, FileSpreadsheet, ShieldAlert, CheckCircle2, Sparkles, Upload, BookOpen } from 'lucide-react';
import { DocumentSample, LanguageCode } from '../types';
import { safeFetchJson } from '../lib/api';

interface DocumentModuleProps {
  language: LanguageCode;
}

const SAMPLE_DOCS: DocumentSample[] = [
  {
    id: 'sample-1',
    name: 'Enterprise AI Governance & SLA Agreement 2026',
    type: 'Legal Contract',
    date: '2026-06-15',
    content: `ENTERPRISE SERVICE LEVEL AGREEMENT & AI GOVERNANCE POLICY
Section 1. Security and Data Protection
1.1 All enterprise customer data processed by Swatea AI OS X shall be encrypted at rest using AES-256 and in transit using TLS 1.3.
1.2 No customer prompt data or uploaded artifacts shall be utilized for foundational model retraining without explicit written consent.
1.3 Uptime Commitment: Provider guarantees 99.99% monthly API availability. In the event of downtime exceeding 0.01%, credits shall be applied at a rate of 5% per hour of delay.
1.4 Liability Cap: Total aggregate liability for data loss or service disruption shall not exceed 12 months of paid subscription fees.`,
  },
  {
    id: 'sample-2',
    name: 'Q2 Cloud Microservices Financial & Growth Audit',
    type: 'Financial Report',
    date: '2026-07-20',
    content: `EXECUTIVE SUMMARY: Q2 FINANCIAL PERFORMANCE
Total Enterprise Revenue: $14.2M (+28% YoY)
API Infrastructure Operational Cost: $2.1M (-12% efficiency gain)
Active Enterprise Tenancies: 1,420 Organisations
Key Risks & Bottlenecks: Token consumption on high-parameter reasoning models increased by 34%. Recommendation: Implement caching layer (Redis) and route routine tasks to Gemini 3.6 Flash.`,
  },
];

export const DocumentModule: React.FC<DocumentModuleProps> = ({ language }) => {
  const isTamil = language === 'ta';

  const [selectedDoc, setSelectedDoc] = useState<DocumentSample>(SAMPLE_DOCS[0]);
  const [customText, setCustomText] = useState(SAMPLE_DOCS[0].content);
  const [action, setAction] = useState<'summarize' | 'risks' | 'qa'>('summarize');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const customDoc: DocumentSample = {
          id: 'uploaded-' + Date.now(),
          name: file.name,
          type: file.type || 'Uploaded File',
          date: new Date().toISOString().split('T')[0],
          content: text,
        };
        setSelectedDoc(customDoc);
        setCustomText(text);
        setAnalysisResult('');
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!customText.trim()) return;

    setLoading(true);
    try {
      const data = await safeFetchJson('/api/doc-analyze', {
        method: 'POST',
        body: JSON.stringify({
          documentText: customText,
          docType: selectedDoc.type,
          action,
        }),
      });

      setAnalysisResult(data.result);
    } catch (err: any) {
      alert(`Document AI Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Module Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            <span>{isTamil ? 'ஆவண நுண்ணறிவு & சுருக்கம்' : 'Swatea Document Intelligence'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'ஒப்பந்தங்கள், நிதி அறிக்கைகள் மற்றும் தொழில்நுட்ப ஆவணங்களை உடனடியாக பகுப்பாய்வு செய்யுங்கள்.'
              : 'Analyze legal contracts, financial audits, and tech papers with high-precision Gemini extraction.'}
          </p>
        </div>

        {/* Action switch */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setAction('summarize')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              action === 'summarize' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setAction('risks')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              action === 'risks' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk Check
          </button>
          <button
            onClick={() => setAction('qa')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              action === 'qa' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Q&A Extraction
          </button>
        </div>
      </div>

      {/* Preset Documents bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-400 uppercase font-mono">
            {isTamil ? 'மாதிரி ஆவணம் / சொந்தக் கோப்பு:' : 'Select Sample or Upload Custom File:'}
          </label>
          <label className="cursor-pointer text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-lg flex items-center gap-1.5 font-mono transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>{isTamil ? 'கோப்பு பதிவேற்று' : 'Upload Document'}</span>
            <input type="file" accept=".txt,.json,.csv,.md,.js,.ts,.py,.doc,.pdf" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_DOCS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedDoc(doc);
                setCustomText(doc.content);
              }}
              className={`p-3 rounded-xl text-left border transition-all ${
                selectedDoc.id === doc.id
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-xs truncate text-amber-300">{doc.name}</div>
              <div className="text-[10px] text-slate-500 flex justify-between mt-1">
                <span>{doc.type}</span>
                <span>{doc.date}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Document Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Text Box */}
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {isTamil ? 'ஆவண உரை (Text Content)' : 'Document Input Context'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {customText.length} chars
            </span>
          </div>

          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={10}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            <span>
              {loading
                ? (isTamil ? 'பகுப்பாய்வு செய்கிறது...' : 'Analyzing Document...')
                : (isTamil ? 'ஆவணத்தை பகுப்பாய்வு செய்' : 'Run Document AI Analysis')}
            </span>
          </button>
        </div>

        {/* Output Intelligence Box */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{isTamil ? 'பகுப்பாய்வு முடிவுகள்' : 'Document Intelligence Output'}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {action.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans overflow-y-auto max-h-[350px]">
            {analysisResult || (
              <span className="text-slate-600 italic">
                {isTamil
                  ? 'முடிவுகள் இங்கு தோன்றும். "ஆவணத்தை பகுப்பாய்வு செய்" பொத்தானை அழுத்தவும்.'
                  : 'Structured summaries, contract risks, or extracted entities will be presented here.'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
