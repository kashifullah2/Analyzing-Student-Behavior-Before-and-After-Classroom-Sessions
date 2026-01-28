import React from 'react';
import { Sparkles, Code } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-auto bg-slate-900 py-10 text-white">
            <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
                        <Sparkles size={20} />
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="text-base font-bold font-[Outfit] tracking-wide">Behavior<span className="text-indigo-400">Analyzer</span></h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Next-Gen Classroom Intelligence</p>
                    </div>
                </div>

                <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
                    <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Support</span>
                    <span className="hover:text-white cursor-pointer transition-colors">API Status</span>
                </div>

                <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/10">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Engineered by</span>
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                        Kashif Ullah <Code size={14} />
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
