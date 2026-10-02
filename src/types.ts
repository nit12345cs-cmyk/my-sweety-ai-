export type ModuleType =
  | 'chat'
  | 'image'
  | 'video'
  | 'website'
  | 'voice'
  | 'workflow'
  | 'admin';

export type LanguageCode = 'ta' | 'en' | 'es' | 'ja' | 'de';

export type ThemeType = 'dark' | 'light';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface UserProfile {
  email: string;
  name: string;
  loggedInAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  persona?: string;
  sources?: { title: string; uri: string }[];
  imageUrl?: string;
  userImage?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface GeneratedImageResult {
  id: string;
  prompt: string;
  imageUrl: string;
  sourceImageUrl?: string;
  aspectRatio: string;
  createdAt: string;
  isEdited?: boolean;
}

export interface GeneratedVideoResult {
  id: string;
  prompt: string;
  sourceImageUrl?: string;
  videoUrl: string;
  aspectRatio: string;
  resolution: string;
  createdAt: string;
  model: string;
}

export interface SearchResult {
  query: string;
  reply: string;
  sources: { title: string; uri: string }[];
  searchQueries: string[];
  timestamp: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
}

export interface DocumentSample {
  id: string;
  name: string;
  type: string;
  content: string;
  date: string;
}

export interface ImageSample {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  description: string;
}

export interface AgentStep {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  details: string;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: string[];
}

export interface SystemStats {
  activeUsers: number;
  apiRequests: number;
  latencyMs: number;
  tokenUsage: number;
  serverStatus: 'Online' | 'Degraded' | 'Offline';
}

export type TaskNodeType =
  | 'image_gen'
  | 'video_anim'
  | 'summary'
  | 'prompt'
  | 'audio_tts'
  | 'code_gen'
  | 'translate';

export type NodeExecutionStatus = 'idle' | 'queued' | 'running' | 'completed' | 'failed';

export interface WorkflowTaskNode {
  id: string;
  type: TaskNodeType;
  title: string;
  customLabel?: string;
  x: number;
  y: number;
  status: NodeExecutionStatus;
  progress?: number;
  elapsedSec?: number;
  error?: string;
  config: {
    prompt?: string;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
    resolution?: '720p' | '1080p';
    model?: string;
    action?: string;
    voice?: string;
    temperature?: number;
    language?: string;
    inheritInput?: boolean;
    useCustomInput?: boolean;
  };
  output?: {
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    audioBase64?: string;
    bulletPoints?: string[];
    metadata?: Record<string, any>;
    timestamp?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
}

export interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  badge?: string;
  nodes: WorkflowTaskNode[];
  edges: WorkflowEdge[];
}

