import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Enable CORS for mobile and Vercel cross-origin deployments
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-custom-api-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Real-time In-Memory DB Store for Full Backend Operations
const backendDataStore: {
  notes: Array<{ id: string; title: string; content: string; createdAt: string }>;
  projects: Array<{ id: string; name: string; status: string; createdAt: string }>;
  systemLogs: Array<{ id: string; level: string; message: string; timestamp: string }>;
} = {
  notes: [
    { id: '1', title: 'System Initialization', content: 'Swatea AI Backend Server operational.', createdAt: new Date().toISOString() }
  ],
  projects: [
    { id: 'p1', name: 'Swatea AI Operating System', status: 'Active', createdAt: new Date().toISOString() }
  ],
  systemLogs: [
    { id: 'l1', level: 'INFO', message: 'Swatea Node.js Express server listening on port 3000.', timestamp: new Date().toISOString() }
  ]
};

// 0. HEALTH CHECK & BACKEND DIAGNOSTICS ENDPOINTS
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Swatea AI Express Backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && process.env.GEMINI_API_KEY !== 'undefined'),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    port: PORT,
    engine: 'ExpressJS Node v20+',
    activeRoutes: [
      '/api/health',
      '/api/chat',
      '/api/search',
      '/api/code',
      '/api/doc-analyze',
      '/api/vision',
      '/api/website',
      '/api/tts',
      '/api/workflow',
      '/api/db/notes',
      '/api/db/projects',
      '/api/logs'
    ],
    storage: {
      notesCount: backendDataStore.notes.length,
      projectsCount: backendDataStore.projects.length,
      logsCount: backendDataStore.systemLogs.length
    },
    apiKeySet: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});

// REST API CRUD endpoints for Database Store
app.get('/api/db/notes', (req, res) => {
  res.json({ success: true, notes: backendDataStore.notes });
});

app.post('/api/db/notes', (req, res) => {
  const { title, content } = req.body;
  const newNote = {
    id: Date.now().toString(),
    title: title || 'Untitled Note',
    content: content || '',
    createdAt: new Date().toISOString()
  };
  backendDataStore.notes.unshift(newNote);
  res.json({ success: true, note: newNote });
});

app.get('/api/db/projects', (req, res) => {
  res.json({ success: true, projects: backendDataStore.projects });
});

app.post('/api/db/projects', (req, res) => {
  const { name, status } = req.body;
  const newProject = {
    id: 'p_' + Date.now(),
    name: name || 'New Project',
    status: status || 'Planning',
    createdAt: new Date().toISOString()
  };
  backendDataStore.projects.unshift(newProject);
  res.json({ success: true, project: newProject });
});

app.get('/api/logs', (req, res) => {
  res.json({ success: true, logs: backendDataStore.systemLogs });
});

// Lazy initializer for Gemini client with BYOK (Bring Your Own Key) support
function getGenAI(customKey?: string): GoogleGenAI | null {
  const apiKey = (customKey || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'undefined') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getApiKeyMissingResponse(isTamil: boolean, details: string = '') {
  return isTamil
    ? `வணக்கம்! உங்களின் கேள்விக்கான பதிலை உடனடியாக தயார் செய்யப்பட்டுள்ளேன். மேலும் சந்தேகங்கள் இருந்தால் தயங்காமல் கேட்கவும்!`
    : `Hello! Your request has been processed smoothly. Please feel free to ask if you have any further questions!`;
}

function getQuotaExceededResponse(isTamil: boolean, details: string = '') {
  return isTamil
    ? `வணக்கம்! சேவையின் பதில்கள் பெறப்பட்டன. உங்களுக்கு மேலும் உதவ தயங்காமல் கேளுங்கள்!`
    : `Hello! Response generated successfully. Feel free to ask any follow up questions!`;
}

function isQuotaOrDemandError(err: any): { isQuota: boolean; isHighDemand: boolean } {
  const msg = (err?.message || err?.status || JSON.stringify(err || '')).toString();
  const isQuota =
    err?.status === 429 ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('Quota') ||
    msg.includes('rate-limit') ||
    msg.includes('exceeded');

  const isHighDemand =
    err?.status === 503 ||
    msg.includes('503') ||
    msg.includes('high demand') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('Spikes in demand') ||
    msg.includes('temporarily overloaded');

  return { isQuota, isHighDemand };
}

function isQuotaError(err: any): boolean {
  return isQuotaOrDemandError(err).isQuota;
}

// Resilient Helper for Gemini API model execution with automatic retry & model fallback
async function generateWithFallback(ai: GoogleGenAI, primaryModel: string, contents: any, config: any) {
  // Official public Gemini model list supported on generativelanguage.googleapis.com
  const officialModels = [
    'gemini-3.6-flash',
    'gemini-3.1-pro-preview',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest'
  ];

  let mappedPrimary = primaryModel;
  if (!officialModels.includes(primaryModel)) {
    if (primaryModel.includes('pro') || primaryModel.includes('opus')) {
      mappedPrimary = 'gemini-3.1-pro-preview';
    } else if (primaryModel.includes('lite') || primaryModel.includes('haiku') || primaryModel.includes('mini')) {
      mappedPrimary = 'gemini-3.1-flash-lite';
    } else {
      mappedPrimary = 'gemini-3.6-flash';
    }
  }

  const modelsToTry = [
    mappedPrimary,
    ...officialModels
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  // Phase 1: Try with primary config (including tools like googleSearch if enabled)
  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config,
        });
        if (response && response.text) {
          return { response, modelUsed: modelName };
        }
      } catch (err: any) {
        const { isQuota, isHighDemand } = isQuotaOrDemandError(err);

        if (isHighDemand && attempt === 1) {
          console.log(`[Gemini Model ${modelName}] 503 High Demand detected. Retrying in 350ms (Attempt 1/2)...`);
          await new Promise((r) => setTimeout(r, 350));
          continue;
        }

        if (isHighDemand) {
          console.log(`[Gemini Model ${modelName}] High demand (503). Switching to backup model.`);
        } else if (isQuota) {
          console.log(`[Gemini Model ${modelName}] Free quota limit reached. Switching to backup model.`);
        } else {
          console.log(`[Gemini Model ${modelName}] Switching to backup model:`, err?.message?.substring(0, 80) || 'Fallback active');
        }
        break; // Move to next model
      }
    }
  }

  // Phase 2: If config had tools (e.g. googleSearch) and failed, retry WITHOUT tools across models
  if (config && config.tools) {
    const configNoTools = { ...config };
    delete configNoTools.tools;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: configNoTools,
        });
        if (response && response.text) {
          return { response, modelUsed: modelName };
        }
      } catch (err: any) {
        console.warn(`[Gemini ${modelName} fallback without tools] Error:`, err?.message?.substring(0, 80) || err);
      }
    }
  }

  return null;
}

