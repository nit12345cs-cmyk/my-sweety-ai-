import React, { useState, useRef } from 'react';
import { Mic, Volume2, Play, Square, Sparkles, Radio, Activity } from 'lucide-react';
import { LanguageCode } from '../types';
import { safeFetchJson } from '../lib/api';
import { speakNaturalText, stopSpeech } from '../lib/tts';
import { AiOrb } from './AiOrb';

interface VoiceModuleProps {
  language: LanguageCode;
}

export const VoiceModule: React.FC<VoiceModuleProps> = ({ language }) => {
  const isTamil = language === 'ta';

  const [text, setText] = useState(
    isTamil
      ? 'வணக்கம்! ஸ்வாதியா ஏஐ வாய்ஸ் அசிஸ்டன்ட் தங்களை வரவேற்கிறது. நான் தெளிவான குரலில் பேச தயார்.'
      : 'Hello and welcome to Swatea AI Voice Assistant. Powered by Gemini TTS preview.'
  );
  const [voice, setVoice] = useState('Zephyr');
  const [cheerfulness, setCheerfulness] = useState('cheerful');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleSynthesizeAndPlay = async () => {
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      const data = await safeFetchJson('/api/tts', {
        method: 'POST',
        body: JSON.stringify({ text, voice, cheerfulness }),
      });

      // Play PCM raw audio using AudioContext (24kHz little-endian 16-bit PCM)
      const base64Audio = data.audioBase64;
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      setIsPlaying(true);
      source.start(0);

      source.onended = () => {
        setIsPlaying(false);
      };
    } catch (err: any) {
      console.warn('PCM audio context notice, activating Natural Speech Engine:', err);
      if ('speechSynthesis' in window) {
        speakNaturalText(text, {
          isTamilUI: isTamil,
          onStart: () => setIsPlaying(true),
          onEnd: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      } else {
        alert(`Voice AI Alert: ${err.message || 'Speech synthesis unavailable'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#080a16]/65 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-y-auto p-4 sm:p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 font-mono">
          <Mic className="w-6 h-6 text-cyan-400" />
          <span>{isTamil ? 'குரல் உதவி & ஸ்பீச் AI' : 'Swatea AI Voice Assistant'}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          {isTamil
            ? 'ஜெமினி TTS மாதிரி மூலம் உங்கள் உரையை இயற்கை குரலில் ஒலிக்கச் செய்யுங்கள்.'
            : 'Convert enterprise prompts to natural human speech using Gemini 3.1 Flash TTS.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input & Voice Controls */}
        <div className="lg:col-span-2 space-y-4 bg-white/[0.02] p-5 rounded-2xl border border-white/10">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {isTamil ? 'ஒலிக்க வேண்டிய உரை (Text Prompt):' : 'Speech Text Prompt:'}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full bg-[#030510] border border-white/10 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {isTamil ? 'குரல் தேர்வு (Voice Selection):' : 'Voice Selection:'}
              </label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full bg-[#030510] border border-white/10 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="Aoede">Aoede (Sweet & Soft Natural Female)</option>
                <option value="Leda">Leda (Warm & Smooth Female Voice)</option>
                <option value="Zephyr">Zephyr (Friendly Conversational Female)</option>
                <option value="Kore">Kore (Clear Professional Female)</option>
                <option value="Puck">Puck (Energetic & Expressive Female)</option>
                <option value="Fenrir">Fenrir (Deep & Resonant Male)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {isTamil ? 'குரல் தொனி (Tone):' : 'Voice Emotion / Tone:'}
              </label>
              <select
                value={cheerfulness}
                onChange={(e) => setCheerfulness(e.target.value)}
                className="w-full bg-[#030510] border border-white/10 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="cheerful">Cheerful & Energetic</option>
                <option value="professional">Professional & Formal</option>
                <option value="calm">Calm & Soothing</option>
                <option value="dramatic">Expressive & Clear</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSynthesizeAndPlay}
            disabled={loading || isPlaying}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black rounded-2xl disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            {loading ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Volume2 className="w-4 h-4 animate-bounce" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>
              {loading
                ? (isTamil ? 'குரல் உருவாக்கப்படுகிறது...' : 'Synthesizing Gemini TTS...')
                : isPlaying
                ? (isTamil ? 'குரல் ஒலிக்கிறது...' : 'Playing Speech Audio...')
                : (isTamil ? 'குரல் ஒலி உருவாக்கு' : 'Generate & Play Gemini Speech')}
            </span>
          </button>
        </div>

        {/* Visualizer Side Card with AI Orb */}
        <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10 flex flex-col justify-between items-center text-center space-y-4">
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Voice Core Orb</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">24kHz PCM</span>
          </div>

          <div className="py-4 space-y-4 flex flex-col items-center">
            <AiOrb
              state={loading ? 'thinking' : isPlaying ? 'speaking' : 'idle'}
              size="lg"
            />

            <div className="text-xs font-black text-slate-200 font-mono">
              {loading ? 'Synthesizing Audio...' : isPlaying ? 'Voice Stream Active' : 'Voice Orb Idle / Ready'}
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Direct PCM audio streaming with web audio context.
            </p>
          </div>

          <div className="w-full bg-[#030510] p-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 text-[10px] font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>gemini-3.1-flash-tts-preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};

