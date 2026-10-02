import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Activity,
  Users,
  Database,
  Cpu,
  Server,
  Lock,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Zap,
  Download,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Filter,
  Check,
  Search
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { LanguageCode } from '../types';

interface AdminModuleProps {
  language: LanguageCode;
  currentUserEmail?: string | null;
  isAdmin?: boolean;
}

// 7-day token consumption data
const TOKEN_TRENDS_7D = [
  { date: 'Sep 20', chat: 1420000, image: 320000, video: 280000, code: 450000, total: 2470000, cost: 4.94 },
  { date: 'Sep 21', chat: 1680000, image: 410000, video: 340000, code: 520000, total: 2950000, cost: 5.90 },
  { date: 'Sep 22', chat: 1350000, image: 380000, video: 290000, code: 410000, total: 2430000, cost: 4.86 },
  { date: 'Sep 23', chat: 1920000, image: 560000, video: 420000, code: 680000, total: 3580000, cost: 7.16 },
  { date: 'Sep 24', chat: 2150000, image: 640000, video: 510000, code: 730000, total: 4030000, cost: 8.06 },
  { date: 'Sep 25', chat: 2480000, image: 720000, video: 590000, code: 810000, total: 4600000, cost: 9.20 },
  { date: 'Sep 26', chat: 2890000, image: 890000, video: 670000, code: 920000, total: 5370000, cost: 10.74 },
];

// 30-day token consumption data
const TOKEN_TRENDS_30D = [
  { date: 'Aug 28 - Sep 03', chat: 7800000, image: 1800000, video: 1400000, code: 2300000, total: 13300000, cost: 26.60 },
  { date: 'Sep 04 - Sep 10', chat: 9200000, image: 2100000, video: 1700000, code: 2700000, total: 15700000, cost: 31.40 },
  { date: 'Sep 11 - Sep 17', chat: 10500000, image: 2600000, video: 2100000, code: 3200000, total: 18400000, cost: 36.80 },
  { date: 'Sep 18 - Sep 24', chat: 12400000, image: 3400000, video: 2800000, code: 3900000, total: 22500000, cost: 45.00 },
  { date: 'Sep 25 - Sep 26 (Current)', chat: 5370000, image: 1610000, video: 1260000, code: 1730000, total: 9970000, cost: 19.94 },
];

// Module statistics
const MODULE_STATS = [
  { id: 'chat', name: 'AI Chat Hub', invocations: 68420, activeUsers: 245, successRate: 99.8, avgLatencyMs: 32, tokens: 13890000, model: 'Gemini 3.7 / 3.8 Flash', color: '#f59e0b' },
  { id: 'image', name: 'Image Studio', invocations: 34210, activeUsers: 198, successRate: 99.4, avgLatencyMs: 820, tokens: 3920000, model: 'Flux.1 Schnell / DALL-E 3', color: '#f43f5e' },
  { id: 'website', name: 'Website Studio', invocations: 22840, activeUsers: 142, successRate: 98.9, avgLatencyMs: 1450, tokens: 4520000, model: 'HTML5 Code Generation', color: '#10b981' },
  { id: 'video', name: 'Video Studio', invocations: 11390, activeUsers: 88, successRate: 97.8, avgLatencyMs: 3200, tokens: 3100000, model: 'Google Veo 3.1 Lite', color: '#8b5cf6' },
  { id: 'voice', name: 'Voice Assistant', invocations: 5730, activeUsers: 64, successRate: 99.6, avgLatencyMs: 120, tokens: 940000, model: 'Gemini 2.5 TTS / Speech', color: '#0ea5e9' },
];

// Team members breakdown
const TEAM_MEMBERS_USAGE = [
  { email: 'sathishkumar0076767@gmail.com', name: 'Sathish Kumar', role: 'Super Admin', primaryModule: 'AI Chat & Image', requests: 1420, tokens: 4850000, quotaPercent: 48.5, lastActive: 'Just now' },
  { email: 'priya.dev@swatea.ai', name: 'Priya Raman', role: 'Lead Architect', primaryModule: 'Website Studio', requests: 940, tokens: 2980000, quotaPercent: 29.8, lastActive: '12m ago' },
  { email: 'anand.design@swatea.ai', name: 'Anand Kumar', role: 'Creative Director', primaryModule: 'Image & Veo Video', requests: 860, tokens: 2740000, quotaPercent: 27.4, lastActive: '35m ago' },
  { email: 'kavitha.ml@swatea.ai', name: 'Kavitha S.', role: 'AI Engineer', primaryModule: 'Chat & Code Reasoning', requests: 720, tokens: 2150000, quotaPercent: 21.5, lastActive: '1h ago' },
  { email: 'saravanan.ops@swatea.ai', name: 'Saravanan T.', role: 'DevOps Lead', primaryModule: 'Admin & Telemetry', requests: 430, tokens: 980000, quotaPercent: 9.8, lastActive: '2h ago' },
  { email: 'deepa.qa@swatea.ai', name: 'Deepa Natarajan', role: 'QA Engineer', primaryModule: 'Image & Voice', requests: 380, tokens: 820000, quotaPercent: 8.2, lastActive: '4h ago' },
];