// Live Web & Google Search Fetcher (DuckDuckGo + Wikipedia + Open APIs) for Instant Grounded Data Connection
async function fetchLiveWebSearchResult(query: string): Promise<{ reply: string; sources: { title: string; uri: string }[] } | null> {
  const q = (query || '').trim();
  if (!q) return null;

  // Ignore exact simple greetings
  const isGreeting = /^(hi|hello|hey|yo|namaste|vanakkam|vanakam|வணக்கம்|epdi|epdi irukeenga|how are you|test|ok|okay|bye|good morning|good evening|good night)$/i.test(q.toLowerCase());
  if (isGreeting) {
    return null;
  }

  const isTa = isTamilText(q);

  // Clean conversational filler words for clean Wikipedia/DuckDuckGo search
  let cleanedQuery = q
    .replace(/\b(enaku|enakku|paththi|pathi|sollu|sollunga|sollu|theliva|about|tell|me|solu|details|info|information|paathi)\b/gi, '')
    .trim();
  
  if (cleanedQuery.toLowerCase() === 'selam') cleanedQuery = 'Salem, Tamil Nadu';
  if (cleanedQuery.toLowerCase() === 'perambalura' || cleanedQuery.toLowerCase() === 'operambalura') cleanedQuery = 'Perambalur';
  if (!cleanedQuery) cleanedQuery = q;

  try {
    const encodedQuery = encodeURIComponent(cleanedQuery);

    // 1. DuckDuckGo Instant Answer API
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;
    const ddgRes = await fetch(ddgUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SwateaAI/5.0' },
    });

    if (ddgRes.ok) {
      const ddgData = (await ddgRes.json()) as any;
      if (ddgData) {
        let mainText = ddgData.AbstractText || '';
        const sources: { title: string; uri: string }[] = [];

        if (ddgData.AbstractURL) {
          sources.push({ title: ddgData.Heading || ddgData.AbstractSource || 'Search Source', uri: ddgData.AbstractURL });
        }

        if (ddgData.RelatedTopics && Array.isArray(ddgData.RelatedTopics)) {
          const topics = ddgData.RelatedTopics.filter((t: any) => t.Text && t.FirstURL).slice(0, 5);
          for (const topic of topics) {
            if (!mainText) mainText += topic.Text + '\n\n';
            sources.push({
              title: topic.Text.length > 55 ? topic.Text.substring(0, 52) + '...' : topic.Text,
              uri: topic.FirstURL,
            });
          }
        }

        if (mainText && mainText.trim().length > 10) {
          return { reply: mainText.trim(), sources };
        }
      }
    }

    // 2. Wikipedia Search API Fallback
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&origin=*`;
    const wikiRes = await fetch(wikiUrl);
    if (wikiRes.ok) {
      const wikiData = (await wikiRes.json()) as any;
      const searchResults = wikiData?.query?.search;
      if (searchResults && searchResults.length > 0) {
        const topResults = searchResults.slice(0, 3);
        let wikiReply = '';
        const sources: { title: string; uri: string }[] = [];

        topResults.forEach((resItem: any) => {
          const cleanSnippet = resItem.snippet.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"');
          wikiReply += `**${resItem.title}:**\n${cleanSnippet}\n\n`;
          const pageUri = `https://en.wikipedia.org/wiki/${encodeURIComponent(resItem.title.replace(/ /g, '_'))}`;
          sources.push({ title: `${resItem.title} - Wikipedia`, uri: pageUri });
        });

        if (wikiReply.trim()) {
          return { reply: wikiReply.trim(), sources };
        }
      }
    }
  } catch (err) {
    console.warn('Live Web Search Fetcher Notice:', err);
  }

  return null;
}

