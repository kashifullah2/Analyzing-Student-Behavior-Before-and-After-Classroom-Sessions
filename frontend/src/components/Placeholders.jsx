import React from 'react';
import { Construction } from 'lucide-react';

export const PlaceholderPage = ({ title }) => (
  <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-fade-in-up" style={{animationDelay: '0.1s', opacity: 1}}>
    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
       <Construction className="text-slate-600" size={40} />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-slate-500 max-w-md">
      This module is currently under development for the Enterprise version. 
      Check back in the next update.
    </p>
  </div>
);