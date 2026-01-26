import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
  BarChart, Bar,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { TrendingUp, Activity, PieChart, Layers, Target } from 'lucide-react';

const Analytics = ({ sessionId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/sessions/${sessionId}/report`);
        setData(res.data);
      } catch (err) { console.error(err); }
    };
    fetchData(); // Load once on mount
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!data) return <div className="p-10 text-center">Loading Analytics...</div>;

  const { entry_stats, exit_stats } = data;

  // --- PREPARE DATA FOR PLOTS ---

  // 1. Radar Data (Entry vs Exit Profile)
  const radarData = Object.keys(entry_stats.counts).map(emotion => ({
    subject: emotion,
    Entry: entry_stats.counts[emotion],
    Exit: exit_stats.counts[emotion],
    fullMark: Math.max(entry_stats.total_faces, exit_stats.total_faces)
  }));

  // 2. Stacked Sentiment Data
  const sentimentData = [
    {
      name: 'Entry',
      Positive: entry_stats.counts['Happy'] + entry_stats.counts['Surprise'],
      Neutral: entry_stats.counts['Neutral'],
      Negative: entry_stats.counts['Sad'] + entry_stats.counts['Angry'] + entry_stats.counts['Fear']
    },
    {
      name: 'Exit',
      Positive: exit_stats.counts['Happy'] + exit_stats.counts['Surprise'],
      Neutral: exit_stats.counts['Neutral'],
      Negative: exit_stats.counts['Sad'] + exit_stats.counts['Angry'] + exit_stats.counts['Fear']
    }
  ];

  // 3. Simple Engagement Trend (Simulated for Demo based on current scores)
  const trendData = [
    { time: 'Start', score: entry_stats.engagement_score },
    { time: 'Mid', score: (entry_stats.engagement_score + exit_stats.engagement_score) / 2 },
    { time: 'End', score: exit_stats.engagement_score },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="text-purple-400" />
          Deep Dive Analytics
        </h2>
        <p className="text-slate-400">Advanced statistical breakdown of session behavior.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PLOT 1: RADAR CHART (Emotional Shape) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4 flex gap-2"><Target size={18}/> Emotional Profile Shape</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar name="Entry" dataKey="Entry" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Radar name="Exit" dataKey="Exit" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Legend />
                <ReTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PLOT 2: AREA CHART (Sentiment Volume) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4 flex gap-2"><Layers size={18}/> Sentiment Composition</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <ReTooltip />
                <Legend />
                <Bar dataKey="Positive" stackId="a" fill="#10B981" />
                <Bar dataKey="Neutral" stackId="a" fill="#9CA3AF" />
                <Bar dataKey="Negative" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PLOT 3: LINE CHART (Engagement Trend) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4 flex gap-2"><TrendingUp size={18}/> Engagement Trajectory</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <ReTooltip />
                <Area type="monotone" dataKey="score" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PLOT 4: HORIZONTAL BAR (Top Emotions) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4 flex gap-2"><PieChart size={18}/> Dominant Emotion Analysis</h3>
          <div className="h-72 flex flex-col justify-center space-y-4">
             {/* Simple custom bars for top 3 exit emotions */}
             {Object.entries(exit_stats.counts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 4)
                .map(([emotion, count]) => (
                  <div key={emotion} className="w-full">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{emotion}</span>
                      <span className="text-slate-500">{count} students</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${(count / exit_stats.total_faces * 100) || 0}%` }}
                      ></div>
                    </div>
                  </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;