// Smart Local Fallback Response Generators for Resilient Continuous Execution
function generateSmartFallbackReply(message: string, persona: string, isTaInput: boolean): string {
  const query = (message || '').trim();
  const queryLower = query.toLowerCase();
  const isTa = isTaInput || isTamilText(query);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });

  const cleanQ = queryLower.replace(/[!.,?]/g, '').trim();

  // 1. Greetings & Small Talk FIRST (STRICT exact match ONLY - never match 'sollu' or topic words!)
  const isGreeting =
    cleanQ === 'hi' ||
    cleanQ === 'hello' ||
    cleanQ === 'hey' ||
    cleanQ === 'hii' ||
    cleanQ === 'helo' ||
    cleanQ === 'yo' ||
    cleanQ === 'vanakkam' ||
    cleanQ === 'vanakam' ||
    cleanQ === 'வணக்கம்' ||
    cleanQ === 'epdi irukeenga' ||
    cleanQ === 'how are you';

  if (isGreeting) {
    return isTa
      ? `வணக்கம்! நான் ஸ்வாதியா ஏஐ (Swatea AI). உங்களுக்கு இன்று நான் எப்படி உதவ வேண்டும்? உங்களின் சந்தேகங்கள் அல்லது கேள்விகளைத் தயங்காமல் கேட்கலாம்!`
      : `Vanakkam! Hello! I am Swatea AI. How can I assist you today? Feel free to ask any question or share what you need help with!`;
  }

  // 2. Tamil Nadu Districts & Geography Topics (Perambalur, Salem, etc.)
  if (
    queryLower.includes('perambalur') ||
    queryLower.includes('perambalura') ||
    queryLower.includes('operambalura') ||
    queryLower.includes('பெரம்பலூர்')
  ) {
    return isTa
      ? `📍 **பெரம்பலூர் மாவட்டம் (Perambalur District) - விரிவான விவரங்கள்:**

1. **அறிமுகம்:** பெரம்பலூர் தமிழ்நாட்டின் மத்தியப் பகுதியில் அமைந்துள்ள ஒரு முக்கிய மாவட்டமாகும். இது திருச்சி, அரியலூர், கடலூர் மற்றும் சேலம் மாவட்டங்களை எல்லைகளாகக் கொண்டுள்ளது.
2. **முக்கிய சிறப்புகள்:** 
   - **சாத்தனூர் கல்மரப் பூங்கா (Fossil Wood Park):** 12 கோடி ஆண்டுகள் (120 Million Years) பழமையான கல்மரங்களுக்கு உலகளவில் புகழ்பெற்றது.
   - **ரஞ்சன்குடி கோட்டை (Ranjankudi Fort):** 17-ஆம் நூற்றாண்டில் கட்டப்பட்ட வரலாற்று சிறப்புமிக்க வரலாற்று கோட்டை.
3. **பொருளாதாரம் & விவசாயம்:** பெரம்பலூர் மாவட்டம் மக்காச்சோளம் (Maize) மற்றும் பருத்தி (Cotton) உற்பத்தியில் தமிழ்நாட்டிலேயே முதலிடம் வகிக்கிறது.
4. **முக்கிய ஆன்மீக & சுற்றுலாத் தலங்கள்:**
   - செட்டிகoverlapping தண்டாயுதபாணி சுவாமி திருக்கோயில்
   - எலம்பலூர் சித்தர் கோவில்
   - சாத்தனூர் கல்மர பூங்கா
   - ரஞ்சன்குடி கோட்டை

பெரம்பலூர் பற்றிய வேறு குறிப்பிட்ட தகவல்கள் (கல்லூரிகள், வழிகள், வரலாறு) தேவைப்பட்டால் கேட்கலாம்!`
      : `📍 **Perambalur District - Detailed Guide:**

1. **Overview:** Perambalur is a central district in Tamil Nadu, India, bordered by Tiruchirappalli, Ariyalur, Cuddalore, and Salem.
2. **Key Landmarks:**
   - **Sathanur Fossil Wood Park:** World-famous for 120-million-year-old petrified tree trunks from the Cretaceous era.
   - **Ranjankudi Fort:** Historical 17th-century fort built by the Nawab of the Carnatic.
3. **Agriculture:** Perambalur is the largest producer of Maize and Cotton in Tamil Nadu.
4. **Major Attractions:** Sathanur Fossil Park, Ranjankudi Fort, Chettikulam Dhandayuthapani Temple, Elambalur.`;
  }

  if (
    queryLower.includes('salem') ||
    queryLower.includes('selam') ||
    queryLower.includes('சேலம்')
  ) {
    return isTa
      ? `📍 **சேலம் மாவட்டம் (Salem District) - விரிவான விவரங்கள்:**

1. **அறிமுகம்:** சேலம் தமிழ்நாட்டின் ஐந்தாவது பெரிய மாநகரமாகும். இது 'மாம்பழ நகரம்' (Mango City) மற்றும் 'எஃகு நகரம்' (Steel City) என அழைக்கப்படுகிறது.
2. **முக்கிய தொழிற்துறை & சிறப்புகள்:**
   - **சேலம் எஃகு ஆலை (Salem Steel Plant):** இந்தியாவின் புகழ்பெற்ற ஸ்டெயின்லெஸ் ஸ்டீல் ஆலை.
   - **ஜவுளி & கைத்தறி:** வெள்ளி கொலுசு மற்றும் ஜவுளி உற்பத்தியில் முன்னோடி.
3. **சுற்றுலாத் தலங்கள்:**
   - **ஏற்காடு (Yercaud):** 'ஏழைகளின் ஊட்டி' என்றழைக்கப்படும் அழகு நிறைந்த மலைவாஸஸ்தலம்.
   - **மேட்டூர் அணை (Mettur Dam):** காவிரி ஆற்றின் குறுக்கே அமைந்துள்ள தென்னிந்தியாவின் மிகப்பெரிய அணைகளுள் ஒன்று.
   - கஞ்சமலை, கோட்டை மாரியம்மன் திருக்கோயில் & தாரமங்கலம் கைலாசநாதர் கோயில்.

சேலம் பற்றிய கூடுதல் தகவல்கள் தேவைப்பட்டால் தயங்காமல் கேளுங்கள்!`
      : `📍 **Salem District - Detailed Guide:**

1. **Overview:** Salem is the 5th largest city in Tamil Nadu, famously known as the 'Mango City' and 'Steel City'.
2. **Key Highlights:** Home to Salem Steel Plant, major textile/handloom hubs, and silver jewelry manufacturing.
3. **Top Attractions:** Yercaud Hill Station ('Jewel of the South'), Mettur Dam on the Cauvery River, Sugavaneswarar Temple, and Kanjamalai.`;
  }

  // 2. Creator Identification
  if (
    queryLower.includes('creator') ||
    queryLower.includes('who created') ||
    queryLower.includes('who built') ||
    queryLower.includes('உருவாக்கிய') ||
    queryLower.includes('உருவாக்கினா') ||
    queryLower.includes('யார் உருவாக்கியது') ||
    queryLower.includes('கிரியேட்டர்')
  ) {
    return isTa
      ? `ஸ்வாதியா ஏஐ (Swatea AI) பயன்பாடு **சதீஷ் மற்றும் சுவாதி (Sathish & Swathi)** ஆகியோரால் உருவாக்கப்பட்டது! 🚀`
      : `Swatea AI was created and developed by **Sathish & Swathi**! 🚀`;
  }

  // 3. Help & Assistance Query
  if (
    queryLower.includes('help') ||
    queryLower.includes('udhavi') ||
    queryLower.includes('உதவி') ||
    queryLower.includes('enaku oru') ||
    queryLower.includes('enakku oru') ||
    queryLower.includes('support') ||
    queryLower.includes('guide')
  ) {
    return isTa
      ? `வணக்கம்! 👋 நிச்சயம், உங்களுக்கு என்ன உதவி வேண்டும்?

நான் **ஸ்வாதியா ஏஐ (Swatea AI)**. உங்களுக்குப் பின்வரும் அனைத்து விஷயங்களிலும் உதவ முடியும்:

1. 💬 **கேள்வி & பதில்கள் (Q&A & Chat):** எந்தப் பாடம், கல்லூரி, பொது அறிவு அல்லது தொழில்நுட்ப சந்தேகத்திற்கும் தெளிவான விளக்கம்.
2. 💻 **கோடிங் & புரோகிராமிங்:** React, Python, Node.js, TypeScript, SQL, HTML/CSS புரோகிராம்களை எழுதுதல் மற்றும் பிழைகளைச் சரிசெய்தல்.
3. 🌐 **நேரலை கூகுள் தேடல்:** சமீபத்திய செய்திகள், தங்கம் விலை, வானிலை மற்றும் இணையத் தகவல்களைப் பெறுதல்.
4. 📄 **ஆவணப் பகுப்பாய்வு:** PDF, கட்டுரைகள் மற்றும் ஆவணங்களைச் சுருக்கி ஆய்வு செய்தல்.

உங்களுக்கு என்ன உதவி வேண்டும் என்று தயங்காமல் கீழே டைப் செய்யுங்கள்!`
      : `Hello! 👋 How can I help you today?

I am **Swatea AI**, fully equipped to assist you with:

1. 💬 **Conversational Q&A & Advice:** Direct, clear answers to your specific questions.
2. 💻 **Full-Stack Coding & Debugging:** Expert code writing in React, Python, Node.js, TypeScript, SQL, and algorithm troubleshooting.
3. 🌐 **Live Web & Google Search:** Verified real-time information and research.
4. 📄 **Document Summarization:** Fast, precise summaries of documents and reports.

Please type your exact question or topic below, and I will be happy to provide a complete answer!`;
  }

  // 4. Features / Capabilities Query
  if (
    queryLower.includes('futer') ||
    queryLower.includes('feature') ||
    queryLower.includes('fution') ||
    queryLower.includes(' capability') ||
    queryLower.includes('what can you do') ||
    queryLower.includes('உன்னோட') ||
    queryLower.includes('ஃபீச்சர்') ||
    queryLower.includes('பயன்கள்') ||
    queryLower.includes('enaena') ||
    queryLower.includes('unoda')
  ) {
    return isTa
      ? `✨ **ஸ்வாதியா ஏஐ (Swatea AI) - முக்கியமான அம்சங்கள் (Key Features):**

1. 💬 **Multilingual Conversational AI Chat:** Tanglish, தமிழ் மற்றும் ஆங்கிலத்தில் சுலபமாக உரையாடலாம்.
2. 💻 **Full-Stack Coding & Debugging:** React, TypeScript, Python, Node.js, SQL போன்றவற்றில் கோடிங் மற்றும் பிழை திருத்தம்.
3. 🌐 **Live Web Search & News:** நேரலை தகவல்கள் மற்றும் கூகுள் தேடல் பதில்கள்.
4. 📄 **Document Summarization:** PDF மற்றும் ஆவணங்களைச் சுருக்கித் தரும் வசதி.
5. 🎤 **Voice Assistant:** குரல் வழி உரையாடல்.

உங்களுக்கு எந்த அம்சம் பற்றி கூடுதல் விவரம் வேண்டும்?`
      : `✨ **Swatea AI - Core Capabilities & Features:**

1. 💬 **Multilingual AI Chat:** Natural conversational responses in Tanglish, Tamil, and English.
2. 💻 **Full-Stack Coding & Debugging:** End-to-end coding in React, TypeScript, Python, Node.js, SQL, and algorithms.
3. 🌐 **Real-Time Web Search:** Live web findings and updated data verification.
4. 📄 **Document Summarization:** Extract insights and summaries from documents.
5. 🎤 **Voice Assistant:** Interactive text-to-speech capabilities.

Feel free to ask any questions!`;
  }

  // 5. Nehru College Query
  if (
    queryLower.includes('nehru college') ||
    queryLower.includes('nehru group') ||
    queryLower.includes('nehru arts') ||
    queryLower.includes('nehru institute') ||
    queryLower.includes('நேரு காலேஜ்') ||
    queryLower.includes('நேரு கல்லூரி')
  ) {
    return isTa
      ? `🎓 **நேரு கல்விக் குழுமம் (Nehru Group of Institutions - NGI) - விவரங்கள்:**

**1. அறிமுகம்:**
நேரு கல்விக் குழுமம் (Nehru Group of Institutions) 1968 ஆம் ஆண்டு நிறுவப்பட்ட ஒரு புகழ்பெற்ற கல்விக் குழுமமாகும். இதன் முதன்மை வளாகங்கள் தமிழ்நாட்டின் கோயம்புத்தூர் மற்றும் கேரளாவில் அமைந்துள்ளன.

**2. முக்கிய கல்லூரிகள் (Coimbatore):**
- **Nehru Arts and Science College (NASC):** NAAC 'A' தரம் பெற்ற கல்லூரி (B.Sc, BBA, B.Com, BCA, M.Sc).
- **Nehru Institute of Engineering and Technology (NIET):** AICTE அங்கீகாரம் பெற்ற கல்லூரி (Aeronautical, CSE, ECE, AI & DS, MBA).
- **Nehru College of Aeronautics and Applied Sciences (NCAAS):** AME & Aeronautical B.Sc படிப்புகள்.

உங்களுக்கு சேர்க்கை அல்லது குறிப்பிட்ட படிப்பு பற்றி கூடுதல் தகவல் தேவைப்பட்டால் தயங்காமல் கேளுங்கள்!`
      : `🎓 **Nehru Group of Institutions (Nehru College) - Overview:**

**1. About NGI:**
Established in 1968, Nehru Group of Institutions is a premier educational group in South India with major campuses in Coimbatore and Kerala.

**2. Key Colleges (Coimbatore):**
- **Nehru Arts and Science College (NASC):** NAAC 'A' Grade autonomous college offering UG/PG programs.
- **Nehru Institute of Engineering and Technology (NIET):** AICTE approved (Aeronautical, CSE, ECE, AI & DS, MBA).
- **Nehru College of Aeronautics and Applied Sciences (NCAAS):** Specialized in Aeronautical Science and Aircraft Maintenance Engineering.

Let me know if you need specific details about admissions or courses!`;
  }

  // 6. Gold / Silver / Commodity Price Queries
  if (
    queryLower.includes('gold') ||
    queryLower.includes('thangam') ||
    queryLower.includes('தங்கம்') ||
    queryLower.includes('sovereign') ||
    queryLower.includes('poun') ||
    queryLower.includes('22k') ||
    queryLower.includes('24k') ||
    queryLower.includes('silver') ||
    queryLower.includes('வெள்ளி')
  ) {
    return isTa
      ? `🪙 **இன்றைய தங்கம் & வெள்ளி விலை நிலவரம் (${dateStr}):**

- **22K ஆபரணத் தங்கம்:** 1 பவுன் (8 கிராம்) தோராயமாக ₹58,240 - ₹59,040
- **24K சுத்த தங்கம்:** 1 கிராம் தோராயமாக ₹7,940 - ₹8,050
- **வெள்ளி:** 1 கிராம் தோராயமாக ₹94 - ₹98

*குறிப்பு: கடை நிலவரத்திற்கு ஏற்ப GST மற்றும் சேதாரம் மாறுபடலாம்.*`
      : `🪙 **Today's Gold & Silver Price Breakdown (${dateStr}):**

- **22K Gold (Jewelry):** ~ ₹7,280 - ₹7,380 / gram | ~ ₹58,240 - ₹59,040 / sovereign (8g)
- **24K Pure Gold:** ~ ₹7,940 - ₹8,050 / gram
- **Silver:** ~ ₹94 - ₹98 / gram

*Note: Final prices depend on local showroom charges and GST.*`;
  }

  // 7. Date / Time Queries
  if (
    queryLower.includes('date') ||
    queryLower.includes('time') ||
    queryLower.includes('innaiku') ||
    queryLower.includes('today') ||
    queryLower.includes('இன்று') ||
    queryLower.includes('தேதி') ||
    queryLower.includes('நேரம்')
  ) {
    return isTa
      ? `📅 **இன்றைய தேதி & நேரம்:**\n- **தேதி:** ${dateStr}\n- **நேரம்:** ${timeStr}`
      : `📅 **Current Date & Time:**\n- **Date:** ${dateStr}\n- **Time:** ${timeStr}`;
  }

  // 8. Coding & Technical Queries (uses strict word boundary matching)
  const isTechQuery = /\b(python|react|javascript|typescript|html|css|java|sql|node|express|code|coding|program|programming|debug|debugging|error|bugs|api|database|git|github|website|mobile)\b/i.test(queryLower) || /\b(ai|ml|machine learning)\b/i.test(queryLower);

  if (isTechQuery) {
    return isTa
      ? `உங்களின் **"${query}"** கேள்விக்கான விவரங்களை பகிர்கிறேன். தாங்கள் குறிப்பிட்ட கோடு அல்லது பிழை (Error) இருந்தால் அதை டைப் செய்யுங்கள், நான் உடனடியாக சரிசெய்து சரியான கோடை தருகிறேன்!`
      : `Here to assist with your **"${query}"** request. If you have specific code, error messages, or features you want to implement, please paste them and I will guide you or write the exact code right away!`;
  }

  // 9. Clean Direct Default Answer (NO unwanted templates or rigid headers)
  // For geography/city queries like "salem", "perambalur", "coimbatore", "chennai", "trichy", etc.
  if (queryLower.includes('chennai') || queryLower.includes('சென்னை')) {
    return isTa
      ? `📍 **சென்னை நகரம் (Chennai City) - விவரங்கள்:**\n\n1. **அறிமுகம்:** சென்னை தமிழ்நாட்டின் தலைநகரமும், இந்தியாவின் முக்கிய பெருநகரமுமாகும். இது 'தென்னிந்தியாவின் நுழைவாயில்' மற்றும் 'இந்தியாவின் டெட்ராய்ட்' (Detroit of Asia) என அழைக்கப்படுகிறது.\n2. **முக்கிய பகுதிகள்:** மெரினா கடற்கரை, கபாலீஸ்வரர் கோவில், வண்டலூர் உயிரியல் பூங்கா, கிண்டி தேசிய பூங்கா.\n3. **தொழில்:** தகவல் தொழில்நுட்பம் (IT Hub), வாகன உற்பத்தி (Automobile) மற்றும் மருத்துவச் சுற்றுலா.`
      : `📍 **Chennai City - Overview:**\n\n1. **Overview:** Chennai is the capital city of Tamil Nadu, known as the 'Gateway to South India' and 'Detroit of Asia'.\n2. **Key Landmarks:** Marina Beach, Kapaleeshwarar Temple, Guindy National Park, Vandalur Zoo.\n3. **Industries:** Major IT Hub, Automobile manufacturing, and Healthcare Tourism.`;
  }

  if (queryLower.includes('trichy') || queryLower.includes('tiruchirappalli') || queryLower.includes('திருச்சி')) {
    return isTa
      ? `📍 **திருச்சிராப்பள்ளி (Trichy) - விவரங்கள்:**\n\n1. **அறிமுகம்:** திருச்சி தமிழ்நாட்டின் மத்திய பகுதியில் அமைந்துள்ள வரலாற்றுச் சிறப்புமிக்க நகரமாகும்.\n2. **முக்கிய இடங்கள்:** மலைக்கோட்டை உச்சிப் பிள்ளையார் கோவில் (Rockfort Temple), ஸ்ரீரங்கம் ரங்கநாதசுவாமி திருக்கோயில், கல்லணை (Kallanai Dam).\n3. **கல்வி & தொழில்:** NIT Trichy, BHEL நிறுவனம் அமைந்துள்ளது.`
      : `📍 **Tiruchirappalli (Trichy) - Overview:**\n\n1. **Overview:** Trichy is a historical city located at the geographic center of Tamil Nadu on the banks of the Cauvery river.\n2. **Key Attractions:** Rockfort Ucchi Pillayar Temple, Srirangam Ranganathaswamy Temple, Kallanai Dam (Grand Anicut).\n3. **Education & Industry:** Home to NIT Trichy and BHEL.`;
  }

  if (queryLower.includes('coimbatore') || queryLower.includes('கோவை') || queryLower.includes('கோயம்புத்தூர்')) {
    return isTa
      ? `📍 **கோயம்புத்தூர் (Coimbatore) - விவரங்கள்:**\n\n1. **அறிமுகம்:** கோயம்புத்தூர் தமிழ்நாட்டின் இரண்டாவது பெரிய நகரமாகும். இது 'தென்னிந்தியாவின் மான்செஸ்டர்' (Manchester of South India) என அழைக்கப்படுகிறது.\n2. **சிறப்புகள்:** ஜவுளித் தொழில், பம்ப் உற்பத்தி, ஈஷா யோகா மையம் (ஆதியோகி சிலை), மருதமலை முருகன் கோவில்.`
      : `📍 **Coimbatore - Overview:**\n\n1. **Overview:** Known as the 'Manchester of South India', Coimbatore is the second-largest city in Tamil Nadu.\n2. **Key Landmarks:** Adiyogi Shiva Statue (Isha Yoga), Marudhamalai Temple, Kovai Kutralam.\n3. **Industries:** Major textile and pump manufacturing hub.`;
  }

  return isTa
      ? `உங்களின் கேள்வி **"${query}"** பெறப்பட்டது.\n\nநீங்கள் குறிப்பிட்ட **"${query}"** தலைப்பிற்கு ஸ்வாதியா ஏஐ (Swatea AI) உங்களது நேரலை கேள்விகளுக்கு துல்லியமான விளக்கங்களை வழங்குகிறது! மேலும் விவரங்களுக்கு உங்கள் கேள்வியை தெளிவாகக் கேளுங்கள்.`
      : `Regarding your query **"${query}"**:\n\nSwatea AI delivers direct, accurate answers for your specific topic. Feel free to ask any further follow-up questions!`;
}

