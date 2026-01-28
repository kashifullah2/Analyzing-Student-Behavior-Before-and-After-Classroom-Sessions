import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const AICoach = ({ sessionId }) => {
  // Initialize with a default welcome message, but we will merge history later
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // 1. LOAD CHAT HISTORY ON MOUNT
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get(`/sessions/${sessionId}/details`);
        const history = res.data.chat_history || [];

        if (history.length > 0) {
          // Convert backend format to frontend format if needed, or just use as is
          setMessages(history);
        } else {
          // Default Welcome if no history
          setMessages([{ role: 'bot', text: 'Hello! I am your AI Teaching Assistant. How can I help you improve engagement?' }]);
        }
      } catch (e) {
        console.error("Failed to load chat history");
      }
    };
    loadHistory();
  }, [sessionId]);

  // 2. AUTO SCROLL
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input;

    // Optimistic UI Update
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post(`/sessions/${sessionId}/chat`, { question: userText });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Service unavailable." }]);
    }
    setLoading(false);
  };
  return (
    <div className="flex flex-col h-[calc(80vh-140px)] dashboard-card overflow-hidden bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl">

      {/* Header */}
      <div className="bg-white/50 backdrop-blur-md border-b border-white/50 p-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-sm text-slate-700 font-bold">Llama-3 Online</p>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Ready to assist</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scroll bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-enter`}>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${m.role === 'user' ? 'bg-white border-slate-200' : 'bg-gradient-to-br from-indigo-600 to-violet-600 border-none'}`}>
              {m.role === 'user' ? <User size={18} className="text-slate-600" /> : <Sparkles size={18} className="text-white" />}
            </div>

            <div className={`max-w-[75%] p-6 rounded-3xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
              ? 'bg-white border border-slate-200 text-slate-700 rounded-tr-none'
              : 'bg-white/80 border border-white/50 backdrop-blur-md text-slate-800 rounded-tl-none shadow-indigo-500/5'
              }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-5 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="bg-white/80 border border-white/50 rounded-3xl rounded-tl-none px-6 py-4 text-slate-500 text-sm italic">
              Analyzing context...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white/60 backdrop-blur-xl border-t border-white/50">
        <form onSubmit={sendMessage} className="flex gap-4 relative">
          <input
            className="w-full bg-white border border-slate-200 rounded-2xl pl-6 pr-16 py-4 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm"
            placeholder="Ask for pedagogical advice based on live data..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button disabled={loading} className="absolute right-2 top-2 bottom-2 aspect-square btn-primary rounded-xl flex items-center justify-center !p-0 !py-0 shadow-md">
            <Send size={20} className={loading ? "opacity-50" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AICoach;