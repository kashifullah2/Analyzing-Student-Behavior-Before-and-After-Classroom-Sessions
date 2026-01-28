import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import { Sparkles, ArrowRight, Code } from 'lucide-react';

import Sidebar from './components/Sidebar';
import LiveSession from './components/LiveSession';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import AICoach from './components/AICoach';
import SessionHistory from './components/SessionHistory';
import Footer from './components/Footer';
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
      api.get(`/sessions/${savedId}/details`)
        .then(res => setActiveSession({ id: savedId, ...res.data.info }))
        .catch(() => localStorage.removeItem('activeSessionId'));
    }
  }, []);

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('activeSessionId'); setToken(null); };

  const handleNewSession = () => {
    if (window.confirm("Start new session? Current data will be saved.")) {
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
      const res = await api.post(`/sessions/create`, sessionForm);
      setActiveSession(res.data);
      localStorage.setItem('activeSessionId', res.data.id);
      setView('session');
    } catch (e) { alert("Error connecting to server"); }
    setLoading(false);
  };

  const handleRestoreSession = (session) => {
    setActiveSession(session);
    localStorage.setItem('activeSessionId', session.id);
    setView('dashboard');
  };



  return (
    <div className="flex min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-700 bg-blobs">
      <Sidebar view={view} setView={setView} handleLogout={handleLogout} handleNewSession={handleNewSession} />
      <div className="flex-1 ml-72 h-screen overflow-y-auto flex flex-col relative z-10 transition-colors duration-300">
        <div className="p-8 flex-1">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {view === 'dashboard' && 'Dashboard Overview'}
                {view === 'session' && 'Live Monitor'}
                {view === 'analytics' && 'Deep Analytics'}
                {view === 'assistant' && 'AI Assistant'}
                {view === 'history' && 'Session Archives'}
              </h2>
              <p className="text-slate-500 text-sm">Analyzing Student Behavior Before and After Classroom Sessions</p>
            </div>
          </header>

          {!activeSession ? (
            view === 'history' ? <SessionHistory onRestore={handleRestoreSession} /> : (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="dashboard-card p-12 max-w-lg w-full text-center bg-white">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                    <Sparkles size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Initialize Session</h2>
                  <form onSubmit={createSession} className="space-y-4 text-left">
                    <input className="input-field" placeholder="Session Name" value={sessionForm.name} onChange={e => setSessionForm({ ...sessionForm, name: e.target.value })} required />
                    <input className="input-field" placeholder="Class Code" value={sessionForm.class_name} onChange={e => setSessionForm({ ...sessionForm, class_name: e.target.value })} required />
                    <input className="input-field" placeholder="Instructor" value={sessionForm.instructor} onChange={e => setSessionForm({ ...sessionForm, instructor: e.target.value })} required />
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
              {view === 'history' && <SessionHistory onRestore={handleRestoreSession} />}
              {view === 'settings' && <PlaceholderPage title="Settings" />}
            </div>
          )}
        </div>
        <Footer />
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