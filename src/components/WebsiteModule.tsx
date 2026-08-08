import React, { useState } from 'react';
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
  ExternalLink,
  Play
} from 'lucide-react';
import { LanguageCode } from '../types';
import { safeFetchJson } from '../lib/api';

interface WebsiteModuleProps {
  language: LanguageCode;
}

const TEMPLATE_PROMPTS = [
  {
    id: 'coffee',
    title: '☕ Coffee Shop / Cafe',
    subtitle: 'Hero banner, menu grid, location, reviews & reservation form',
    prompt: 'Create a modern, elegant Coffee Shop website with a dark brown and gold aesthetic, hero banner, interactive menu grid, customer reviews, and a table booking form.',
  },
  {
    id: 'saas',
    title: '🚀 AI SaaS Landing Page',
    subtitle: 'Dark cyberpunk theme, pricing cards, feature matrix & CTA',
    prompt: 'Create a high-converting AI Tech SaaS product landing page with dark theme, glowing gradients, feature grid with icons, 3-tier pricing table, and newsletter signup.',
  },
  {
    id: 'restaurant',
    title: '🍽️ Luxury Restaurant',
    subtitle: 'Fine dining menu, chef recommendations & online reservation',
    prompt: 'Create a luxury fine dining restaurant website with gold and black theme, chef specials, food menu filter, image gallery, and reservation modal.',
  },
  {
    id: 'portfolio',
    title: '👨‍💻 Developer Portfolio',
    subtitle: 'Personal bio, projects showcase, tech stack pills & contact',
    prompt: 'Create a slick Full-Stack Developer & UI Designer portfolio website with animated hero, project cards, skill badges, experience timeline, and contact form.',
  },
  {
    id: 'gym',
    title: '💪 Fitness Gym & Fitness',
    subtitle: 'High energy theme, workout plans, trainer bios & pricing',
    prompt: 'Create a high-energy fitness gym landing page with bold red and dark theme, class schedule, membership tiers, trainer profiles, and free trial signup form.',
  },
  {
    id: 'ecommerce',
    title: '🛍️ Fashion E-Commerce',
    subtitle: 'Product grid, shopping cart modal & checkout summary',
    prompt: 'Create a trendy online fashion clothing store website with category filters, product card grid with hover effects, shopping cart drawer, and modern banner.',
  },
];

const DEFAULT_SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Swatea Coffee House & Bakery</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    h1, h2, h3 { font-family: 'Playfair Display', serif; }
  </style>
