import React, { useState, useEffect } from 'react';
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

  // --- FIX 1: RESTORE SESSION ON REFRESH ---
  useEffect(() => {
    const savedSessionId = localStorage.getItem('activeSessionId');
    if (savedSessionId) {
      // If we have an ID, try to get data from backend
      axios.get(`http://localhost:8000/sessions/${savedSessionId}/details`)
        .then(res => {
          // Success! We found the session in memory.
          setActiveSession({
            id: savedSessionId,
            ...res.data.info
          });
          // Note: If you want to force stay on 'session' view:
          // setView('session');
        })
        .catch(err => {
          // Backend forgot the session (e.g., server restart). Clear frontend.
          console.warn("Session expired or server restarted.");
          localStorage.removeItem('activeSessionId');
          setActiveSession(null);
        });
    }
  }, []); // Run once on mount

  const handleLogout = () => { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('activeSessionId'); // Clear session
    setToken(null); 
  };

  // --- FIX 2: CREATE NEW SESSION BUTTON LOGIC ---
  const handleNewSession = () => {
    if (window.confirm("Start a new session? Current monitoring data will be archived.")) {
      setActiveSession(null);
      localStorage.removeItem('activeSessionId');
      setView('dashboard'); // Will show the "Initialize" form
      setSessionForm({ name: '', class_name: '', instructor: '' }); // Reset form
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/sessions/create', sessionForm);
      setActiveSession(res.data);
      
      // Save ID so it persists on refresh
      localStorage.setItem('activeSessionId', res.data.id);
      
      setView('session');
    } catch (error) { alert("Backend Error"); }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Sidebar now gets handleNewSession */}
      <Sidebar 
        view={view} 
        setView={setView} 
        handleLogout={handleLogout} 
        handleNewSession={handleNewSession} 
      />

      <div className="flex-1 ml-64 h-screen overflow-y-auto flex flex-col">
        
        <div className="p-8 flex-1">
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

          {!activeSession ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="dashboard-card p-12 max-w-lg w-full text-center bg-white">
                 <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 border border-indigo-100">
                    <Sparkles size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-2">Initialize Session</h2>
                 <p className="text-slate-500 mb-8">Configure the neural network parameters to begin class monitoring.</p>
                 
                 <form onSubmit={createSession} className="space-y-4 text-left">
                    <input className="input-field" placeholder="Session Name" value={sessionForm.name} onChange={e => setSessionForm({...sessionForm, name: e.target.value})} required />
                    <input className="input-field" placeholder="Class Code" value={sessionForm.class_name} onChange={e => setSessionForm({...sessionForm, class_name: e.target.value})} required />
                    <input className="input-field" placeholder="Instructor Name" value={sessionForm.instructor} onChange={e => setSessionForm({...sessionForm, instructor: e.target.value})} required />
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

        <footer className="mt-auto border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                    <h3 className="text-sm font-bold text-slate-900">
                        Analyzing Student Behavior
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        AI-Based Classroom Analytics System
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Engineered by</span>
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                        Kashif Ullah <Code size={12} />
                    </span>
                </div>

                <div className="text-center md:text-right">
                    <p className="text-[10px] text-slate-400">
                        © {new Date().getFullYear()} Final Year Project
                    </p>
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