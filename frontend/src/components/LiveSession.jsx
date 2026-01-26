import React, { useState, useEffect } from 'react';
import MediaCapture from './MediaCapture';
import axios from 'axios';
import { Users, Zap, AlertTriangle, Eye, Activity, Flag, MessageSquare } from 'lucide-react';

const LiveSession = ({ sessionId }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/sessions/${sessionId}/report`);
        setMetrics(res.data.entry_stats);
      } catch (e) {}
    };
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!metrics) return <div className="p-20 text-center text-slate-400 animate-pulse">Connecting to Secure Feed...</div>;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Metrics - Light Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Status */}
        <div className="dashboard-card p-4 flex items-center gap-4 border-l-4 border-l-green-500">
           <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <Activity size={24} />
           </div>
           <div>
              <p className="text-muted text-xs uppercase font-bold">System State</p>
              <p className="text-slate-900 font-bold text-lg">Active</p>
           </div>
        </div>

        {/* Attendance */}
        <div className="dashboard-card p-4 flex items-center gap-4">
           <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Users size={24} />
           </div>
           <div>
              <p className="text-muted text-xs uppercase font-bold">Est. Attendance</p>
              <p className="text-slate-900 font-bold text-lg">{metrics.attendance_est} Students</p>
           </div>
        </div>

        {/* Vibe */}
        <div className="dashboard-card p-4 flex items-center gap-4">
           <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
              <Zap size={24} />
           </div>
           <div>
              <p className="text-muted text-xs uppercase font-bold">Energy Score</p>
              <p className="text-slate-900 font-bold text-lg">{metrics.vibe_score} / 10</p>
           </div>
        </div>

        {/* Alert Status */}
        <div className="dashboard-card p-4 flex items-center gap-4">
           <div className={`p-3 rounded-lg ${metrics.at_risk_index > 20 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle size={24} />
           </div>
           <div>
              <p className="text-muted text-xs uppercase font-bold">Risk Level</p>
              <p className="text-slate-900 font-bold text-lg">{metrics.at_risk_index > 20 ? 'High' : 'Normal'}</p>
           </div>
        </div>
      </div>

      {/* 2. Video Grid - Keeps video dark for contrast, but container is white */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
        {/* Entry Cam */}
        <div className="dashboard-card p-2 relative bg-white">
           <div className="absolute top-5 left-5 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded shadow-sm text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ENTRY FEED
           </div>
           <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden relative border border-slate-100">
              <MediaCapture sessionId={sessionId} type="entry" />
           </div>
        </div>

        {/* Exit Cam */}
        <div className="dashboard-card p-2 relative bg-white">
           <div className="absolute top-5 left-5 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded shadow-sm text-xs font-bold text-slate-800 flex items-center gap-2 border border-slate-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> EXIT FEED
           </div>
           <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden relative border border-slate-100">
              <MediaCapture sessionId={sessionId} type="exit" />
           </div>
        </div>
      </div>

      {/* 3. Action Bar */}
      <div className="dashboard-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                <Eye size={20} />
             </div>
             <div>
                <h4 className="font-bold text-slate-900">Live Analysis Engine</h4>
                <p className="text-muted">Processing frame data via TensorFlow Backend...</p>
             </div>
          </div>
          <div className="flex gap-3">
             <button className="btn-ghost text-xs"><Flag size={14}/> Flag Event</button>
             <button className="btn-ghost text-xs"><MessageSquare size={14}/> Log Note</button>
          </div>
      </div>

    </div>
  );
};

export default LiveSession;