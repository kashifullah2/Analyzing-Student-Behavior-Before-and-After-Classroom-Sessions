import React, { useState, useEffect, useRef } from 'react';
import MediaCapture from './MediaCapture';
import axios from 'axios';
import { 
  Activity, Users, Zap, AlertTriangle, 
  Terminal, Play, Maximize, MoreHorizontal,
  BrainCircuit, Flag, MessageSquare
} from 'lucide-react';

const LiveSession = ({ sessionId }) => {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]); // System Logs

  // 1. Fetch Metrics
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/sessions/${sessionId}/report`);
        setMetrics(res.data.entry_stats);
        
        // Simulating "System Logs" based on data changes
        const score = res.data.entry_stats.vibe_score;
        if (score > 8) addLog("Engagement spike detected", "success");
        if (score < 4) addLog("Engagement dropping below threshold", "warning");
        if (res.data.entry_stats.at_risk_index > 20) addLog("Negative emotion cluster identified", "error");

      } catch (e) {}
    };
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // 2. Log Helper
  const addLog = (message, type = "info") => {
    setLogs(prev => {
      // Keep last 6 logs only
      const newLogs = [{ id: Date.now(), time: new Date().toLocaleTimeString(), message, type }, ...prev];
      return newLogs.slice(0, 6);
    });
  };

  // 3. Annotation Handler
  const handleAction = (action) => {
    addLog(`Instructor Action: ${action}`, "info");
    // In real app: axios.post(...)
  };

  if (!metrics) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
        <Activity className="animate-spin text-cyan-500" size={40} />
        <p className="font-mono text-sm">ESTABLISHING SECURE CONNECTION...</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      
      {/* LEFT COLUMN: VIDEO FEEDS (Flexible Width) */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Feed Header */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="text-white font-bold tracking-tight">LIVE MONITORING</h3>
              <span className="text-slate-600 text-xs font-mono ml-2">CAM-01 / CAM-02</span>
           </div>
           <div className="flex gap-2">
              <button className="btn-ghost text-xs py-1 px-3 border border-slate-800"><Maximize size={14} /> Fullscreen</button>
           </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0">
            {/* Feed 1 */}
            <div className="dashboard-card relative overflow-hidden group bg-black flex flex-col">
                <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                   <span className="text-cyan-400 font-mono text-xs font-bold tracking-widest border border-cyan-500/30 px-2 py-1 rounded bg-cyan-950/30">ENTRY FEED</span>
                   <Activity size={16} className="text-green-500" />
                </div>
                {/* Crosshair Overlay */}
                <div className="absolute inset-0 border border-slate-800/0 group-hover:border-slate-800/50 transition-colors pointer-events-none z-0 m-4 rounded opacity-50">
                    <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-500"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-500"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500"></div>
                </div>
                <div className="flex-1 relative">
                    <MediaCapture sessionId={sessionId} type="entry" />
                </div>
            </div>

            {/* Feed 2 */}
            <div className="dashboard-card relative overflow-hidden group bg-black flex flex-col">
                <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                   <span className="text-purple-400 font-mono text-xs font-bold tracking-widest border border-purple-500/30 px-2 py-1 rounded bg-purple-950/30">EXIT FEED</span>
                   <Activity size={16} className="text-green-500" />
                </div>
                <div className="flex-1 relative">
                    <MediaCapture sessionId={sessionId} type="exit" />
                </div>
            </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="dashboard-card p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase px-2">Quick Actions</span>
            <div className="flex gap-2">
                <button onClick={() => handleAction('Topic Switch')} className="btn-ghost bg-slate-900 text-xs py-1.5 hover:bg-cyan-900/20 hover:text-cyan-400 border border-slate-800">
                    <Flag size={14} /> Topic Switch
                </button>
                <button onClick={() => handleAction('Q&A Start')} className="btn-ghost bg-slate-900 text-xs py-1.5 hover:bg-purple-900/20 hover:text-purple-400 border border-slate-800">
                    <MessageSquare size={14} /> Start Q&A
                </button>
                <button onClick={() => handleAction('Intervention')} className="btn-ghost bg-slate-900 text-xs py-1.5 hover:bg-yellow-900/20 hover:text-yellow-400 border border-slate-800">
                    <Zap size={14} /> Intervention
                </button>
            </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ANALYTICS SIDEBAR (Fixed Width) */}
      <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto">
         
         {/* 1. Main Score Card */}
         <div className="dashboard-card p-5 bg-gradient-to-br from-slate-900 to-slate-900 border-t-4 border-t-cyan-500">
             <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Engagement Vibe</h4>
                    <h2 className="text-4xl font-bold text-white mt-1">{metrics.vibe_score}<span className="text-lg text-slate-600 font-medium">/10</span></h2>
                </div>
                <div className="p-2 bg-cyan-950 rounded-lg text-cyan-400">
                    <Zap size={20} />
                </div>
             </div>
             {/* Progress Bar */}
             <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-500 transition-all duration-1000" style={{width: `${metrics.vibe_score * 10}%`}}></div>
             </div>
             <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                <Activity size={12} /> Updating in real-time
             </p>
         </div>

         {/* 2. Secondary Metrics */}
         <div className="grid grid-cols-2 gap-3">
             <div className="dashboard-card p-3 text-center">
                 <Users size={20} className="mx-auto text-slate-500 mb-2" />
                 <h3 className="text-xl font-bold text-white">{metrics.attendance_est}</h3>
                 <p className="text-[10px] text-slate-500 uppercase">Attendance</p>
             </div>
             <div className="dashboard-card p-3 text-center">
                 <AlertTriangle size={20} className={`mx-auto mb-2 ${metrics.at_risk_index > 15 ? 'text-red-500' : 'text-slate-500'}`} />
                 <h3 className={`text-xl font-bold ${metrics.at_risk_index > 15 ? 'text-red-500' : 'text-white'}`}>{metrics.at_risk_index}%</h3>
                 <p className="text-[10px] text-slate-500 uppercase">Risk Index</p>
             </div>
         </div>

         {/* 3. Confusion & Boredom List */}
         <div className="dashboard-card p-4 space-y-4">
             <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Confusion Level</span>
                    <span className="text-white font-mono">{metrics.confusion_index}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full">
                    <div className="h-full bg-orange-500 transition-all" style={{width: `${metrics.confusion_index}%`}}></div>
                </div>
             </div>
             <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Boredom Level</span>
                    <span className="text-white font-mono">{metrics.boredom_meter}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full">
                    <div className="h-full bg-purple-500 transition-all" style={{width: `${metrics.boredom_meter}%`}}></div>
                </div>
             </div>
         </div>

         {/* 4. Live System Logs */}
         <div className="dashboard-card flex-1 flex flex-col min-h-[200px]">
             <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                 <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                     <Terminal size={12} /> System Log
                 </span>
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
             </div>
             <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scroll max-h-[200px]">
                 {logs.length === 0 && <p className="text-xs text-slate-600 p-2 italic">Waiting for events...</p>}
                 {logs.map(log => (
                     <div key={log.id} className="text-[10px] p-2 rounded bg-slate-900 border border-slate-800/50 hover:border-slate-700 transition-colors">
                         <span className="text-slate-500 font-mono mr-2">[{log.time}]</span>
                         <span className={`${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-cyan-200'}`}>
                             {log.message}
                         </span>
                     </div>
                 ))}
             </div>
         </div>

      </div>
    </div>
  );
};

export default LiveSession;