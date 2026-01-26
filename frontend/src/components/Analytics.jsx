import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Target, Layers, Zap } from 'lucide-react';

const Analytics = ({ sessionId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/sessions/${sessionId}/report`);
        setData(res.data);
      } catch (err) { console.error(err); }
    };
    fetchData(); 
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!data) return <div className="p-10 text-center text-slate-500">Processing Deep Data...</div>;

  const { entry_stats, exit_stats } = data;

  const radarData = Object.keys(entry_stats.counts).map(emotion => ({
    subject: emotion,
    Entry: entry_stats.counts[emotion],
    Exit: exit_stats.counts[emotion],
    fullMark: Math.max(entry_stats.total_faces, exit_stats.total_faces) || 10
  }));

  const trendData = [
    { time: 'Start', score: entry_stats.engagement_score },
    { time: 'Mid', score: (entry_stats.engagement_score + exit_stats.engagement_score) / 2 },
    { time: 'End', score: exit_stats.engagement_score },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-yellow-400" fill="currentColor" /> Deep Dive Analytics
          </h2>
          <p className="text-slate-400 text-sm mt-1">Advanced psychometric breakdown</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-500 uppercase">Risk Index</p>
          <p className={`text-2xl font-bold ${exit_stats.at_risk_index > 20 ? 'text-red-400' : 'text-green-400'}`}>
            {exit_stats.at_risk_index}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-heading text-lg mb-4 flex gap-2"><Target className="text-blue-400"/> Emotional Profile</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar name="Entry" dataKey="Entry" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.3} />
                <Radar name="Exit" dataKey="Exit" stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#fff' }}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Trend Chart */}
        <div className="glass-card p-6">
          <h3 className="text-heading text-lg mb-4 flex gap-2"><Layers className="text-purple-400"/> Engagement Trajectory</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#fff' }} />
                <Area type="monotone" dataKey="score" stroke="#8884d8" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;