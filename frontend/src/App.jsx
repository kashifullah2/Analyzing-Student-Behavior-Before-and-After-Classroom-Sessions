import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, ArrowRight } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import LiveSession from './components/LiveSession';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import AICoach from './components/AICoach'; // New Full Page
import { PlaceholderPage } from './components/Placeholders'; // New
import { Login, Signup } from './components/Auth';

const MainLayout = ({ token, setToken }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [sessionForm, setSessionForm] = useState({ name: '', class_name: '', instructor: '' });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

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
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar view={view} setView={setView} handleLogout={handleLogout} />

      <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        
        {/* Dynamic Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
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
             <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">{activeSession.class_name}</span>
             </div>
          )}
        </header>

        {/* Content Area */}
        {!activeSession ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="dashboard-card p-12 max-w-lg w-full text-center">
               <div className="w-16 h-16 bg-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-cyan-400">
                  <Sparkles size={32} />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Initialize Session</h2>
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
          <div className="animate-fade-in-up">
            {view === 'dashboard' && <Dashboard sessionId={activeSession.id} />}
            {view === 'session' && <LiveSession sessionId={activeSession.id} />}
            {view === 'analytics' && <Analytics sessionId={activeSession.id} />}
            {view === 'assistant' && <AICoach sessionId={activeSession.id} />}
            
            {/* Placeholders for new buttons */}
            {view === 'history' && <PlaceholderPage title="Session History" />}
            {view === 'settings' && <PlaceholderPage title="Global Settings" />}
          </div>
        )}
      </div>
    </div>
  );
};

// ... Router Wrapper (Same as before) ...
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