import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Film,
  Wand2,
  FileText,
  Volume2,
  Code,
  Languages,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FolderOpen,
  Save,
  Upload,
  ArrowRight,
  ChevronRight,
  Layers,
  Info,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Terminal,
  X,
  Compass,
  Zap,
  HelpCircle,
  LayoutGrid
} from 'lucide-react';
import {
  LanguageCode,
  TaskNodeType,
  NodeExecutionStatus,
  WorkflowTaskNode,
  WorkflowEdge,
  WorkflowPreset,
} from '../types';
import { safeFetchJson } from '../lib/api';

interface WorkflowManagerProps {
  language: LanguageCode;
  onNavigateToVideo?: (imageUrl: string, promptText: string) => void;
}

// Available Node Types in Palette
interface NodeTypeDefinition {
  type: TaskNodeType;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  icon: React.FC<any>;
  color: string;
  badge: string;
  defaultConfig: WorkflowTaskNode['config'];
}

const NODE_DEFINITIONS: NodeTypeDefinition[] = [
  {
    type: 'prompt',
    titleEn: 'Input Prompt & Brief',
    titleTa: 'உள்ளீட்டு யோசனை (Prompt)',
    descriptionEn: 'Defines the starting creative concept, goal, or narrative brief',
    descriptionTa: 'வொர்க்ஃப்ளோவின் ஆரம்ப குறிக்கோள் அல்லது யோசனை',
    icon: Sparkles,
    color: 'amber',
    badge: 'INPUT',
    defaultConfig: {
      prompt: 'A futuristic cybernetic metropolis with soaring glass towers, neon skyways, lush hanging gardens, photorealistic 8k, cinematic golden hour sunset',
      temperature: 0.7,
    },
  },
  {
    type: 'image_gen',
    titleEn: 'Image Generation',
    titleTa: 'பட உருவாக்கம் (Image Gen)',
    descriptionEn: 'Generates ultra-realistic visuals using Gemini 3.1 Flash Image',
    descriptionTa: 'ஜெமினி 3.1 ஃபிளாஷ் மூலம் உயர்தர AI படங்களை உருவாக்குகிறது',
    icon: Wand2,
    color: 'orange',
    badge: 'GEMINI 3.1',
    defaultConfig: {
      prompt: 'A futuristic cybernetic metropolis with soaring glass towers, neon skyways, lush hanging gardens, photorealistic 8k, cinematic golden hour sunset',
      aspectRatio: '16:9',
      model: 'gemini-3.1-flash-image-preview',
      inheritInput: true,
    },
  },
  {
    type: 'video_anim',
    titleEn: 'Video Animation',
    titleTa: 'வீடியோ அனிமேஷன் (Video Anim)',
    descriptionEn: 'Animates the generated visual into motion video using Google Veo Studio',
    descriptionTa: 'கூகிள் Veo ஏஐ மூலம் படங்களை நேரலை வீடியோவாக மாற்றுகிறது',
    icon: Film,
    color: 'indigo',
    badge: 'GOOGLE VEO',
    defaultConfig: {
      prompt: 'Cinematic drone fly-through over the skyline, natural wind blowing through foliage, shimmering water reflections, smooth motion',
      aspectRatio: '16:9',
      resolution: '720p',
      model: 'veo-3.1-lite-generate-preview',
      inheritInput: true,
    },
  },
  {
    type: 'summary',
    titleEn: 'AI Summary & Insights',
    titleTa: 'AI சுருக்கம் & அறிக்கை (Summary)',
    descriptionEn: 'Synthesizes executive summary, creative rationale, and social media copy',
    descriptionTa: 'முழு படைப்பின் ஆவணச் சுருக்கம், விவரிப்பு மற்றும் சமூகப் பகிர்வுக் குறிப்பு',
    icon: FileText,
    color: 'emerald',
    badge: 'GEMINI 3.7',
    defaultConfig: {
      action: 'Executive Creative Summary & Social Broadcast',
      prompt: 'Analyze this creative production chain, provide an executive summary, artistic breakdown, key technical specifications, and ready-to-publish social captions with hashtags.',
      inheritInput: true,
    },
  },
  {
    type: 'audio_tts',
    titleEn: 'Voiceover & Narration',
    titleTa: 'குரல் வழி வாசிப்பு (Voiceover)',
    descriptionEn: 'Converts synthesized summary script into studio-grade voice narration',
    descriptionTa: 'உரையை உயர்தர ஸ்டுடியோ குரலாக மாற்றுகிறது',
    icon: Volume2,
    color: 'violet',
    badge: 'NEURAL TTS',
    defaultConfig: {
      voice: 'Aoede',
      prompt: 'Welcome to the future of visual computing. Explore the dawn of autonomous procedural worlds.',
      inheritInput: true,
    },
  },
  {
    type: 'code_gen',
    titleEn: 'Code & Automation Script',
    titleTa: 'கோடிங் & ஆட்டோமேஷன் (Code)',
    descriptionEn: 'Generates programmatic deployment scripts and metadata integration code',
    descriptionTa: 'தானியங்கி ஸ்கிரிப்ட் மற்றும் மென்பொருள் நிரல் உருவாக்குகிறது',
    icon: Code,
    color: 'sky',
    badge: 'CODE',
    defaultConfig: {
      prompt: 'Generate a TypeScript script to upload the generated video and asset bundle to cloud storage and broadcast webhook notification.',
      language: 'TypeScript',
      inheritInput: true,
    },
  },
  {
    type: 'translate',
    titleEn: 'Language Translator',
    titleTa: 'மொழிபெயர்ப்பு (Translator)',
    descriptionEn: 'Translates all narrative summaries and prompts into Tamil or global languages',
    descriptionTa: 'சுருக்கங்களை தமிழ் மற்றும் பிற உலக மொழிகளுக்கு மாற்றுகிறது',
    icon: Languages,
    color: 'teal',
    badge: 'LANG',
    defaultConfig: {
      language: 'Tamil',
      prompt: 'Translate the narrative brief and summary into formal, poetic Tamil.',
      inheritInput: true,
    },
  },
];

