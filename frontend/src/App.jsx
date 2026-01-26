import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, ArrowRight, Code, Shield, FileText } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import LiveSession from './components/LiveSession';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import AICoach from './components/AICoach';
import { PlaceholderPage } from './components/Placeholders';
import { Login, Signup } from './components/Auth';

const MainLayout = ({ token, setToken }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [sessionForm, setSessionForm] = useState({ name: '', class_name: '', instructor: '' });

  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };

  const createSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/sessions/create', sessionForm);
      setActiveSession(res.data);
      setView('session');
    } catch (error) { alert("Backend Error"); }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar view={view} setView={setView} handleLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 h-screen overflow-y-auto flex flex-col">
        
        <div className="p-8 flex-1">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {view === 'dashboard' && 'Dashboard Overview'}
                {view === 'session' && 'Live Monitor'}
                {view === 'analytics' && 'Deep Analytics'}
                {view === 'assistant' && 'AI Pedagogical Coach'}
                {view === 'history' && 'Session Archive'}
                {view === 'settings' && 'System Configuration'}
              </h2>
              <p className="text-slate-500 text-sm">Real-time Emotion Analysis Engine</p>
            </div>
            {activeSession && (
               <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{activeSession.class_name}</span>
               </div>
            )}
          </header>

          {/* Dynamic Content Views */}
          {!activeSession ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="dashboard-card p-12 max-w-lg w-full text-center bg-white">
                 <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 border border-indigo-100">
                    <Sparkles size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-2">Initialize Session</h2>
                 <p className="text-slate-500 mb-8">Configure the neural network parameters to begin class monitoring.</p>
                 
                 <form onSubmit={createSession} className="space-y-4 text-left">
                    <input className="input-field" placeholder="Session Name" onChange={e => setSessionForm({...sessionForm, name: e.target.value})} required />
                    <input className="input-field" placeholder="Class Code" onChange={e => setSessionForm({...sessionForm, class_name: e.target.value})} required />
                    <input className="input-field" placeholder="Instructor Name" onChange={e => setSessionForm({...sessionForm, instructor: e.target.value})} required />
                    <button disabled={loading} className="w-full btn-primary mt-4">
                      {loading ? 'Booting System...' : 'Launch Monitor'} <ArrowRight size={18} />
                    </button>
                 </form>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up min-h-[60vh]">
              {view === 'dashboard' && <Dashboard sessionId={activeSession.id} />}
              {view === 'session' && <LiveSession sessionId={activeSession.id} />}
              {view === 'analytics' && <Analytics sessionId={activeSession.id} />}
              {view === 'assistant' && <AICoach sessionId={activeSession.id} />}
              {view === 'history' && <PlaceholderPage title="Session History" />}
              {view === 'settings' && <PlaceholderPage title="Global Settings" />}
            </div>
          )}
        </div>

        {/* --- PROFESSIONAL FOOTER --- */}
        <footer className="mt-auto border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Left: Project Identity */}
                <div className="text-center md:text-left">
                    <h3 className="text-sm font-bold text-slate-900">
                        Analyzing Student Behavior
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        AI-Based Classroom Analytics System
                    </p>
                </div>

                {/* Center: Developer Credit */}
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Developed by</span>
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                        Kashif Ullah <Code size={12} />
                    </span>
                </div>

                {/* Right: Meta Links */}
                <div className="text-center md:text-right">
                    <p className="text-[10px] text-slate-400">
                        © {new Date().getFullYear()} Final Year Project
                    </p>
                    <div className="flex gap-4 justify-center md:justify-end mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
                            <Shield size={10} /> Privacy Policy
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
                            <FileText size={10} /> Documentation
                        </span>
                    </div>
                </div>

            </div>
        </footer>

      </div>
    </div>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  return (
    <Router>
      <Routes>
        <Route path="/" element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={token ? <MainLayout token={token} setToken={setToken} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;