import React, { useState } from 'react';
import { Eye, Image as ImageIcon, Sparkles, Upload, Scan, Wand2, Download, Copy, Check, RefreshCw } from 'lucide-react';
import { ImageSample, LanguageCode, GeneratedImageResult } from '../types';
import { safeFetchJson } from '../lib/api';

interface VisionModuleProps {
  language: LanguageCode;
}

const SAMPLE_IMAGES: ImageSample[] = [
  {
    id: 'img-1',
    name: 'Enterprise Dashboard Mockup',
    mimeType: 'image/svg+xml',
    description: 'System Architecture Diagram showing Cloud API Gateway, Microservices & Database',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="%230f172a"><rect width="400" height="250" fill="%23020617" rx="16"/><rect x="30" y="30" width="100" height="60" fill="%231e293b" stroke="%23f59e0b" stroke-width="2" rx="8"/><text x="50" y="65" fill="%23f59e0b" font-family="sans-serif" font-size="12" font-weight="bold">API Gateway</text><rect x="150" y="30" width="100" height="60" fill="%231e293b" stroke="%2338bdf8" stroke-width="2" rx="8"/><text x="165" y="65" fill="%2338bdf8" font-family="sans-serif" font-size="12" font-weight="bold">Gemini AI</text><rect x="270" y="30" width="100" height="60" fill="%231e293b" stroke="%2310b981" stroke-width="2" rx="8"/><text x="285" y="65" fill="%2310b981" font-family="sans-serif" font-size="12" font-weight="bold">PostgreSQL</text><path d="M130 60 L150 60 M250 60 L270 60" stroke="%2394a3b8" stroke-width="2" stroke-dasharray="4"/><rect x="30" y="130" width="340" height="80" fill="%230f172a" stroke="%23334155" rx="8"/><text x="50" y="160" fill="%23e2e8f0" font-family="sans-serif" font-size="14" font-weight="bold">SWATEA AI OS X Ultimate Architecture</text><text x="50" y="185" fill="%2394a3b8" font-family="sans-serif" font-size="11">Latency: 42ms | Availability: 99.99% | Security: Encrypted</text></svg>`,
  },
  {
    id: 'img-2',
    name: 'Hardware Circuit & Sensor Diagram',
    mimeType: 'image/svg+xml',
    description: 'Embedded Microcontroller Circuit board with IoT sensors and wireless module',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="%23020617"><rect width="400" height="250" fill="%23020617" rx="16"/><circle cx="200" cy="125" r="70" fill="%23065f46" stroke="%2310b981" stroke-width="3"/><rect x="175" y="100" width="50" height="50" fill="%230f172a" stroke="%23f59e0b" stroke-width="2"/><text x="180" y="130" fill="%23f59e0b" font-family="monospace" font-size="12" font-weight="bold">MCU</text><path d="M100 125 L130 125 M270 125 L300 125" stroke="%2338bdf8" stroke-width="4"/><circle cx="90" cy="125" r="10" fill="%230284c7"/><circle cx="310" cy="125" r="10" fill="%23e11d48"/><text x="120" y="220" fill="%23e2e8f0" font-family="sans-serif" font-size="12">Swatea Vision OCR Test Image</text></svg>`,
  }
];