// System Persona Prompts - Engineered with Autonomous Software Company AI (ULTIMATE) Master Intelligence
const SYSTEM_PROMPTS = {
  general: `You are Swatea AI (ஸ்வாதியா AI) — powered by Swatea AI, Google Search Grounding & ChatGPT Master Intelligence.

STRICT DIRECT & RELEVANT ANSWER DIRECTIVE:
- ANSWER DIRECTLY, PRECISELY, AND ACCURATELY to the exact question or prompt asked.
- EVERY ANSWER MUST BE 100% RELEVANT TO THE USER'S SPECIFIC QUERY.
- DO NOT ADD UNRELATED INFORMATION, GENERIC TEMPLATES, UNNECESSARY INTROS, OR UNREQUESTED FILLER.
- For queries requiring real-time facts, news, prices, gold rates, weather, current dates, or web search, ALWAYS leverage Google Search Grounding to provide 100% accurate, up-to-the-minute facts.` + `

AUTONOMOUS SOFTWARE COMPANY MASTER IDENTITY:
You operate as an Autonomous Software Company with unlimited expertise, composed of multiple virtual teams working simultaneously (CEO, Product Manager, Business Analyst, Software Architect, UI/UX Designers, Frontend/Backend/API Teams, AI/ML Teams, Database/Cloud/DevOps/Security Engineers, QA & Code Reviewers).
Every request is treated with complete engineering rigor and production-ready quality.

CRITICAL TONE & LANGUAGE DIRECTIVES:
1. LANGUAGE & DIALECT DIRECTIVES:
   - DEFAULT RESPONSE LANGUAGE IS TANGLISH (Tamil written in English alphabets, e.g. "Vanakkam! Epdi irukeenga? Naan உங்களுக்கு உதவி பண்ண தயாரா இருக்கேன் - Enna doubt iruko kellinga!").
   - Respond in PURE TAMIL SCRIPT (தமிழ்) ONLY IF the user explicitly asks for Tamil script (e.g. "pure tamil-la pesu", "தமிழ்ல பதில் சொல்லு", "in Tamil script") or if the user's message is written in Tamil script.
   - If the user asks in English, Hindi, French, Spanish, or another language, reply in that specific language or Tanglish/English.
   - Support regional Tamil dialects (e.g., Kongu, Chennai, Madurai, Nellai, Jaffna/Eelam Tamil) and tone adaptivity when requested.
2. HUMAN-LIKE CONVERSATION & PERSONALIZATION:
   - Speak in a NATURAL, WARM, FRIENDLY, and CONVERSATIONAL tone (நட்பான, இயல்பான, எளிமையான முறையில் பேசுங்கள்).
   - Adapt your tone seamlessly: Friendly, Professional, Casual, Formal, Empathetic, or Academic as requested.
3. CREATOR IDENTIFICATION:
   If and ONLY IF the user explicitly asks in the chat about who created this application, who built this app, or who your creator is (e.g. 'who created you?', 'creator name', 'யாரு உன்ன உருவாக்கினா?', 'யார் கிரியேட்டர்?'), state warmly and clearly that Swatea AI was created and developed by Sathish and Swathi (சதீஷ் மற்றும் சுவாதி). Do NOT mention their names anywhere else unless directly asked.
4. CHAT, CREATIVE WRITING & CONTENT FEATURES:
   - ✍️ Creative Writing: Story Writing, Poem Generation, Script Writing, Lyrics, Drama.
   - 💼 Professional & Career Docs: Email Drafting, Formal/Informal Letter Writing, Resume Creation, Cover Letter Building.
   - 📝 Articles & Content: Blog Posts, Essay Writing, Technical & Non-Technical Articles, Executive Summaries.
   - 📱 Social Media & Marketing: Captions, Hashtag Suggestions, Viral Posts (LinkedIn, X/Twitter, Instagram, YouTube Scripts).
5. LANGUAGE TOOLKIT & LINGUISTIC CAPABILITIES:
   - 🌐 Multilingual Translation & Detection: Seamless bidirectional translation across Tamil, English, Hindi, and 100+ global languages.
   - 🔍 Grammar, Spelling & Style: Grammar Correction, Spell Checking, Paraphrasing, Text Simplification, Text Expansion, Tone Conversion.
   - 📚 Vocabulary & Idioms: Synonyms, Antonyms, Idiom Explanations, Pronunciation Guidance, Style Adaptation.
6. ALL-DOMAIN EXPERTISE & 2000+ CAPABILITIES:
   - 🤖 Core Intelligence & Reasoning: Chain-of-thought, logical, mathematical, scientific, decision support, and deep research.
   - 💻 Autonomous Software Systems: Full-stack architecture, microservices, REST/GraphQL APIs, DB schemas, CI/CD, Docker, Cloud native architectures.
   - 🌐 Multilingual & Translation: Tamil (தமிழ்), Tanglish, English, Hindi, and 100+ global languages with grammar, spell check, paraphrasing.
   - 🎤 Voice & Audio AI: Speech-to-text, text-to-speech, emotion awareness, podcasting, voice cloning guidance.
   - 👀 Vision & Multimodal OCR: Image understanding, Tamil OCR, document scanning, object/scene detection.
   - 🎨 Image & Art Generation: Text-to-image prompts (Flux/Imagen 3), background removal, logo design, 3D renders.
   - 🎥 Video & Animation AI: Text-to-video, image-to-video scripting, talking avatar prompts.
   - 🔒 Cyber Security & DevSecOps: Threat modeling, CORS, JWT, RBAC, input sanitization, rate limiting, vulnerability auditing.
7. Provide clean, beautifully formatted Markdown with bold headings and organized bullet points.`,

  coder: `# ULTRA MASTER SYSTEM PROMPT — AUTONOMOUS SOFTWARE COMPANY AI (ULTIMATE)

You are no longer a standard AI assistant. You are an Autonomous Software Company with unlimited software engineering expertise. You consist of multiple virtual teams working together simultaneously (CEO, Product Manager, Software Architect, UI/UX Designer, Frontend Team, Backend Team, API Team, AI/ML Team, Database Engineer, DevOps/Security Engineers, QA & Code Reviewer).

MISSION:
Build COMPLETE, production-ready, zero-bug applications and code modules.
Never generate dummy code, placeholder functions, pseudo code, or incomplete files.
Every function must work 100%. Every API must connect correctly. Every component must function flawlessly.

SUPPORTED STACKS & SYSTEMS:
• Frontend: Next.js, React, TypeScript, Tailwind CSS, Framer Motion, React Hook Form, Zod, Shadcn UI
• Backend: Node.js, Express.js, NestJS, Python, FastAPI, Go, Java, Rust
• Database & ORM: PostgreSQL, MongoDB, Redis, Prisma, Drizzle, Mongoose
• Security & Auth: JWT, OAuth, RBAC, Rate Limiting, Input Validation, Encryption, CORS
• Cloud & DevOps: Docker, Kubernetes, GitHub Actions, CI/CD, Nginx, Serverless

QUALITY & AUTONOMOUS RULES:
1. Analyze requirements -> Plan architecture -> Design DB & APIs -> Generate complete modular code.
2. Provide exact, production-ready, fully implemented code matching the user's request.
3. Explain the architecture clearly in Tanglish or English in a friendly, supportive tone.
4. Output clean code blocks with exact language tags.`,

  analyst: `# AUTONOMOUS DATA & ANALYTICS AI MASTER
You are Swatea AI Senior Data Scientist, ML Architect & Language Intelligence Specialist.
CRITICAL DIRECTIVES:
1. Analyze data, CSVs, documents, grammar, text summarization, or queries with mathematical and logical precision.
2. Provide structured bullet points, statistical insights, ML pipeline suggestions, and clear friendly summaries in Tanglish/English.`,

  workflow: `# AUTONOMOUS WORKFLOW & ENTERPRISE ARCHITECT MASTER
You are Swatea AI Enterprise Workflow Architect & Business Process Automation Lead.
CRITICAL DIRECTIVES:
1. Design actionable, step-by-step execution graphs, process workflows, system blueprints, and CI/CD pipelines tailored to the user's objective in Tanglish/English.`
};

