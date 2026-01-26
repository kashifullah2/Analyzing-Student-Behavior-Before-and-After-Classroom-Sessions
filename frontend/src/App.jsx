import React, { useState } from 'react';
import axios from 'axios';
import { Activity, BookOpen, User, Video, ShieldCheck, BarChart2, LayoutDashboard } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MediaCapture from './components/MediaCapture';
import Analytics from './components/Analytics'; // <--- IMPORT NEW PAGE

function App() {
  const [sessionData, setSessionData] = useState({ name: '', class_name: '', instructor: '' });
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'analytics'

  const handleInputChange = (e) => setSessionData({ ...sessionData, [e.target.name]: e.target.value });

  const createSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/sessions/create', sessionData);
      setActiveSession(response.data);
    } catch (error) { alert("Backend connection failed."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">Analyzing Student Behavior Before and After Classroom Sessions</h1>
              <p className="text-xs text-slate-500">AI-Based System</p>
            </div>
          </div>
          
          {/* NAVIGATION BUTTONS */}
          {activeSession && (
            <div className="flex space-x-2">
                <button 
                  onClick={() => setView('dashboard')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </button>
                <button 
                  onClick={() => setView('analytics')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'analytics' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <BarChart2 className="w-4 h-4 mr-2" /> Analytics
                </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!activeSession ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            {/* ... (Keep existing form code exactly the same) ... */}
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
              <div className="bg-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">New Session</h2>
                <p className="text-indigo-100 mt-1">Initialize analysis for a new class.</p>
              </div>
              <form onSubmit={createSession} className="p-8 space-y-6">
                <div><label className="block text-sm font-semibold text-slate-700 mb-1">Session Title</label><input type="text" name="name" required className="modern-input" value={sessionData.name} onChange={handleInputChange} /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-1">Class</label><input type="text" name="class_name" required className="modern-input" value={sessionData.class_name} onChange={handleInputChange} /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-1">Instructor</label><input type="text" name="instructor" required className="modern-input" value={sessionData.instructor} onChange={handleInputChange} /></div>
                <button type="submit" disabled={loading} className="w-full btn-gradient py-3 rounded-xl">{loading ? 'Starting...' : 'Start Session'}</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {/* VIEW SWITCHER LOGIC */}
            {view === 'dashboard' ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Entry Gate</h2>
                            <MediaCapture sessionId={activeSession.id} type="entry" />
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Exit Gate</h2>
                            <MediaCapture sessionId={activeSession.id} type="exit" />
                        </div>
                    </div>
                    <div className="mt-8"><Dashboard sessionId={activeSession.id} /></div>
                </>
            ) : (
                <Analytics sessionId={activeSession.id} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;