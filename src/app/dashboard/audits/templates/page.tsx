'use client';

import React, { useState } from 'react';
import { Copy, Save, Plus, Zap, Layout, ShieldCheck, Eye } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MOCK_TEMPLATES = [
  { 
    id: 1, 
    name: 'Full Deep Scan', 
    description: 'Runs all 11 AI agents for maximum coverage.', 
    agents: ['Visual', 'UX', 'Conversion', 'SEO', 'Security', 'Copy'],
    active: true
  },
  { 
    id: 2, 
    name: 'Quick Health Check', 
    description: 'Runs only essential agents for a fast overview.', 
    agents: ['SEO', 'Performance', 'Mobile'],
    active: false
  },
  { 
    id: 3, 
    name: 'Design Audit Only', 
    description: 'Focuses entirely on UI/UX and brand alignment.', 
    agents: ['Visual', 'UX', 'Brand'],
    active: false
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);

  const setAsActive = (id: number) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      active: t.id === id
    })));
  };

  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Audit Templates</h1>
          <p className="text-slate-500 mt-1">Configure preset agent combinations for your scans.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div 
            key={template.id} 
            className={cn(
              "bg-white rounded-[2rem] p-8 border transition-all cursor-pointer group",
              template.active 
                ? "border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20" 
                : "border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
            )}
            onClick={() => setAsActive(template.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-lg",
                template.active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-600"
              )}>
                <Copy className="w-6 h-6" />
              </div>
              {template.active && (
                <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Active
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">{template.name}</h3>
            <p className="text-slate-500 text-sm mb-6 min-h-[40px]">{template.description}</p>
            
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agents Included</div>
              <div className="flex flex-wrap gap-2">
                {template.agents.map(agent => (
                  <span key={agent} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {agent}
                  </span>
                ))}
                <span className="bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  +{Math.floor(Math.random() * 5) + 1} more
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
