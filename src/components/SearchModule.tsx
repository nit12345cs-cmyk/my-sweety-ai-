import React, { useState } from 'react';
import { Search, Globe, ExternalLink, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { LanguageCode } from '../types';
import { safeFetchJson } from '../lib/api';

interface SearchModuleProps {
  language: LanguageCode;
}

export const SearchModule: React.FC<SearchModuleProps> = ({ language }) => {
  const isTamil = language === 'ta';

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    reply: string;
    sources: { title: string; uri: string }[];
    searchQueries: string[];
    timestamp: string;
  } | null>(null);

  const sampleTopics = isTamil
    ? [
        'தமிழ்நாட்டில் சமீபத்திய தொழில்நுட்ப முன்னேற்றங்கள்',
        'Gemini 3.6 Flash மாதிரியின் சிறப்பம்சங்கள்',
        'Enterprise AI Architecture trends 2026',
        'சமீபத்திய உலகளாவிய செயற்கை நுண்ணறிவு விதிகளின் சுருக்கம்',
      ]
    : [
        'Latest developments in Generative AI 2026',
        'Google Gemini 3.6 Flash capabilities',
        'Enterprise AI Operating System architectures',
        'Global Tech Innovations & Market Trends',
      ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setQuery(searchQuery);

    try {
      const data = await safeFetchJson('/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery }),
      });

      setResults(data);
    } catch (err: any) {
      alert(`Search error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Globe className="w-3.5 h-3.5 animate-spin" />
          <span>{isTamil ? 'கூகுள் தகவல்களுடன் கூடிய நேரலை தேடல்' : 'Google Grounded Deep Web Search'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {isTamil ? 'ஸ்வாதியா ஏஐ ஆழமான தேடல்' : 'Swatea AI Grounded Deep Search'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          {isTamil
            ? 'இணையத்தின் நிகழ்நேர தகவல்களை பகுப்பாய்வு செய்து, ஆதார இணைப்புகளுடன் துல்லியமான பதில்களைப் பெறுங்கள்.'
            : 'Access real-time web knowledge with citation links, grounded sources, and enterprise synthesis.'}
        </p>

        {/* Search Bar */}
        <div className="pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="relative flex items-center max-w-2xl mx-auto"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isTamil
                  ? 'என்ன தேட விரும்புகிறீர்கள்?...'
                  : 'Enter enterprise topic, news, or query...'
              }
              className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-28 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 shadow-xl transition-all"
            />
            <Search className="w-5 h-5 absolute left-3.5 text-slate-400" />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold rounded-xl hover:brightness-110 disabled:opacity-40 transition-all text-xs flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? (isTamil ? 'தேடுகிறது...' : 'Searching...') : (isTamil ? 'தேடு' : 'Search')}</span>
            </button>
          </form>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-[11px] text-slate-500 font-semibold font-mono">
            {isTamil ? 'பரிந்துரைகள்:' : 'Suggestions:'}
          </span>
          {sampleTopics.map((topic, i) => (
            <button
              key={i}
              onClick={() => handleSearch(topic)}
              className="text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1 rounded-full transition-all flex items-center gap-1 hover:border-amber-500/40"
            >
              <span>{topic}</span>
              <ArrowRight className="w-3 h-3 text-amber-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {loading && (
        <div className="max-w-3xl mx-auto p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-200">
            {isTamil
              ? 'கூகுள் தேடல் மூலமாக நேரலைத் தரவுகள் சேகரிக்கப்பட்டு ஆராயப்படுகின்றன...'
              : 'Synthesizing real-time grounded sources from Google Search...'}
          </p>
        </div>
      )}

      {results && !loading && (
        <div className="max-w-3xl mx-auto space-y-6 w-full">
          {/* Main Grounded Answer Card */}
          <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-slate-200">
                  {isTamil ? 'ஆராய்ச்சி அறிக்கை & விவரங்கள்' : 'Grounded Synthesis Overview'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> {results.timestamp}
              </span>
            </div>

            <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
              {results.reply}
            </div>
          </div>

          {/* Sources Section */}
          {results.sources.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>{isTamil ? 'சரிபார்க்கப்பட்ட வெப் இணைப்புகள் (Sources)' : 'Verified Sources & Citations'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all flex items-start justify-between gap-2 group shadow-sm"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 line-clamp-1">
                        {src.title || 'Source Citation'}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate mt-1">
                        {src.uri}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
