'use client';

import React, { useState } from 'react';
import { CalendarClock, Plus, Search, MoreHorizontal, Clock, Play, Pause, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MOCK_SCHEDULES = [
  { id: 1, url: 'https://growth99.com', frequency: 'Weekly', nextRun: 'Tomorrow at 9:00 AM', status: 'active' },
  { id: 2, url: 'https://apple.com', frequency: 'Daily', nextRun: 'Today at 12:00 PM', status: 'active' },
  { id: 3, url: 'https://tesla.com', frequency: 'Monthly', nextRun: 'Oct 1st at 1:00 AM', status: 'paused' },
];

export default function ScheduledAuditsPage() {
  const [schedules, setSchedules] = useState(MOCK_SCHEDULES);

  const toggleStatus = (id: number) => {
    setSchedules(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'active' ? 'paused' : 'active' };
      }
      return s;
    }));
  };

  const deleteSchedule = (id: number) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Scheduled Audits</h1>
          <p className="text-slate-500 mt-1">Set up recurring scans to monitor changes over time.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md shadow-indigo-200 flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Schedule
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search schedules..." 
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-900 font-bold text-sm border-b border-slate-100">
                <th className="pb-4 pl-4">Target URL</th>
                <th className="pb-4">Frequency</th>
                <th className="pb-4">Next Run</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-600">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <GlobeIcon url={schedule.url} />
                      </div>
                      <span className="font-bold text-slate-900">{new URL(schedule.url).hostname}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">{schedule.frequency}</span>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" /> {schedule.nextRun}
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        schedule.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-slate-300"
                      )} />
                      <span className={schedule.status === 'active' ? 'text-green-700' : 'text-slate-500'}>
                        {schedule.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleStatus(schedule.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title={schedule.status === 'active' ? "Pause Schedule" : "Resume Schedule"}
                      >
                        {schedule.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => deleteSchedule(schedule.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No scheduled audits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GlobeIcon({ url }: { url: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" x2="22" y1="12" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
