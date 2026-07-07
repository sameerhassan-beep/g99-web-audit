'use client';

import React from 'react';
import { ArrowLeftRight, Calendar, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CompareReportsPage() {
  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="mb-10 text-center w-full">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner">
          <ArrowLeftRight className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Compare Reports</h1>
        <p className="text-slate-500 text-lg">Select two historical audit reports to see exactly what changed, improved, or degraded over time.</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-4 md:p-10 mb-10 flex flex-col md:flex-row gap-6 items-center">
        
        {/* Report A Selector */}
        <div className="flex-1 w-full bg-slate-50 rounded-[2rem] p-6 border border-slate-200">
          <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-4">Baseline Report</h3>
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search reports by URL or date..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-base outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              defaultValue="July 1st, 2026 - growth99.com"
            />
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-lg">growth99.com</p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Calendar className="w-3.5 h-3.5" /> Jul 1, 2026 at 9:00 AM</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md">
              74
            </div>
          </div>
        </div>

        {/* VS Badge */}
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl flex-shrink-0 z-10 shadow-inner border-4 border-white">
          VS
        </div>

        {/* Report B Selector */}
        <div className="flex-1 w-full bg-indigo-50 rounded-[2rem] p-6 border border-indigo-100">
          <h3 className="text-indigo-500 font-bold text-sm uppercase tracking-wider mb-4">Compare Against</h3>
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-indigo-300 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search reports by URL or date..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-indigo-100 rounded-2xl text-base outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              defaultValue="Latest Scan - growth99.com"
            />
          </div>
          <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-lg">growth99.com</p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Calendar className="w-3.5 h-3.5" /> Jul 6, 2026 at 2:30 PM</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              92
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Results Mockup */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Score Differences</h2>
        
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-48 font-bold text-slate-700">Overall Score</div>
            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-slate-300 w-[74%]" />
            </div>
            <div className="flex-1 h-4 bg-indigo-50 rounded-full overflow-hidden flex">
              <div className="h-full bg-indigo-500 w-[92%]" />
            </div>
            <div className="w-24 text-right flex items-center justify-end gap-1 font-bold text-green-500 bg-green-50 px-3 py-1 rounded-lg">
              <ArrowUp className="w-4 h-4" /> 18 pts
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-48 font-bold text-slate-700">Performance</div>
            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-slate-300 w-[60%]" />
            </div>
            <div className="flex-1 h-4 bg-indigo-50 rounded-full overflow-hidden flex">
              <div className="h-full bg-indigo-500 w-[88%]" />
            </div>
            <div className="w-24 text-right flex items-center justify-end gap-1 font-bold text-green-500 bg-green-50 px-3 py-1 rounded-lg">
              <ArrowUp className="w-4 h-4" /> 28 pts
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-48 font-bold text-slate-700">Accessibility</div>
            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-slate-300 w-[100%]" />
            </div>
            <div className="flex-1 h-4 bg-indigo-50 rounded-full overflow-hidden flex">
              <div className="h-full bg-indigo-500 w-[95%]" />
            </div>
            <div className="w-24 text-right flex items-center justify-end gap-1 font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg">
              <ArrowDown className="w-4 h-4" /> 5 pts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
