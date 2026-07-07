'use client';

import React from 'react';
import { Hammer } from 'lucide-react';

export default function PlaceholderPage() {
  return (
    <div className="pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
          <Hammer className="h-7 w-7" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Recent Audits</h1>
      </div>

      <div className="bg-[#F3F4F6] border border-slate-200 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center shadow-sm">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-slate-300">
          <Hammer className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Work in Progress</h2>
        <p className="text-slate-500 text-lg mb-8 max-w-md">
          The <strong>Recent Audits</strong> page is currently under development. Quick overview of your latest scans.
        </p>
      </div>
    </div>
  );
}
