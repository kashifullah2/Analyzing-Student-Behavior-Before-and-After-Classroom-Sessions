import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, Zap, Search, FileText, ArrowUpRight } from 'lucide-react';

const SessionHistory = ({ onRestore }) => {
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
      <div className="flex flex-col md:flex-row justify-end items-center gap-4">
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
      <div className="dashboard-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Class Details</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Vibe Score</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-400 text-sm italic">No session records found matching your criteria.</td>
              </tr>
            ) : (
              filteredHistory.map((session) => (
                <tr key={session.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-slate-900 text-base">{session.class_name}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{session.instructor}</div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Calendar size={16} className="text-slate-400" />
                      {formatDate(session.created_at)}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Users size={16} className="text-blue-500" />
                      {session.attendance} <span className="text-slate-400 font-normal">Students</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm 
                            ${session.vibe_score >= 7 ? 'bg-green-100 text-green-700' :
                          session.vibe_score >= 4 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'}`}>
                        {session.vibe_score}
                      </div>
                      <Zap size={16} className={session.vibe_score >= 7 ? 'text-green-500' : 'text-slate-300'} />
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => onRestore && onRestore(session)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 py-2 px-4 rounded-lg flex items-center gap-2 ml-auto w-fit transition-all"
                    >
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