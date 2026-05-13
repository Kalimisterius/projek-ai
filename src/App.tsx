import React from 'react';
import { Dashboard } from './components/Dashboard';
import { AgentPanel } from './components/AgentPanel';
import { ChatInterface } from './components/ChatInterface';
import { Task, Agent } from './types';
import { Sidebar, LayoutDashboard, Users, MessageSquare, Settings, Activity } from 'lucide-react';
import { aiManager } from './services/aiManager';

export default function App() {
  const [activeTab, setActiveTab] = React.useState<'dashboard'|'agents'|'chat'>('dashboard');
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  React.useEffect(() => {
    // Initial agents from aiManager
    setAgents(aiManager.getAgents());

    // Load persisted tasks
    const savedTasks = localStorage.getItem('ai_team_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    }
  }, []);

  React.useEffect(() => {
    // Persist tasks on change
    localStorage.setItem('ai_team_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const runTask = async (agentId: string, prompt: string, file?: { name: string, type: string, data: string }) => {
    const taskId = Math.random().toString(36).substring(7);
    const newTask: Task = {
      id: taskId,
      type: 'AGENT_PROMPT',
      payload: { agentId, prompt, fileName: file?.name },
      status: 'processing',
      createdAt: Date.now()
    };

    setTasks(prev => [...prev, newTask]);
    setSelectedTask(newTask);

    try {
      const fileData = file ? { mimeType: file.type, data: file.data } : undefined;
      const result = await aiManager.runTask(agentId, prompt, fileData);
      
      const completedTask: Task = {
        ...newTask,
        status: 'completed',
        result: { content: result }
      };

      setTasks(prev => prev.map(t => t.id === taskId ? completedTask : t));
      setSelectedTask(completedTask);
    } catch (err) {
      const failedTask: Task = {
        ...newTask,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err)
      };
      setTasks(prev => prev.map(t => t.id === taskId ? failedTask : t));
      setSelectedTask(failedTask);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Rail */}
      <div className="w-18 border-r border-slate-200 flex flex-col items-center py-6 gap-6 bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.05)] z-20">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
            <Activity className="text-white w-5 h-5" />
          </div>
        </div>
        
        <button 
          onClick={() => { setActiveTab('dashboard'); setSelectedTask(null); }}
          className={`p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          title="Panel Kontrol"
        >
          <LayoutDashboard size={22} strokeWidth={2} />
        </button>

        <button 
          onClick={() => { setActiveTab('agents'); setSelectedTask(null); }}
          className={`p-3 rounded-xl transition-all ${activeTab === 'agents' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          title="Daftar Agen"
        >
          <Users size={22} strokeWidth={2} />
        </button>

        <button 
          onClick={() => setActiveTab('chat')}
          className={`p-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          title="Obrolan Tim"
        >
          <MessageSquare size={22} strokeWidth={2} />
        </button>

        <div className="mt-auto p-3 text-slate-300 hover:text-slate-500 cursor-help transition-colors">
          <Settings size={22} strokeWidth={2} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-4 right-6 z-50 pointer-events-none">
          <span className="flex items-center gap-2 bg-white border border-slate-200/60 rounded-full px-3 py-1 text-[10px] font-bold text-slate-500 shadow-sm backdrop-blur-sm bg-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            ORKESTRATOR_AKTIF
          </span>
        </div>

        {activeTab === 'dashboard' && (
          <Dashboard 
            tasks={tasks} 
            onSelectTask={(task) => {
              setSelectedTask(task);
              setActiveTab('agents');
            }} 
          />
        )}

        {activeTab === 'agents' && (
          <AgentPanel 
            task={selectedTask} 
            agents={agents} 
            onBack={() => {
              if (selectedTask) setSelectedTask(null);
              else setActiveTab('dashboard');
            }}
            onRunTask={runTask}
          />
        )}

        {activeTab === 'chat' && <ChatInterface />}
      </div>
    </div>
  );
}
