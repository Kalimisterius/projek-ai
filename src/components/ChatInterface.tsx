import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, Paperclip, X } from 'lucide-react';
import { aiManager } from '../services/aiManager';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant', content: string, fileName?: string }[]>([
    { role: 'assistant', content: 'Halo, saya Manajer Tim AI. Ada yang bisa saya bantu hari ini?' }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [attachedFile, setAttachedFile] = React.useState<{ name: string, type: string, data: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) { // 20MB limit
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

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || loading) return;

    const userMsg = input.trim();
    const currentFile = attachedFile;
    
    setInput('');
    setAttachedFile(null);
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMsg || (currentFile ? `[Lampiran: ${currentFile.name}]` : ""),
      fileName: currentFile?.name 
    }]);
    setLoading(true);

    try {
      const fileData = currentFile ? { mimeType: currentFile.type, data: currentFile.data } : undefined;
      const response = await aiManager.coordinate(userMsg, fileData);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, saya mengalami kesalahan saat berkoordinasi dengan tim.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="h-20 px-8 border-b border-slate-200 bg-white flex items-center shadow-sm z-10">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900 leading-none">Saluran Koordinasi Keamanan</h2>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aktif</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-8 overflow-x-hidden max-w-5xl mx-auto w-full flex flex-col gap-8 text-sm">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div className={`p-2.5 rounded-xl h-fit mt-1 flex-shrink-0 shadow-sm border ${
                msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {msg.role === 'user' ? <User size={18} strokeWidth={2} /> : <Bot size={18} strokeWidth={2} />}
              </div>
              <div className={`p-5 rounded-2xl shadow-sm border ${
                msg.role === 'user' 
                ? 'bg-white text-slate-900 border-slate-200 rounded-tr-none' 
                : 'bg-white text-slate-700 border-indigo-100 rounded-tl-none markdown-body'}`}>
                {msg.role === 'assistant' ? (
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
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.content}</p>
                )}
                
                {msg.fileName && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase w-fit">
                    <Paperclip size={10} />
                    {msg.fileName}
                  </div>
                )}
                {msg.role === 'user' && (
                   <p className="text-[9px] uppercase font-bold text-slate-300 mt-2 text-right tracking-widest">Operator Masuk</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-4 self-start animate-pulse">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-5 bg-white border border-indigo-100 rounded-2xl rounded-tl-none text-slate-400 text-sm font-medium italic">
              Konsultasi dengan daftar agen khusus...
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {attachedFile && (
            <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="flex items-center gap-3">
                <Paperclip size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-indigo-900 truncate max-w-[300px]">{attachedFile.name}</span>
               </div>
               <button onClick={() => setAttachedFile(null)} className="p-1 hover:bg-indigo-100 rounded text-indigo-400">
                <X size={14} />
               </button>
            </div>
          )}
          <div className="flex gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,application/pdf,text/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
              title="Lampirkan File"
            >
              <Paperclip size={18} strokeWidth={2} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Berikan perintah delegasi tugas..."
              className="flex-1 bg-transparent px-2 py-2 focus:outline-none text-sm text-slate-700 font-medium placeholder:text-slate-300"
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !attachedFile) || loading}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-30 shadow-lg shadow-indigo-100 border border-indigo-700 transform active:scale-95"
            >
              <Send size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
