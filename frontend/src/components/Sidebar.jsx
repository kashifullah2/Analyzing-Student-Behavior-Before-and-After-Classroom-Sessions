import React from 'react';
import { LayoutGrid, Radio, BarChart3, Bot, Clock, Settings, LogOut, Hexagon } from 'lucide-react';

const Sidebar = ({ view, setView, handleLogout }) => {
  
  const menu = [
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'session', label: 'Live Monitor', icon: Radio },
    { id: 'analytics', label: 'Deep Analytics', icon: BarChart3 },
    { id: 'assistant', label: 'AI Coach', icon: Bot }, // Now a full page
    { id: 'history', label: 'Session History', icon: Clock }, // New Placeholder
    { id: 'settings', label: 'Settings', icon: Settings },    // New Placeholder
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-slate-950 border-r border-slate-800 flex flex-col z-50">
      
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <Hexagon className="text-cyan-500 fill-cyan-500/10" size={28} />
          <div>
            <h1 className="font-bold text-white tracking-tight">EduMotion</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Enterprise</p>
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
                  ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }
              `}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-900">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;