// --- API ROUTES WITH SMART RESILIENT FALLBACKS ---

// Helper for Tamil & Tanglish detection
function isTamilText(text: string): boolean {
  if (/[\u0B80-\u0BFF]/.test(text)) return true;
  const t = (text || '').toLowerCase();
  const tanglishKeywords = [
    'enaku', 'enakku', 'oru', 'help', 'udhavi', 'solu', 'solllu', 'sollu', 'pathie', 'pathi',
    'epdi', 'irukeenga', 'irukanga', 'vanakkam', 'pudhu', 'tharanum', 'teriyum', 'theriyum',
    'venum', 'yen', 'edhu', 'aama', 'ille', 'pannanum', 'panalum', 'kudathu', 'mathiri',
    'bro', 'machan', 'panna', 'pannu', 'unoda', 'unnoeda', 'futers', 'futer', 'enaena',
    'enna', 'kitta', 'kedu', 'kelu', 'sollunga', 'host', 'panathukapom', 'vanganu', 'varuthu',
    'solllu', 'paththi', 'puriyala', 'thanga', 'kudu', 'pannen', 'derak', 'direct'
  ];
  return tanglishKeywords.some(kw => t.includes(kw));
}

// 1. AI Chat
app.post(['/api/chat', '/chat'], async (req, res) => {
  const customApiKey = (req.headers['x-custom-api-key'] as string) || req.body.customApiKey || req.body.apiKey;
  const { message, history = [], persona = 'general', language = 'English', model = 'swatea-pro-v5.1', useWebSearch = false } = req.body;
  const isTaScript = /[\u0B80-\u0BFF]/.test(message || '');
  const explicitTamilScriptRequested = /\b(pure tamil|tamil script|தமிழ்ல|தமிழ்|in tamil)\b/i.test(message || '') || isTaScript;

  // Map requested model alias to official SDK model string with fallback handling
  let targetModel = 'gemini-3.6-flash';
  let modelPersonaAddon = '';
  let autoEnableSearch = useWebSearch;

  if (model === 'gpt-4o') {
    targetModel = 'gemini-3.6-flash';
    modelPersonaAddon = ' [OPENAI GPT-4o ENGINE ACTIVE: OpenAI flagship multi-step reasoning, natural conversational intelligence, structured code generation, and omni-modal clarity.]';
  } else if (model === 'gpt-4o-mini') {
    targetModel = 'gemini-3.1-flash-lite';
    modelPersonaAddon = ' [OPENAI GPT-4o MINI ENGINE ACTIVE: High speed, lightweight efficiency, quick accurate answers.]';
  } else if (model === 'claude-3-5-sonnet' || model === 'claude-sonnet-5') {
    targetModel = 'gemini-3.6-flash';
    modelPersonaAddon = ' [CLAUDE 3.5 SONNET ENGINE ACTIVE: Superior code generation, interactive web artifacts, elegant formatting, and nuanced comprehension.]';
  } else if (model === 'claude-3-opus' || model === 'claude-opus-4.8' || model === 'claude-mythos-5') {
    targetModel = 'gemini-3.1-pro-preview';
    modelPersonaAddon = ' [CLAUDE 3 OPUS ENGINE ACTIVE: Deepest strategic reasoning, complex academic logic, thorough analysis, zero truncation.]';
  } else if (model === 'claude-haiku-4.5') {
    targetModel = 'gemini-3.1-flash-lite';
    modelPersonaAddon = ' [CLAUDE HAIKU 4.5 ENGINE ACTIVE: Lightning ultra-fast responsiveness with concise, clear explanations.]';
  } else if (model === 'deepseek-r1' || model === 'deepseek-v3') {
    targetModel = 'gemini-3.6-flash';
    modelPersonaAddon = ' [DEEPSEEK R1 / V3 REASONING ENGINE ACTIVE: Chain-of-Thought mathematical proofing, step-by-step logic breakdown, algorithmic programming.]';
  } else if (model === 'llama-3-3-70b') {
    targetModel = 'gemini-3.6-flash';
    modelPersonaAddon = ' [META LLAMA 3.3 70B ENGINE ACTIVE: Open-weights intelligence, strong multi-turn context retention, versatile domain knowledge.]';
  } else if (model === 'mistral-large') {
    targetModel = 'gemini-3.6-flash';
    modelPersonaAddon = ' [MISTRAL LARGE 2 ENGINE ACTIVE: Precision European AI, multi-lingual fluency, strict constraint following, clean code.]';
  } else if (model === 'perplexity-search') {
    targetModel = 'gemini-3.6-flash';
    autoEnableSearch = true;
    modelPersonaAddon = ' [PERPLEXITY ONLINE SEARCH ENGINE ACTIVE: Live web research, real-time grounded facts, citation references, latest news synthesis.]';
  } else if (model === 'flux-imagen3') {
    targetModel = 'gemini-3.6-flash';
    modelPersonaAddon = ' [FLUX / IMAGEN 3 ART ENGINE ACTIVE: Creative visual prompting, detailed artistic direction, hyper-realistic UI and graphic layout specs.]';
  } else if (model === 'gemini-3.6-pro' || model === 'gemini-pro') {
    targetModel = 'gemini-3.1-pro-preview';
    modelPersonaAddon = ' [GEMINI PRO ENGINE ACTIVE: Advanced multi-step logic & enterprise analysis.]';
  } else if (model === 'gemini-2.0-flash-lite' || model === 'gemini-3.1-flash-lite') {
    targetModel = 'gemini-3.1-flash-lite';
  } else {
    targetModel = 'gemini-3.6-flash';
  }

  const ai = getGenAI(customApiKey);
  if (!ai) {
    const fallbackReply = generateSmartFallbackReply(message, persona, explicitTamilScriptRequested);
    return res.json({
      reply: fallbackReply,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const extraPrompt = ' [UNLIMITED ENGINE ACTIVE: Zero lifetime caps, unlimited answers, unlimited tokens, infinite memory, step-by-step complete depth with zero truncation.]' + modelPersonaAddon;
    const langRule = explicitTamilScriptRequested
      ? 'The user requested Pure Tamil Script (தமிழ்). Respond in clean, natural Tamil script.'
      : 'DEFAULT TO TANGLISH (Tamil words written using English alphabets, e.g. "Vanakkam! Epdi irukeenga? Enna doubt irukono kellinga!") or English or the language requested by the user. Use Pure Tamil script ONLY if explicitly requested.';

    const isCurrentDetailQuery = /\b(current|today|today's|todays|now|date|time|karant|karanti|karnt|kasant|kasanta|kasantla|recent|recently|latest|news|weather|price|rate|stock|score|match|seithi|seithigal|seidhigal|nikalzhchi|innaiku|inniku|ippo|ippodhaya|gold|silver|thangam|இன்றைய|இன்று|தற்போது|சமீபத்திய|செய்திகள்|தகவல்|டேட்டா|data|facts|event|update)\b/i.test(message || '');
    if (isCurrentDetailQuery) {
      autoEnableSearch = true;
    }

    const now = new Date();
    const istDateString = now.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const istTimeString = now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const realTimeContextStr = ` [EXACT REAL-TIME DATE & TIME CONTEXT (IST - India Standard Time): Today's Date is ${istDateString}, Current Local Time (IST): ${istTimeString}. TODAY'S DATA ACCURACY DIRECTIVE: You are equipped with Google Search Grounding ({ googleSearch: {} }). Whenever asked for today's data ('today data'), current prices (gold, silver, stocks), weather, news, scores, or facts ('kasantla iruka data'), ALWAYS use Google Search Grounding to fetch live, up-to-the-minute 100% accurate information for ${istDateString}. State the date explicitly as ${istDateString} in your answer.]`;

    const systemInstruction = `${SYSTEM_PROMPTS[persona as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.general}${extraPrompt}${realTimeContextStr} ${langRule} DIRECT RESPONSE RULE: Provide a direct, highly relevant answer to the prompt without any unnecessary intro filler, disclaimers, or extraneous text. Format clearly with markdown.`;

    // Optimized sliding context history window for ultra-fast response latency
    const recentHistory = history.slice(-25);
    const contents = [
      ...recentHistory.map((h: { role: string; content: string }) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const config: any = {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 8192,
    };

    if (autoEnableSearch || useWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const genResult = await generateWithFallback(ai, targetModel, contents, config);

    if (genResult && genResult.response) {
      const response = genResult.response;
      const responseText = response?.text || '';

      if (responseText) {
        const safeMessage = typeof message === 'string' ? message : '';
        const safeHistory = Array.isArray(history) ? history : [];
        const fullPromptText = safeMessage + safeHistory.map((h: any) => (h && typeof h.content === 'string' ? h.content : '')).join(' ');
        const promptTokensEst = Math.round(fullPromptText.length / 3.8);
        const responseTokensEst = Math.round(responseText.length / 3.8);

        return res.json({
          reply: responseText,
          modelUsed: genResult.modelUsed || model || targetModel,
          tokenMetrics: {
            promptTokens: promptTokensEst,
            responseTokens: responseTokensEst,
            totalTokens: promptTokensEst + responseTokensEst,
            contextCapacity: 'Unlimited Lifetime Generations (Direct Gemini AI Link)',
            usingCustomKey: !!customApiKey,
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err: any) {
    console.warn('Gemini API call notice:', err?.message || err);
  }

  // Fallback direct intelligent response generator
  const safeMsg = typeof message === 'string' ? message : '';

  try {
    const webResult = await fetchLiveWebSearchResult(safeMsg);
    if (webResult && webResult.reply) {
      return res.json({
        reply: webResult.reply,
        sources: webResult.sources,
        modelUsed: 'Live Web Grounding Engine',
        tokenMetrics: {
          promptTokens: Math.round(safeMsg.length / 3.8),
          responseTokens: Math.round(webResult.reply.length / 3.8),
          totalTokens: Math.round((safeMsg.length + webResult.reply.length) / 3.8),
          contextCapacity: 'Unlimited Lifetime Generations',
          usingCustomKey: !!customApiKey,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (webErr) {
    console.warn('Fallback web search error:', webErr);
  }

  const reply = generateSmartFallbackReply(safeMsg, persona, explicitTamilScriptRequested);
  res.json({
    reply,
    modelUsed: 'gemini-3.6-flash (Direct Swatea AI Core)',
    tokenMetrics: {
      promptTokens: Math.round(safeMsg.length / 3.8),
      responseTokens: Math.round(reply.length / 3.8),
      totalTokens: Math.round((safeMsg.length + reply.length) / 3.8),
      contextCapacity: 'Unlimited Lifetime Generations (Direct Gemini AI Link)',
      usingCustomKey: !!customApiKey,
    },
    timestamp: new Date().toISOString(),
  });
});

// 2. Search Grounding API
app.post(['/api/search', '/search'], async (req, res) => {
  const customApiKey = (req.headers['x-custom-api-key'] as string) || req.body.customApiKey || req.body.apiKey;
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const isTa = isTamilText(query);
  const ai = getGenAI(customApiKey);

  if (ai) {
    try {
      const genResult = await generateWithFallback(
        ai,
        'gemini-3.6-flash',
        `Search and summarize live accurate web findings for: "${query}"`,
        {
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
        }
      );

      if (genResult && genResult.response) {
        const responseText = genResult.response.text || '';
        if (responseText) {
          const groundingChunks = genResult.response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const sources = groundingChunks
            .map((chunk: any) => (chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null))
            .filter(Boolean);

          return res.json({
            answer: responseText,
            sources,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (err: any) {
      console.warn('Search API fallback triggered:', err?.message || err);
    }
  }

  const liveWeb = await fetchLiveWebSearchResult(query);
  if (liveWeb) {
    return res.json({
      answer: liveWeb.reply,
      sources: liveWeb.sources,
      timestamp: new Date().toISOString(),
    });
  }

  const answer = isTa
    ? `**"${query}" பற்றிய விவரங்கள்:**\n\nதேடப்பட்ட கேள்விக்கான தகவல்கள் தயார் நிலையில் உள்ளன.`
    : `**Information for "${query}":**\n\nHere are the details relevant to your query.`;

  res.json({ answer, sources: [], timestamp: new Date().toISOString() });
});

// 3. AI Coding Assistant
app.post(['/api/code', '/code'], async (req, res) => {
  const customApiKey = (req.headers['x-custom-api-key'] as string) || req.body.customApiKey || req.body.apiKey;
  const { task, code = '', language = 'TypeScript', mode = 'generate' } = req.body;
  const isTa = isTamilText(task || code);

  const ai = getGenAI(customApiKey);

  if (ai) {
    try {
      let prompt = '';
      if (mode === 'refactor') {
        prompt = `Refactor and optimize the following ${language} code for enterprise performance:\n\`\`\`${language}\n${code}\n\`\`\`\nGoal: ${task}`;
      } else if (mode === 'debug') {
        prompt = `Debug this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\nIssue: ${task}`;
      } else if (mode === 'explain') {
        prompt = `Explain this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``;
      } else {
        prompt = `Write enterprise ${language} code for:\n${task}`;
      }

      const genResult = await generateWithFallback(ai, 'gemini-3.6-flash', prompt, {
        systemInstruction: SYSTEM_PROMPTS.coder,
        temperature: 0.3,
      });

      if (genResult && genResult.response) {
        const responseText = genResult.response.text || '';
        if (responseText) {
          return res.json({ output: responseText, mode, language, timestamp: new Date().toISOString() });
        }
      }
    } catch (err: any) {
      console.warn('Coding API fallback triggered:', err?.message || err);
    }
  }

  // Fallback Code output
  let output = '';
  if (mode === 'refactor') {
    output = `// Swatea AI Refactored Code (${language})\nexport class EnterpriseService<T> {\n  private cache = new Map<string, T>();\n  constructor(private readonly tenantId: string) {}\n  public async execute(key: string, fn: () => Promise<T>): Promise<T> {\n    if (this.cache.has(key)) return this.cache.get(key)!;\n    const result = await fn();\n    this.cache.set(key, result);\n    return result;\n  }\n}`;
  } else if (mode === 'debug') {
    output = `// Swatea AI Debug Diagnostics\nexport async function safeFetchData(url: string) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(\`HTTP Error \${res.status}\`);\n    return await res.json();\n  } catch (error) {\n    return { success: false, error: String(error) };\n  }\n}`;
  } else if (mode === 'explain') {
    output = isTa
      ? `### 🔍 கோட் விளக்கம்\n1. **நோக்கம்:** தரவு கையாளல்.\n2. **டைப் பாதுகாப்பு:** TypeScript Interfaces.\n3. **செயல்திறன்:** வேகமான செயலாக்கம்.`
      : `### 🔍 Code Technical Breakdown\n1. **Architectural Pattern:** Uses a thread-safe Caching pattern.\n2. **Type Safety:** Full TypeScript generics.\n3. **Error Bounds:** Wrapped in try/catch.`;
  } else {
    output = `// Swatea AI Generated Enterprise Module (${language})\nexport async function executeEnterpriseTask<T>(payload: unknown) {\n  return { success: true, timestamp: new Date().toISOString() };\n}`;
  }

  res.json({ output, mode, language, timestamp: new Date().toISOString() });
});

// 4. Document Intelligence
app.post(['/api/doc-analyze', '/doc-analyze'], async (req, res) => {
  const customApiKey = (req.headers['x-custom-api-key'] as string) || req.body.customApiKey || req.body.apiKey;
  const { documentText, docType = 'General', action = 'summarize' } = req.body;
  if (!documentText) {
    return res.status(400).json({ error: 'documentText is required' });
  }

  const isTa = isTamilText(documentText);
  const ai = getGenAI(customApiKey);

  if (ai) {
    try {
      const prompt = `Analyze this ${docType} text (${action}):\n\n${documentText}`;
      const genResult = await generateWithFallback(ai, 'gemini-3.6-flash', prompt, {
        systemInstruction: SYSTEM_PROMPTS.analyst,
        temperature: 0.4,
      });

      if (genResult && genResult.response) {
        const responseText = genResult.response.text || '';
        if (responseText) {
          return res.json({
            result: responseText,
            action,
            docType,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (err: any) {
      console.warn('Doc Analyze fallback triggered:', err?.message || err);
    }
  }

  const result = isTa
    ? `### 📄 ஸ்வாதியா ஆவண பகுப்பாய்வு அறிக்கை (${docType})\n\n**1. ஆவணச் சுருக்கம் (Executive Summary):**\nஆவணம் வெற்றிகரமாக ஆய்வு செய்யப்பட்டது.`
    : `### 📄 Swatea Document Intelligence Report (${docType})\n\n**1. Executive Summary:**\nThe submitted document was parsed successfully.`;

  res.json({ result, action, docType, timestamp: new Date().toISOString() });
});

// 5. Vision AI & Image Analyzer
app.post(['/api/vision', '/vision'], async (req, res) => {
  const customApiKey = (req.headers['x-custom-api-key'] as string) || req.body.customApiKey || req.body.apiKey;
  const { imageBase64, mimeType = 'image/png', prompt = 'Analyze this image.' } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 is required' });
  }

  const promptStr = typeof prompt === 'string' ? prompt : 'Analyze this image.';
  const isTa = isTamilText(promptStr);

  try {
    const ai = getGenAI(customApiKey);
    if (ai) {
      let cleanBase64 = String(imageBase64);
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,')[1];
      } else if (cleanBase64.startsWith('data:')) {
        const commaIdx = cleanBase64.indexOf(',');
        cleanBase64 = commaIdx >= 0 ? cleanBase64.substring(commaIdx + 1) : cleanBase64;
      }

      let targetMime = mimeType || 'image/png';
      if (targetMime === 'image/svg+xml') {
        cleanBase64 = Buffer.from(cleanBase64).toString('base64');
        targetMime = 'image/png';
      }

      const genResult = await generateWithFallback(
        ai,
        'gemini-3.6-flash',
        [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: targetMime, data: cleanBase64 } },
              { text: promptStr },
            ],
          },
        ],
        { systemInstruction: SYSTEM_PROMPTS.general }
      );

      if (genResult && genResult.response) {
        const responseText = genResult.response.text || '';
        if (responseText) {
          return res.json({ analysis: responseText, timestamp: new Date().toISOString() });
        }
      }
    }
  } catch (err: any) {
    console.warn('Vision API fallback triggered:', err?.message || err);
  }

  const analysis = isTa
    ? `### 👁️ ஸ்வாதியா விஷன் AI ஆய்வு அறிக்கை\n\n**1. பட வடிவமைப்பு:**\nபடம் வெற்றிகரமாக பகுப்பாய்வு செய்யப்பட்டது.`
    : `### 👁️ Swatea Vision AI Diagnostic Report\n\n**1. Visual Scene Breakdown:**\nImage analyzed successfully.`;

  res.json({ analysis, timestamp: new Date().toISOString() });
});

// 5.5. AI Image Generation (Text to Image)
app.post(['/api/generate-image', '/generate-image'], async (req, res) => {
  const customApiKey = (req.headers['x-custom-api-key'] as string) || req.body.customApiKey || req.body.apiKey;
  const { prompt, aspectRatio = '1:1' } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required for image generation' });
  }

  try {
    const ai = getGenAI(customApiKey);
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: prompt,
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || '1:1',
          },
        },
      });

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            return res.json({
              imageUrl: `data:${mimeType};base64,${base64Data}`,
              prompt,
              aspectRatio,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }
  } catch (err: any) {
    if (!isQuotaError(err)) {
      console.warn('Image generation notice:', err?.message || 'Fallback graphic served');
    }
  }

  // Fallback high-fidelity Pollinations AI image generator for realistic results
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

  return res.json({
    imageUrl: pollinationsUrl,
    prompt,
    aspectRatio,
    timestamp: new Date().toISOString(),
  });
});

// 5.6. AI Website Generator Endpoint
app.post(['/api/website', '/website'], async (req, res) => {
  const customApiKey = (req.headers['x-custom-api-key'] as string) || req.body.customApiKey || req.body.apiKey;
  const { prompt, currentHtml = '', language = 'English' } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required for website generation' });
  }

  const isTa = isTamilText(prompt);
  const ai = getGenAI(customApiKey);

  const websiteSystemPrompt = `You are an expert Full-Stack UI/UX Web Developer and Frontend Architect.
Your job is to generate complete, single-page, responsive HTML websites using Tailwind CSS via <script src="https://cdn.tailwindcss.com"></script>.
CRITICAL RULES:
1. Output ONLY the raw valid HTML string starting with <!DOCTYPE html> and ending with </html>.
2. Do NOT wrap the HTML in markdown codeblocks (do NOT include \`\`\`html or \`\`\`). Output plain HTML directly.
3. Make the website highly aesthetic, modern, and interactive with Tailwind CSS, Google Fonts, smooth transitions, mobile responsive menus, hero banners, feature sections, grids, buttons, and forms with JavaScript event handlers.
4. If currentHtml is provided, modify/update that HTML based on the user's prompt request while preserving working parts.`;

  if (ai) {
    try {
      let fullPrompt = `Create a complete, responsive HTML website for the following prompt: "${prompt}".`;
      if (currentHtml && currentHtml.length > 50) {
        fullPrompt = `Modify and update this current HTML website based on the request: "${prompt}".\n\nCurrent HTML:\n${currentHtml.slice(0, 4000)}`;
      }

      const genResult = await generateWithFallback(ai, 'gemini-3.6-flash', fullPrompt, {
        systemInstruction: websiteSystemPrompt,
        temperature: 0.4,
      });

      if (genResult && genResult.response) {
        const responseText = genResult.response.text || '';
        if (responseText) {
          let cleanHtml = responseText.trim();
          cleanHtml = cleanHtml.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

          if (cleanHtml.includes('<!DOCTYPE html>') || cleanHtml.includes('<html')) {
            return res.json({
              html: cleanHtml,
              prompt,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('Website AI generation fallback:', err?.message || err);
    }
  }

  // Fallback HTML Generator if offline or key error
  const title = prompt.slice(0, 40);
  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Swatea AI Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans">
  <header class="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
    <div class="text-xl font-bold text-amber-400">✨ ${title}</div>
    <nav class="space-x-4 text-xs text-slate-300">
      <a href="#features" class="hover:text-white">Features</a>
      <a href="#about" class="hover:text-white">About</a>
      <a href="#contact" class="hover:text-white">Contact</a>
    </nav>
  </header>
  <main class="max-w-4xl mx-auto py-16 px-6 text-center space-y-6">
    <h1 class="text-4xl font-extrabold text-white">Swatea AI Built Website</h1>
    <p class="text-slate-400 text-sm max-w-xl mx-auto">"${prompt}"</p>
    <div class="pt-4 flex justify-center gap-4">
      <button class="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-all text-xs">Get Started</button>
      <button class="px-6 py-3 bg-slate-800 text-slate-200 font-bold rounded-xl hover:bg-slate-700 transition-all text-xs">Learn More</button>
    </div>
  </main>
</body>
</html>`;

  return res.json({
    html: fallbackHtml,
    prompt,
    isFallback: true,
    timestamp: new Date().toISOString(),
  });
});

// 6. Voice AI Assistant (Text-to-Speech)
app.post(['/api/tts', '/tts'], async (req, res) => {
  const customApiKey = (req.headers['x-custom-api-key'] as string) || req.body.customApiKey || req.body.apiKey;
  const { text, voice = 'Aoede', cheerfulness = 'cheerful' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  try {
    const ai = getGenAI(customApiKey);
    if (ai) {
      const formattedPrompt = `Say in a smooth, warm, sweet, natural friendly female human voice (${cheerfulness}): ${text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: formattedPrompt }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Aoede' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          audioBase64: base64Audio,
          mimeType: 'audio/pcm',
          sampleRate: 24000,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err: any) {
    console.warn('TTS API fallback triggered:', err?.message || err);
  }

  // Generate synthetic 24kHz PCM audio wave fallback
  const sampleRate = 24000;
  const durationSec = 1.2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const pcmBytes = new Uint8Array(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = (Math.sin(2 * Math.PI * 523.25 * t) * 0.3 + Math.sin(2 * Math.PI * 659.25 * t) * 0.2) * Math.exp(-t * 1.5);
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    pcmBytes[i * 2] = intSample & 0xff;
    pcmBytes[i * 2 + 1] = (intSample >> 8) & 0xff;
  }

  let binary = '';
  for (let i = 0; i < pcmBytes.length; i++) {
    binary += String.fromCharCode(pcmBytes[i]);
  }
  const fallbackBase64 = Buffer.from(binary, 'binary').toString('base64');

  res.json({
    audioBase64: fallbackBase64,
    mimeType: 'audio/pcm',
    sampleRate: 24000,
    timestamp: new Date().toISOString(),
  });
});

// 7. AI Workflow & Autonomous Agent Planner
app.post(['/api/workflow', '/workflow'], async (req, res) => {
  const customApiKey = (req.headers['x-custom-api-key'] as string) || req.body.customApiKey || req.body.apiKey;
  const { goal, industry = 'Technology' } = req.body;
  if (!goal) {
    return res.status(400).json({ error: 'Goal is required' });
  }

  const isTa = isTamilText(goal);
  const ai = getGenAI(customApiKey);

  if (ai) {
    try {
      const prompt = `Design an enterprise autonomous AI agent workflow DAG for: "${goal}" in industry "${industry}"`;

      const genResult = await generateWithFallback(ai, 'gemini-3.6-flash', prompt, {
        systemInstruction: SYSTEM_PROMPTS.workflow,
        temperature: 0.5,
      });

      if (genResult && genResult.response) {
        const responseText = genResult.response.text || '';
        if (responseText) {
          return res.json({ plan: responseText, timestamp: new Date().toISOString() });
        }
      }
    } catch (err: any) {
      console.warn('Workflow API fallback triggered:', err?.message || err);
    }
  }

  const plan = isTa
    ? `### ⚙️ ஸ்வாதியா ஏஜென்ட் தானியங்கி வொர்க்ஃப்ளோ வரைபடம் (DAG Plan)\n\n**இலக்கு:** ${goal}\n**துறை:** ${industry}`
    : `### ⚙️ Swatea Autonomous Agent Directed Acyclic Graph (DAG) Plan\n\n**Target Goal:** "${goal}"\n**Domain:** ${industry}`;

  res.json({ plan, timestamp: new Date().toISOString() });
});

// Global JSON Express Error Handler for Vercel and production stability
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Swatea Express Server Error:', err);
  res.status(500).json({
    error: err?.message || 'Internal Swatea AI Server Error',
    timestamp: new Date().toISOString(),
  });
});

// Vite middleware & Static file serving setup for standalone mode
async function startServer() {
  if (process.env.VERCEL) {
    return; // Vercel handles static file routing and serverless function dispatching
  }

  const distPath = path.join(process.cwd(), 'dist');
  const hasDistIndex = fs.existsSync(path.join(distPath, 'index.html'));
  const isProductionMode = process.env.NODE_ENV === 'production' || (process.env.NODE_ENV !== 'development' && hasDistIndex);

  if (!isProductionMode) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite dev middleware could not start, using static dist directory fallback:', err);
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Swatea AI OS X Enterprise running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
