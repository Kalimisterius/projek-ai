import React from 'react';
import { Task, Agent } from '../types';
import { motion } from 'motion/react';
import { User, Cpu, Shield, Database, TestTube, ArrowLeft, Terminal, AlertCircle, Paperclip, X, Palette } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AgentPanelProps {
  task: Task | null;
  agents: Agent[];
  onBack: () => void;
  onRunTask: (agentId: string, prompt: string, file?: { name: string, type: string, data: string }) => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ task, agents, onBack, onRunTask }) => {
  const [prompt, setPrompt] = React.useState('');
  const [selectedAgentId, setSelectedAgentId] = React.useState(agents[0]?.id || '');
  const [attachedFile, setAttachedFile] = React.useState<{ name: string, type: string, data: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("File terlalu besar. Maksimal 20MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(',')[1];
      setAttachedFile({
        name: file.name,
        type: file.type, 
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
  };

  const getAgentIcon = (role: string) => {
    if (role.includes("Software")) return <Cpu className="w-5 h-5" />;
    if (role.includes("QA")) return <TestTube className="w-5 h-5" />;
    if (role.includes("Security")) return <Shield className="w-5 h-5" />;
    if (role.includes("Database")) return <Database className="w-5 h-5" />;
    if (role.includes("Designer")) return <Palette className="w-5 h-5" />;
    return <User className="w-5 h-5" />;
  };

  return (
    <div className="flex h-full bg-slate-50 font-sans">
      {/* Sidebar: Agent List */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Daftar Agen</h2>
        </div>
        <div className="flex-1 overflow-auto py-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`w-full px-6 py-4 flex items-center gap-4 text-left transition-all relative group
                ${selectedAgentId === agent.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div className={`p-2 rounded-lg transition-colors shadow-sm
                ${selectedAgentId === agent.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200 group-hover:text-slate-600'}`}>
                {getAgentIcon(agent.role)}
              </div>
              <div className="min-w-0">
                <p className={`font-bold text-sm leading-tight transition-colors ${selectedAgentId === agent.id ? 'text-indigo-900' : 'text-slate-600'}`}>
                  {agent.name}
                </p>
                <p className={`text-[10px] font-bold uppercase mt-1 opacity-60 tracking-wider transition-colors ${selectedAgentId === agent.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {agent.role.split(' ')[0]}
                </p>
              </div>
              {selectedAgentId === agent.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-200" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        <div className="h-20 px-8 border-b border-slate-200 bg-white flex items-center gap-6 shadow-sm z-10">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <h2 className="font-bold uppercase tracking-tight text-slate-900">
              {task ? `ID Proses: ${task.id.slice(0, 8)}` : 'Protokol Deployment Agen'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {task ? 'Mode Inspeksi Sesi' : 'Konfigurasi Diperlukan'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 flex flex-col gap-8 max-w-5xl mx-auto w-full">
          {!task ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col gap-6"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                <div className="p-2.5 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 tracking-tight text-sm uppercase">Input Urutan</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Tentukan parameter untuk agen aktif.</p>
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Masukkan spesifikasi teknis atau tujuan dalam bahasa alami..."
                className="w-full h-48 p-6 font-mono text-sm border border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"
              />

              {attachedFile && (
                <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      <Paperclip size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-indigo-900 truncate max-w-[200px]">{attachedFile.name}</span>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{attachedFile.type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAttachedFile(null)}
                    className="p-1.5 hover:bg-indigo-100 rounded-md text-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-indigo-500" />
                     <span className="text-[11px] font-bold text-indigo-900 uppercase">Target: {agents.find(a => a.id === selectedAgentId)?.name}</span>
                   </div>
                   
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     className="hidden" 
                     accept="image/*,application/pdf,text/*"
                   />
                   
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all text-[11px] font-bold uppercase tracking-wider shadow-sm"
                   >
                     <Paperclip size={14} />
                     Lampirkan File
                   </button>
                 </div>

                 <button
                  disabled={!prompt || !selectedAgentId}
                  onClick={() => {
                    onRunTask(selectedAgentId, prompt, attachedFile || undefined);
                    setPrompt('');
                    setAttachedFile(null);
                  }}
                  className="bg-indigo-600 text-white px-10 py-3 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transform transition-all active:scale-95 shadow-lg shadow-indigo-100 border border-indigo-700"
                >
                  Inisiasi Tugas
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-8 h-full pb-8"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] mb-3">Definisi Tugas</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-sm text-slate-700 leading-relaxed">
                      {task.payload.prompt}
                    </div>
                    {task.payload.fileName && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 w-fit">
                        <Paperclip size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{task.payload.fileName}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-8 text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm border ${
                      task.status === 'completed' ? 'bg-green-50 text-green-600 border-green-200' :
                      task.status === 'failed' ? 'bg-red-50 text-red-600 border-red-200' :
                      'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center backdrop-blur-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Aliran Analitik Proses</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">{task.id}</span>
                </div>
                <div className="flex-1 overflow-auto p-8">
                  {task.status === 'processing' ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-6 text-slate-400">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                        <div className="absolute top-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <p className="font-bold text-sm tracking-widest text-slate-600 uppercase">Menghasilkan...</p>
                        <p className="font-mono text-[10px] opacity-60">Konsultasi dengan kluster jaringan saraf</p>
                      </div>
                    </div>
                  ) : task.status === 'failed' ? (
                    <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 flex gap-4 items-start">
                      <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-lg leading-none mb-2">Protokol Dibatalkan</h4>
                        <p className="font-mono text-sm leading-relaxed text-red-700/80 italic">{task.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="markdown-body max-w-none">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus as any}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {task.result?.content || ''}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
