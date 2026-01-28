import React, { useState, useEffect } from 'react';
import MediaCapture from './MediaCapture';
import axios from 'axios';
import { API_URL } from '../config';
import { Activity, Users, Zap, AlertTriangle } from 'lucide-react';

const LiveSession = ({ sessionId }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/sessions/${sessionId}/report`);
        setMetrics(res.data.entry_stats);
      } catch (e) { }
    };
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!metrics) return <div className="p-20 text-center animate-pulse">Establishing Secure Link...</div>;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="dashboard-card p-6 border-l-4 border-l-green-500 flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">System Status</p>
          <p className="heading-xl flex items-center gap-3 mt-2">
            <Activity className="text-green-500 animate-pulse" size={24} /> <span className="text-lg">active</span>
          </p>
        </div>
        <div className="dashboard-card p-6 flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Est. Students</p>
          <p className="heading-xl flex items-center gap-3 mt-2">
            <Users className="text-blue-500" size={24} /> {metrics.attendance_est}
          </p>
        </div>
        <div className="dashboard-card p-6 flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Class Vibe</p>
          <p className="heading-xl flex items-center gap-3 mt-2">
            <Zap className="text-yellow-500" size={24} /> {metrics.vibe_score}<span className="text-lg text-slate-400">/10</span>
          </p>
        </div>
        <div className="dashboard-card p-6 flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Risk Level</p>
          <p className="heading-xl flex items-center gap-3 mt-2">
            <AlertTriangle className={metrics.at_risk_index > 20 ? "text-red-500" : "text-slate-300"} size={24} />
            {metrics.at_risk_index}%
          </p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
        <div className="dashboard-card p-1.5 relative bg-slate-900 border-none shadow-2xl shadow-indigo-500/10 overflow-hidden group">
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 text-xs rounded-full font-bold border border-white/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> ENTRY FEED
          </div>
          <MediaCapture sessionId={sessionId} type="entry" />
        </div>
        <div className="dashboard-card p-1.5 relative bg-slate-900 border-none shadow-2xl shadow-indigo-500/10 overflow-hidden group">
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 text-xs rounded-full font-bold border border-white/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> EXIT FEED
          </div>
          <MediaCapture sessionId={sessionId} type="exit" />
        </div>
      </div>
    </div>
  );
};

export default LiveSession;