import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Film,
  Wand2,
  Trash2,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Maximize2
} from 'lucide-react';

interface ImageUploadToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTamil: boolean;
  onImageSelected: (
    imageData: { name: string; content: string; type: string; size?: number },
    action?: 'chat' | 'vision' | 'edit' | 'video',
    userPrompt?: string
  ) => void;
  onNavigateToVideo?: (imageUrl: string, promptText: string) => void;
  onNavigateToImage?: (imageUrl: string) => void;
}

export const ImageUploadToolModal: React.FC<ImageUploadToolModalProps> = ({
  isOpen,
  onClose,
  isTamil,
  onImageSelected,
  onNavigateToVideo,
  onNavigateToImage,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'url'>('upload');
  const [selectedImage, setSelectedImage] = useState<{
    name: string;
    content: string;
    type: string;
    size: number;
    width?: number;
    height?: number;
  } | null>(null);

  const [prompt, setPrompt] = useState('');
  const [selectedAction, setSelectedAction] = useState<'chat' | 'vision' | 'edit' | 'video'>('chat');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera on unmount or tab switch
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(isTamil ? 'உங்கள் உலாவி கேமராவை ஆதரிக்கவில்லை.' : 'Camera not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError(err?.message || (isTamil ? 'கேமராவை அணுக முடியவில்லை.' : 'Failed to access camera.'));
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png', 0.95);
    const byteString = atob(dataUrl.split(',')[1]);
    const size = byteString.length;

    setSelectedImage({
      name: `Camera_Capture_${Date.now()}.png`,
      content: dataUrl,
      type: 'image/png',
      size,
      width: canvas.width,
      height: canvas.height,
    });

    stopCamera();
    setActiveTab('upload');
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(isTamil ? 'தயவுசெய்து ஒரு படத்தை (Image) மட்டும் தேர்வு செய்யவும்.' : 'Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setSelectedImage({
          name: file.name,
          content: dataUrl,
          type: file.type,
          size: file.size,
          width: img.width,
          height: img.height,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLoadUrl = () => {
    if (!urlInput.trim()) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setSelectedImage({
          name: urlInput.split('/').pop()?.split('?')[0] || `web_image_${Date.now()}.png`,
          content: dataUrl,
          type: 'image/png',
          size: Math.round(dataUrl.length * 0.75),
          width: img.width,
          height: img.height,
        });
        setUrlInput('');
      } else {
        setSelectedImage({
          name: 'Web Image',
          content: urlInput,
          type: 'image/jpeg',
          size: 10240,
        });
      }
    };
    img.onerror = () => {
      // Direct pass fallback
      setSelectedImage({
        name: 'Web Image',
        content: urlInput,
        type: 'image/jpeg',
        size: 10240,
      });
    };
    img.src = urlInput;
  };

  const handleConfirmAction = () => {
    if (!selectedImage) return;

    if (selectedAction === 'video' && onNavigateToVideo) {
      onNavigateToVideo(selectedImage.content, prompt || 'Smooth cinematic temporal motion animation');
      onClose();
      return;
    }

    if (selectedAction === 'edit' && onNavigateToImage) {
      onNavigateToImage(selectedImage.content);
      onClose();
      return;
    }

    onImageSelected(
      {
        name: selectedImage.name,
        content: selectedImage.content,
        type: selectedImage.type,
        size: selectedImage.size,
      },
      selectedAction,
      prompt
    );

    onClose();
  };

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{isTamil ? '📷 நேரடி படம் / புகைப்பட பதிவேற்று கருவி' : '📷 Direct Image & Photo Upload Tool'}</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold border border-sky-500/30">
                  READY
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {isTamil
                  ? 'கணினி / மொபைலில் இருந்து நேரடியாக புகைப்படங்களை பதிவேற்றி ஏஐ மூலம் ஆய்வு செய்யுங்கள்.'
                  : 'Directly upload or capture photos from your device for AI Vision, Editing, or Animation.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-900/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isTamil ? '📁 கணினி / மொபைல் பைல்கள்' : '📁 Browse Device Files'}</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isTamil ? '📸 கேமரா மூலம் படம் எடு' : '📸 Live Camera Snap'}</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>{isTamil ? '🔗 இணைய முகவரி (URL)' : '🔗 Image Web URL'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* TAB 1: File Upload / Drag & Drop */}
          {activeTab === 'upload' && !selectedImage && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
                  : 'border-slate-700 hover:border-sky-500/60 bg-slate-950/40 hover:bg-slate-950/80'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-md">
                <Upload className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-200">
                  {isTamil ? 'புகைப்படத்தை தேர்ந்தெடுக்க இங்கே கிளிக் செய்யவும்' : 'Click to select photo or drag & drop here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {isTamil
                    ? 'PNG, JPG, JPEG, WEBP, GIF, SVG ஆதரிக்கப்படுகிறது (அதிகபட்சம் 30MB)'
                    : 'Supports PNG, JPG, JPEG, WEBP, GIF, SVG (Up to 30MB)'}
                </p>
              </div>

              <button
                type="button"
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 transition-all pointer-events-none"
              >
                {isTamil ? '📁 உங்கள் சாதனத்திலிருந்து பைலைத் தேர்வு செய்க' : '📁 Browse Files from Your System'}
              </button>
            </div>
          )}

          {/* TAB 2: Live Camera Viewfinder */}
          {activeTab === 'camera' && !selectedImage && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
                {cameraError ? (
                  <div className="text-center p-4 text-rose-400 space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto" />
                    <p className="text-xs">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-3 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs hover:bg-slate-700"
                    >
                      {isTamil ? 'மீண்டும் முயற்சிக்க' : 'Retry Camera'}
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                      autoPlay
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-110 text-white font-bold text-xs shadow-2xl flex items-center gap-2 cursor-pointer border-2 border-white/20 active:scale-95 transition-transform"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isTamil ? '📸 புகைப்படம் எடு (Snap Photo)' : '📸 Capture Photo'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                {isTamil
                  ? 'உங்கள் வெப்கேம் அல்லது மொபைல் கேமரா மூலம் நேரலையாக படம் எடுத்து பதிவேற்றலாம்.'
                  : 'Capture live snapshots directly from your webcam or phone camera.'}
              </p>
            </div>
          )}

          {/* TAB 3: Web Image URL */}
          {activeTab === 'url' && !selectedImage && (
            <div className="space-y-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">
                {isTamil ? 'படத்தின் இணைய முகவரி (Image Link):' : 'Enter Web Image URL:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleLoadUrl}
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {isTamil ? 'ஏற்று' : 'Load Image'}
                </button>
              </div>
            </div>
          )}

          {/* SELECTED IMAGE PREVIEW & ACTIONS DASHBOARD */}
          {selectedImage && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
                {/* Thumbnail */}
                <div className="relative group w-32 h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 shadow-md">
                  <img
                    src={selectedImage.content}
                    alt={selectedImage.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">
                      {selectedImage.width && selectedImage.height
                        ? `${selectedImage.width}x${selectedImage.height}`
                        : 'Preview'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 truncate max-w-[240px] text-sm">
                      {selectedImage.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Remove Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {formatFileSize(selectedImage.size)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {selectedImage.type}
                    </span>
                    {selectedImage.width && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        {selectedImage.width} x {selectedImage.height} px
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!' : 'Photo loaded and staged successfully!'}</span>
                  </p>
                </div>
              </div>

              {/* Action Selection Radio Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  {isTamil ? 'இந்த புகைப்படத்துடன் என்ன செய்ய விரும்புகிறீர்கள்?' : 'Select What You Want To Do With This Photo:'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Option 1: Chat / Question */}
                  <div
                    onClick={() => setSelectedAction('chat')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      selectedAction === 'chat'
                        ? 'border-sky-400 bg-sky-500/10 shadow-sm'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">
                        {isTamil ? 'சாட்டில் கேள்விகள் கேளுங்கள்' : 'Ask in AI Chat Hub'}
                      </span>
                      <span className="text-[11px] text-slate-400 leading-tight block">
                        {isTamil ? 'இப்படத்தைப் பற்றி ஏதேனும் கேட்க' : 'Send to chat with custom question'}
                      </span>
                    </div>
                  </div>

                  {/* Option 2: Vision AI Deep Analysis */}
                  <div
                    onClick={() => setSelectedAction('vision')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      selectedAction === 'vision'
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-sm'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">
                        {isTamil ? 'Vision AI விரிவான ஆய்வு & OCR' : 'Deep Vision AI & OCR'}
                      </span>
                      <span className="text-[11px] text-slate-400 leading-tight block">
                        {isTamil ? 'பொருட்கள் & எழுத்துக்களை படித்து விவரி' : 'Extract text, detect objects, explain details'}
                      </span>
                    </div>
                  </div>

                  {/* Option 3: Gemini 3.1 Flash Image Edit */}
                  <div
                    onClick={() => setSelectedAction('edit')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      selectedAction === 'edit'
                        ? 'border-amber-400 bg-amber-500/10 shadow-sm'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">
                        {isTamil ? 'ஜெமினி 3.1 ஃபிளாஷ் எடிட்டிங்' : 'Gemini 3.1 Flash Edit'}
                      </span>
                      <span className="text-[11px] text-slate-400 leading-tight block">
                        {isTamil ? 'பின்னணியை மாற்ற அல்லது திருத்த' : 'Alter style, background, or elements'}
                      </span>
                    </div>
                  </div>

                  {/* Option 4: Animate to Video */}
                  <div
                    onClick={() => setSelectedAction('video')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      selectedAction === 'video'
                        ? 'border-purple-400 bg-purple-500/10 shadow-sm'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">
                        {isTamil ? 'கூகிள் Veo வீடியோ அனிமேஷன்' : 'Animate with Google Veo'}
                      </span>
                      <span className="text-[11px] text-slate-400 leading-tight block">
                        {isTamil ? 'இப்படத்தை இயங்கும் வீடியோவாக மாற்று' : 'Turn this static photo into 1080p motion video'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Prompt Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {isTamil ? 'உங்களின் குறிப்பு அல்லது கேள்வி (விருப்பத்தேர்வு):' : 'Your Prompt / Question (Optional):'}
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    selectedAction === 'vision'
                      ? (isTamil ? 'இப்படத்தில் உள்ளதை விவரித்து எழுத்துக்களை படிக்கவும்' : 'Describe this image in detail and extract all visible text')
                      : selectedAction === 'edit'
                      ? (isTamil ? 'பின்னணியில் நியான் வெளிச்சம் சேர்க்கவும்' : 'Add cinematic lighting and futuristic cyberpunk background')
                      : selectedAction === 'video'
                      ? (isTamil ? 'மெதுவான கேமரா ஜூம் மற்றும் திரவ அசைவு' : 'Slow cinematic drone zoom in, atmospheric depth')
                      : (isTamil ? 'இப்படத்தைப் பற்றி ஏதேனும் கேளுங்கள்...' : 'Ask anything about this photo...')
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            {isTamil ? 'ரத்து செய்க' : 'Cancel'}
          </button>

          {selectedImage && (
            <button
              type="button"
              onClick={handleConfirmAction}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>{isTamil ? '🚀 தொடர்க / இயக்கு' : '🚀 Proceed with Photo'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
