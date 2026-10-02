import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  Palette,
  Sliders,
  Upload,
  Film,
  Layers,
  Split,
  Trash2,
  Key,
  Zap,
  Cpu,
  ShieldCheck,
  ExternalLink,
  X,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { LanguageCode, GeneratedImageResult } from '../types';
import { safeFetchJson } from '../lib/api';

interface ImageModuleProps {
  language: LanguageCode;
  onNavigateToVideo?: (imageUrl: string, prompt: string) => void;
}

const STYLE_PRESETS = [
  { id: 'cinematic', name: '🎬 Cinematic Cyberpunk', promptAdd: ', 8k resolution, cinematic lighting, cyberpunk neon glow, ultra-detailed' },
  { id: 'photo', name: '📸 Photorealistic 8K', promptAdd: ', photorealistic, shot on 35mm lens, natural lighting, hyperrealistic 8k, bokeh' },
  { id: 'anime', name: '🎨 Anime & Digital Art', promptAdd: ', makoto shinkai style, vibrant colors, detailed anime digital painting, soft volumetric lighting' },
  { id: 'fantasy', name: '🔮 High Fantasy Art', promptAdd: ', epic fantasy illustration, glowing magical runes, dramatic atmospheric lighting' },
  { id: '3d', name: '🧊 Modern 3D Octane', promptAdd: ', octane 3d render, smooth isometric geometry, ambient occlusion, pastel colors, raytracing' },
  { id: 'oil', name: '🖌️ Classical Oil Painting', promptAdd: ', impasto oil painting on canvas, expressive brush strokes, dramatic chiaroscuro' },
];

const SAMPLE_PROMPTS_CREATE = [
  {
    title: '🌆 Tamil Nadu Cyberpunk City',
    prompt: 'Futuristic Tamil Nadu cyberpunk smart city with golden lotus towers, flying vehicles, and glowing Tamil neon signs at twilight, photorealistic 8k',
  },
  {
    title: '🦁 Majestic Royal Gold Lion',
    prompt: 'A majestic royal lion wearing ornate ancient royal gold armor, glowing ruby eyes, dramatic cinematic studio dark background, high detail',
  },
  {
    title: '🌌 Celestial Galaxy Waterfall',
    prompt: 'A surreal mystical waterfall flowing into a crystal purple river under a celestial galaxy night sky with glowing planets and nebula',
  },
  {
    title: '☕ AI Barista Robot Cafe',
    prompt: 'An AI barista robot pouring espresso in a cozy futuristic neon coffee shop surrounded by lush tropical plants and holographic menus',
  },
];

const SAMPLE_PROMPTS_EDIT = [
  {
    title: '🕶️ Add Cyberpunk Sunglasses',
    prompt: 'Add stylish glowing futuristic neon cyberpunk sunglasses to the subject with subtle neon reflections and cinematic rim light',
  },
  {
    title: '🎨 Transform to Anime Art',
    prompt: 'Transform this entire image into a high-detail vibrant Makoto Shinkai anime aesthetic while keeping subject composition intact',
  },
  {
    title: '🌅 Change to Sunset Beach',
    prompt: 'Replace the background with a breathtaking golden hour tropical sunset beach with calm turquoise waves and coconut palms',
  },
  {
    title: '🤖 Add Companion Drone',
    prompt: 'Add a small, friendly glowing companion robot drone hovering gracefully beside the main subject with blue led lights',
  },
];

interface EngineOption {
  id: string;
  name: string;
  badge: string;
  desc: string;
  color: string;
  requiresKey: boolean;
  keyType?: 'openai' | 'gemini';
}

