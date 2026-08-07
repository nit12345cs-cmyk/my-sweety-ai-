import React, { useState } from 'react';
import { Workflow, Zap, Sparkles, CheckCircle2, Circle, ArrowRight, ShieldCheck, Play, RefreshCw, Layers } from 'lucide-react';
import { LanguageCode } from '../types';
import { safeFetchJson } from '../lib/api';

interface WorkflowModuleProps {
  language: LanguageCode;
}

interface WorkflowNode {
  id: number;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'completed';
  logs: string;
}

export const WorkflowModule: React.FC<WorkflowModuleProps> = ({ language }) => {
  const isTamil = language === 'ta';

  const [goal, setGoal] = useState(
    isTamil
      ? 'வாடிக்கையாளர் ஆதரவு டிக்கெட்டுகளை தானாக வகைப்படுத்தி, சாட்-ஜிபிடி / ஜெமினி வழியே உடனடி பதில் அனுப்பும் ஏஜென்ட் சிஸ்டம்.'
      : 'Automated Customer Support Agent: Intake incoming support emails, classify sentiment & urgency, query vector knowledge base, and draft response.'
  );
  const [industry, setIndustry] = useState('SaaS / Cloud Technology');
  const [loading, setLoading] = useState(false);
  const [workflowPlan, setWorkflowPlan] = useState('');
  
  // Interactive DAG Nodes
  const [dagNodes, setDagNodes] = useState<WorkflowNode[]>([
    { id: 1, name: 'Intake Trigger Agent', role: 'Event Listener & Webhook', status: 'idle', logs: 'Listening to incoming events...' },
    { id: 2, name: 'Context Vector Search', role: 'Knowledge Base Retrieval', status: 'idle', logs: 'Querying Firestore embeddings...' },
    { id: 3, name: 'Gemini Reasoning Agent', role: 'LLM Processing Engine', status: 'idle', logs: 'Synthesizing resolution strategy...' },
    { id: 4, name: 'Action Dispatcher', role: 'API Execution & Notification', status: 'idle', logs: 'Sending automated dispatch...' },
  ]);
  const [isRunningSim, setIsRunningSim] = useState(false);

  const handleGenerateWorkflow = async () => {
    if (!goal.trim()) return;

    setLoading(true);
    try {
      const data = await safeFetchJson('/api/workflow', {
        method: 'POST',
        body: JSON.stringify({ goal, industry }),
      });

      setWorkflowPlan(data.plan);
      // Reset DAG nodes to ready state
      setDagNodes([
        { id: 1, name: 'Trigger & Data Intake', role: 'Agent Node 1', status: 'idle', logs: 'Intake validated.' },
        { id: 2, name: 'Semantic Context Search', role: 'Agent Node 2', status: 'idle', logs: 'RAG context loaded.' },
        { id: 3, name: 'Gemini 3.6 Flash Decision', role: 'Agent Node 3', status: 'idle', logs: 'Decision graph synthesized.' },
        { id: 4, name: 'Response & Guardrail Dispatch', role: 'Agent Node 4', status: 'idle', logs: 'Safety check passed & dispatched.' },
      ]);
    } catch (err: any) {
      alert(`Workflow Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    if (isRunningSim) return;
    setIsRunningSim(true);

    // Reset all nodes to idle
    setDagNodes((prev) => prev.map((n) => ({ ...n, status: 'idle' })));

    for (let i = 0; i < dagNodes.length; i++) {
      // Mark running
      setDagNodes((prev) =>
        prev.map((n, idx) => (idx === i ? { ...n, status: 'running' } : n))
      );
      await new Promise((r) => setTimeout(r, 900));

      // Mark completed
      setDagNodes((prev) =>
        prev.map((n, idx) => (idx === i ? { ...n, status: 'completed' } : n))
      );
    }
    setIsRunningSim(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
          <Workflow className="w-6 h-6 text-amber-400" />
          <span>{isTamil ? 'தானியங்கி வொர்க்ஃப்ளோ & ஏஜென்ட் ஸ்டுடியோ' : 'Swatea Autonomous Agent & Workflow Studio'}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isTamil
            ? 'சிக்கலான நிறுவனப் பணிகளைத் தானியங்கி ஏஜென்ட் DAG சுழற்சிகளாக மாற்றுங்கள்.'
            : 'Design multi-step autonomous agent execution graphs (DAGs) for automated enterprise processes.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Inputs */}
        <div className="space-y-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
              {isTamil ? 'ஏஜென்ட்டின் முக்கிய இலக்கு (Goal):' : 'Autonomous Goal Description:'}
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
              {isTamil ? 'நிறுவனத் துறை (Domain):' : 'Industry Domain:'}
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <button
            onClick={handleGenerateWorkflow}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>
              {loading
                ? (isTamil ? 'வொர்க்ஃப்ளோ திட்டமிடுகிறது...' : 'Generating Agent DAG Plan...')
                : (isTamil ? 'ஏஜென்ட் திட்டம் உருவாக்கு' : 'Build Autonomous Workflow DAG')}
            </span>
          </button>
        </div>

        {/* Right Plan & DAG Execution Simulator */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>{isTamil ? 'ஏஜென்ட் வொர்க்ஃப்ளோ திட்டம்' : 'Agent DAG Execution Architecture'}</span>
            </span>
            <button
              onClick={handleRunSimulation}
              disabled={isRunningSim || !workflowPlan}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-[11px] rounded-lg font-mono flex items-center gap-1 transition-all"
            >
              {isRunningSim ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-slate-950" />}
              <span>{isRunningSim ? 'Running...' : 'Run Simulation'}</span>
            </button>
          </div>

          {/* Interactive DAG Nodes Flow */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              {isTamil ? 'ஏஜென்ட் முனைகள் (Active DAG Nodes):' : 'Autonomous Agent Graph Nodes:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dagNodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-2.5 rounded-lg border transition-all ${
                    node.status === 'running'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 animate-pulse'
                      : node.status === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>{node.name}</span>
                    {node.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : node.status === 'running' ? (
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 truncate mt-0.5">{node.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Text Output Plan */}
          <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans overflow-y-auto max-h-[260px]">
            {workflowPlan || (
              <span className="text-slate-600 italic">
                {isTamil
                  ? 'ஏஜென்ட் படிநிலைகள் இங்கு தோன்றும்.'
                  : 'Detailed multi-step agent triggers, tool definitions, inputs/outputs, and risk controls will be presented here.'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
