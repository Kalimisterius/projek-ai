import React from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Clock, CheckCircle2, XCircle, Loader2, Activity } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, onSelectTask }) => {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans">
      <div className="h-20 px-8 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-50 rounded-lg">
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase">Kontrol Misi</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Monitor Tugas Langsung v2.4.0</p>
          </div>
        </div>
        <div className="flex gap-10">
          <div className="flex flex-col items-end">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Tugas</p>
            <p className="text-xl font-bold text-slate-900">{tasks.length}</p>
          </div>
          <div className="flex flex-col items-end border-l border-slate-100 pl-10">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aktif</p>
            <p className="text-xl font-bold text-indigo-600">{tasks.filter(t => t.status === 'processing').length}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[60px_140px_1fr_120px_100px] p-4 bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <div className="pl-2">Ref.</div>
            <div>Kategori Agen</div>
            <div>Muatan Tugas</div>
            <div>Status</div>
            <div className="text-right pr-2">Waktu</div>
          </div>

          <AnimatePresence mode="popLayout">
            {tasks.slice().reverse().map((task, idx) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onSelectTask(task)}
                className="grid grid-cols-[60px_140px_1fr_120px_100px] p-4 border-b border-slate-100/60 hover:bg-slate-50 transition-colors cursor-pointer group items-center"
              >
                <div className="font-mono text-[11px] text-slate-300 group-hover:text-slate-500 pl-2">#{tasks.length - idx}</div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 rounded text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                    <Terminal className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-xs text-slate-700 truncate">{task.type.replace('_', ' ')}</span>
                </div>
                <div className="text-sm truncate pr-6 text-slate-500 group-hover:text-slate-900 transition-colors italic font-medium">{task.payload.prompt || JSON.stringify(task.payload)}</div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight">
                  {getStatusIcon(task.status)}
                  <span className={
                    task.status === 'completed' ? 'text-green-600' :
                    task.status === 'failed' ? 'text-red-600' :
                    task.status === 'processing' ? 'text-blue-600' : 'text-slate-400'
                  }>
                    {task.status}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-right text-slate-400 italic pr-2">
                  {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
                <Clock size={24} />
              </div>
              <p className="text-slate-400 text-sm font-medium italic">
                Sistem idle. Menunggu instruksi perintah berikutnya.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
