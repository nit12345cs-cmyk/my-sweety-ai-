// Natural Human Voice Speech Synthesis Engine for Tamil, Tanglish & English
// Supports Web Speech API with Preloaded Voices, Smart Sentence Chunking, & Indian Accent Phonetics

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  lang: string;
  name: string;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

// Preload browser voices asynchronously
export const initVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices() || [];
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices() || [];
      };
    }
  }
};

// Initialize pre-fetching
initVoices();

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (cachedVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  }
  return cachedVoices;
};

// Clean text for natural human reading
export const cleanTextForSpeech = (text: string, isTamilDefault: boolean = false): string => {
  if (!text) return '';

  return (
    text
      // Handle markdown code blocks gracefully
      .replace(/```[\s\S]*?```/g, isTamilDefault ? ' இதோ உங்களுக்கான குறிமுறை தயாரிக்கப்பட்டுள்ளது. ' : ' Here is your completed code snippet. ')
      // Remove inline image markdown
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Keep markdown link title text only
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      // Remove Emojis & Decorative unicode symbols that cause TTS stutter
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Symbols to spoken human words
      .replace(/&/g, isTamilDefault ? ' மற்றும் ' : ' and ')
      .replace(/%/g, isTamilDefault ? ' சதவீதம் ' : ' percent ')
      .replace(/\+/g, isTamilDefault ? ' பிளஸ் ' : ' plus ')
      .replace(/=/g, isTamilDefault ? ' சமம் ' : ' equals ')
      .replace(/₹/g, isTamilDefault ? ' ரூபாய் ' : ' rupees ')
      .replace(/\$/g, isTamilDefault ? ' டாலர் ' : ' dollars ')
      // Strip markdown formatting characters
      .replace(/[*_#`~|>]/g, '')
      // Strip list markers (bullets, numbered lists)
      .replace(/^[\s\t]*[-+*]\s+/gm, '')
      .replace(/^[\s\t]*\d+\.\s+/gm, '')
      // Replace multiple colons/dashes with simple comma pauses
      .replace(/[:—–-]/g, ', ')
      // Normalize space
      .replace(/\s+/g, ' ')
      .trim()
  );
};

// Detect language type and return matching voice + rate/pitch configuration
export const selectNaturalVoice = (
  text: string,
  forceTamil: boolean = false
): { voice: SpeechSynthesisVoice | null; langCode: string; rate: number; pitch: number } => {
  const voices = getAvailableVoices();
  const lower = text.toLowerCase();

  const isTamilScript = /[\u0B80-\u0BFF]/.test(text);

  // Tanglish keywords in romanized script
  const tanglishKeywords = [
    'vanakkam', 'epdi', 'panra', 'nalla', 'machi', 'thala', 'iruka', 'varum',
    'iruku', 'panna', 'solla', 'romba', 'anna', 'thambi', 'akkaa', 'seri',
    'poya', 'aama', 'illai', 'podu', 'vanga', 'ponga', 'yenna', 'enna', 'innaiku',
    'dhanyawad', 'namaste', 'kaise', 'hai', 'bhai'
  ];

  const isTanglish = !isTamilScript && tanglishKeywords.some((kw) => lower.includes(kw));

  let langCode = 'en-US';
  let langPrefix = 'en';
  let rate = 0.95; // Warm human reading speed
  let pitch = 1.02; // Warm natural human pitch

  if (isTamilScript || forceTamil) {
    langCode = 'ta-IN';
    langPrefix = 'ta';
    rate = 0.92; // Slightly relaxed for articulate Tamil pronunciation
    pitch = 1.01;
  } else if (isTanglish) {
    langCode = 'en-IN'; // Indian English accent reads Tanglish words phonetically
    langPrefix = 'en';
    rate = 0.93;
    pitch = 1.02;
  } else if (/[\u0900-\u097F]/.test(text)) {
    langCode = 'hi-IN';
    langPrefix = 'hi';
    rate = 0.93;
    pitch = 1.01;
  } else {
    langCode = forceTamil ? 'ta-IN' : 'en-US';
    langPrefix = forceTamil ? 'ta' : 'en';
    rate = 0.95;
    pitch = 1.02;
  }

  if (voices.length === 0) {
    return { voice: null, langCode, rate, pitch };
  }

  // Desired natural human voice names in priority order
  const naturalKeywords = [
    'natural', 'neural', 'google', 'online', 'valluvar', 'latha', 'vani',
    'samantha', 'aria', 'jenny', 'heera', 'neerja', 'karen', 'zira', 'female'
  ];

  // 1. Try finding native language voice with natural/female quality
  let bestVoice = voices.find((v) => {
    const l = v.lang.toLowerCase().replace('_', '-');
    const n = v.name.toLowerCase();
    const matchesLang = l.startsWith(langPrefix) || l.includes(langCode.toLowerCase());
    const matchesQuality = naturalKeywords.some((kw) => n.includes(kw));
    return matchesLang && matchesQuality;
  });

  // 2. Try finding any match for target language
  if (!bestVoice) {
    bestVoice = voices.find((v) => {
      const l = v.lang.toLowerCase().replace('_', '-');
      return l.startsWith(langPrefix) || l.includes(langCode.toLowerCase());
    });
  }

  // 3. For Tanglish/English, fallback to Indian English or high quality Google voice
  if (!bestVoice && (isTanglish || langPrefix === 'en')) {
    bestVoice = voices.find((v) => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('google'));
  }

  // 4. Default to first voice if nothing matched
  if (!bestVoice) {
    bestVoice = voices[0];
  }

  return { voice: bestVoice, langCode, rate, pitch };
};

let currentUtteranceList: SpeechSynthesisUtterance[] = [];

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtteranceList = [];
};

export const speakNaturalText = (
  rawText: string,
  options: {
    isTamilUI?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onError) options.onError('Speech synthesis not supported');
    return;
  }

  stopSpeech();

  // Ensure browser speech engine is active and unblocked
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const cleaned = cleanTextForSpeech(rawText, !!options.isTamilUI);
  if (!cleaned) {
    if (options.onEnd) options.onEnd();
    return;
  }

  // Split into natural clause/sentence chunks without losing trailing text
  const rawSentences = cleaned.split(/(?<=[.!?\n।])\s+/);
  const sentences = rawSentences.map((s) => s.trim()).filter((s) => s.length > 0);

  const finalSentences = sentences.length > 0 ? sentences : [cleaned];
  const total = finalSentences.length;

  if (options.onStart) options.onStart();

  // Enqueue all sentences into browser speech engine natively for zero-lag fluent transition
  finalSentences.forEach((sentence, idx) => {
    const { voice, langCode, rate, pitch } = selectNaturalVoice(sentence, !!options.isTamilUI);

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = langCode;
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (voice) {
      utterance.voice = voice;
    }

    if (idx === 0) {
      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };
    }

    if (idx === total - 1) {
      utterance.onend = () => {
        if (options.onEnd) options.onEnd();
      };
      utterance.onerror = (e) => {
        console.warn('TTS end utterance warning:', e);
        if (options.onEnd) options.onEnd();
      };
    }

    window.speechSynthesis.speak(utterance);
  });
};
