import React, { useState, useEffect, useRef } from 'react';
import MediaCapture from './MediaCapture';
import api from '../api';
import { Activity, Users, Zap, AlertTriangle, LogIn, LogOut } from 'lucide-react';

const LiveSession = ({ sessionId }) => {
  const [data, setData] = useState(null);
  // ─── BUG FIX #6: isFetchingRef prevents overlapping poll requests ─────────────
  const isFetchingRef = useRef(false);

  useEffect(() => {
    let interval;

    // ─── BUG FIX #6: renamed from `fetch` to avoid shadowing the global fetch API ─
    const fetchMetrics = async () => {
      if (isFetchingRef.current) return; // skip if previous request still in-flight
      isFetchingRef.current = true;
      try {
        const res = await api.get(`/sessions/${sessionId}/report`);
        setData(res.data);
      } catch (e) {
        if (e.response?.status === 404) {
          console.warn('Session not found, stopping poll.');
          clearInterval(interval);
        }
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchMetrics();
    interval = setInterval(fetchMetrics, 5000); // poll every 5s (was 2s — too aggressive)
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!data) return (
    <div className="p-20 text-center animate-pulse text-slate-400">
      Establishing Secure Link...
    </div>
  );

  const metrics = data.entry_stats;
  const exitMetrics = data.exit_stats;
  const confirmed = data.confirmed_attendance ?? 0;

  return (
    <div className="space-y-6">

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="dashboard-card p-5 border-l-4 border-l-green-500 flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Status</p>
          <p className="heading-xl flex items-center gap-2 mt-2">
            <Activity className="text-green-500 animate-pulse" size={22} />
            <span className="text-base">Active</span>
          </p>
        </div>

        <div className="dashboard-card p-5 flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Entry</p>
          <p className="heading-xl flex items-center gap-2 mt-2">
            <LogIn className="text-blue-500" size={22} />
            {metrics.attendance_est}
          </p>
        </div>

        <div className="dashboard-card p-5 flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Exit</p>
          <p className="heading-xl flex items-center gap-2 mt-2">
            <LogOut className="text-emerald-500" size={22} />
            {exitMetrics.attendance_est}
          </p>
        </div>

        <div className="dashboard-card p-5 flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Confirmed</p>
          <p className="heading-xl flex items-center gap-2 mt-2">
            <Users className="text-orange-500" size={22} />
            {confirmed}
          </p>
        </div>

        <div className="dashboard-card p-5 flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Class Vibe</p>
          <p className="heading-xl flex items-center gap-2 mt-2">
            <Zap className="text-yellow-500" size={22} />
            {metrics.vibe_score}
            <span className="text-lg text-slate-400">/10</span>
          </p>
        </div>

        <div className="dashboard-card p-5 flex flex-col justify-between">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Risk Level</p>
          <p className="heading-xl flex items-center gap-2 mt-2">
            <AlertTriangle
              className={metrics.at_risk_index > 20 ? 'text-red-500' : 'text-slate-300'}
              size={22}
            />
            {metrics.at_risk_index}%
          </p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px] lg:h-[500px]">
        <div className="dashboard-card p-1.5 relative bg-slate-900 border-none shadow-2xl shadow-indigo-500/10 overflow-hidden group">
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 text-xs rounded-full font-bold border border-white/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> ENTRY FEED
          </div>
          <MediaCapture sessionId={sessionId} type="entry" />
        </div>

        <div className="dashboard-card p-1.5 relative bg-slate-900 border-none shadow-2xl shadow-indigo-500/10 overflow-hidden group">
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 text-xs rounded-full font-bold border border-white/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> EXIT FEED
          </div>
          <MediaCapture sessionId={sessionId} type="exit" />
        </div>
      </div>

    </div>
  );
};

export default LiveSession;