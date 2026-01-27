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
      } catch (e) {}
    };
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!metrics) return <div className="p-20 text-center animate-pulse">Establishing Secure Link...</div>;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card p-4 border-l-4 border-l-green-500">
           <p className="text-muted text-xs font-bold uppercase">System Status</p>
           <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <Activity className="text-green-500 animate-pulse" size={20}/> Monitoring
           </p>
        </div>
        <div className="dashboard-card p-4">
           <p className="text-muted text-xs font-bold uppercase">Est. Students</p>
           <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <Users className="text-blue-500" size={20}/> {metrics.attendance_est}
           </p>
        </div>
        <div className="dashboard-card p-4">
           <p className="text-muted text-xs font-bold uppercase">Class Vibe</p>
           <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <Zap className="text-yellow-500" size={20}/> {metrics.vibe_score}/10
           </p>
        </div>
        <div className="dashboard-card p-4">
           <p className="text-muted text-xs font-bold uppercase">Risk Level</p>
           <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <AlertTriangle className={metrics.at_risk_index > 20 ? "text-red-500" : "text-slate-300"} size={20}/> 
             {metrics.at_risk_index}%
           </p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
        <div className="dashboard-card p-1 relative bg-slate-900">
           <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-2 py-1 text-xs rounded font-bold">ENTRY FEED</div>
           <MediaCapture sessionId={sessionId} type="entry" />
        </div>
        <div className="dashboard-card p-1 relative bg-slate-900">
           <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-2 py-1 text-xs rounded font-bold">EXIT FEED</div>
           <MediaCapture sessionId={sessionId} type="exit" />
        </div>
      </div>
    </div>
  );
};

export default LiveSession;