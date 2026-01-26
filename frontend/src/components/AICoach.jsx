import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const AICoach = ({ sessionId }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello, Professor. I have analyzed the current session data. How can I assist you with the class engagement today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`http://localhost:8000/sessions/${sessionId}/chat`, { question: userText });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting to the neural core. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] dashboard-card overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-cyan-900/30 rounded-lg flex items-center justify-center text-cyan-400">
              <Bot size={24} />
           </div>
           <div>
              <h3 className="font-bold text-white">AI Pedagogical Coach</h3>
              <p className="text-xs text-slate-500">Powered by Llama-3-8b</p>
           </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-green-900/20 text-green-500 text-xs font-bold border border-green-900/30">
           ● Online
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 custom-scroll">
         {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
               
               {/* Avatar */}
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-700' : 'bg-cyan-700'}`}>
                  {m.role === 'user' ? <User size={16} className="text-white" /> : <Sparkles size={16} className="text-white" />}
               </div>

               {/* Bubble */}
               <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
               }`}>
                  {m.text}
               </div>
            </div>
         ))}
         {loading && (
             <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center shrink-0 animate-pulse">
                     <Bot size={16} className="text-white" />
                 </div>
                 <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none text-slate-500 text-sm">
                     Analyzing context...
                 </div>
             </div>
         )}
         <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
         <form onSubmit={sendMessage} className="flex gap-3">
            <input 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 text-white focus:border-cyan-500 outline-none transition-colors"
              placeholder="Ask about student engagement, teaching tips, or data interpretation..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button disabled={loading} className="btn-primary w-14 flex items-center justify-center">
               <Send size={20} />
            </button>
         </form>
      </div>

    </div>
  );
};

export default AICoach;