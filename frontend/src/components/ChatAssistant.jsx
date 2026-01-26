import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Bot, X, Sparkles } from 'lucide-react';

const ChatAssistant = ({ sessionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am monitoring the class emotions. Ask me for insights!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`http://localhost:8000/sessions/${sessionId}/chat`, {
        question: userMsg
      });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end font-sans">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="glass-panel w-80 sm:w-96 h-[500px] rounded-3xl flex flex-col mb-4 overflow-hidden animate-fade-in-up border border-white/20 shadow-2xl">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bot size={18} />
              </div>
              <div>
                <span className="font-bold text-sm block">AI Coach</span>
                <span className="text-[10px] opacity-80 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X size={18} />
            </button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-black/20 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                        m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-tl-none'
                    }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 ml-2">
                    <Sparkles size={12} className="animate-spin" /> Thinking...
                </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 flex gap-2">
            <input 
              className="flex-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
              placeholder="Ask for advice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
                type="submit" 
                disabled={loading} 
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group border-2 border-white/20"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} className="group-hover:animate-bounce" />}
      </button>
    </div>
  );
};

export default ChatAssistant;