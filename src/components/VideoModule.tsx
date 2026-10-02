import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Video,
  Sparkles,
  Upload,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sliders,
  Layers,
  Zap,
  Trash2,
  Check,
  Maximize2,
  AlertCircle,
  Eye,
  RefreshCw,
  Clock
} from 'lucide-react';
import { LanguageCode, GeneratedVideoResult } from '../types';
import { safeFetchJson } from '../lib/api';

interface VideoModuleProps {
  language: LanguageCode;
  initialImage?: string | null;
  initialPrompt?: string | null;
}

const SAMPLE_PRESETS = [
  {
    title: '🦁 Royal Lion Awakening',
    prompt: 'Slow motion cinematic camera push-in as the majestic golden lion opens its glowing ruby eyes with subtle wind blowing through its royal mane',
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: '🌆 Cyberpunk Flying Cars',
    prompt: 'Cinematic drone glide forward between futuristic golden neon skyscrapers with flying vehicles zooming past in twilight fog',
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: '🌊 Bioluminescent Ocean Waves',
    prompt: 'Gentle slow motion ocean waves washing ashore glowing with blue bioluminescent sparkles under starry celestial night sky',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: '☕ Cozy Neon Cafe Rain',
    prompt: 'Camera tracking gently past a cozy cafe window with raindrops sliding down glass and glowing warm lights reflecting softly',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
  },
];

const GENERATION_STEPS = [
  'Analyzing source image keyframes & subject composition...',
  'Initializing Google Veo Neural Diffusion engine...',
  'Calculating optical flow vectors and temporal motion coherence...',
  'Synthesizing continuous 24fps cinematic animation frames...',
  'Applying lighting physics and volumetric depth mapping...',
  'Finalizing MP4 video rendering & audio-visual sync...'
];

