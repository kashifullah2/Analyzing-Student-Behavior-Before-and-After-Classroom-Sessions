import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { LogIn, LogOut, Smile, MinusCircle, TrendingUp, Activity, Download } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard = ({ sessionId, onSessionInvalid }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/sessions/${sessionId}/report`);
        setData(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404 && onSessionInvalid) {
          onSessionInvalid();
        }
      }
    };
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleExportPDF = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.open(`${baseUrl}/sessions/${sessionId}/export_pdf`, '_blank');
  };

  if (!data) return <div className="p-10 text-center text-muted">Loading Data Stream...</div>;

  const { entry_stats, exit_stats } = data;
  const emotionKeys = ['Happy', 'Sad', 'Neutral', 'Angry', 'Surprise'];

  const comparisonData = emotionKeys.map(key => ({
    name: key,
    Entry: entry_stats.counts[key] || 0,
    Exit: exit_stats.counts[key] || 0,
  }));

  const pieData = emotionKeys.map(key => ({
    name: key,
    value: exit_stats.counts[key] || 0
  })).filter(d => d.value > 0);

  const MetricCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="dashboard-card p-6 flex items-center justify-between group">
      <div>
        <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">{title}</p>
        <h3 className="heading-xl">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
        <Icon size={28} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10 animate-fade-in-up">

      <div className="flex justify-end">
        <button onClick={handleExportPDF} className="btn-ghost text-xs">
          <Download size={14} /> Download PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Entry" value={entry_stats.total_faces} icon={LogIn} colorClass="text-blue-600" bgClass="bg-blue-50" />
        <MetricCard title="Total Exit" value={exit_stats.total_faces} icon={LogOut} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
        <MetricCard title="Happy Count" value={entry_stats.counts['Happy'] + exit_stats.counts['Happy']} icon={Smile} colorClass="text-yellow-600" bgClass="bg-yellow-50" />
        <MetricCard title="Neutral Count" value={entry_stats.counts['Neutral'] + exit_stats.counts['Neutral']} icon={MinusCircle} colorClass="text-purple-600" bgClass="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <div className="dashboard-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-900 text-lg">Entry vs Exit Trends</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Legend iconType="circle" />
                <Bar name="Entry" dataKey="Entry" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar name="Exit" dataKey="Exit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="dashboard-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-pink-600" size={20} />
            <h3 className="font-bold text-slate-900 text-lg">Final Emotion Split</h3>
          </div>
          <div className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;