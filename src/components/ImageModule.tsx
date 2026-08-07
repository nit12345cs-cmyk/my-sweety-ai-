import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  RefreshCw,
  Palette,
  Layers,
  Zap,
  Eye,
  Sliders
} from 'lucide-react';
import { LanguageCode, GeneratedImageResult } from '../types';
import { safeFetchJson } from '../lib/api';

interface ImageModuleProps {
  language: LanguageCode;
}

const STYLE_PRESETS = [
  { id: 'cinematic', name: '🎬 Cinematic Cyberpunk', promptAdd: ', 8k resolution, cinematic lighting, cyberpunk neon glow, ultra-detailed' },
  { id: 'anime', name: '🎨 Anime & Digital Art', promptAdd: ', makoto shinkai style, vibrant colors, detailed anime digital painting, soft lighting' },
  { id: 'photo', name: '📸 Photorealistic HD', promptAdd: ', photorealistic, shot on 35mm lens, natural lighting, hyperrealistic 8k' },
  { id: 'fantasy', name: '🔮 High Fantasy Art', promptAdd: ', epic fantasy illustration, glowing magical runes, dramatic volumetric atmospheric lighting' },
  { id: '3d', name: '🧊 Modern 3D Render', promptAdd: ', octane 3d render, smooth isometric geometry, ambient occlusion, pastel colors' },
  { id: 'sketch', name: '✏️ Pencil & Ink Sketch', promptAdd: ', vintage charcoal pencil sketch, intricate hatching lines, artistic monochrome' },
];

const SAMPLE_PROMPTS = [
  {
    title: '🌆 Tamil Nadu Cyberpunk City',
    prompt: 'Futuristic Tamil Nadu cyberpunk smart city with golden lotus towers, flying cars, and glowing Tamil neon signs at twilight',
  },
  {
    title: '🦁 Majestic Golden Lion Armor',
    prompt: 'A majestic lion wearing ornate ancient royal gold armor, glowing ruby eyes, dramatic studio dark background',
  },
  {
    title: '🌌 Cosmic Galaxy Waterfall',
    prompt: 'A surreal mystical waterfall flowing into a crystal purple river under a celestial galaxy night sky with glowing planets',
  },
  {
    title: '☕ Cyberpunk Cafe Barista',
    prompt: 'An AI barista robot pouring espresso in a cozy futuristic neon coffee shop surrounded by plants and holographic menus',
  },
];

