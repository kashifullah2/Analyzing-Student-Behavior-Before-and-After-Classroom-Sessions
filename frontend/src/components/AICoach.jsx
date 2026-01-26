import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const AICoach = ({ sessionId }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your AI Teaching Assistant. I have access to the current class metrics. How can I help you improve engagement?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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
      setMessages(prev => [...prev, { role: 'bot', text: "Service unavailable." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] dashboard-card overflow-hidden bg-white">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Bot size={24} />
           </div>
           <div>
              <h3 className="font-bold text-slate-900">AI Pedagogical Coach</h3>
              <p className="text-xs text-slate-500">Llama-3 Model • Active</p>
           </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 custom-scroll">
         {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
               
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-white border-slate-200' : 'bg-indigo-600 border-indigo-600'}`}>
                  {m.role === 'user' ? <User size={16} className="text-slate-600" /> : <Sparkles size={16} className="text-white" />}
               </div>

               <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
               }`}>
                  {m.text}
               </div>
            </div>
         ))}
         {loading && (
             <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 animate-pulse">
                     <Bot size={16} className="text-white" />
                 </div>
                 <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none text-slate-500 text-sm italic">
                     Thinking...
                 </div>
             </div>
         )}
         <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
         <form onSubmit={sendMessage} className="flex gap-3">
            <input 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
              placeholder="Ask for advice..."
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