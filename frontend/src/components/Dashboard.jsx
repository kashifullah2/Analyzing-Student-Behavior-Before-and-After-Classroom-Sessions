import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  LogIn, LogOut, Smile, MinusCircle, 
  TrendingUp, Activity, Download 
} from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard = ({ sessionId }) => {
  const [data, setData] = useState(null);

  // Poll for data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/sessions/${sessionId}/report`);
        setData(res.data);
      } catch (err) { console.error("Dashboard Poll Error", err); }
    };
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleExportPDF = () => {
    window.open(`http://localhost:8000/sessions/${sessionId}/export_pdf`, '_blank');
  };

  if (!data) return <div className="p-10 text-center text-sub animate-pulse">Loading Analytics Stream...</div>;

  const { entry_stats, exit_stats } = data;
  const emotionKeys = ['Happy', 'Sad', 'Neutral', 'Angry', 'Surprise'];
  
  // Data for Bar Chart (Entry vs Exit)
  const comparisonData = emotionKeys.map(key => ({
    name: key,
    Entry: entry_stats.counts[key] || 0,
    Exit: exit_stats.counts[key] || 0,
  }));
  
  // Data for Pie Chart (Exit Profile)
  const pieData = emotionKeys.map(key => ({
    name: key,
    value: exit_stats.counts[key] || 0
  })).filter(d => d.value > 0);

  // Helper Component for KPI Cards
  const MetricCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <Icon size={64} />
      </div>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${bgClass} ${colorClass}`}>
          <Icon size={20} />
        </div>
        <p className="text-sub uppercase tracking-wider text-xs">{title}</p>
        <h3 className="text-3xl font-bold text-heading mt-1">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10 animate-fade-in-up">
      
      {/* 1. Header Actions */}
      <div className="flex justify-end">
          <button 
            onClick={handleExportPDF}
            className="btn-secondary text-xs flex items-center gap-2"
          >
             <Download size={14} /> Download PDF Report
          </button>
      </div>

      {/* 2. METRICS GRID (Counts Request) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Entry" 
          value={entry_stats.total_faces} 
          icon={LogIn} 
          colorClass="text-blue-500" 
          bgClass="bg-blue-500/10" 
        />
        <MetricCard 
          title="Total Exit" 
          value={exit_stats.total_faces} 
          icon={LogOut} 
          colorClass="text-emerald-500" 
          bgClass="bg-emerald-500/10" 
        />
        <MetricCard 
          title="Happy Students" 
          value={entry_stats.counts['Happy'] + exit_stats.counts['Happy']} 
          icon={Smile} 
          colorClass="text-yellow-500" 
          bgClass="bg-yellow-500/10" 
        />
        <MetricCard 
          title="Neutral State" 
          value={entry_stats.counts['Neutral'] + exit_stats.counts['Neutral']} 
          icon={MinusCircle} 
          colorClass="text-purple-500" 
          bgClass="bg-purple-500/10" 
        />
      </div>

      {/* 3. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Before (Entry) vs After (Exit) */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-indigo-500" size={20} />
            <h3 className="text-heading text-lg">Entry vs Exit Comparison</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Bar name="Before (Entry)" dataKey="Entry" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar name="After (Exit)" dataKey="Exit" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Final Distribution */}
        <div className="glass-card p-6">
           <div className="flex items-center gap-2 mb-6">
            <Activity className="text-pink-500" size={20} />
            <h3 className="text-heading text-lg">Final Emotion Distribution</h3>
          </div>
           <div className="h-72 flex justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie 
                      data={pieData} 
                      innerRadius={80} 
                      outerRadius={100} 
                      paddingAngle={5} 
                      dataKey="value"
                      stroke="none"
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;