const ENGINE_OPTIONS: EngineOption[] = [
  {
    id: 'flux-schnell',
    name: 'Flux.1 Schnell',
    badge: '⚡ ~1s Turbo',
    desc: 'Core High-Speed Engine (Direct, Free & Instant)',
    color: 'border-amber-500/60 bg-amber-500/10 text-amber-300',
    requiresKey: false,
  },
  {
    id: 'flux-realism',
    name: 'Flux.1 Realism',
    badge: '🎨 8K Photoreal',
    desc: 'Photorealistic textures, depth & studio light',
    color: 'border-purple-500/60 bg-purple-500/10 text-purple-300',
    requiresKey: false,
  },
  {
    id: 'dall-e-3',
    name: 'OpenAI DALL-E 3',
    badge: '🤖 DALL-E 3',
    desc: 'Master prompt fidelity & artistic composition',
    color: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300',
    requiresKey: true,
    keyType: 'openai',
  },
  {
    id: 'imagen-3',
    name: 'Google Imagen 3',
    badge: '🌟 Imagen 3',
    desc: 'Google Imagen 3.0 ultra-fine studio generation',
    color: 'border-blue-500/60 bg-blue-500/10 text-blue-300',
    requiresKey: true,
    keyType: 'gemini',
  },
  {
    id: 'sdxl-turbo',
    name: 'SDXL Turbo',
    badge: '🚀 SDXL',
    desc: 'Rapid draft & concept generation',
    color: 'border-rose-500/60 bg-rose-500/10 text-rose-300',
    requiresKey: false,
  },
];