// Curated Workflow Templates (Default is Image -> Video -> Summary as requested)
const PRESET_TEMPLATES: WorkflowPreset[] = [
  {
    id: 'flagship_chain',
    name: 'Classic Visual Chain (Image -> Video -> Summary)',
    description: 'The definitive sequential AI pipeline: Generates keyframe visual, animates it into a motion video, and synthesizes an executive summary.',
    badge: 'RECOMMENDED',
    nodes: [
      {
        id: 'node-img-1',
        type: 'image_gen',
        title: 'Image Generation',
        customLabel: '1. Keyframe Concept Art',
        x: 60,
        y: 120,
        status: 'idle',
        config: {
          prompt: 'A breathtaking bioluminescent crystalline forest under twin purple moons, cinematic lighting, 8k resolution, photorealistic concept art',
          aspectRatio: '16:9',
          model: 'gemini-3.1-flash-image-preview',
        },
      },
      {
        id: 'node-vid-2',
        type: 'video_anim',
        title: 'Video Animation',
        customLabel: '2. Veo Motion Synthesis',
        x: 480,
        y: 120,
        status: 'idle',
        config: {
          prompt: 'Slow forward camera tracking shot through glowing trees, floating spore particles, gentle breeze, cinematic lighting',
          aspectRatio: '16:9',
          resolution: '720p',
          model: 'veo-3.1-lite-generate-preview',
          inheritInput: true,
        },
      },
      {
        id: 'node-sum-3',
        type: 'summary',
        title: 'AI Summary & Insights',
        customLabel: '3. Production Summary & Copy',
        x: 900,
        y: 120,
        status: 'idle',
        config: {
          action: 'Creative Production Summary',
          prompt: 'Generate an executive summary of this generated video visual, detailing cinematic mood, art direction, and 3 viral social media captions.',
          inheritInput: true,
        },
      },
    ],
    edges: [
      { id: 'edge-1-2', sourceNodeId: 'node-img-1', targetNodeId: 'node-vid-2', label: 'Image Output -> Video Source' },
      { id: 'edge-2-3', sourceNodeId: 'node-vid-2', targetNodeId: 'node-sum-3', label: 'Video Context -> Executive Summary' },
    ],
  },
  {
    id: 'studio_narrative',
    name: 'Full Studio Production (Brief -> Image -> Video -> Summary -> Voiceover)',
    description: 'Autonomous creative pipeline from ideation prompt down to narrated audio teaser.',
    badge: 'STUDIO 5-STEP',
    nodes: [
      {
        id: 'n-prompt',
        type: 'prompt',
        title: 'Input Prompt & Brief',
        customLabel: 'Creative Direction',
        x: 50,
        y: 140,
        status: 'idle',
        config: {
          prompt: 'Futuristic solar-powered deep sea ocean research sanctuary with sleek observation domes and bioluminescent marine creatures.',
        },
      },
      {
        id: 'n-image',
        type: 'image_gen',
        title: 'Image Generation',
        customLabel: 'Visual Blueprint',
        x: 420,
        y: 140,
        status: 'idle',
        config: {
          prompt: 'Futuristic solar-powered deep sea ocean research sanctuary with sleek observation domes and bioluminescent marine creatures, cinematic volumetric lighting.',
          aspectRatio: '16:9',
          inheritInput: true,
        },
      },
      {
        id: 'n-video',
        type: 'video_anim',
        title: 'Video Animation',
        customLabel: 'Sub-aquatic Cinematic Reel',
        x: 790,
        y: 140,
        status: 'idle',
        config: {
          prompt: 'Subtle underwater camera glide, glowing fish swimming past the observation glass, serene water caustics.',
          aspectRatio: '16:9',
          resolution: '720p',
          inheritInput: true,
        },
      },
      {
        id: 'n-sum',
        type: 'summary',
        title: 'AI Summary & Insights',
        customLabel: 'Documentary Script & Meta',
        x: 1160,
        y: 60,
        status: 'idle',
        config: {
          action: 'Documentary Teaser Script',
          prompt: 'Write a 30-second documentary voiceover script and promotional summary for this marine sanctuary project.',
          inheritInput: true,
        },
      },
      {
        id: 'n-audio',
        type: 'audio_tts',
        title: 'Voiceover & Narration',
        customLabel: 'Audio Narration',
        x: 1160,
        y: 350,
        status: 'idle',
        config: {
          voice: 'Aoede',
          prompt: 'Deep beneath the pacific waves, humanity pioneers a new frontier of clean energy and marine harmony.',
          inheritInput: true,
        },
      },
    ],
    edges: [
      { id: 'e-1', sourceNodeId: 'n-prompt', targetNodeId: 'n-image', label: 'Brief -> Image' },
      { id: 'e-2', sourceNodeId: 'n-image', targetNodeId: 'n-video', label: 'Image -> Video' },
      { id: 'e-3', sourceNodeId: 'n-video', targetNodeId: 'n-sum', label: 'Video -> Script' },
      { id: 'e-4', sourceNodeId: 'n-sum', targetNodeId: 'n-audio', label: 'Script -> Voiceover' },
    ],
  },
  {
    id: 'code_architecture',
    name: 'Tech Architecture (Spec -> Code -> Mockup -> Summary)',
    description: 'Synthesizes software specs, architecture code, UI graphic mockup, and technical documentation.',
    badge: 'ENGINEERING',
    nodes: [
      {
        id: 'na-prompt',
        type: 'prompt',
        title: 'Input Prompt & Brief',
        customLabel: 'System Requirement',
        x: 60,
        y: 130,
        status: 'idle',
        config: {
          prompt: 'Real-time WebSocket streaming analytics engine with distributed cache and multi-tenant telemetry dashboards.',
        },
      },
      {
        id: 'na-code',
        type: 'code_gen',
        title: 'Code & Automation Script',
        customLabel: 'Core Engine Code',
        x: 450,
        y: 130,
        status: 'idle',
        config: {
          language: 'TypeScript',
          prompt: 'Build high-performance distributed WebSocket streaming node module in TypeScript with metrics aggregation.',
          inheritInput: true,
        },
      },
      {
        id: 'na-img',
        type: 'image_gen',
        title: 'Image Generation',
        customLabel: 'System Architecture Diagram',
        x: 840,
        y: 130,
        status: 'idle',
        config: {
          prompt: 'Dark mode high tech architecture diagram of distributed real-time cloud data pipeline with glowing nodes and data flows, 4k graphic design.',
          aspectRatio: '16:9',
          inheritInput: true,
        },
      },
      {
        id: 'na-sum',
        type: 'summary',
        title: 'AI Summary & Insights',
        customLabel: 'Technical Architecture Doc',
        x: 1230,
        y: 130,
        status: 'idle',
        config: {
          action: 'Technical Architecture Brief',
          prompt: 'Summarize system architectural trade-offs, latency bounds, and integration instructions.',
          inheritInput: true,
        },
      },
    ],
    edges: [
      { id: 'ea-1', sourceNodeId: 'na-prompt', targetNodeId: 'na-code' },
      { id: 'ea-2', sourceNodeId: 'na-code', targetNodeId: 'na-img' },
      { id: 'ea-3', sourceNodeId: 'na-img', targetNodeId: 'na-sum' },
    ],
  },
];

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  language,
  onNavigateToVideo,
}) => {
  const isTamil = language === 'ta';

  // Core Graph State
  const [workflowTitle, setWorkflowTitle] = useState('Sequential AI Media Pipeline');
  const [nodes, setNodes] = useState<WorkflowTaskNode[]>(() => PRESET_TEMPLATES[0].nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(() => PRESET_TEMPLATES[0].edges);

  // Canvas Viewport Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Dragging Nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Interactive Connection Wire Dragging (Port-to-Port)
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number } | null>(null);

  // Execution Engine State
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeExecutingNodeId, setActiveExecutingNodeId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<Array<{ timestamp: string; level: 'info' | 'success' | 'error'; message: string }>>([
    { timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Workflow engine initialized and ready.' },
  ]);
  const cancelExecutionRef = useRef(false);

  // Inspector & Preview Panel
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-img-1');
  const [showInspector, setShowInspector] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<'config' | 'results' | 'logs'>('config');

  // Media Modal (Zoom in image / fullscreen video)
  const [modalMedia, setModalMedia] = useState<{ type: 'image' | 'video'; url: string; title: string } | null>(null);

  // Saved Workflows from LocalStorage
  const [savedWorkflowsList, setSavedWorkflowsList] = useState<Array<{ id: string; name: string; date: string }>>(() => {
    try {
      const data = localStorage.getItem('swatea_saved_workflows');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Add Log Entry
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'error' = 'info') => {
    setExecutionLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
      },
    ]);
  }, []);

  // Compute Topological Execution Order
  const topologicalOrder = useMemo(() => {
    // Build adjacency and in-degree maps
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach((n) => {
      adj.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    edges.forEach((e) => {
      if (adj.has(e.sourceNodeId) && inDegree.has(e.targetNodeId)) {
        adj.get(e.sourceNodeId)!.push(e.targetNodeId);
        inDegree.set(e.targetNodeId, (inDegree.get(e.targetNodeId) || 0) + 1);
      }
    });

    // Kahn's algorithm
    const queue: string[] = [];
    nodes.forEach((n) => {
      if ((inDegree.get(n.id) || 0) === 0) {
        queue.push(n.id);
      }
    });

    // Sort initial queue by x coordinate for natural left-to-right order
    queue.sort((a, b) => {
      const na = nodes.find((n) => n.id === a);
      const nb = nodes.find((n) => n.id === b);
      return (na?.x || 0) - (nb?.x || 0);
    });

    const order: string[] = [];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      order.push(curr);

      const neighbors = adj.get(curr) || [];
      for (const nbr of neighbors) {
        inDegree.set(nbr, (inDegree.get(nbr) || 1) - 1);
        if (inDegree.get(nbr) === 0) {
          queue.push(nbr);
        }
      }
    }

    // Append any isolated or circular nodes if remaining
    nodes.forEach((n) => {
      if (!order.includes(n.id)) {
        order.push(n.id);
      }
    });

    return order;
  }, [nodes, edges]);

  // Selected Node Object
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  }, [nodes, selectedNodeId]);

  // Canvas Mouse / Pointer Event Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicked directly on canvas background or SVG
    if ((e.target as HTMLElement).closest('.workflow-node') || (e.target as HTMLElement).closest('.workflow-port')) {
      return;
    }
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // 1. Panning canvas
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    // 2. Dragging a node
    if (draggingNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;

      const newX = Math.round(rawX - dragOffsetRef.current.x);
      const newY = Math.round(rawY - dragOffsetRef.current.y);

      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: Math.max(10, newX), y: Math.max(10, newY) } : n))
      );
      return;
    }

    // 3. Drawing a connection line
    if (connectingSourceId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectingMousePos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setConnectingSourceId(null);
    setConnectingMousePos(null);
  };

  // Node Drag Start
  const handleNodeHeaderMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    dragOffsetRef.current = {
      x: mouseX - node.x,
      y: mouseY - node.y,
    };
  };

  // Port Connection Drag Handlers
  const handleStartConnection = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    setConnectingSourceId(sourceId);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectingMousePos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      });
    }
  };

  const handleEndConnection = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!connectingSourceId || connectingSourceId === targetId) {
      setConnectingSourceId(null);
      setConnectingMousePos(null);
      return;
    }

    // Check if edge already exists
    const exists = edges.some(
      (edge) => edge.sourceNodeId === connectingSourceId && edge.targetNodeId === targetId
    );

    if (!exists) {
      const sourceNode = nodes.find((n) => n.id === connectingSourceId);
      const targetNode = nodes.find((n) => n.id === targetId);
      const label = `${sourceNode?.title || 'Output'} -> ${targetNode?.title || 'Input'}`;

      const newEdge: WorkflowEdge = {
        id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceNodeId: connectingSourceId,
        targetNodeId: targetId,
        label,
      };

      setEdges((prev) => [...prev, newEdge]);
      addLog(`Connected [${sourceNode?.title}] to [${targetNode?.title}]`, 'info');
    }

    setConnectingSourceId(null);
    setConnectingMousePos(null);
  };

  // Delete Connection
  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    addLog(`Connection removed`, 'info');
  };

  // Add Node from Palette
  const handleAddNode = (type: TaskNodeType, dropX?: number, dropY?: number) => {
    const def = NODE_DEFINITIONS.find((d) => d.type === type);
    if (!def) return;

    // Position node nicely
    let x = dropX ?? 100;
    let y = dropY ?? 150;

    if (dropX === undefined || dropY === undefined) {
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        x = lastNode.x + 360;
        y = lastNode.y;
      }
    }

    const newNodeId = `node-${type.slice(0, 3)}-${Date.now()}`;
    const newNode: WorkflowTaskNode = {
      id: newNodeId,
      type,
      title: def.titleEn,
      customLabel: `${nodes.length + 1}. ${def.titleEn}`,
      x,
      y,
      status: 'idle',
      config: { ...def.defaultConfig },
    };

    setNodes((prev) => [...prev, newNode]);

    // If there is an existing previous node, automatically connect to it for sequential convenience
    if (nodes.length > 0) {
      const prevNode = nodes[nodes.length - 1];
      const autoEdge: WorkflowEdge = {
        id: `edge-auto-${Date.now()}`,
        sourceNodeId: prevNode.id,
        targetNodeId: newNodeId,
        label: `${prevNode.title} -> ${newNode.title}`,
      };
      setEdges((prev) => [...prev, autoEdge]);
    }

    setSelectedNodeId(newNodeId);
    addLog(`Added task node: ${def.titleEn}`, 'info');
  };

  // HTML5 Drag and Drop from Palette onto Canvas
  const handlePaletteDragStart = (e: React.DragEvent, type: TaskNodeType) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as TaskNodeType;
    if (!type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const dropX = Math.round((e.clientX - rect.left - pan.x) / zoom) - 150;
    const dropY = Math.round((e.clientY - rect.top - pan.y) / zoom) - 80;

    handleAddNode(type, Math.max(20, dropX), Math.max(20, dropY));
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((edge) => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(nodes[0]?.id || null);
    }
    addLog(`Deleted node ${nodeId}`, 'info');
  };

  // Duplicate Node
  const handleDuplicateNode = (nodeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const original = nodes.find((n) => n.id === nodeId);
    if (!original) return;

    const duplicated: WorkflowTaskNode = {
      ...original,
      id: `node-${original.type.slice(0, 3)}-${Date.now()}`,
      customLabel: `${original.customLabel || original.title} (Copy)`,
      x: original.x + 40,
      y: original.y + 40,
      status: 'idle',
      output: undefined,
      error: undefined,
    };

    setNodes((prev) => [...prev, duplicated]);
    setSelectedNodeId(duplicated.id);
    addLog(`Duplicated node ${original.title}`, 'info');
  };

  // Auto Arrange Nodes in Clean Sequential Layout
  const handleAutoArrange = () => {
    const spacingX = 380;
    const startX = 60;
    const startY = 140;

    const updated = nodes.map((node) => {
      const idx = topologicalOrder.indexOf(node.id);
      const posIndex = idx >= 0 ? idx : 0;
      return {
        ...node,
        x: startX + posIndex * spacingX,
        y: startY + (posIndex % 2 === 1 ? 20 : 0),
      };
    });

    setNodes(updated);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    addLog(`Auto-arranged ${nodes.length} nodes in sequence.`, 'info');
  };

  // Load a Preset Template
  const handleLoadPreset = (preset: WorkflowPreset) => {
    if (nodes.length > 0 && !window.confirm(isTamil ? 'தற்போதைய வரைபடத்தை மாற்றி இந்த டெம்ப்ளேட்டை ஏற்றவா?' : 'Replace current workflow with this preset template?')) {
      return;
    }
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setWorkflowTitle(preset.name);
    setSelectedNodeId(preset.nodes[0]?.id || null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    addLog(`Loaded workflow preset: "${preset.name}"`, 'success');
  };

  // Update Config of a Node
  const updateNodeConfig = (nodeId: string, updates: Partial<WorkflowTaskNode['config']>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, ...updates } } : n))
    );
  };

  // Update Custom Label of a Node
  const updateNodeLabel = (nodeId: string, label: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, customLabel: label } : n))
    );
  };

  // ---------------------------------------------------------------------------
  // SEQUENTIAL AI EXECUTION ENGINE
  // ---------------------------------------------------------------------------
  const executeSingleNode = async (
    targetNode: WorkflowTaskNode,
    inheritedContext?: {
      text?: string;
      imageUrl?: string;
      videoUrl?: string;
      prompt?: string;
    }
  ): Promise<WorkflowTaskNode['output']> => {
    // Mark node running
    setNodes((prev) =>
      prev.map((n) => (n.id === targetNode.id ? { ...n, status: 'running', error: undefined, progress: 15 } : n))
    );
    setActiveExecutingNodeId(targetNode.id);
    addLog(`▶ [Step ${targetNode.customLabel || targetNode.title}] Starting execution...`, 'info');

    try {
      let output: WorkflowTaskNode['output'] = {};

      switch (targetNode.type) {
        // 1. PROMPT / BRIEF NODE
        case 'prompt': {
          await new Promise((r) => setTimeout(r, 400));
          output = {
            text: targetNode.config.prompt || 'Creative Prompt Brief',
            timestamp: new Date().toISOString(),
          };
          break;
        }

        // 2. IMAGE GENERATION NODE (Gemini 3.1 Flash Image)
        case 'image_gen': {
          const effectivePrompt =
            targetNode.config.inheritInput && inheritedContext?.text
              ? `${inheritedContext.text}. ${targetNode.config.prompt || ''}`
              : targetNode.config.prompt || 'A magnificent visual art piece';

          addLog(`Calling Gemini 3.1 Flash Image preview for: "${effectivePrompt.slice(0, 60)}..."`, 'info');

          // Progress ticker
          const ticker = setInterval(() => {
            setNodes((prev) =>
              prev.map((n) => (n.id === targetNode.id && n.status === 'running' ? { ...n, progress: Math.min(90, (n.progress || 15) + 18) } : n))
            );
          }, 450);

          try {
            const data = await safeFetchJson('/api/generate-image', {
              method: 'POST',
              body: JSON.stringify({
                prompt: effectivePrompt,
                aspectRatio: targetNode.config.aspectRatio || '16:9',
                image: targetNode.config.useCustomInput ? undefined : inheritedContext?.imageUrl,
              }),
            });

            clearInterval(ticker);

            if (!data.imageUrl) {
              throw new Error('Image URL was not returned by generator');
            }

            output = {
              imageUrl: data.imageUrl,
              text: data.prompt || effectivePrompt,
              metadata: {
                aspectRatio: targetNode.config.aspectRatio,
                modelUsed: data.modelUsed,
              },
              timestamp: new Date().toISOString(),
            };
            addLog(`✓ Image generated successfully (${data.modelUsed || 'Gemini 3.1 Flash Image'})`, 'success');
          } catch (err: any) {
            clearInterval(ticker);
            throw err;
          }
          break;
        }

        // 3. VIDEO ANIMATION NODE (Google Veo Video Studio)
        case 'video_anim': {
          const sourceImage = inheritedContext?.imageUrl;
          const animationPrompt =
            targetNode.config.prompt ||
            inheritedContext?.text ||
            'Cinematic fluid motion with natural lighting and camera movement';

          addLog(`Initiating Google Veo Video Generation (source image: ${sourceImage ? 'Yes (Piped)' : 'Direct prompt'})...`, 'info');

          // Step 1: Start video generation
          const initData = await safeFetchJson('/api/generate-video', {
            method: 'POST',
            body: JSON.stringify({
              prompt: animationPrompt,
              image: sourceImage,
              aspectRatio: targetNode.config.aspectRatio || '16:9',
              resolution: targetNode.config.resolution || '720p',
              model: targetNode.config.model || 'veo-3.1-lite-generate-preview',
            }),
          });

          const operationName = initData.operationName;
          if (!operationName) {
            throw new Error('Veo video generation token not returned');
          }

          addLog(`Veo Operation started [${operationName}]. Synthesizing neural video frames...`, 'info');

          // Step 2: Poll operation status
          let isDone = false;
          let attempts = 0;
          const maxAttempts = 25;

          while (!isDone && attempts < maxAttempts) {
            if (cancelExecutionRef.current) {
              throw new Error('Execution stopped by user');
            }
            await new Promise((r) => setTimeout(r, 1400));
            attempts++;

            const statusData = await safeFetchJson('/api/video-status', {
              method: 'POST',
              body: JSON.stringify({ operationName }),
            });

            const currentProg = Math.min(95, 20 + attempts * 12);
            setNodes((prev) =>
              prev.map((n) => (n.id === targetNode.id ? { ...n, progress: currentProg } : n))
            );

            if (statusData.done) {
              isDone = true;
              break;
            }
          }

          // Step 3: Fetch video result
          const videoResult = await safeFetchJson('/api/video-download', {
            method: 'POST',
            body: JSON.stringify({ operationName, returnBase64: true }),
          });

          if (!videoResult.videoUrl) {
            throw new Error('Video generation failed or timed out.');
          }

          output = {
            videoUrl: videoResult.videoUrl,
            imageUrl: sourceImage,
            text: videoResult.prompt || animationPrompt,
            metadata: {
              model: videoResult.model || 'veo-3.1-lite-generate-preview',
              resolution: targetNode.config.resolution,
            },
            timestamp: new Date().toISOString(),
          };
          addLog(`✓ Google Veo Video Animation rendered successfully!`, 'success');
          break;
        }

        // 4. AI SUMMARY NODE (Gemini 3.7 Flash Reasoning)
        case 'summary': {
          const action = targetNode.config.action || 'Executive Summary';
          const contextSummary = `
Creative AI Task Chain Output:
- Source Prompt / Narrative: "${inheritedContext?.prompt || inheritedContext?.text || targetNode.config.prompt}"
- Has Video Asset: ${Boolean(inheritedContext?.videoUrl)}
- Has Keyframe Image: ${Boolean(inheritedContext?.imageUrl)}
- Custom Instructions: ${targetNode.config.prompt}
          `.trim();

          addLog(`Generating ${action} with Gemini Document Intelligence...`, 'info');

          const sumData = await safeFetchJson('/api/doc-analyze', {
            method: 'POST',
            body: JSON.stringify({
              documentText: contextSummary,
              docType: action,
              action: 'summarize',
            }),
          });

          const rawText = sumData.result || sumData.reply || 'Summary generated successfully.';
          const bulletPoints = rawText
            .split('\n')
            .filter((l: string) => l.trim().startsWith('-') || l.trim().startsWith('*') || /^\d+\./.test(l.trim()))
            .map((l: string) => l.replace(/^[-*]|\d+\.\s*/, '').trim())
            .slice(0, 5);

          output = {
            text: rawText,
            bulletPoints: bulletPoints.length > 0 ? bulletPoints : undefined,
            metadata: { action },
            timestamp: new Date().toISOString(),
          };
          addLog(`✓ AI Summary & Insights synthesized!`, 'success');
          break;
        }

        // 5. AUDIO / TTS NODE
        case 'audio_tts': {
          const textToSpeak = (inheritedContext?.text || targetNode.config.prompt || 'Autonomous AI workflow generated.')
            .slice(0, 280);

          addLog(`Synthesizing Neural Speech for text: "${textToSpeak.slice(0, 40)}..."`, 'info');

          const ttsData = await safeFetchJson('/api/tts', {
            method: 'POST',
            body: JSON.stringify({
              text: textToSpeak,
              voice: targetNode.config.voice || 'Aoede',
            }),
          });

          output = {
            text: textToSpeak,
            audioBase64: ttsData.audioBase64,
            metadata: { voice: targetNode.config.voice || 'Aoede' },
            timestamp: new Date().toISOString(),
          };
          addLog(`✓ Audio narration track created!`, 'success');
          break;
        }

        // 6. CODE GENERATION NODE
        case 'code_gen': {
          const taskDescription = inheritedContext?.text || targetNode.config.prompt || 'Create integration pipeline';
          addLog(`Synthesizing ${targetNode.config.language || 'TypeScript'} enterprise code...`, 'info');

          const codeData = await safeFetchJson('/api/code', {
            method: 'POST',
            body: JSON.stringify({
              task: taskDescription,
              language: targetNode.config.language || 'TypeScript',
              mode: 'generate',
            }),
          });

          output = {
            text: codeData.output,
            metadata: { language: targetNode.config.language },
            timestamp: new Date().toISOString(),
          };
          addLog(`✓ Enterprise script generated!`, 'success');
          break;
        }

        // 7. TRANSLATOR NODE
        case 'translate': {
          const targetLang = targetNode.config.language || 'Tamil';
          const contentToTranslate = inheritedContext?.text || targetNode.config.prompt || 'AI generated creative asset';

          addLog(`Translating content into ${targetLang}...`, 'info');

          const chatData = await safeFetchJson('/api/chat', {
            method: 'POST',
            body: JSON.stringify({
              message: `Translate the following text into ${targetLang} accurately and elegantly:\n\n${contentToTranslate}`,
            }),
          });

          output = {
            text: chatData.reply || chatData.text,
            metadata: { targetLang },
            timestamp: new Date().toISOString(),
          };
          addLog(`✓ Translation completed into ${targetLang}!`, 'success');
          break;
        }

        default:
          output = { text: 'Task completed.', timestamp: new Date().toISOString() };
      }

      // Mark node completed
      setNodes((prev) =>
        prev.map((n) => (n.id === targetNode.id ? { ...n, status: 'completed', progress: 100, output } : n))
      );

      return output;
    } catch (err: any) {
      console.error(`Error executing node ${targetNode.id}:`, err);
      const errMsg = err?.message || 'Execution error encountered';
      setNodes((prev) =>
        prev.map((n) => (n.id === targetNode.id ? { ...n, status: 'failed', error: errMsg, progress: 0 } : n))
      );
      addLog(`❌ [${targetNode.title}] Error: ${errMsg}`, 'error');
      throw err;
    } finally {
      setActiveExecutingNodeId(null);
    }
  };

  // Run Sequential AI Pipeline (Full Chain)
  const handleRunFullWorkflow = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    cancelExecutionRef.current = false;
    setInspectorTab('results');

    addLog(`🚀 Starting sequential execution of ${topologicalOrder.length} nodes in order: ${topologicalOrder.join(' -> ')}`, 'info');

    // Context pipe passed down the chain
    let pipedContext: {
      text?: string;
      imageUrl?: string;
      videoUrl?: string;
      prompt?: string;
    } = {};

    try {
      for (let i = 0; i < topologicalOrder.length; i++) {
        if (cancelExecutionRef.current) {
          addLog(`⏹ Workflow execution cancelled by user.`, 'info');
          break;
        }

        const nodeId = topologicalOrder[i];
        const currentNode = nodes.find((n) => n.id === nodeId);
        if (!currentNode) continue;

        // Find incoming edges to pipe previous node outputs
        const incomingEdges = edges.filter((e) => e.targetNodeId === nodeId);
        if (incomingEdges.length > 0) {
          // Gather outputs of predecessor nodes
          for (const edge of incomingEdges) {
            const sourceNode = nodes.find((n) => n.id === edge.sourceNodeId);
            if (sourceNode?.output) {
              if (sourceNode.output.imageUrl) pipedContext.imageUrl = sourceNode.output.imageUrl;
              if (sourceNode.output.videoUrl) pipedContext.videoUrl = sourceNode.output.videoUrl;
              if (sourceNode.output.text) pipedContext.text = sourceNode.output.text;
              if (sourceNode.config.prompt) pipedContext.prompt = sourceNode.config.prompt;
            }
          }
        }

        setSelectedNodeId(nodeId);

        // Execute node
        const resultOutput = await executeSingleNode(currentNode, pipedContext);

        // Update pipe for subsequent nodes
        if (resultOutput?.imageUrl) pipedContext.imageUrl = resultOutput.imageUrl;
        if (resultOutput?.videoUrl) pipedContext.videoUrl = resultOutput.videoUrl;
        if (resultOutput?.text) pipedContext.text = resultOutput.text;

        // Brief delay between steps for smooth visual feedback
        await new Promise((r) => setTimeout(r, 600));
      }

      addLog(`🎉 All sequential tasks in workflow completed successfully!`, 'success');
    } catch (err: any) {
      addLog(`Workflow execution stopped: ${err?.message || err}`, 'error');
    } finally {
      setIsExecuting(false);
      setActiveExecutingNodeId(null);
    }
  };

  // Stop Execution
  const handleStopExecution = () => {
    cancelExecutionRef.current = true;
    setIsExecuting(false);
    setActiveExecutingNodeId(null);
    addLog(`Workflow execution stopped by user.`, 'info');
  };

  // Reset Workflow State
  const handleResetWorkflow = () => {
    if (window.confirm(isTamil ? 'அனைத்து நோடுகளின் முடிவுகளையும் அழிக்கவா?' : 'Reset all node outputs to idle state?')) {
      setNodes((prev) => prev.map((n) => ({ ...n, status: 'idle', progress: 0, output: undefined, error: undefined })));
      addLog(`Reset all node statuses to idle.`, 'info');
    }
  };

  // Save to LocalStorage
  const handleSaveWorkflow = () => {
    const name = window.prompt(isTamil ? 'வொர்க்ஃப்ளோவின் பெயர்:' : 'Enter workflow name:', workflowTitle);
    if (!name) return;

    const newId = `wf_${Date.now()}`;
    const payload = {
      id: newId,
      name,
      date: new Date().toLocaleDateString(),
      nodes,
      edges,
    };

    try {
      const existing = localStorage.getItem('swatea_saved_workflows');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(payload);
      localStorage.setItem('swatea_saved_workflows', JSON.stringify(list.slice(0, 20)));
      setSavedWorkflowsList(list.slice(0, 20));
      setWorkflowTitle(name);
      addLog(`Saved workflow "${name}" to local library.`, 'success');
    } catch (e: any) {
      alert(`Save error: ${e.message}`);
    }
  };

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ name: workflowTitle, nodes, edges }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${workflowTitle.toLowerCase().replace(/\s+/g, '_')}_workflow.json`);
    dlAnchor.click();
    dlAnchor.remove();
    addLog(`Exported workflow JSON bundle.`, 'info');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          if (parsed.name) setWorkflowTitle(parsed.name);
          addLog(`Imported workflow "${parsed.name || 'Custom'}" successfully.`, 'success');
        } else {
          alert('Invalid workflow JSON format');
        }
      } catch (err: any) {
        alert(`JSON parse error: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Calculate SVG Cubic Bezier Curves for Edges
  const renderEdgePath = (edge: WorkflowEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.sourceNodeId);
    const targetNode = nodes.find((n) => n.id === edge.targetNodeId);
    if (!sourceNode || !targetNode) return null;

    // Node dimensions: standard width is 320px
    const nodeWidth = 320;
    const startX = sourceNode.x + nodeWidth;
    const startY = sourceNode.y + 44; // Port vertical offset
    const endX = targetNode.x;
    const endY = targetNode.y + 44;

    const dx = Math.abs(endX - startX) * 0.55;
    const c1X = startX + Math.max(60, dx);
    const c1Y = startY;
    const c2X = endX - Math.max(60, dx);
    const c2Y = endY;

    const isSourceActive = sourceNode.status === 'running' || sourceNode.status === 'completed';
    const isEdgeActive = isExecuting && (activeExecutingNodeId === edge.targetNodeId || activeExecutingNodeId === edge.sourceNodeId);

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    return (
      <g key={edge.id} className="transition-all duration-300 group">
        {/* Invisible wider hover hit-area */}
        <path
          d={`M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`}
          fill="none"
          stroke="transparent"
          strokeWidth="24"
          className="cursor-pointer"
          onClick={() => handleDeleteEdge(edge.id)}
        />

        {/* Glow backdrop path */}
        {isEdgeActive && (
          <path
            d={`M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`}
            fill="none"
            stroke="rgba(245, 158, 11, 0.4)"
            strokeWidth="8"
            className="animate-pulse"
          />
        )}

        {/* Core Wire Path */}
        <path
          d={`M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`}
          fill="none"
          stroke={
            isEdgeActive
              ? '#f59e0b'
              : sourceNode.status === 'completed'
              ? '#10b981'
              : '#475569'
          }
          strokeWidth={isEdgeActive ? 3.5 : 2.5}
          strokeDasharray={isEdgeActive ? '8, 4' : 'none'}
          className={isEdgeActive ? 'animate-pulse' : 'transition-colors'}
        />

        {/* Directional Signal Flow Indicator Circle */}
        {isEdgeActive && (
          <circle r="4.5" fill="#f59e0b">
            <animateMotion
              path={`M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`}
              dur="1.4s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Edge Delete Hover Badge */}
        <g
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => handleDeleteEdge(edge.id)}
          transform={`translate(${midX}, ${midY})`}
        >
          <circle r="11" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
          <text textAnchor="middle" dy="3.5" fill="#ef4444" fontSize="10" fontWeight="bold">✕</text>
        </g>
      </g>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden relative select-none">
      {/* ------------------------------------------------------------- */}
      {/* TOP CONTROL BAR                                               */}
      {/* ------------------------------------------------------------- */}
      <header className="p-3 sm:px-4 sm:py-3 bg-slate-900/90 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 backdrop-blur-md">
        {/* Title & Pipeline Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <Layers className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={workflowTitle}
                onChange={(e) => setWorkflowTitle(e.target.value)}
                className="bg-transparent border-none text-white font-extrabold text-sm sm:text-base focus:ring-1 focus:ring-amber-500 rounded px-1 -ml-1 truncate hover:bg-slate-800/50"
                placeholder={isTamil ? 'வொர்க்ஃப்ளோ பெயர்...' : 'Workflow Title...'}
              />
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                DAG ENGINE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{nodes.length} {isTamil ? 'பணிகள்' : 'Tasks'}</span>
              <span>·</span>
              <span>{edges.length} {isTamil ? 'இணைப்புகள்' : 'Links'}</span>
              <span>·</span>
              <span className="text-amber-400/90 font-mono">
                {topologicalOrder.length > 0 ? topologicalOrder.map((id) => nodes.find((n) => n.id === id)?.title).filter(Boolean).join(' → ') : 'Empty Chain'}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Preset Templates Selector */}
          <div className="relative group">
            <button className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTamil ? 'டெம்ப்ளேட்டுகள்' : 'Templates'}</span>
              <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
            </button>
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 animate-fadeIn">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                {isTamil ? 'உடனடி AI செயின் டெம்ப்ளேட்டுகள்' : 'Instant AI Pipeline Presets'}
              </div>
              {PRESET_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleLoadPreset(tmpl)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/90 transition-all text-xs flex flex-col gap-0.5 border border-transparent hover:border-slate-700"
                >
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span className="truncate">{tmpl.name}</span>
                    {tmpl.badge && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">
                        {tmpl.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{tmpl.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Auto Arrange Layout */}
          <button
            onClick={handleAutoArrange}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title={isTamil ? 'தானாக வரிசைப்படுத்து' : 'Auto arrange nodes sequentially'}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{isTamil ? 'வரிசைப்படுத்து' : 'Auto Arrange'}</span>
          </button>

          {/* Reset State */}
          <button
            onClick={handleResetWorkflow}
            disabled={isExecuting}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
            title={isTamil ? 'மீட்டமை' : 'Reset node outputs'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">{isTamil ? 'மீட்டமை' : 'Reset'}</span>
          </button>

          {/* Save / Export Menu */}
          <button
            onClick={handleSaveWorkflow}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title={isTamil ? 'சேமிக்க' : 'Save workflow'}
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">{isTamil ? 'சேமி' : 'Save'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold transition-all"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <label
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold cursor-pointer transition-all"
            title="Import JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          {/* PRIMARY ACTION: Run Entire Chain / Stop */}
          {isExecuting ? (
            <button
              onClick={handleStopExecution}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer animate-pulse"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>{isTamil ? 'நிறுத்து' : 'Stop Workflow'}</span>
            </button>
          ) : (
            <button
              onClick={handleRunFullWorkflow}
              disabled={nodes.length === 0}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-950/30 transition-all cursor-pointer transform active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isTamil ? 'வொர்க்ஃப்ளோ இயக்கு' : 'Run Entire Chain'}</span>
            </button>
          )}

          {/* Toggle Inspector Drawer */}
          <button
            onClick={() => setShowInspector(!showInspector)}
            className={`p-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showInspector
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
            title={showInspector ? 'Hide Inspector' : 'Show Inspector'}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* WORKSPACE MAIN BODY                                           */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ----------------------------------------------------------- */}
        {/* LEFT PALETTE: DRAGGABLE AI TASK NODES                       */}
        {/* ----------------------------------------------------------- */}
        <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0 z-10 overflow-y-auto">
          <div className="p-3 border-b border-slate-800/80">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{isTamil ? 'AI பணிகள் நூலகம்' : 'AI Task Library'}</span>
              <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1 rounded">DRAG & DROP</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {isTamil ? 'பணிகளை வரைபடத்தில் இழுத்து வையுங்கள்' : 'Drag onto canvas or click + to chain'}
            </p>
          </div>

          <div className="p-2 space-y-2 flex-1 overflow-y-auto">
            {NODE_DEFINITIONS.map((def) => {
              const Icon = def.icon;
              return (
                <div
                  key={def.type}
                  draggable
                  onDragStart={(e) => handlePaletteDragStart(e, def.type)}
                  className="group p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700 text-left transition-all cursor-grab active:cursor-grabbing flex flex-col gap-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-${def.color}-500/15 text-${def.color}-400 border border-${def.color}-500/30`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                        {isTamil ? def.titleTa : def.titleEn}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddNode(def.type)}
                      className="p-1 rounded-md bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-colors cursor-pointer"
                      title={isTamil ? 'சேர்' : 'Add to chain'}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isTamil ? def.descriptionTa : def.descriptionEn}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[9px] font-mono text-slate-500">
                    <span>{def.badge}</span>
                    <span className="opacity-0 group-hover:opacity-100 text-amber-400 font-sans transition-opacity">
                      Drag to add →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="p-3 m-2 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>{isTamil ? 'சீக்வென்ஷியல் செயின்' : 'Sequential Data Piped'}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              {isTamil
                ? 'ஒவ்வொரு நோடின் வெளியீடும் (எ.கா. படம்) தானாக அடுத்த நோடிற்கு (வீடியோ) உள்ளீடாகப் பாயும்.'
                : 'Node outputs (e.g. generated Image) automatically pipe into the successor node (e.g. Veo Video animation)!'
              }
            </p>
          </div>
        </aside>

        {/* ----------------------------------------------------------- */}
        {/* CENTER INTERACTIVE 2D NODE CANVAS                           */}
        {/* ----------------------------------------------------------- */}
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          className="flex-1 h-full overflow-hidden relative cursor-default bg-slate-950 bg-grid-pattern"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          {/* Zoom & Viewport Overlay Floater */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl backdrop-blur-md shadow-xl">
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1.5">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-800 my-auto" />
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="px-2 py-1 hover:bg-slate-800 text-[10px] font-mono text-slate-400 rounded-lg transition-colors"
              title="Reset View"
            >
              1:1
            </button>
          </div>

          {/* SVG Connection Wires Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Render Existing Edges */}
            {edges.map(renderEdgePath)}

            {/* Render Live Rubber-Band Connection Wire When Dragging */}
            {connectingSourceId && connectingMousePos && (() => {
              const src = nodes.find((n) => n.id === connectingSourceId);
              if (!src) return null;
              const startX = src.x + 320;
              const startY = src.y + 44;
              const endX = connectingMousePos.x;
              const endY = connectingMousePos.y;
              const dx = Math.abs(endX - startX) * 0.5;

              return (
                <path
                  d={`M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="6, 4"
                  className="animate-pulse"
                />
              );
            })()}
          </svg>

          {/* Draggable Node Cards Container */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {nodes.map((node, index) => {
              const isSelected = node.id === selectedNodeId;
              const isRunning = node.status === 'running';
              const isCompleted = node.status === 'completed';
              const isFailed = node.status === 'failed';
              const def = NODE_DEFINITIONS.find((d) => d.type === node.type);
              const Icon = def?.icon || Wand2;

              // Determine sequence step number
              const stepNumber = topologicalOrder.indexOf(node.id) + 1;

              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(node.id);
                  }}
                  className={`workflow-node absolute pointer-events-auto w-[320px] rounded-2xl bg-slate-900 border transition-shadow duration-200 select-none shadow-xl ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-amber-950/40 z-20'
                      : isRunning
                      ? 'border-amber-400 ring-2 ring-amber-400/40 animate-pulse z-20'
                      : isCompleted
                      ? 'border-emerald-500/60 shadow-emerald-950/20 z-10'
                      : isFailed
                      ? 'border-rose-500/80 z-10'
                      : 'border-slate-800 hover:border-slate-700 z-10'
                  }`}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                  }}
                >
                  {/* LEFT INPUT PORT (TARGET) */}
                  <div
                    onMouseUp={(e) => handleEndConnection(e, node.id)}
                    className="workflow-port absolute -left-3.5 top-9 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-700 hover:border-amber-400 hover:scale-125 transition-all flex items-center justify-center cursor-crosshair z-30 group"
                    title={isTamil ? 'உள்ளீட்டு முனை (இணைக்க இங்கு விடுங்கள்)' : 'Input Port (Drop connection here)'}
                  >
                    <div className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-amber-400" />
                  </div>

                  {/* RIGHT OUTPUT PORT (SOURCE) */}
                  <div
                    onMouseDown={(e) => handleStartConnection(e, node.id)}
                    className="workflow-port absolute -right-3.5 top-9 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-700 hover:border-amber-400 hover:scale-125 transition-all flex items-center justify-center cursor-crosshair z-30 group"
                    title={isTamil ? 'வெளியீட்டு முனை (இணைக்க இழுக்கவும்)' : 'Output Port (Drag to connect)'}
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 group-hover:scale-125" />
                  </div>

                  {/* NODE HEADER (DRAGGABLE HANDLE) */}
                  <div
                    onMouseDown={(e) => handleNodeHeaderMouseDown(e, node.id)}
                    className="px-3 py-2.5 bg-slate-950/80 rounded-t-2xl border-b border-slate-800/80 flex items-center justify-between cursor-move"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono font-black text-amber-400 flex items-center justify-center shrink-0">
                        {stepNumber || '#'}
                      </span>
                      <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <input
                          type="text"
                          value={node.customLabel || node.title}
                          onChange={(e) => updateNodeLabel(node.id, e.target.value)}
                          className="text-xs font-bold text-slate-100 bg-transparent border-none p-0 focus:ring-0 truncate w-36 hover:underline cursor-text"
                        />
                      </div>
                    </div>

                    {/* Status Badge & Node Menu */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isRunning ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 font-mono animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>{node.progress || 0}%</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>DONE</span>
                        </span>
                      ) : isFailed ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 font-mono">
                          <AlertCircle className="w-3 h-3" />
                          <span>FAIL</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">IDLE</span>
                      )}

                      {/* Run Single Node */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeSingleNode(node);
                        }}
                        disabled={isRunning || isExecuting}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors disabled:opacity-30"
                        title={isTamil ? 'இந்த நோடை மட்டும் இயக்கு' : 'Run this node'}
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>

                      {/* Duplicate Node */}
                      <button
                        onClick={(e) => handleDuplicateNode(node.id, e)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title={isTamil ? 'நகலெடு' : 'Duplicate'}
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      {/* Delete Node */}
                      <button
                        onClick={(e) => handleDeleteNode(node.id, e)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                        title={isTamil ? 'நீக்கு' : 'Delete'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* NODE BODY */}
                  <div className="p-3 space-y-2.5 text-xs">
                    {/* Prompt Configuration Mini Input */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>{isTamil ? 'நோட் கட்டளை (Prompt):' : 'Task Directives / Prompt:'}</span>
                        {node.config.inheritInput && (
                          <span className="text-amber-400/90 text-[9px] font-bold">↳ PIPED INPUT</span>
                        )}
                      </div>
                      <textarea
                        value={node.config.prompt || ''}
                        onChange={(e) => updateNodeConfig(node.id, { prompt: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans leading-relaxed resize-none"
                        placeholder="Define prompt or instruction..."
                      />
                    </div>

                    {/* TYPE-SPECIFIC PREVIEW / OUTPUT */}
                    {/* 1. IMAGE GEN PREVIEW */}
                    {node.type === 'image_gen' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{node.config.aspectRatio || '16:9'} · Gemini 3.1</span>
                          {node.output?.imageUrl && (
                            <button
                              onClick={() => setModalMedia({ type: 'image', url: node.output!.imageUrl!, title: node.customLabel || node.title })}
                              className="text-amber-400 hover:underline flex items-center gap-0.5 text-[10px]"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Enlarge</span>
                            </button>
                          )}
                        </div>

                        {node.output?.imageUrl ? (
                          <div className="relative group rounded-xl overflow-hidden border border-slate-800 aspect-video bg-black">
                            <img
                              src={node.output.imageUrl}
                              alt="Generated Visual"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => setModalMedia({ type: 'image', url: node.output!.imageUrl!, title: node.customLabel || node.title })}
                                className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                                title="Enlarge"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={node.output.imageUrl}
                                download="generated_keyframe.png"
                                className="p-1.5 rounded-lg bg-slate-800 text-white font-bold text-xs"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video rounded-xl bg-slate-950/60 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-[11px] gap-1">
                            <Wand2 className="w-4 h-4 text-slate-600" />
                            <span>{isRunning ? 'Synthesizing visual...' : 'Awaiting execution'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. VIDEO ANIMATION PREVIEW */}
                    {node.type === 'video_anim' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Google Veo · {node.config.resolution || '720p'}</span>
                          {node.output?.videoUrl && (
                            <button
                              onClick={() => setModalMedia({ type: 'video', url: node.output!.videoUrl!, title: node.customLabel || node.title })}
                              className="text-amber-400 hover:underline flex items-center gap-0.5 text-[10px]"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Player</span>
                            </button>
                          )}
                        </div>

                        {node.output?.videoUrl ? (
                          <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-black relative group">
                            <video
                              src={node.output.videoUrl}
                              controls
                              playsInline
                              loop
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video rounded-xl bg-slate-950/60 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-[11px] gap-1">
                            <Film className="w-4 h-4 text-slate-600" />
                            <span>{isRunning ? `Veo animating frames (${node.progress || 0}%)...` : 'Awaiting predecessor image'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. AI SUMMARY PREVIEW */}
                    {node.type === 'summary' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Executive Summary</span>
                          {node.output?.text && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(node.output!.text!);
                                alert('Summary copied to clipboard!');
                              }}
                              className="text-emerald-400 hover:underline flex items-center gap-0.5 text-[10px]"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                          )}
                        </div>
                        <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 text-[11px] text-slate-300 max-h-24 overflow-y-auto leading-relaxed">
                          {node.output?.text ? (
                            <p className="line-clamp-4 whitespace-pre-wrap">{node.output.text}</p>
                          ) : (
                            <span className="text-slate-600 italic">
                              {isRunning ? 'Analyzing chain assets and drafting summary...' : 'Awaiting video & visual input...'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 4. AUDIO / TTS PREVIEW */}
                    {node.type === 'audio_tts' && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-slate-400">
                          Neural Voice: {node.config.voice || 'Aoede'}
                        </div>
                        {node.output?.audioBase64 ? (
                          <audio
                            controls
                            src={`data:audio/wav;base64,${node.output.audioBase64}`}
                            className="w-full h-8"
                          />
                        ) : (
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center text-[10px] text-slate-500">
                            {isRunning ? 'Synthesizing voice waveform...' : 'Awaiting script input'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progress Bar When Running */}
                    {isRunning && (
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full transition-all duration-300"
                          style={{ width: `${node.progress || 20}%` }}
                        />
                      </div>
                    )}

                    {/* Error Message if Failed */}
                    {isFailed && node.error && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate">{node.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT DRAWER: INSPECTOR / RESULTS GALLERY / LOGS           */}
        {/* ----------------------------------------------------------- */}
        {showInspector && (
          <aside className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 shadow-2xl transition-all">
            {/* Inspector Tabs */}
            <div className="p-2 border-b border-slate-800 flex items-center justify-between gap-1 bg-slate-950/60">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setInspectorTab('config')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inspectorTab === 'config'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isTamil ? 'நோட் கட்டமைப்பு' : 'Node Config'}
                </button>
                <button
                  onClick={() => setInspectorTab('results')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inspectorTab === 'results'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isTamil ? 'முடிவுகள்' : 'Chain Results'}
                </button>
                <button
                  onClick={() => setInspectorTab('logs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inspectorTab === 'logs'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isTamil ? 'லாக்ஸ்' : 'Logs'}
                </button>
              </div>

              <button
                onClick={() => setShowInspector(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: NODE CONFIG INSPECTOR */}
              {inspectorTab === 'config' && selectedNode && (
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                      {isTamil ? 'தேர்ந்தெடுக்கப்பட்ட பணி' : 'Selected Task Node'}
                    </div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>{selectedNode.customLabel || selectedNode.title}</span>
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Type: <span className="font-mono text-amber-400">{selectedNode.type}</span> · ID: <span className="font-mono text-slate-500">{selectedNode.id}</span>
                    </div>
                  </div>

                  {/* Inherit Input Toggle */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {isTamil ? 'முந்தைய நோடின் முடிவை ஏற்கவும்' : 'Inherit Predecessor Output'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isTamil ? 'இணைக்கப்பட்ட நோடின் படம்/உரையை உள்ளீடாக மாற்றும்' : 'Pipes previous node text/image directly'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedNode.config.inheritInput ?? true}
                      onChange={(e) => updateNodeConfig(selectedNode.id, { inheritInput: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                  </div>

                  {/* Prompt Textarea */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                      {isTamil ? 'கட்டளை வழிகாட்டல் (Prompt):' : 'System Prompt / Directive:'}
                    </label>
                    <textarea
                      value={selectedNode.config.prompt || ''}
                      onChange={(e) => updateNodeConfig(selectedNode.id, { prompt: e.target.value })}
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Aspect Ratio (if Image or Video) */}
                  {(selectedNode.type === 'image_gen' || selectedNode.type === 'video_anim') && (
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono">
                        {isTamil ? 'வடிவ விகிதம் (Aspect Ratio):' : 'Aspect Ratio:'}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['16:9', '1:1', '9:16'] as const).map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => updateNodeConfig(selectedNode.id, { aspectRatio: ratio })}
                            className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                              selectedNode.config.aspectRatio === ratio
                                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Resolution (if Video) */}
                  {selectedNode.type === 'video_anim' && (
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono">
                        {isTamil ? 'வீடியோ தெளிவுத்திறன் (Resolution):' : 'Video Resolution:'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['720p', '1080p'] as const).map((res) => (
                          <button
                            key={res}
                            onClick={() => updateNodeConfig(selectedNode.id, { resolution: res })}
                            className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                              selectedNode.config.resolution === res
                                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary Action */}
                  {selectedNode.type === 'summary' && (
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5 font-mono">
                        {isTamil ? 'சுருக்க வகை (Analysis Goal):' : 'Analysis & Output Format:'}
                      </label>
                      <select
                        value={selectedNode.config.action || 'Executive Creative Summary'}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { action: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Executive Creative Summary & Social Broadcast">Executive Creative Summary & Social Broadcast</option>
                        <option value="Cinematic Director Breakdown">Cinematic Director Breakdown</option>
                        <option value="Viral Video Script & Hashtags">Viral Video Script & Hashtags</option>
                        <option value="Technical Architecture Spec">Technical Architecture Spec</option>
                      </select>
                    </div>
                  )}

                  {/* Run Single Node Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => executeSingleNode(selectedNode)}
                      disabled={selectedNode.status === 'running' || isExecuting}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isTamil ? 'இந்த நோடை மட்டும் இயக்கு' : 'Test Run This Node'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CHAIN RESULTS OVERVIEW */}
              {inspectorTab === 'results' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{isTamil ? 'முழுமையான தயாரிப்பு முடிவுகள்' : 'Pipeline Asset Showcase'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isTamil
                        ? 'வொர்க்ஃப்ளோவின் அனைத்து கட்ட முடிவுகளும் ஒரே பார்வையில்.'
                        : 'Unified gallery of all generated sequential assets.'}
                    </p>
                  </div>

                  {nodes.some((n) => n.output) ? (
                    <div className="space-y-4">
                      {/* Step 1 Result: Image */}
                      {nodes.find((n) => n.type === 'image_gen' && n.output?.imageUrl) && (() => {
                        const imgNode = nodes.find((n) => n.type === 'image_gen' && n.output?.imageUrl)!;
                        return (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                              <span className="flex items-center gap-1.5">
                                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                                <span>1. Keyframe Visual</span>
                              </span>
                              <button
                                onClick={() => setModalMedia({ type: 'image', url: imgNode.output!.imageUrl!, title: imgNode.customLabel || 'Keyframe Art' })}
                                className="text-amber-400 hover:underline text-[10px]"
                              >
                                View Full
                              </button>
                            </div>
                            <img
                              src={imgNode.output!.imageUrl}
                              alt="Result Keyframe"
                              className="w-full rounded-lg aspect-video object-cover border border-slate-800"
                            />
                            <p className="text-[10px] text-slate-400 italic line-clamp-2">
                              "{imgNode.output!.text || imgNode.config.prompt}"
                            </p>
                          </div>
                        );
                      })()}

                      {/* Step 2 Result: Video */}
                      {nodes.find((n) => n.type === 'video_anim' && n.output?.videoUrl) && (() => {
                        const vidNode = nodes.find((n) => n.type === 'video_anim' && n.output?.videoUrl)!;
                        return (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                              <span className="flex items-center gap-1.5">
                                <Film className="w-3.5 h-3.5 text-indigo-400" />
                                <span>2. Veo Motion Video</span>
                              </span>
                              <button
                                onClick={() => setModalMedia({ type: 'video', url: vidNode.output!.videoUrl!, title: vidNode.customLabel || 'Veo Video' })}
                                className="text-indigo-400 hover:underline text-[10px]"
                              >
                                Full Player
                              </button>
                            </div>
                            <video
                              src={vidNode.output!.videoUrl}
                              controls
                              playsInline
                              loop
                              className="w-full rounded-lg aspect-video object-cover border border-slate-800"
                            />
                          </div>
                        );
                      })()}

                      {/* Step 3 Result: Summary */}
                      {nodes.find((n) => n.type === 'summary' && n.output?.text) && (() => {
                        const sumNode = nodes.find((n) => n.type === 'summary' && n.output?.text)!;
                        return (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                              <span className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                <span>3. Executive Summary</span>
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(sumNode.output!.text!);
                                  alert('Copied summary!');
                                }}
                                className="text-emerald-400 hover:underline text-[10px] flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </button>
                            </div>
                            <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 font-sans">
                              {sumNode.output!.text}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Step 4 Result: Voice Narration */}
                      {nodes.find((n) => n.type === 'audio_tts' && n.output?.audioBase64) && (() => {
                        const audNode = nodes.find((n) => n.type === 'audio_tts' && n.output?.audioBase64)!;
                        return (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-violet-400" />
                              <span>4. Voice Narration Audio</span>
                            </div>
                            <audio
                              controls
                              src={`data:audio/wav;base64,${audNode.output!.audioBase64}`}
                              className="w-full"
                            />
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="py-12 px-4 text-center text-slate-500 space-y-2 border border-dashed border-slate-800 rounded-2xl">
                      <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-400">
                        {isTamil ? 'முடிவுகள் இன்னும் உருவாகவில்லை' : 'No execution results yet'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isTamil
                          ? 'முழு செயினையும் இயக்க மேலே உள்ள "Run Entire Chain" பொத்தானை அழுத்தவும்.'
                          : 'Click "Run Entire Chain" to start sequential generation.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EXECUTION LOGS */}
              {inspectorTab === 'logs' && (
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">
                      {isTamil ? 'இயக்க விவரங்கள் (Logs)' : 'System Diagnostics'}
                    </span>
                    <button
                      onClick={() => setExecutionLogs([])}
                      className="text-slate-500 hover:text-slate-300 text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 max-h-[500px] overflow-y-auto">
                    {executionLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 leading-relaxed ${
                          log.level === 'error'
                            ? 'text-rose-400'
                            : log.level === 'success'
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }`}
                      >
                        <span className="text-slate-600 text-[10px] shrink-0">{log.timestamp}</span>
                        <span className="break-all">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MEDIA PREVIEW MODAL (FULL SCREEN IMAGE / VIDEO)               */}
      {/* ------------------------------------------------------------- */}
      {modalMedia && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalMedia(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>{modalMedia.title}</span>
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={modalMedia.url}
                  download="swatea_asset"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setModalMedia(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[75vh]">
              {modalMedia.type === 'image' ? (
                <img
                  src={modalMedia.url}
                  alt={modalMedia.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              ) : (
                <video
                  src={modalMedia.url}
                  controls
                  autoPlay
                  playsInline
                  loop
                  className="max-h-[70vh] w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManager;