export const ImageModule: React.FC<ImageModuleProps> = ({ language }) => {
  const isTamil = language === 'ta';

  const [prompt, setPrompt] = useState(
    isTamil
      ? 'தமிழ்நாட்டின் எதிர்கால ஸ்மார்ட் சிட்டி மற்றும் நியான் விளக்குகள் கொண்ட ஏஐ கோபுரம்.'
      : 'A futuristic Tamil Nadu smart city with glowing golden neon towers and lotus architecture at twilight'
  );
  const [selectedStyle, setSelectedStyle] = useState<string>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<GeneratedImageResult | null>(null);
  const [history, setHistory] = useState<GeneratedImageResult[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerateImage = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse.trim() || loading) return;

    setLoading(true);

    const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
    const finalPrompt = promptToUse + (styleObj ? styleObj.promptAdd : '');

    try {
      const data = await safeFetchJson('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio,
        }),
      });

      const newRes: GeneratedImageResult = {
        id: Date.now().toString(),
        prompt: promptToUse,
        imageUrl: data.imageUrl,
        aspectRatio: data.aspectRatio || aspectRatio,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentResult(newRes);
      setHistory((prev) => [newRes, ...prev.slice(0, 10)]);
    } catch (err: any) {
      alert(`Image Generation Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const magicEnhancePrompt = () => {
    const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
    const enhanced = prompt.trim()
      ? `${prompt.trim()}, masterpiece quality, intricate textures, volumetric god rays, high detail, trending on artstation`
      : 'A surreal mystical floating island with crystal waterfalls, glowing flora, and a giant glowing moon in the background';
    setPrompt(enhanced);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-rose-400" />
            <span>{isTamil ? 'AI படம் உருவாக்குபவர் (AI Image Studio)' : 'Swatea AI Image Generator'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'உரையை உள்ளிட்டு உடனடியாக உயர்தர AI படங்களை உருவாக்குங்கள்.'
              : 'Transform text prompts into high-resolution artwork, photo renders, and digital illustrations powered by Gemini.'}
          </p>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column Controls */}
        <div className="lg:col-span-5 space-y-5 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          {/* Prompt Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isTamil ? 'பட விவரக் குறிப்பு (Image Prompt):' : 'Image Prompt:'}</span>
              </label>

              <button
                type="button"
                onClick={magicEnhancePrompt}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3 h-3" />
                <span>Enhance</span>
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder={
                isTamil
                  ? 'எத்தகைய படத்தை உருவாக்க வேண்டும் என்பதை விவரிக்கவும்...'
                  : 'Describe the image scene, subjects, colors, lighting, and composition...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
          </div>

          {/* Style Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2 font-mono flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              <span>{isTamil ? 'பாணி / Style:' : 'Artistic Style Preset:'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-2.5 rounded-xl text-left border font-semibold transition-all ${
                    selectedStyle === style.id
                      ? 'bg-rose-500/20 text-rose-200 border-rose-500/60 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate text-xs font-bold">{style.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2 font-mono flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>{isTamil ? 'விகிதம் / Aspect Ratio:' : 'Aspect Ratio:'}</span>
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 rounded-xl font-bold transition-all border ${
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

          {/* Generate Button */}
          <button
            onClick={() => handleGenerateImage()}
            disabled={loading || !prompt.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-slate-950 font-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-2xl uppercase tracking-wider cursor-pointer"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-slate-950" />}
            <span>
              {loading
                ? (isTamil ? 'படம் உருவாக்கப்படுகிறது...' : 'Generating AI Artwork...')
                : (isTamil ? 'AI படம் உருவாக்கு' : 'Generate AI Image')}
            </span>
          </button>

          {/* Quick Idea Prompts */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              {isTamil ? 'மாதிரி Prompt கருத்துக்கள்:' : 'Sample Image Ideas:'}
            </span>
            <div className="space-y-1.5">
              {SAMPLE_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(p.prompt);
                    handleGenerateImage(p.prompt);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800/60 text-[11px] text-slate-300 hover:text-amber-300 transition-all truncate"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Display & Gallery */}
        <div className="lg:col-span-7 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>{isTamil ? 'உருவாக்கப்பட்ட படம்' : 'Generated Image Canvas'}</span>
            </span>

            {currentResult && (
              <span className="text-[10px] text-amber-300 font-mono bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                {currentResult.aspectRatio} | {currentResult.createdAt}
              </span>
            )}
          </div>

          {/* Active Canvas Display */}
          <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-4 min-h-[360px] overflow-hidden">
            {loading ? (
              <div className="text-center space-y-3">
                <Sparkles className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
                <p className="text-xs text-amber-300 font-mono">
                  {isTamil ? 'ஜெமினி மாடல் உயர்தர படத்தை வடிவமைக்கிறது...' : 'Rendering high-definition visual output with Gemini...'}
                </p>
              </div>
            ) : currentResult ? (
              <div className="space-y-3 text-center w-full">
                <img
                  src={currentResult.imageUrl}
                  alt={currentResult.prompt}
                  className="max-h-[400px] mx-auto object-contain rounded-xl shadow-2xl border border-slate-800"
                />
                <div className="flex items-center justify-between max-w-lg mx-auto bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                  <p className="text-slate-300 italic truncate max-w-[300px] text-left">
                    "{currentResult.prompt}"
                  </p>
                  <a
                    href={currentResult.imageUrl}
                    download={`swatea-ai-image-${Date.now()}.png`}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-all text-xs shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 text-slate-600">
                <Wand2 className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-xs italic">
                  {isTamil
                    ? 'உங்கள் விவரிப்பை உள்ளிட்டு "AI படம் உருவாக்கு" பொத்தானைக் கிளிக் செய்யவும்.'
                    : 'Enter an image prompt and click Generate AI Image to create artwork.'}
                </p>
              </div>
            )}
          </div>

          {/* Image History Gallery */}
          {history.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 font-mono">
                {isTamil ? 'முந்தைய படங்கள்:' : 'Recent Generated Gallery:'}
              </span>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentResult(item)}
                    className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border transition-all ${
                      currentResult?.id === item.id ? 'border-amber-400 scale-105 shadow-lg' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