export const VisionModule: React.FC<VisionModuleProps> = ({ language }) => {
  const isTamil = language === 'ta';

  const [activeTab, setActiveTab] = useState<'inspect' | 'generate'>('inspect');
  const [selectedImg, setSelectedImg] = useState<ImageSample>(SAMPLE_IMAGES[0]);
  const [prompt, setPrompt] = useState(
    isTamil
      ? 'இந்த படத்தில் உள்ள முக்கிய பாகங்கள், எழுத்துக்கள் மற்றும் கட்டமைப்பு விவரங்களை ஆராயுங்கள்.'
      : 'Analyze this image in detail. Extract any text, architectural elements, status metrics, and component relationships.'
  );
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');

  // Image Generation States
  const [genPrompt, setGenPrompt] = useState(
    isTamil
      ? 'தமிழ்நாட்டின் எதிர்கால ஸ்மார்ட் சிட்டி மற்றும் நியான் விளக்குகள் கொண்ட ஏஐ கோபுரம்.'
      : 'Futuristic AI Cyberpunk Smart City skyline in Tamil Nadu with glowing golden neon towers at twilight.'
  );
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [genLoading, setGenLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedImageResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const customImageSample: ImageSample = {
          id: 'uploaded-' + Date.now(),
          name: file.name,
          mimeType: file.type || 'image/png',
          description: `User uploaded file: ${file.name} (${Math.round(file.size / 1024)} KB)`,
          url: result,
        };
        setSelectedImg(customImageSample);
        setAnalysis('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImg) return;

    setLoading(true);
    try {
      const data = await safeFetchJson('/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: selectedImg.url,
          mimeType: selectedImg.mimeType,
          prompt,
        }),
      });

      setAnalysis(data.analysis);
    } catch (err: any) {
      alert(`Vision AI Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!genPrompt.trim()) return;

    setGenLoading(true);
    try {
      const data = await safeFetchJson('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: genPrompt,
          aspectRatio,
        }),
      });

      setGeneratedResult({
        id: Date.now().toString(),
        prompt: data.prompt || genPrompt,
        imageUrl: data.imageUrl,
        aspectRatio: data.aspectRatio || aspectRatio,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      alert(`Image Generation Error: ${err.message}`);
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Module Title & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-amber-400" />
            <span>{isTamil ? 'விஷன் & படம் AI ஸ்டுடியோ' : 'Swatea Vision & Image AI Studio'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'பட ஆய்வுகள், உரை கண்டறிதல் (OCR) மற்றும் புதிய AI பட உருவாக்கம்.'
              : 'Multimodal vision inspection, diagram OCR, and text-to-image generation powered by Gemini.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('inspect')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inspect'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isTamil ? 'படம் பகுப்பாய்வு' : 'Vision OCR & Inspection'}</span>
          </button>

          <button
            onClick={() => setActiveTab('generate')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'generate'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{isTamil ? 'AI படம் உருவாக்கு' : 'AI Image Generator'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'inspect' ? (
        <>
          {/* Preset sample images & Upload custom */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase font-mono">
                {isTamil ? 'மாதிரி படங்கள் / சொந்தப் படம்:' : 'Select Sample or Upload Custom:'}
              </label>
              <label className="cursor-pointer text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-lg flex items-center gap-1.5 font-mono transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>{isTamil ? 'சொந்தப் படம் பதிவேற்று' : 'Upload Image'}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_IMAGES.map((img) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setSelectedImg(img);
                    setAnalysis('');
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    selectedImg.id === img.id
                      ? 'bg-amber-500/10 border-amber-500/50 text-white shadow'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="w-16 h-12 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-amber-300 truncate">{img.name}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{img.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Inspection Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Scan className="w-4 h-4 text-amber-400" />
                <span>{isTamil ? 'படம் முன்னோட்டம்' : 'Active Image Preview'}</span>
              </div>

              <div className="w-full h-56 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 overflow-hidden shadow-inner">
                <img src={selectedImg.url} alt={selectedImg.name} className="max-h-full object-contain rounded-lg" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isTamil ? 'விஷன் வினா / Prompt:' : 'Vision Analysis Prompt:'}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <button
                onClick={handleAnalyzeImage}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                <span>
                  {loading
                    ? (isTamil ? 'படத்தை ஆராய்கிறது...' : 'Analyzing Image with Gemini Vision...')
                    : (isTamil ? 'படத்தை பகுப்பாய்வு செய்' : 'Run Gemini Vision Inspection')}
                </span>
              </button>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{isTamil ? 'விஷன் ஆய்வு முடிவுகள்' : 'Gemini Vision Diagnostic Report'}</span>
                </span>
              </div>

              <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans overflow-y-auto max-h-[360px]">
                {analysis || (
                  <span className="text-slate-600 italic">
                    {isTamil
                      ? 'பட பகுப்பாய்வு முடிவுகள் இங்கு தோன்றும்.'
                      : 'Detailed visual breakdown, detected text, and object relationships will be displayed here.'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* AI Image Generation Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono">
                {isTamil ? 'படம் உருவாக்க விவரங்கள் (Image Prompt):' : 'Image Generation Prompt:'}
              </label>
              <textarea
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                rows={4}
                placeholder={isTamil ? 'எத்தகைய படத்தை உருவாக்க வேண்டும்?...' : 'Describe the scene, style, lighting, and composition...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono">
                {isTamil ? 'விகிதம் (Aspect Ratio):' : 'Aspect Ratio:'}
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 rounded-xl font-bold font-mono transition-all border ${
                      aspectRatio === ratio
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={genLoading || !genPrompt.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-slate-950 font-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-xl uppercase tracking-wider"
            >
              {genLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-slate-950" />}
              <span>
                {genLoading
                  ? (isTamil ? 'படம் உருவாக்கப்படுகிறது...' : 'Generating Image with Gemini...')
                  : (isTamil ? 'AI படம் உருவாக்கு' : 'Generate AI Image')}
              </span>
            </button>
          </div>

          {/* Right Image Display Card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                <span>{isTamil ? 'உருவாக்கப்பட்ட படம்' : 'AI Generated Visual Output'}</span>
              </span>
              {generatedResult && (
                <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {generatedResult.aspectRatio}
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-3 overflow-hidden min-h-[280px]">
              {genLoading ? (
                <div className="text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">
                    {isTamil ? 'ஜெமினி மாடல் படத்தை வடிவமைக்கிறது...' : 'Rendering high-resolution artwork with Gemini...'}
                  </p>
                </div>
              ) : generatedResult ? (
                <img
                  src={generatedResult.imageUrl}
                  alt={generatedResult.prompt}
                  className="max-h-[340px] w-auto object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="text-center space-y-2 text-slate-600">
                  <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                  <p className="text-xs italic">
                    {isTamil
                      ? 'உங்கள் கற்பனையான விவரிப்பை உள்ளிட்டு "AI படம் உருவாக்கு" பொத்தானை அழுத்தவும்.'
                      : 'Describe a scene and click Generate AI Image to view generated artwork.'}
                  </p>
                </div>
              )}
            </div>

            {generatedResult && (
              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-400 truncate max-w-[240px] font-mono text-[11px]">
                  "{generatedResult.prompt}"
                </span>
                <a
                  href={generatedResult.imageUrl}
                  download={`swatea-ai-image-${Date.now()}.png`}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg flex items-center gap-1.5 font-bold transition-all text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'பதிவிறக்கு' : 'Download'}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
