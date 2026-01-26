import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Smile, MinusCircle, LogIn, LogOut } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

const Dashboard = ({ sessionId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/sessions/${sessionId}/report`);
        setData(res.data);
      } catch (err) { console.error(err); }
    };
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!data) return <div className="p-10 text-center">Loading Data...</div>;

  const { entry_stats, exit_stats } = data;

  // Chart Data Preparation
  const emotionKeys = ['Happy', 'Sad', 'Neutral', 'Angry', 'Surprise', 'Fear'];
  const comparisonData = emotionKeys.map(key => ({
    name: key,
    Entry: entry_stats.counts[key] || 0, // Using RAW COUNTS now
    Exit: exit_stats.counts[key] || 0,
  }));
  
  const pieData = emotionKeys.map(key => ({
    name: key,
    value: exit_stats.counts[key] || 0
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6 pb-10">
      
      {/* 1. KEY METRICS ROW (Requested Counts) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Entry Count */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg"><LogIn size={20} className="text-blue-600"/></div>
            <span className="text-sm font-medium text-slate-500">Entry Faces</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{entry_stats.total_faces}</p>
        </div>

        {/* Exit Count */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg"><LogOut size={20} className="text-green-600"/></div>
            <span className="text-sm font-medium text-slate-500">Exit Faces</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{exit_stats.total_faces}</p>
        </div>

        {/* Happy Count (Aggregated Entry+Exit) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg"><Smile size={20} className="text-yellow-600"/></div>
            <span className="text-sm font-medium text-slate-500">Happy Students</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {entry_stats.counts['Happy'] + exit_stats.counts['Happy']}
          </p>
        </div>

        {/* Neutral Count (Aggregated Entry+Exit) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg"><MinusCircle size={20} className="text-gray-600"/></div>
            <span className="text-sm font-medium text-slate-500">Neutral Students</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {entry_stats.counts['Neutral'] + exit_stats.counts['Neutral']}
          </p>
        </div>
      </div>

      {/* 2. CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4">Entry vs Exit Counts</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Entry" fill="#3B82F6" />
                <Bar dataKey="Exit" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
           <h3 className="font-bold text-slate-700 mb-4">Final Mood Distribution</h3>
           <div className="h-64 flex justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} dataKey="value">
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;