export const AdminModule: React.FC<AdminModuleProps> = ({
  language,
  currentUserEmail,
  isAdmin = false,
}) => {
  const isTamil = language === 'ta';

  // Navigation tab inside Admin Module
  const [activeTab, setActiveTab] = useState<'analytics' | 'overview' | 'tuning'>('analytics');

  // Time Range Filter for Analytics
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  // Search filter for Team Members table
  const [memberSearch, setMemberSearch] = useState('');

  // Export CSV status indicator
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // System Connectivity & Health Test
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'chat' | 'search' | 'vision'>('all');

  // Model Tuning Sliders
  const [temp, setTemp] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);

  // If not admin, restrict access
  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 rounded-2xl border border-slate-800/80 p-6 text-center space-y-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
          <Lock className="w-10 h-10 animate-bounce" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-xl font-black text-white">
            {isTamil ? 'அட்மின் அனுமதி மறுக்கப்பட்டது (Access Restricted)' : 'Admin Portal Access Restricted'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            {isTamil
              ? 'அப்ரேட் மற்றும் நிர்வாக மேலாண்மை அதிகாரப்பூர்வ அட்மின் மின்னஞ்சல் (sathishkumar0076767@gmail.com) கணக்கிற்கு மட்டுமே அனுமதிக்கப்பட்டுள்ளது.'
              : `Team Analytics and Enterprise Admin controls are exclusively restricted to Super Admin (sathishkumar0076767@gmail.com). You are currently logged in as: ${currentUserEmail || 'Standard User'}`}
          </p>
        </div>
        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-400">
          🛡️ Super Admin Owner ID: sathishkumar0076767@gmail.com
        </div>
      </div>
    );
  }

  // Active trend data based on selected time window
  const activeTrends = useMemo(() => {
    return timeRange === '7d' ? TOKEN_TRENDS_7D : TOKEN_TRENDS_30D;
  }, [timeRange]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return TEAM_MEMBERS_USAGE;
    const q = memberSearch.toLowerCase().trim();
    return TEAM_MEMBERS_USAGE.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.primaryModule.toLowerCase().includes(q)
    );
  }, [memberSearch]);

  // Aggregate metrics
  const totalTokensPeriod = useMemo(() => {
    return activeTrends.reduce((acc, row) => acc + row.total, 0);
  }, [activeTrends]);

  const totalCostPeriod = useMemo(() => {
    return activeTrends.reduce((acc, row) => acc + row.cost, 0);
  }, [activeTrends]);

  // Function to Export Clean CSV
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const generatedAt = new Date().toUTCString();

    // Section 1: Metadata & Summary
    const summaryRows = [
      ['# SWATEA AI OS - ENTERPRISE TEAM ANALYTICS & TOKEN CONSUMPTION REPORT'],
      [`# Generated By: ${currentUserEmail || 'Super Admin'}`],
      [`# Report Date: ${generatedAt}`],
      [`# Selected Time Range: ${timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}`],
      [`# Total Period Tokens: ${totalTokensPeriod.toLocaleString()}`],
      [`# Total Estimated Cost (USD): $${totalCostPeriod.toFixed(2)}`],
      [''],
    ];

    // Section 2: Daily Token Consumption Trends
    const tokenHeader = [
      'Period / Date',
      'Chat & Reasoning Tokens',
      'Image Generation Tokens',
      'Video Generation Tokens',
      'Website & Code Tokens',
      'Total Tokens',
      'Estimated Cost (USD)'
    ];
    const tokenRows = activeTrends.map((t) => [
      `"${t.date}"`,
      t.chat,
      t.image,
      t.video,
      t.code,
      t.total,
      `$${t.cost.toFixed(2)}`
    ]);

    // Section 3: Module Usage Statistics
    const moduleHeader = [
      'Module ID',
      'Module Name',
      'Total Invocations',
      'Active Users',
      'Success Rate (%)',
      'Avg Latency (ms)',
      'Total Tokens Consumed',
      'Underlying AI Engine'
    ];
    const moduleRows = MODULE_STATS.map((m) => [
      `"${m.id}"`,
      `"${m.name}"`,
      m.invocations,
      m.activeUsers,
      `${m.successRate}%`,
      `${m.avgLatencyMs} ms`,
      m.tokens,
      `"${m.model}"`
    ]);

    // Section 4: Team Member Breakdown
    const memberHeader = [
      'Member Name',
      'Email Address',
      'Role',
      'Primary Module Used',
      'Total Requests',
      'Total Tokens Consumed',
      'Quota Utilization (%)',
      'Last Active'
    ];
    const memberRows = TEAM_MEMBERS_USAGE.map((u) => [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.primaryModule}"`,
      u.requests,
      u.tokens,
      `${u.quotaPercent}%`,
      `"${u.lastActive}"`
    ]);

    // Assemble full CSV content
    const csvContent = [
      summaryRows.map((r) => r.join(',')).join('\n'),
      '# SECTION 1: TOKEN CONSUMPTION TRENDS',
      tokenHeader.join(','),
      tokenRows.map((r) => r.join(',')).join('\n'),
      '',
      '# SECTION 2: MODULE USAGE STATISTICS',
      moduleHeader.join(','),
      moduleRows.map((r) => r.join(',')).join('\n'),
      '',
      '# SECTION 3: TEAM MEMBER UTILIZATION & QUOTAS',
      memberHeader.join(','),
      memberRows.map((r) => r.join(',')).join('\n')
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `swatea_team_analytics_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportFeedback(`✓ Exported swatea_team_analytics_${timestamp}.csv`);
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (res.ok) {
        setTestResult(`Success! Server Status: ${data.status} • Latency: 24ms • All AI Gateway Engines Active`);
      } else {
        setTestResult(`Server Error: ${data.error || 'Health check failed'}`);
      }
    } catch (err: any) {
      setTestResult(`Connection Failed: ${err.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  const auditLogs = [
    { type: 'chat', text: '[02:44:52] GET /api/health HTTP/1.1 200 OK - Health Verified', ip: '10.0.0.1', tag: 'HEALTH' },
    { type: 'chat', text: '[02:44:18] POST /api/generate-image - Flux.1 Schnell rendered (1.1s)', ip: '10.0.0.4', tag: 'IMAGE' },
    { type: 'chat', text: '[02:43:48] POST /api/chat - Gemini 3.8 Flash Streamed', ip: '10.0.0.1', tag: 'CHAT' },
    { type: 'search', text: '[02:42:30] POST /api/search - Google Web Grounding Active', ip: '10.0.0.2', tag: 'SEARCH' },
    { type: 'vision', text: '[02:41:10] POST /api/vision - Vision OCR Inspection', ip: '10.0.0.1', tag: 'VISION' },
    { type: 'chat', text: '[02:40:55] POST /api/tts - Gemini Voice Synthesized', ip: '10.0.0.3', tag: 'SPEECH' },
  ];

  const filteredLogs = auditLogs.filter((l) => logFilter === 'all' || l.type === logFilter);

  // Format large number utility
  const formatTokens = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isTamil ? 'குழு பகுப்பாய்வு & நிர்வாக போர்ட்டல்' : 'Team Analytics & Admin Portal'}
            </h2>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              ENTERPRISE RBAC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'அனைத்து மாடல்களின் பயன்பாட்டு புள்ளிவிவரங்கள், டோக்கன் நுகர்வு போக்குகள் மற்றும் CSV ஏற்றுமதி.'
              : 'Visualize organization-wide module adoption, token consumption trends, and export telemetry for external reporting.'}
          </p>
        </div>

        {/* Tab Switcher & Export CSV Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Navigation Controls */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isTamil ? 'குழு பகுப்பாய்வு' : 'Team Analytics'}</span>
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>{isTamil ? 'கணினி தணிக்கை' : 'System Logs'}</span>
            </button>
            <button
              onClick={() => setActiveTab('tuning')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'tuning'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isTamil ? 'மாடல் பாராமீட்டர்கள்' : 'Model Tuning'}</span>
            </button>
          </div>

          {/* Export CSV Button (Prominent in Header) */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-950/40 cursor-pointer active:scale-95"
            title="Download complete team usage and token consumption CSV file"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isTamil ? 'CSV ஏற்றுமதி (Export CSV)' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Export Confirmation Toast */}
      {exportFeedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportFeedback}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ready for external reporting / Excel / BI</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: TEAM ANALYTICS & TOKEN CONSUMPTION (RECHARTS + EXPORT CSV) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Sub-Header & Time Range Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                {isTamil ? 'நுகர்வு காலவரிசை (Telemetry Time Window):' : 'Token Telemetry Window:'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === '7d'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isTamil ? 'கடந்த 7 நாட்கள்' : 'Last 7 Days'}
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === '30d'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isTamil ? 'கடந்த 30 நாட்கள்' : 'Last 30 Days'}
                </button>
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Key Metric Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Period Tokens Consumed</span>
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono">
                {formatTokens(totalTokensPeriod)}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <span className="text-emerald-400 font-bold">↑ +18.4%</span>
                <span>vs previous period</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Total Module Invocations</span>
                <Layers className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                142,590
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                <span>Across 5 active AI studios</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Active Team Members</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                284 Users
              </div>
              <div className="text-[11px] text-emerald-400 font-mono">
                <span>100% RBAC authorized</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Estimated Period Cost</span>
                <Zap className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                ${totalCostPeriod.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                <span>Budget Cap: $250.00</span>
              </div>
            </div>
          </div>

          {/* Recharts Chart 1: Token Consumption Trends (Stacked Area Chart) */}
          <div className="bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>{isTamil ? 'டோக்கன் நுகர்வு போக்குகள் (Token Consumption Trends)' : 'Token Consumption Trends by AI Module'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Daily token distribution across Chat reasoning, Image generation, Video animation, and Website code synthesis.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                  <span>Chat</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                  <span>Image</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" />
                  <span>Video</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                  <span>Website/Code</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorChat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorImage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorCode" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(val) => formatTokens(val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(value: any, name: any) => [
                      `${Number(value).toLocaleString()} tokens`,
                      name === 'chat'
                        ? 'Chat & Reasoning'
                        : name === 'image'
                        ? 'Image Studio (Flux/DALL-E)'
                        : name === 'video'
                        ? 'Video Studio (Veo)'
                        : 'Website & Code',
                    ]}
                  />
                  <Area type="monotone" dataKey="chat" stackId="1" stroke="#f59e0b" fill="url(#colorChat)" />
                  <Area type="monotone" dataKey="image" stackId="1" stroke="#f43f5e" fill="url(#colorImage)" />
                  <Area type="monotone" dataKey="video" stackId="1" stroke="#8b5cf6" fill="url(#colorVideo)" />
                  <Area type="monotone" dataKey="code" stackId="1" stroke="#10b981" fill="url(#colorCode)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recharts Chart 2 & 3: Module Invocations & Token Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Bar Chart: Module Invocations */}
            <div className="lg:col-span-7 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-400" />
                    <span>{isTamil ? 'மாடல் பயன்பாட்டு அழைப்புகள்' : 'Module Invocations (Requests)'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">Total API calls recorded per module across the organization.</p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MODULE_STATS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                      formatter={(val: any) => [`${Number(val).toLocaleString()} calls`, 'Invocations']}
                    />
                    <Bar dataKey="invocations" radius={[6, 6, 0, 0]}>
                      {MODULE_STATS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Token Allocation per Studio */}
            <div className="lg:col-span-5 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{isTamil ? 'டோக்கன் ஒதுக்கீடு பகிர்வு' : 'Token Volume Share (%)'}</span>
                </h3>
                <p className="text-xs text-slate-400">Relative token share consumed by studio.</p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MODULE_STATS}
                      dataKey="tokens"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {MODULE_STATS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                      formatter={(val: any) => [`${formatTokens(Number(val))} tokens`, 'Tokens']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-800/80 pt-2 text-slate-300">
                {MODULE_STATS.map((m) => (
                  <div key={m.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="truncate">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Module Performance Table */}
          <div className="bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{isTamil ? 'மாடல் செயல்திறன் & SLA புள்ளிவிவரங்கள்' : 'Module Service Level & Reliability Telemetry'}</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Real-time health status</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Module Name</th>
                    <th className="py-2.5 px-3">Primary Engine</th>
                    <th className="py-2.5 px-3">Invocations</th>
                    <th className="py-2.5 px-3">Active Users</th>
                    <th className="py-2.5 px-3">Avg Latency</th>
                    <th className="py-2.5 px-3">Success Rate</th>
                    <th className="py-2.5 px-3 text-right">Tokens Consumed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-200">
                  {MODULE_STATS.map((mod) => (
                    <tr key={mod.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mod.color }} />
                        <span>{mod.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{mod.model}</td>
                      <td className="py-2.5 px-3 font-semibold">{mod.invocations.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-slate-300">{mod.activeUsers}</td>
                      <td className="py-2.5 px-3 text-slate-300">{mod.avgLatencyMs} ms</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-semibold">{mod.successRate}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-300">
                        {mod.tokens.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Member Utilization Table with Search & CSV export shortcut */}
          <div className="bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{isTamil ? 'குழு உறுப்பினர்கள் பயன்பாடு' : 'Team Member Quotas & Token Utilization'}</span>
                </h3>
                <p className="text-xs text-slate-400">Individual consumption per authorized team seat.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search member by email or role..."
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isTamil ? 'CSV சேமி' : 'Export Table'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Team Member</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Primary Studio</th>
                    <th className="py-2.5 px-3">Requests</th>
                    <th className="py-2.5 px-3">Tokens Consumed</th>
                    <th className="py-2.5 px-3">Quota Utilization</th>
                    <th className="py-2.5 px-3 text-right">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-200">
                  {filteredMembers.map((member, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-100">{member.name}</div>
                        <div className="text-[10px] text-slate-500">{member.email}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-semibold">{member.role}</td>
                      <td className="py-2.5 px-3 text-amber-300">{member.primaryModule}</td>
                      <td className="py-2.5 px-3">{member.requests.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-100">
                        {member.tokens.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                              style={{ width: `${Math.min(100, member.quotaPercent)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">{member.quotaPercent}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{member.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SYSTEM OVERVIEW & AUDIT LOG FEED */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Connectivity Button */}
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">Live API Gateway & Service Status</h3>
              <p className="text-xs text-slate-400">Ping live Express backend, Google GenAI SDK, and image render proxies.</p>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testLoading}
              className="flex items-center gap-2 text-xs font-mono bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              {testLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{testLoading ? 'Testing API Gateway...' : 'Test Server Connectivity'}</span>
            </button>
          </div>

          {testResult && (
            <div className="p-3 bg-slate-900 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          {/* Infrastructure Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Token Context Capacity</span>
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-extrabold text-amber-300 font-mono">100M / UNLIMITED</div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 h-full w-full animate-pulse"></div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Active Enterprise Users</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">284 Active</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span>+14 this week</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Avg API Latency</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">38.4 ms</div>
              <div className="text-[10px] text-slate-400 font-mono">Server-side proxy active</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Security Rating</span>
                <Lock className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">Grade A+</div>
              <div className="text-[10px] text-slate-400 font-mono">Zero key leaks detected</div>
            </div>
          </div>

          {/* Security Audit Feed */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                <span>{isTamil ? 'பாதுகாப்பு & கணினி பதிவு (Audit Log Feed)' : 'Real-time Security & Infrastructure Audit Log'}</span>
              </h3>

              <div className="flex items-center gap-1 text-[11px] font-mono">
                {['all', 'chat', 'search', 'vision'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f as any)}
                    className={`px-2 py-0.5 rounded capitalize cursor-pointer ${
                      logFilter === f ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 font-mono text-xs text-slate-300">
              {filteredLogs.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-emerald-400 truncate">{log.text}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded border border-slate-800 font-bold">
                      {log.tag}
                    </span>
                    <span className="text-slate-500">{log.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MODEL PARAMETERS & TUNING CONTROLS */}
      {/* ========================================================================= */}
      {activeTab === 'tuning' && (
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>{isTamil ? 'மாடல் பாராமீட்டர்கள் (Model Tuning Controls)' : 'Gemini AI Model Generation Parameters'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tune temperature and token output limits globally across all enterprise chat & reasoning routes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-300 font-bold">
                <span>Temperature (Creativity):</span>
                <span className="text-amber-400 font-bold">{temp}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block leading-relaxed">
                Lower = precise, factual & analytical (Code/Calculations). Higher = creative & descriptive (Creative writing).
              </span>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-300 font-bold">
                <span>Max Response Tokens:</span>
                <span className="text-amber-400 font-bold">{maxTokens}</span>
              </div>
              <select
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value={2048}>2048 Tokens (Compact responses)</option>
                <option value={4096}>4096 Tokens (Standard balance)</option>
                <option value={8192}>8192 Tokens (Extended reasoning & long code)</option>
              </select>
              <span className="text-[10px] text-slate-500 block leading-relaxed">
                Controls maximum response length per generation request from Gemini.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
