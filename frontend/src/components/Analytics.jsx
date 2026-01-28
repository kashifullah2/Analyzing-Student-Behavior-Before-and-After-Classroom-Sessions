import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Target, Layers, Zap } from 'lucide-react';
import { API_URL } from '../config';

const Analytics = ({ sessionId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/sessions/${sessionId}/report`);
        setData(res.data);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        <div className="animate-pulse">Processing Deep Data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-400">
        <p>Error loading analytics: {error}</p>
      </div>
    );
  }

  if (!data || !data.entry_stats || !data.exit_stats) {
    return (
      <div className="p-10 text-center text-slate-500">
        No analytics data available yet
      </div>
    );
  }

  const { entry_stats, exit_stats } = data;

  // Safely handle emotion counts
  const emotionKeys = Object.keys(entry_stats.counts || {});
  const radarData = emotionKeys.length > 0
    ? emotionKeys.map(emotion => ({
      subject: emotion,
      Entry: entry_stats.counts[emotion] || 0,
      Exit: exit_stats.counts[emotion] || 0,
      fullMark: Math.max(entry_stats.total_faces || 0, exit_stats.total_faces || 0) || 10
    }))
    : [];

  const trendData = [
    { time: 'Start', score: entry_stats.engagement_score || 0 },
    { time: 'Mid', score: ((entry_stats.engagement_score || 0) + (exit_stats.engagement_score || 0)) / 2 },
    { time: 'End', score: exit_stats.engagement_score || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Radar Chart */}
        <div className="dashboard-card p-6">
          <h3 className="heading-lg mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Target className="text-blue-500" size={20} /></div>
            Emotional Profile
          </h3>
          <div className="h-80">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar name="Entry" dataKey="Entry" stroke="#3B82F6" strokeWidth={3} fill="#3B82F6" fillOpacity={0.2} />
                  <Radar name="Exit" dataKey="Exit" stroke="#10B981" strokeWidth={3} fill="#10B981" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No emotion data available
              </div>
            )}
          </div>
        </div>

        {/* Area Trend Chart */}
        <div className="dashboard-card p-6">
          <h3 className="heading-lg mb-6 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Layers className="text-purple-500" size={20} /></div>
            Engagement Trajectory
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 100]} fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;