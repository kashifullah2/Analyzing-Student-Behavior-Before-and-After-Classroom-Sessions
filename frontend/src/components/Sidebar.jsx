import React from 'react';
import { LayoutGrid, Radio, BarChart3, Bot, Clock, Settings, LogOut, GraduationCap, PlusCircle, X } from 'lucide-react';

const Sidebar = ({ view, setView, handleLogout, handleNewSession, isOpen, onClose }) => {

  const menu = [
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'session', label: 'Live Monitor', icon: Radio },
    { id: 'analytics', label: 'Deep Analytics', icon: BarChart3 },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'history', label: 'Session History', icon: Clock },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`
        fixed left-0 top-0 h-screen bg-white shadow-2xl z-50 transition-transform duration-300 lg:translate-x-0 w-72 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Mobile Close Button */}
        <button onClick={onClose} className="lg:hidden absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <X size={20} />
        </button>

        {/* PROFESSIONAL PROJECT TITLE */}
        <div className="h-28 flex flex-col justify-center px-8 border-b border-indigo-50/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30 shrink-0">
              <GraduationCap className="text-white" size={22} />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50/80 px-2 py-0.5 rounded-full ring-1 ring-indigo-100">
              PRO
            </span>
          </div>
          <h1 className="font-bold text-slate-900 text-lg leading-tight font-[Outfit]">
            Behavior<span className="text-indigo-600">Analyzer</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Intelligent Classroom Analytics
          </p>
        </div>

        {/* CREATE SESSION BUTTON */}
        <div className="p-6 pb-2">
          <button
            onClick={handleNewSession}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/25 group"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" /> New Session
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scroll">
          {menu.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/60 hover:shadow-sm'
                  }
                `}
              >
                <item.icon size={20} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-indigo-50/50 bg-white/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-all hover:shadow-sm"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;