</head>
<body class="bg-amber-950 text-amber-50 min-h-screen">
  <!-- Navigation Header -->
  <header class="sticky top-0 z-50 bg-amber-950/90 backdrop-blur-md border-b border-amber-800/40 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="text-2xl">☕</span>
      <span class="text-xl font-bold tracking-wider text-amber-200">SWATEA CAFE</span>
    </div>
    <nav class="hidden md:flex items-center gap-6 text-sm text-amber-200 font-medium">
      <a href="#about" class="hover:text-amber-400 transition-colors">About Us</a>
      <a href="#menu" class="hover:text-amber-400 transition-colors">Signature Menu</a>
      <a href="#reviews" class="hover:text-amber-400 transition-colors">Reviews</a>
      <a href="#contact" class="hover:text-amber-400 transition-colors">Location</a>
    </nav>
    <a href="#contact" class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-extrabold px-5 py-2.5 rounded-full text-xs transition-all shadow-lg hover:scale-105">
      Book a Table
    </a>
  </header>

  <!-- Hero Section -->
  <section class="relative px-6 py-20 md:py-28 max-w-6xl mx-auto text-center space-y-6">
    <div class="inline-block px-4 py-1.5 rounded-full bg-amber-900/60 border border-amber-700/50 text-amber-300 text-xs font-semibold uppercase tracking-widest">
      ✨ Fresh Roasted Artisanal Beans Every Morning
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold text-amber-100 leading-tight">
      A Pure Taste of <span class="text-amber-400 italic">Perfection & Warmth</span>
    </h1>
    <p class="text-amber-200/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
      Welcome to Swatea Cafe, where organic single-origin beans meet hand-crafted sourdough pastries. Experience serene ambiance and masterfully brewed espresso.
    </p>
    <div class="flex flex-wrap justify-center gap-4 pt-4">
      <a href="#menu" class="bg-amber-400 text-amber-950 font-bold px-7 py-3 rounded-xl hover:bg-amber-300 transition-all text-sm shadow-xl">
        Explore Menu
      </a>
      <a href="#contact" class="bg-amber-900/60 border border-amber-700 text-amber-200 font-semibold px-7 py-3 rounded-xl hover:bg-amber-800/80 transition-all text-sm">
        Visit Cafe
      </a>
    </div>
  </section>

  <!-- Signature Menu Grid -->
  <section id="menu" class="px-6 py-16 bg-amber-900/30 border-y border-amber-800/30">
    <div class="max-w-6xl mx-auto space-y-10">
      <div class="text-center space-y-2">
        <h2 class="text-3xl md:text-4xl font-extrabold text-amber-200">Our Signature Menu</h2>
        <p class="text-amber-300/70 text-xs md:text-sm">Handcrafted drinks and fresh organic bakes</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-amber-900/50 border border-amber-800/60 p-6 rounded-2xl space-y-3 hover:border-amber-500/50 transition-all hover:-translate-y-1">
          <div class="text-4xl">☕</div>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-amber-100">Swatea Gold Espresso</h3>
            <span class="text-amber-400 font-bold font-mono">₹220</span>
          </div>
          <p class="text-xs text-amber-300/70 leading-relaxed">Double shot dark roast espresso infused with organic honey & cardamom note.</p>
        </div>

        <div class="bg-amber-900/50 border border-amber-800/60 p-6 rounded-2xl space-y-3 hover:border-amber-500/50 transition-all hover:-translate-y-1">
          <div class="text-4xl">🥐</div>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-amber-100">Butter Almond Croissant</h3>
            <span class="text-amber-400 font-bold font-mono">₹180</span>
          </div>
          <p class="text-xs text-amber-300/70 leading-relaxed">Freshly baked French flaky croissant layered with toasted almond flakes.</p>
        </div>

        <div class="bg-amber-900/50 border border-amber-800/60 p-6 rounded-2xl space-y-3 hover:border-amber-500/50 transition-all hover:-translate-y-1">
          <div class="text-4xl">🍵</div>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-amber-100">Kyoto Match Latte</h3>
            <span class="text-amber-400 font-bold font-mono">₹260</span>
          </div>
          <p class="text-xs text-amber-300/70 leading-relaxed">Ceremonial grade Japanese green tea matcha steamed with creamy oat milk.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Reservation & Contact -->
  <section id="contact" class="px-6 py-16 max-w-4xl mx-auto text-center space-y-6">
    <h2 class="text-3xl font-bold text-amber-100">Reserve Your Experience</h2>
    <form class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto text-left" onsubmit="event.preventDefault(); alert('Reservation Request Received!');">
      <input type="text" placeholder="Your Name" required class="bg-amber-900/60 border border-amber-700 rounded-xl p-3 text-xs text-amber-100 focus:outline-none focus:border-amber-400">
      <input type="tel" placeholder="Phone Number" required class="bg-amber-900/60 border border-amber-700 rounded-xl p-3 text-xs text-amber-100 focus:outline-none focus:border-amber-400">
      <input type="date" required class="bg-amber-900/60 border border-amber-700 rounded-xl p-3 text-xs text-amber-100 focus:outline-none focus:border-amber-400">
      <select class="bg-amber-900/60 border border-amber-700 rounded-xl p-3 text-xs text-amber-100 focus:outline-none focus:border-amber-400">
        <option>2 Guests</option>
        <option>4 Guests</option>
        <option>6+ Guests Party</option>
      </select>
      <button type="submit" class="md:col-span-2 bg-amber-400 text-amber-950 font-bold py-3 rounded-xl hover:bg-amber-300 transition-all text-xs uppercase tracking-wider">
        Confirm Reservation Table
      </button>
    </form>
  </section>

  <!-- Footer -->
  <footer class="border-t border-amber-800/40 py-8 px-6 text-center text-xs text-amber-400/60">
    © 2026 Swatea Cafe & Bakery. Built with Swatea AI Website Studio.
  </footer>
