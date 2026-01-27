import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, Zap, Search, FileText, ArrowUpRight } from 'lucide-react';

const SessionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:8000/sessions/history');
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(session => 
    session.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading Archives...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-900">Session Archives</h2>
           <p className="text-sm text-slate-500">Historical records of student behavior analysis.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-3 text-slate-400" size={16} />
           <input 
             className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all"
             placeholder="Search class or instructor..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Class Details</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vibe Score</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.length === 0 ? (
                <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">No session records found.</td>
                </tr>
            ) : (
                filteredHistory.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4">
                    <div className="font-bold text-slate-900">{session.class_name}</div>
                    <div className="text-xs text-slate-500">{session.instructor}</div>
                    </td>
                    <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(session.created_at)}
                    </div>
                    </td>
                    <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users size={14} className="text-blue-500" />
                        {session.attendance} Students
                    </div>
                    </td>
                    <td className="p-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold 
                            ${session.vibe_score >= 7 ? 'bg-green-100 text-green-700' : 
                            session.vibe_score >= 4 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'}`}>
                            {session.vibe_score}
                        </div>
                        <Zap size={14} className={session.vibe_score >= 7 ? 'text-green-500' : 'text-slate-300'} />
                    </div>
                    </td>
                    <td className="p-4 text-right">
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        View Report <ArrowUpRight size={14} />
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionHistory;