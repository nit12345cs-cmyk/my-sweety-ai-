export type ModuleType =
  | 'chat'
  | 'website'
  | 'voice'
  | 'admin';

export type LanguageCode = 'ta' | 'en' | 'es' | 'ja' | 'de';

export type ThemeType = 'chatgpt' | 'light' | 'cyberpunk' | 'obsidian' | 'violet' | 'cyan';

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
  aspectRatio: string;
  createdAt: string;
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