</body>
</html>`;

export const WebsiteModule: React.FC<WebsiteModuleProps> = ({ language }) => {
  const isTamil = language === 'ta';

  const [prompt, setPrompt] = useState('');
  const [refactorPrompt, setRefactorPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>(DEFAULT_SAMPLE_HTML);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [isFullscreenModal, setIsFullscreenModal] = useState(false);

  const handleGenerateWebsite = async (overridePrompt?: string) => {
    const targetPrompt = overridePrompt || prompt;
    if (!targetPrompt.trim() || loading) return;

    setLoading(true);
    try {
      const data = await safeFetchJson('/api/website', {
        method: 'POST',
        body: JSON.stringify({
          prompt: targetPrompt,
          currentHtml: generatedHtml,
          language: isTamil ? 'Tamil' : 'English',
        }),
      });

      if (data.html) {
        setGeneratedHtml(data.html);
        setActiveTab('preview');
      }
    } catch (err: any) {
      alert(`Website AI Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefactorWebsite = async () => {
    if (!refactorPrompt.trim() || loading) return;

    setLoading(true);
    try {
      const data = await safeFetchJson('/api/website', {
        method: 'POST',
        body: JSON.stringify({
          prompt: `Modify the current website: ${refactorPrompt}`,
          currentHtml: generatedHtml,
          language: isTamil ? 'Tamil' : 'English',
        }),
      });

      if (data.html) {
        setGeneratedHtml(data.html);
        setRefactorPrompt('');
        setActiveTab('preview');
      }
    } catch (err: any) {
      alert(`Modification Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swatea-website-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-amber-400" />
            <span>{isTamil ? 'AI வெப்சைட் பில்டர் (AI Website Studio)' : 'Swatea AI Website Builder'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'ஒரே Prompt உள்ளீட்டில் முழுமையான, நேரலை responsive வெப்சைட் உருவாக்குங்கள்.'
              : 'Generate complete, modern, interactive Tailwind HTML/JS websites from natural language prompts with instant live preview.'}
          </p>
        </div>

        {/* Viewport & View Mode Switches */}
        <div className="flex items-center gap-2">
          {/* Viewport switch */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-2 rounded-lg font-bold transition-all ${
                viewport === 'desktop' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-2 rounded-lg font-bold transition-all ${
                viewport === 'tablet' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-2 rounded-lg font-bold transition-all ${
                viewport === 'mobile' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switch (Preview / Code) */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isTamil ? 'நேரலை முன்னோட்டம்' : 'Live Preview'}</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'code' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{isTamil ? 'HTML கோட்' : 'HTML Code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Prompts Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase font-mono">
          {isTamil ? 'வேகமான வெப்சைட் மாதிரிகள் (Quick Website Templates):' : 'Instant Starter Website Templates:'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TEMPLATE_PROMPTS.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                setPrompt(tmpl.prompt);
                handleGenerateWebsite(tmpl.prompt);
              }}
              className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 rounded-xl text-left transition-all group"
            >
              <div className="font-bold text-xs text-amber-300 group-hover:text-amber-200">{tmpl.title}</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{tmpl.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Generator Box */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isTamil ? 'உங்கள் வெப்சைட் விவரங்களை எழுதுங்கள் (Prompt):' : 'Describe your custom website:'}</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            placeholder={
              isTamil
                ? 'எடுத்துக்காட்டு: "ஒரு ஆடம்பர ஹோட்டல் மற்றும் ரிசார்ட் வெப்சைட் உருவாக்கு..."'
                : 'Example: "Create a modern organic bakery website with hero slider, baked items grid, customer reviews, and order form"'
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-sans resize-none"
          />

          <button
            onClick={() => handleGenerateWebsite()}
            disabled={loading || !prompt.trim()}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-slate-950 font-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-xl whitespace-nowrap"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-slate-950 fill-slate-950" />}
            <span>
              {loading
                ? (isTamil ? 'வெப்சைட் உருவாகிறது...' : 'Building Website with Gemini...')
                : (isTamil ? 'வெப்சைட் உருவாக்கு' : 'Generate Website')}
            </span>
          </button>
        </div>
      </div>

      {/* Main Display Area (Live iFrame Preview or HTML Code) */}
      <div className="flex-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[500px]">
        {/* Top Control Bar for Display */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="text-[11px] ml-2 text-slate-300">https://swatea-preview.internal</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 rounded-lg text-xs font-mono flex items-center gap-1 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>

            <button
              onClick={() => setIsFullscreenModal(true)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
              title="Fullscreen View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-slate-950 flex justify-center p-2 overflow-auto">
          {activeTab === 'preview' ? (
            <div
              className={`transition-all bg-white rounded-xl overflow-hidden border border-slate-800 shadow-2xl ${
                viewport === 'mobile'
                  ? 'w-[375px] h-[667px] my-auto'
                  : viewport === 'tablet'
                  ? 'w-[768px] h-[800px] my-auto'
                  : 'w-full h-full min-h-[500px]'
              }`}
            >
              <iframe
                title="Website Live Preview"
                srcDoc={generatedHtml}
                className="w-full h-full border-0 rounded-xl"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
              />
            </div>
          ) : (
            <div className="w-full h-full p-4 font-mono text-xs text-amber-300 bg-slate-950 overflow-auto whitespace-pre leading-relaxed">
              {generatedHtml}
            </div>
          )}
        </div>

        {/* Bottom Refactor / Modify Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={refactorPrompt}
            onChange={(e) => setRefactorPrompt(e.target.value)}
            placeholder={
              isTamil
                ? 'தற்போது உள்ள வெப்சைட்டில் மாற்றம் செய்ய (எ.கா: "டார்க் மோட் பட்டன் சேர்", "வண்ணங்களை பச்சை நிறமாக்கு")...'
                : 'Modify generated website (e.g., "Add dark mode toggle button", "Change primary accent color to emerald green", "Add contact form")'
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRefactorWebsite();
              }
            }}
          />
          <button
            onClick={handleRefactorWebsite}
            disabled={loading || !refactorPrompt.trim()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{isTamil ? 'மாற்றம் செய்' : 'Refactor Page'}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Viewport Modal */}
      {isFullscreenModal && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-amber-300 font-bold flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Full Browser Live Website Preview</span>
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
              title="Fullscreen Website Preview"
              srcDoc={generatedHtml}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
};
