import React from 'react';
import { LayoutGrid, Radio, BarChart3, Bot, Clock, Settings, LogOut, Hexagon } from 'lucide-react';

const Sidebar = ({ view, setView, handleLogout }) => {
  
  const menu = [
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'session', label: 'Live Monitor', icon: Radio },
    { id: 'analytics', label: 'Deep Analytics', icon: BarChart3 },
    { id: 'assistant', label: 'AI Coach', icon: Bot },
    // { id: 'history', label: 'Session History', icon: Clock },
    // { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 flex flex-col z-50">
      
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
             <Hexagon className="text-white fill-white/20" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-lg">ASBBAACS</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">AI-Based</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 py-6 px-3 space-y-1">
        {menu.map((item) => {
          const isActive = view === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setView(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }
              `}
            >
              <item.icon size={18} className={isActive ? "text-indigo-600" : "text-slate-400"} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;