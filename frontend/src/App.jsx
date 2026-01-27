import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config';
import { Sparkles, ArrowRight, Code, GraduationCap } from 'lucide-react';

import Sidebar from './components/Sidebar';
import LiveSession from './components/LiveSession';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import AICoach from './components/AICoach';
import SessionHistory from './components/SessionHistory';
import { PlaceholderPage } from './components/Placeholders';
import { Login, Signup } from './components/Auth';

const MainLayout = ({ token, setToken }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [sessionForm, setSessionForm] = useState({ name: '', class_name: '', instructor: '' });

  useEffect(() => {
    const savedId = localStorage.getItem('activeSessionId');
    if (savedId) {
      axios.get(`${API_URL}/sessions/${savedId}/details`)
        .then(res => setActiveSession({ id: savedId, ...res.data.info }))
        .catch(() => localStorage.removeItem('activeSessionId'));
    }
  }, []);

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('activeSessionId'); setToken(null); };

  const handleNewSession = () => {
    if (window.confirm("Start new session? Current data will be saved to History.")) {
      setActiveSession(null);
      localStorage.removeItem('activeSessionId');
      setView('dashboard');
      setSessionForm({ name: '', class_name: '', instructor: '' });
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/sessions/create`, sessionForm);
      setActiveSession(res.data);
      localStorage.setItem('activeSessionId', res.data.id);
      setView('session');
    } catch (e) { alert("Error creating session"); }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar view={view} setView={setView} handleLogout={handleLogout} handleNewSession={handleNewSession} />
      <div className="flex-1 ml-64 h-screen overflow-y-auto flex flex-col">
        <div className="p-8 flex-1">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {view === 'dashboard' && 'Dashboard Overview'}
                {view === 'session' && 'Live Monitor'}
                {view === 'analytics' && 'Deep Analytics'}
                {view === 'assistant' && 'AI Pedagogical Coach'}
                {view === 'history' && 'Session Archives'}
              </h2>
              <p className="text-slate-500 text-sm">Analyzing Student Behavior Before and After Classroom Sessions</p>
            </div>
            {activeSession && (
               <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-700 uppercase">{activeSession.class_name}</span>
               </div>
            )}
          </header>

          {!activeSession ? (
             view === 'history' ? <SessionHistory /> : (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="dashboard-card p-12 max-w-lg w-full text-center bg-white">
                 <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                    <Sparkles size={32} />
                 </div>
                 <h2 className="text-2xl font-bold mb-2">Initialize Session</h2>
                 <form onSubmit={createSession} className="space-y-4 text-left">
                    <input className="input-field" placeholder="Session Name" value={sessionForm.name} onChange={e => setSessionForm({...sessionForm, name: e.target.value})} required />
                    <input className="input-field" placeholder="Class Code" value={sessionForm.class_name} onChange={e => setSessionForm({...sessionForm, class_name: e.target.value})} required />
                    <input className="input-field" placeholder="Instructor" value={sessionForm.instructor} onChange={e => setSessionForm({...sessionForm, instructor: e.target.value})} required />
                    <button disabled={loading} className="w-full btn-primary mt-4">
                      {loading ? 'Booting...' : 'Launch Monitor'} <ArrowRight size={18} />
                    </button>
                 </form>
              </div>
            </div>
          )) : (
            <div className="animate-fade-in-up">
              {view === 'dashboard' && <Dashboard sessionId={activeSession.id} />}
              {view === 'session' && <LiveSession sessionId={activeSession.id} />}
              {view === 'analytics' && <Analytics sessionId={activeSession.id} />}
              {view === 'assistant' && <AICoach sessionId={activeSession.id} />}
              {view === 'history' && <SessionHistory />}
              {view === 'settings' && <PlaceholderPage title="Settings" />}
            </div>
          )}
        </div>

        <footer className="mt-auto border-t border-slate-200 bg-white py-6">
            <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Analyzing Student Behavior</h3>
                    <p className="text-xs text-slate-500">Before and After Classroom Sessions</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Engineered by</span>
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">Kashif Ullah <Code size={12}/></span>
                </div>
                <p className="text-[10px] text-slate-400">© {new Date().getFullYear()} Final Year Project</p>
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