export const VideoModule: React.FC<VideoModuleProps> = ({
  language,
  initialImage,
  initialPrompt
}) => {
  const isTamil = language === 'ta';

  // State
  const [sourceImage, setSourceImage] = useState<string | null>(initialImage || null);
  const [sourceImageName, setSourceImageName] = useState<string>(initialImage ? 'Source Image' : '');
  const [prompt, setPrompt] = useState<string>(
    initialPrompt ||
      (isTamil
        ? 'இந்த புகைப்படத்தை மெதுவான சினிமா கேமரா நகர்வு மற்றும் நியான் வெளிச்சத்துடன் உயிரோட்டமுள்ள வீடியோவாக அனிமேட் செய்யவும்.'
        : 'Animate this photo with smooth cinematic drone motion, natural wind physics, and ambient atmospheric lighting')
  );

  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [model, setModel] = useState<'veo-3.1-lite-generate-preview' | 'veo-3.1-generate-preview'>(
    'veo-3.1-lite-generate-preview'
  );

  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  const [currentVideo, setCurrentVideo] = useState<GeneratedVideoResult | null>(null);
  const [videoHistory, setVideoHistory] = useState<GeneratedVideoResult[]>(() => {
    try {
      const saved = localStorage.getItem('swatea_video_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (initialImage) {
      setSourceImage(initialImage);
      setSourceImageName('Selected from Studio');
    }
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialImage, initialPrompt]);

  useEffect(() => {
    try {
      localStorage.setItem('swatea_video_history', JSON.stringify(videoHistory.slice(0, 10)));
    } catch (e) {}
  }, [videoHistory]);

  // Handle local image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setSourceImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSourceImageName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setSourceImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert preset URL to base64
  const handleSelectPreset = async (preset: typeof SAMPLE_PRESETS[0]) => {
    setPrompt(preset.prompt);
    setSourceImageName(preset.title);
    try {
      const resp = await fetch(preset.imageUrl);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      setSourceImage(preset.imageUrl);
    }
  };

  // Start Veo generation
  const handleGenerateVideo = async () => {
    if (loading) return;
    if (!sourceImage && !prompt.trim()) {
      alert(isTamil ? 'தயவுசெய்து ஒரு படத்தை பதிவேற்றவும் அல்லது விவரக் குறிப்பை உள்ளிடவும்.' : 'Please upload a photo or enter a motion prompt.');
      return;
    }

    setLoading(true);
    setCurrentStepIndex(0);
    setProgressPercent(10);

    // Progress interval for reassuring feedback
    const progressTimer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 95) return 95;
        const next = prev + Math.floor(Math.random() * 8) + 3;
        const stepIdx = Math.min(
          GENERATION_STEPS.length - 1,
          Math.floor((next / 100) * GENERATION_STEPS.length)
        );
        setCurrentStepIndex(stepIdx);
        return next;
      });
    }, 800);

    try {
      // Step 1: Initiate Video Generation
      const startRes = await safeFetchJson('/api/generate-video', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          image: sourceImage || undefined,
          aspectRatio,
          resolution,
          model,
        }),
      });

      const operationName = startRes.operationName;
      if (!operationName) {
        throw new Error('Failed to obtain Veo generation operation token');
      }

      // Step 2: Poll operation status
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 35; // ~70 seconds max polling

      while (!isDone && attempts < maxAttempts) {
        attempts++;
        await new Promise((r) => setTimeout(r, 2000));

        const statusRes = await safeFetchJson('/api/video-status', {
          method: 'POST',
          body: JSON.stringify({ operationName }),
        });

        if (statusRes.error) {
          throw new Error(statusRes.error);
        }

        if (statusRes.done) {
          isDone = true;
          break;
        }
      }

      // Step 3: Fetch the generated video
      const downloadRes = await safeFetchJson('/api/video-download', {
        method: 'POST',
        body: JSON.stringify({
          operationName,
          returnBase64: true,
        }),
      });

      clearInterval(progressTimer);
      setProgressPercent(100);

      const generatedVid: GeneratedVideoResult = {
        id: Date.now().toString(),
        prompt: prompt || 'Veo Animated Video',
        sourceImageUrl: sourceImage || undefined,
        videoUrl: downloadRes.videoUrl,
        aspectRatio,
        resolution,
        model,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentVideo(generatedVid);
      setVideoHistory((prev) => [generatedVid, ...prev.slice(0, 9)]);
    } catch (err: any) {
      clearInterval(progressTimer);
      alert(`Veo Video Generation Error: ${err.message || 'Operation failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-y-auto p-3 sm:p-5 space-y-4">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-purple-950/30">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                {isTamil ? 'வீடியோ அனிமேஷன் ஸ்டுடியோ' : 'Veo Video Studio'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Veo Generative Video</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isTamil
                ? 'புகைப்படத்தை பதிவேற்றி, கூகிள் Veo ஏஐ மூலம் பிரமிக்கத்தக்க சினிமா வீடியோவாக மாற்றுங்கள்.'
                : 'Upload a photo and animate it into a high-definition cinematic video using Google Veo.'}
            </p>
          </div>
        </div>

        {/* Model Indicator Badge */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">{isTamil ? 'மாடல்:' : 'Model:'}</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as any)}
            className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
          >
            <option value="veo-3.1-lite-generate-preview">Veo 3.1 Lite (Fast)</option>
            <option value="veo-3.1-generate-preview">Veo 3.1 (High Quality)</option>
          </select>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Controls Column (Left) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            {/* 1. Upload Photo / Starting Frame */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>{isTamil ? 'அனிமேட் செய்ய வேண்டிய புகைப்படம்:' : 'Starting Photo / Keyframe:'}</span>
                </label>
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
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {sourceImage ? (
                <div className="relative rounded-xl overflow-hidden border border-purple-500/40 bg-slate-950 p-2 flex items-center gap-3">
                  <img
                    src={sourceImage}
                    alt="Starting frame"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-800 shadow"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200 truncate">{sourceImageName || 'Selected Photo'}</p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-0.5">✓ Ready for Veo Temporal Animation</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] text-amber-400 hover:underline mt-1 font-bold cursor-pointer"
                    >
                      {isTamil ? 'வேறு படத்தை மாற்று' : 'Change Photo'}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-purple-500/80 rounded-xl p-4 text-center bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer group"
                >
                  <Upload className="w-6 h-6 text-slate-500 group-hover:text-purple-400 mx-auto mb-1.5 transition-colors" />
                  <p className="text-xs font-bold text-slate-200">
                    {isTamil ? 'புகைப்படத்தை பதிவேற்ற கிளிக் செய்க' : 'Click to Upload or Drag & Drop Photo'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, WEBP (Ideal 16:9 or 9:16)</p>
                </div>
              )}
            </div>

            {/* 2. Motion & Animation Prompt */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isTamil ? 'இயக்க விவரக் குறிப்பு (Motion Prompt):' : 'Camera Motion & Animation Prompt:'}</span>
              </label>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={
                  isTamil
                    ? 'கேமரா நகர்வு, வெளிச்சம், காற்று, மற்றும் அனிமேஷன் பாணியை விவரிக்கவும்...'
                    : 'Describe camera movements (e.g., drone pullback, pan right), subject actions, lighting changes...'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
              />
            </div>

            {/* 3. Aspect Ratio & Resolution Configs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono">
                  {isTamil ? 'திரை விகிதம் (Aspect):' : 'Aspect Ratio:'}
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-1.5 rounded-lg font-bold border transition-all text-center cursor-pointer ${
                      aspectRatio === '16:9'
                        ? 'bg-purple-600 text-white border-purple-400 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    16:9 Widescreen
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-1.5 rounded-lg font-bold border transition-all text-center cursor-pointer ${
                      aspectRatio === '9:16'
                        ? 'bg-purple-600 text-white border-purple-400 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    9:16 Vertical
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono">
                  {isTamil ? 'தரம் (Resolution):' : 'Resolution:'}
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  <button
                    onClick={() => setResolution('720p')}
                    className={`py-1.5 rounded-lg font-bold border transition-all text-center cursor-pointer ${
                      resolution === '720p'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    720p HD
                  </button>
                  <button
                    onClick={() => setResolution('1080p')}
                    className={`py-1.5 rounded-lg font-bold border transition-all text-center cursor-pointer ${
                      resolution === '1080p'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    1080p FHD
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Generate Button */}
            <button
              onClick={handleGenerateVideo}
              disabled={loading || (!sourceImage && !prompt.trim())}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-purple-600 to-amber-500 text-white font-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-2xl uppercase tracking-wider cursor-pointer"
            >
              {loading ? (
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
              ) : (
                <Film className="w-4 h-4" />
              )}
              <span>
                {loading
                  ? (isTamil ? 'Veo வீடியோ உருவாக்கப்படுகிறது...' : 'Generating Video with Veo...')
                  : (isTamil ? '🎬 Veo வீடியோவை உருவாக்கு (Generate Video)' : '🎬 Generate Video with Veo')}
              </span>
            </button>
          </div>

          {/* Quick Presets for 1-Click Testing */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              {isTamil ? 'மாதிரி புகைப்பட அனிமேஷன்கள்:' : 'Sample Animation Starters:'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className="text-left p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800/60 text-[10px] text-slate-300 hover:text-purple-300 transition-all truncate cursor-pointer flex items-center gap-1.5"
                >
                  <img src={p.imageUrl} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                  <span className="truncate">{p.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Player & Gallery Column (Right) */}
        <div className="lg:col-span-7 bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-purple-400 font-mono flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>{isTamil ? 'வீடியோ பிளேயர் (Veo Theater)' : 'Veo Cinema Player'}</span>
            </span>

            {currentVideo && (
              <span className="text-[10px] text-purple-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {currentVideo.aspectRatio} | {currentVideo.resolution} | {currentVideo.createdAt}
              </span>
            )}
          </div>

          {/* Video Player Display Area */}
          <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-3 min-h-[360px] overflow-hidden relative">
            {loading ? (
              <div className="text-center space-y-4 max-w-md mx-auto p-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-amber-500/20 border-b-amber-400 animate-spin-slow" />
                  <Film className="w-6 h-6 text-purple-400 absolute inset-0 m-auto animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-purple-300 font-mono">
                    {GENERATION_STEPS[currentStepIndex]}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isTamil
                      ? 'Veo மாடல் புகைப்படத்தை ஆய்வு செய்து வீடியோவை ரெண்டர் செய்கிறது. இது சில நொடிகள் எடுக்கும்...'
                      : 'Google Veo is synthesizing video frames. This takes a few moments...'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-rose-500 via-purple-500 to-amber-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{progressPercent}% Completed</span>
              </div>
            ) : currentVideo ? (
              <div className="space-y-3 text-center w-full max-w-2xl mx-auto">
                {/* HTML5 Video Element */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black max-h-[380px] flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={currentVideo.videoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="max-h-[380px] w-full object-contain rounded-xl"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>

                {/* Video Info and Download Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <p className="text-slate-300 italic truncate max-w-sm text-left">
                    "{currentVideo.prompt}"
                  </p>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={togglePlay}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center gap-1 cursor-pointer text-xs"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>

                    <a
                      href={currentVideo.videoUrl}
                      download={`swatea-veo-video-${currentVideo.id}.mp4`}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:brightness-110 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download MP4</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 text-slate-600 max-w-sm">
                <Video className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
                <p className="text-xs text-slate-400">
                  {isTamil
                    ? 'புகைப்படத்தை பதிவேற்றி அல்லது மாதிரி விருப்பத்தைத் தேர்ந்தெடுத்து "வீடியோவை உருவாக்கு" என்பதை கிளிக் செய்யவும்.'
                    : 'Upload a photo and click Generate Video with Veo to animate it into motion.'}
                </p>
                <div className="pt-2 flex justify-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">Veo 3.1 Neural Engine</span>
                  <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">MP4 24fps HD</span>
                </div>
              </div>
            )}
          </div>

          {/* Video History Gallery */}
          {videoHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 font-mono">
                  {isTamil ? 'உருவாக்கப்பட்ட வீடியோக்கள்:' : 'Generated Video Library:'}
                </span>
                <button
                  onClick={() => {
                    setVideoHistory([]);
                    localStorage.removeItem('swatea_video_history');
                  }}
                  className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{isTamil ? 'அனைத்தும் நீக்கு' : 'Clear'}</span>
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {videoHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentVideo(item)}
                    className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer relative group bg-black ${
                      currentVideo?.id === item.id
                        ? 'border-purple-400 scale-105 shadow-lg'
                        : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.sourceImageUrl ? (
                      <img src={item.sourceImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-purple-400">
                        <Video className="w-5 h-5" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
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
