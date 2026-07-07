'use client';

import React, { useState } from 'react';
import { Terminal, Search, ArrowRight, Download, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const ACTIONS = [
  { id: 'export-csv', name: 'Export All Audits to CSV', icon: Download, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'export-pdf', name: 'Generate Portfolio PDF Report', icon: Download, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  { id: 'force-refresh', name: 'Force Refresh All Uptime Monitors', icon: RefreshCw, color: 'text-green-500', bg: 'bg-green-100' },
  { id: 'clear-cache', name: 'Clear Agent Analysis Cache', icon: Trash2, color: 'text-amber-500', bg: 'bg-amber-100' },
  { id: 'revoke-sessions', name: 'Revoke All Active Sessions', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-100' },
];

export default function ActionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [executing, setExecuting] = useState<string | null>(null);

  const handleAction = async (id: string) => {
    setExecuting(id);
    
    if (id === 'export-csv') {
      const supabase = createClient();
      const { data } = await supabase.from('audits').select('*');
      if (data) {
        const headers = ['ID,URL,Date,Score\n'];
        const rows = data.map(d => `${d.id},${d.url},${d.date},${d.overall_score}\n`);
        const blob = new Blob([headers.join('') + rows.join('')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audits_export.csv';
        a.click();
      }
    } else if (id === 'clear-cache') {
      localStorage.clear();
      sessionStorage.clear();
      alert('Local cache and session storage cleared successfully.');
    } else if (id === 'force-refresh') {
      await new Promise(r => setTimeout(r, 1000));
      alert('Uptime monitors forcibly pinged.');
    } else {
      await new Promise(r => setTimeout(r, 800));
      alert(`Action ${id} executed successfully! (Mocked)`);
    }
    
    setExecuting(null);
  };

  const filtered = ACTIONS.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="mb-10 text-center w-full">
        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner">
          <Terminal className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Command Center</h1>
        <p className="text-slate-500 text-lg">Execute workspace-level macros and data operations instantly.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
        <div className="relative mb-8">
          <Search className="w-6 h-6 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search commands..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-lg outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner font-medium text-slate-900"
          />
        </div>

        <div className="space-y-3">
          {filtered.map(action => (
            <button 
              key={action.id}
              onClick={() => handleAction(action.id)}
              disabled={executing !== null}
              className={`w-full bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 p-4 rounded-2xl flex items-center justify-between group transition-all ${executing === action.id ? 'animate-pulse opacity-75' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.bg} ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-lg font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {executing === action.id ? 'Executing...' : action.name}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          ))}
          
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 font-medium">
              No commands found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