export const ImageModule: React.FC<ImageModuleProps> = ({ language, onNavigateToVideo }) => {
  const isTamil = language === 'ta';

  // Mode: 'create' (text-to-image) or 'edit' (image-to-image)
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');

  // Active Engine
  const [selectedEngine, setSelectedEngine] = useState<string>('flux-schnell');

  // Prompts
  const [createPrompt, setCreatePrompt] = useState(
    isTamil
      ? 'தமிழ்நாட்டின் எதிர்கால ஸ்மார்ட் சிட்டி, நியான் விளக்குகள் மற்றும் தங்க தாமரை கோபுரம், 8k தரம்.'
      : 'A futuristic Tamil Nadu smart city with glowing golden neon towers and lotus architecture at twilight, 8k resolution'
  );
  const [editPrompt, setEditPrompt] = useState(
    isTamil
      ? 'இந்த படத்தில் நியான் சன்கிளாஸ் மற்றும் சைபர்பங்க் ஒளிரும் ஆடைகளை சேர்க்கவும்.'
      : 'Add stylish glowing futuristic neon cyberpunk sunglasses and subtle neon aura to the subject'
  );

  // Source Image for Editing (base64)
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageName, setSourceImageName] = useState<string>('');

  const [selectedStyle, setSelectedStyle] = useState<string>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');

  // Generation status & Timer
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [currentResult, setCurrentResult] = useState<GeneratedImageResult | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // API Settings Modal
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState<string>(() => {
    return localStorage.getItem('swatea_openai_api_key') || '';
  });
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('swatea_custom_api_key') || '';
  });
  const [testStatus, setTestStatus] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
  }>({ testing: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local storage history
  const [history, setHistory] = useState<GeneratedImageResult[]>(() => {
    try {
      const saved = localStorage.getItem('swatea_image_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('swatea_image_history', JSON.stringify(history.slice(0, 15)));
    } catch (e) {}
  }, [history]);

  // Elapsed timer during loading
  useEffect(() => {
    if (loading) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const handleSaveApiKeys = () => {
    if (openaiApiKey.trim()) {
      localStorage.setItem('swatea_openai_api_key', openaiApiKey.trim());
    } else {
      localStorage.removeItem('swatea_openai_api_key');
    }

    if (geminiApiKey.trim()) {
      localStorage.setItem('swatea_custom_api_key', geminiApiKey.trim());
    } else {
      localStorage.removeItem('swatea_custom_api_key');
    }

    setIsApiModalOpen(false);
  };

  const handleTestEngine = async (engineToTest: string) => {
    setTestStatus({ testing: true });
    try {
      const res = await safeFetchJson('/api/test-image-engine', {
        method: 'POST',
        headers: {
          ...(openaiApiKey ? { 'x-openai-api-key': openaiApiKey.trim() } : {}),
          ...(geminiApiKey ? { 'x-custom-api-key': geminiApiKey.trim() } : {}),
        },
        body: JSON.stringify({
          engine: engineToTest,
          openaiApiKey: openaiApiKey.trim(),
          customApiKey: geminiApiKey.trim(),
        }),
      });
      setTestStatus({
        testing: false,
        success: res.success,
        message: res.message || (res.success ? 'Engine connected successfully!' : 'Connection test failed'),
      });
    } catch (err: any) {
      setTestStatus({
        testing: false,
        success: false,
        message: err?.message || 'Connection error',
      });
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceImageName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setSourceImage(result);
      setActiveTab('edit');
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSourceImageName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setSourceImage(result);
        setActiveTab('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (customPrompt?: string) => {
    const isEdit = activeTab === 'edit';
    const rawPrompt = customPrompt || (isEdit ? editPrompt : createPrompt);
    if (!rawPrompt.trim() || loading) return;

    if (isEdit && !sourceImage) {
      alert(isTamil ? 'தயவுசெய்து திருத்துவதற்கு ஒரு படத்தை பதிவேற்றவும்.' : 'Please upload a source image to edit.');
      return;
    }

    // Check if user selected DALL-E 3 without providing an OpenAI Key
    if (selectedEngine === 'dall-e-3' && !openaiApiKey.trim()) {
      const proceed = confirm(
        isTamil
          ? 'DALL-E 3 மாடலுக்கு OpenAI API Key தேவை. இப்போது உள்ளமைக்கப்பட்ட அதிவேக Flux.1 Schnell மூலம் உருவாக்கவா?'
          : 'OpenAI API Key is required for DALL-E 3. Would you like to use the built-in ultra-fast Flux.1 Schnell engine instead?'
      );
      if (!proceed) {
        setIsApiModalOpen(true);
        return;
      }
    }

    setLoading(true);

    const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
    const finalPrompt = rawPrompt + (!isEdit && styleObj ? styleObj.promptAdd : '');

    try {
      const payload: any = {
        prompt: finalPrompt,
        aspectRatio,
        engine: selectedEngine,
        model: selectedEngine,
      };

      if (isEdit && sourceImage) {
        payload.image = sourceImage;
      }

      const headers: Record<string, string> = {};
      if (openaiApiKey.trim()) {
        headers['x-openai-api-key'] = openaiApiKey.trim();
      }
      if (geminiApiKey.trim()) {
        headers['x-custom-api-key'] = geminiApiKey.trim();
      }

      const data = await safeFetchJson('/api/generate-image', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const newRes: GeneratedImageResult = {
        id: Date.now().toString(),
        prompt: rawPrompt,
        imageUrl: data.imageUrl,
        sourceImageUrl: isEdit && sourceImage ? sourceImage : undefined,
        aspectRatio: data.aspectRatio || aspectRatio,
        isEdited: isEdit,
        modelUsed: data.modelUsed || selectedEngine,
        durationMs: data.durationMs,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentResult(newRes);
      setHistory((prev) => [newRes, ...prev.slice(0, 14)]);
      if (isEdit) {
        setCompareMode(true);
      }
    } catch (err: any) {
      alert(`Image Generation Error: ${err.message || 'Failed to generate image'}`);
    } finally {
      setLoading(false);
    }
  };

  const magicEnhancePrompt = () => {
    if (activeTab === 'edit') {
      const enhanced = editPrompt.trim()
        ? `${editPrompt.trim()}, seamless natural lighting blend, studio quality, sharp focus, 8k textures`
        : 'Add glowing holographic cyberpunk elements with cinematic ambient neon lighting';
      setEditPrompt(enhanced);
    } else {
      const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
      const enhanced = createPrompt.trim()
        ? `${createPrompt.trim()}, masterpiece quality, intricate textures, volumetric god rays, high detail, 8k resolution, cinematic`
        : 'A surreal mystical floating island with crystal waterfalls, glowing flora, and a celestial nebula in the background';
      setCreatePrompt(enhanced);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-y-auto p-3 sm:p-5 space-y-4">
      {/* Title & Mode Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-rose-950/30">
            <Wand2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isTamil ? 'அதிவேக பட உருவாக்கம் & திருத்தம்' : 'Ultra-Fast Image Studio'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Flux.1 / DALL-E 3 Ready</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isTamil
                ? 'நேரடி Flux.1 Schnell, DALL-E 3 & Imagen 3 இணைக்கப்பட்ட அதிவேக AI பட உருவாக்கம்.'
                : 'Direct Flux.1 Schnell, DALL-E 3 & Imagen 3 connected core engine for instant rendering.'}
            </p>
          </div>
        </div>

        {/* Right Header: API Config Button & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* API Engine Settings Button */}
          <button
            onClick={() => setIsApiModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Configure API Keys for DALL-E 3, Imagen 3, or Test Flux Engine"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{isTamil ? 'API அமைப்புகள்' : 'API & Engine'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-0.5" />
          </button>

          {/* Tab Switcher: Create vs Edit */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTamil ? '🎨 உருவாக்கு' : '🎨 Create'}</span>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-rose-500 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isTamil ? '🪄 திருத்து' : '🪄 Edit Image'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Engine Selection Bar */}
      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>{isTamil ? 'AI மாடல் என்ஜின் (Engine Core):' : 'Select AI Model Engine:'}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {selectedEngine === 'flux-schnell' && '⚡ Ultra-Fast ~1s direct render'}
            {selectedEngine === 'flux-realism' && '🎨 8K Photorealistic textures'}
            {selectedEngine === 'dall-e-3' && (openaiApiKey ? '✓ OpenAI API Connected' : '⚠️ Custom Key or Auto-Fallback')}
            {selectedEngine === 'imagen-3' && '🌟 Google Imagen 3 Studio'}
            {selectedEngine === 'sdxl-turbo' && '🚀 Rapid draft'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {ENGINE_OPTIONS.map((eng) => (
            <button
              key={eng.id}
              onClick={() => setSelectedEngine(eng.id)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative ${
                selectedEngine === eng.id
                  ? `${eng.color} ring-1 ring-amber-400/40 shadow-md`
                  : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black truncate">{eng.name}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{eng.badge}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Controls Column (Left) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            {/* If Edit Mode: Upload Image Dropzone */}
            {activeTab === 'edit' && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-rose-400" />
                    <span>{isTamil ? 'மூலப் படம் (Source Image to Edit):' : 'Source Image to Edit:'}</span>
                  </span>
                  {sourceImage && (
                    <button
                      onClick={() => {
                        setSourceImage(null);
                        setSourceImageName('');
                      }}
                      className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                    >
                      {isTamil ? 'அகற்று' : 'Remove'}
                    </button>
                  )}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {sourceImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 flex items-center gap-3">
                    <img
                      src={sourceImage}
                      alt="Source"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-800"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 truncate">{sourceImageName || 'Uploaded Image'}</p>
                      <p className="text-[10px] text-emerald-400 font-mono mt-0.5">✓ Ready for AI Editing</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] text-amber-400 hover:underline mt-1 font-bold cursor-pointer"
                      >
                        {isTamil ? 'வேறு படத்தை மாற்று' : 'Replace Image'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-rose-500/80 rounded-xl p-4 text-center bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer group"
                  >
                    <Upload className="w-6 h-6 text-slate-500 group-hover:text-rose-400 mx-auto mb-1.5 transition-colors" />
                    <p className="text-xs font-bold text-slate-200">
                      {isTamil ? 'படத்தை பதிவேற்ற இங்கே கிளிக் செய்யவும்' : 'Click to Upload or Drag & Drop Photo'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP up to 20MB</p>
                  </div>
                )}
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {activeTab === 'edit'
                      ? (isTamil ? 'திருத்த விவரக் குறிப்பு (Edit Prompt):' : 'Edit Instruction Prompt:')
                      : (isTamil ? 'பட விவரக் குறிப்பு (Creation Prompt):' : 'Image Description Prompt:')}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={magicEnhancePrompt}
                  className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Enhance</span>
                </button>
              </div>

              <textarea
                value={activeTab === 'edit' ? editPrompt : createPrompt}
                onChange={(e) =>
                  activeTab === 'edit' ? setEditPrompt(e.target.value) : setCreatePrompt(e.target.value)
                }
                rows={3}
                placeholder={
                  activeTab === 'edit'
                    ? (isTamil
                        ? 'எ.கா: சன்கிளாஸ் சேர்க்கவும், பின்னணியை நியான் நகரமாக மாற்றவும்...'
                        : 'e.g., Add futuristic sunglasses, turn the background into a cyberpunk neon street...')
                    : (isTamil
                        ? 'எத்தகைய படத்தை உருவாக்க வேண்டும் என்பதை விவரிக்கவும்...'
                        : 'Describe subjects, composition, atmosphere, colors, and camera angle...')
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
              />
            </div>

            {/* Style Selector (For Create Mode) */}
            {activeTab === 'create' && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isTamil ? 'பாணி / Style Preset:' : 'Artistic Style Preset:'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-2 rounded-xl text-left border font-semibold transition-all cursor-pointer ${
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
            )}

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>{isTamil ? 'விகிதம் / Aspect Ratio:' : 'Aspect Ratio:'}</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-xs font-mono">
                {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 rounded-lg font-bold transition-all border text-center cursor-pointer ${
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

            {/* Generate Action Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={loading || (activeTab === 'edit' ? !editPrompt.trim() || !sourceImage : !createPrompt.trim())}
              className={`w-full py-3.5 font-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-2xl uppercase tracking-wider cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-gradient-to-r from-rose-500 via-purple-600 to-amber-500 text-white'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-slate-950'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                  <span>
                    {isTamil
                      ? `உருவாகிறது... (${elapsedSeconds}s)`
                      : `Rendering with ${ENGINE_OPTIONS.find((e) => e.id === selectedEngine)?.name || 'AI'}... (${elapsedSeconds}s)`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  <span>
                    {activeTab === 'edit'
                      ? (isTamil ? '🪄 படத்தை திருத்து (Edit Image)' : '🪄 Render Image Edit')
                      : (isTamil ? '✨ நொடியில் படம் உருவாக்கு (Generate ~1s)' : `✨ Generate with ${ENGINE_OPTIONS.find((e) => e.id === selectedEngine)?.name || 'AI'}`)}
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Quick Idea Samples */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              {activeTab === 'edit'
                ? (isTamil ? 'மாதிரி திருத்த கருத்துக்கள்:' : 'Sample Edit Prompts:')
                : (isTamil ? 'மாதிரி Prompt கருத்துக்கள்:' : 'Sample Creation Ideas:')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {(activeTab === 'edit' ? SAMPLE_PROMPTS_EDIT : SAMPLE_PROMPTS_CREATE).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (activeTab === 'edit') {
                      setEditPrompt(p.prompt);
                    } else {
                      setCreatePrompt(p.prompt);
                    }
                  }}
                  className="text-left p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800/60 text-[10px] text-slate-300 hover:text-amber-300 transition-all truncate cursor-pointer"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Display & Gallery Column (Right) */}
        <div className="lg:col-span-7 bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
          {/* Canvas Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>{isTamil ? 'AI கேன்வாஸ் (Render Output)' : 'AI Image Canvas'}</span>
            </span>

            <div className="flex items-center gap-2">
              {currentResult?.sourceImageUrl && (
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                    compareMode
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Split className="w-3 h-3" />
                  <span>{compareMode ? (isTamil ? 'ஒப்பீடு ஆன்' : 'Compare ON') : (isTamil ? 'ஒப்பீடு' : 'Compare')}</span>
                </button>
              )}

              {currentResult && (
                <div className="flex items-center gap-1.5">
                  {currentResult.durationMs && (
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      ⚡ {(currentResult.durationMs / 1000).toFixed(1)}s
                    </span>
                  )}
                  <span className="text-[10px] text-amber-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {currentResult.aspectRatio}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Active Canvas Display Area */}
          <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-3 min-h-[360px] overflow-hidden relative">
            {loading ? (
              <div className="text-center space-y-3">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-rose-500/20 border-b-rose-400 animate-spin-slow" />
                  <Zap className="w-7 h-7 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-300 font-mono">
                    {isTamil
                      ? `${ENGINE_OPTIONS.find((e) => e.id === selectedEngine)?.name || 'AI'} மூலம் படம் தயாராகிறது...`
                      : `Rendering via ${ENGINE_OPTIONS.find((e) => e.id === selectedEngine)?.name || 'AI Engine'}...`}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">Elapsed: {elapsedSeconds}s</p>
                </div>
              </div>
            ) : currentResult ? (
              <div className="space-y-3 text-center w-full max-w-2xl mx-auto">
                {/* Compare Mode: Before & After */}
                {compareMode && currentResult.sourceImageUrl ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {isTamil ? 'முந்தைய படம் (Original)' : 'Original Source'}
                      </span>
                      <img
                        src={currentResult.sourceImageUrl}
                        alt="Original"
                        className="max-h-[300px] w-full object-contain rounded-xl border border-slate-800 bg-black/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                        {isTamil ? 'திருத்தப்பட்ட படம் (AI Edited)' : 'AI Edited Output'}
                      </span>
                      <img
                        src={currentResult.imageUrl}
                        alt="Edited"
                        className="max-h-[300px] w-full object-contain rounded-xl border border-rose-500/40 bg-black/40 shadow-xl cursor-pointer"
                        onClick={() => setZoomImage(currentResult.imageUrl)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative group inline-block">
                    <img
                      src={currentResult.imageUrl}
                      alt={currentResult.prompt}
                      className="max-h-[360px] mx-auto object-contain rounded-xl shadow-2xl border border-slate-800 cursor-pointer"
                      onClick={() => setZoomImage(currentResult.imageUrl)}
                    />
                    <button
                      onClick={() => setZoomImage(currentResult.imageUrl)}
                      className="absolute bottom-3 right-3 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                      title="Fullscreen Zoom"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Action Bar for the Generated Image */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-slate-300 italic truncate text-xs">"{currentResult.prompt}"</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                      <span>{currentResult.modelUsed || selectedEngine}</span>
                      {currentResult.durationMs && (
                        <span>· {(currentResult.durationMs / 1000).toFixed(1)}s render</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Animate into Video with Veo Button */}
                    {onNavigateToVideo && (
                      <button
                        onClick={() => onNavigateToVideo(currentResult.imageUrl, currentResult.prompt)}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:brightness-110 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-md"
                        title={isTamil ? 'Veo மூலம் வீடியோவாக அனிமேட் செய்' : 'Animate into Video using Veo'}
                      >
                        <Film className="w-3.5 h-3.5 text-white" />
                        <span>{isTamil ? 'வீடியோ' : 'Animate (Veo)'}</span>
                      </button>
                    )}

                    {/* Copy Link / Data */}
                    <button
                      onClick={() => handleCopyUrl(currentResult.imageUrl)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer"
                      title="Copy Image URL / Base64"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    {/* Edit this image button */}
                    <button
                      onClick={() => {
                        setSourceImage(currentResult.imageUrl);
                        setSourceImageName(`generated-${currentResult.id}.png`);
                        setActiveTab('edit');
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer"
                      title={isTamil ? 'இதை திருத்து' : 'Edit This Image'}
                    >
                      <Layers className="w-3 h-3 text-rose-400" />
                      <span>{isTamil ? 'திருத்து' : 'Edit'}</span>
                    </button>

                    {/* Download */}
                    <a
                      href={currentResult.imageUrl}
                      download={`swatea-image-${currentResult.id}.jpg`}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1 transition-all text-xs shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 text-slate-600 max-w-sm">
                <Wand2 className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
                <p className="text-xs text-slate-400">
                  {isTamil
                    ? 'விவரக் குறிப்பை உள்ளிட்டு "Generate" என்பதை கிளிக் செய்யவும். Flux.1 Schnell அல்லது DALL-E 3 நொடியில் படம் தயாரிக்கும்!'
                    : 'Enter an image prompt to create artwork or upload a photo to edit it with natural language instructions.'}
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">⚡ Flux.1 Schnell (~1s)</span>
                  <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">🤖 DALL-E 3 Ready</span>
                  <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">🎥 Veo Video Ready</span>
                </div>
              </div>
            )}
          </div>

          {/* History Gallery */}
          {history.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 font-mono">
                  {isTamil ? 'வரலாறு (Recent Creations):' : 'Recent Studio Gallery:'}
                </span>
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('swatea_image_history');
                  }}
                  className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{isTamil ? 'அனைத்தும் நீக்கு' : 'Clear'}</span>
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentResult(item);
                      if (item.sourceImageUrl) setCompareMode(true);
                    }}
                    className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer relative group ${
                      currentResult?.id === item.id
                        ? 'border-amber-400 scale-105 shadow-lg'
                        : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover" />
                    {item.isEdited && (
                      <span className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-black px-1 rounded">
                        EDIT
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API & Engine Settings Modal */}
      {isApiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsApiModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  {isTamil ? 'AI பட என்ஜின் & API அணுகல்' : 'AI Image Engine & API Access'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isTamil
                    ? 'DALL-E 3 அல்லது Imagen 3 க்கான சொந்த API விசைகளை இணைக்கவும்.'
                    : 'Connect your custom API keys for DALL-E 3 & Google Imagen 3.'}
                </p>
              </div>
            </div>

            {/* Active Core Engine Status Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-emerald-300">
                  {isTamil ? 'கோர் என்ஜின் இணைக்கப்பட்டுள்ளது (Flux.1 Schnell Active)' : 'Core Engine Connected (Flux.1 Schnell Active)'}
                </p>
                <p className="text-slate-300 leading-relaxed">
                  {isTamil
                    ? 'எந்த API விசியும் தேவையில்லை! ஸ்வாதியாவின் பிரத்யேக Flux.1 என்ஜின் உடனடியாக 1024x1024 படங்களை ~1 நொடியில் உருவாக்கும்.'
                    : 'No API key required for standard usage! The core Flux.1 Schnell engine renders 1024px images in ~1s.'}
                </p>
              </div>
            </div>

            {/* OpenAI API Key for DALL-E 3 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>OpenAI API Key (DALL-E 3)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Optional</span>
              </label>
              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-400">
                {isTamil
                  ? 'உங்கள் OpenAI கணக்கிலிருந்து DALL-E 3 மாடலை நேரடியாக இயக்க இந்த விசை பயன்படுகிறது.'
                  : 'Allows direct execution of OpenAI DALL-E 3 model with your personal quota.'}
              </p>
            </div>

            {/* Google Gemini API Key for Imagen 3 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Google Gemini API Key (Imagen 3)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Optional</span>
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-400">
                {isTamil
                  ? 'Google Imagen 3 மாடலை நேரடியாக அணுக இந்த விசை பயன்படுகிறது.'
                  : 'Used for direct calls to Google Imagen 3 via Google GenAI SDK.'}
              </p>
            </div>

            {/* Test Connection Button & Result */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {isTamil ? 'என்ஜின் சோதனை (Test Ping):' : 'Engine Latency & Ping Test:'}
                </span>
                <button
                  type="button"
                  onClick={() => handleTestEngine(selectedEngine)}
                  disabled={testStatus.testing}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${testStatus.testing ? 'animate-spin' : ''}`} />
                  <span>{testStatus.testing ? 'Testing...' : 'Test Now'}</span>
                </button>
              </div>

              {testStatus.message && (
                <div
                  className={`text-xs p-2 rounded-lg font-mono flex items-center gap-2 ${
                    testStatus.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  <span className="font-bold">{testStatus.success ? '✓' : '✗'}</span>
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsApiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isTamil ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveApiKeys}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
              >
                {isTamil ? 'சேமி & உறுதி செய்' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-amber-400 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomImage}
              alt="Zoomed"
              className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl border border-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
};
