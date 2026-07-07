'use client';

import React from 'react';
import { HeartPulse, TrendingUp, ShieldAlert, Zap, Globe, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar } from 'recharts';

const MOCK_TREND = Array.from({ length: 30 }).map((_, i) => ({
  day: `Day ${i+1}`,
  score: Math.floor(Math.random() * 20) + 70 + (i * 0.5) // Gradually improving trend
}));

const MOCK_CATEGORIES = [
  { name: 'SEO', score: 95, fill: '#6366f1' },
  { name: 'Performance', score: 82, fill: '#8b5cf6' },
  { name: 'Accessibility', score: 98, fill: '#ec4899' },
  { name: 'Design', score: 88, fill: '#14b8a6' },
  { name: 'UX', score: 75, fill: '#f59e0b' },
];

export default function HealthScorePage() {
  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Portfolio Health Score</h1>
        <p className="text-slate-500 mt-1">Aggregated metrics across all your monitored websites.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-40 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <HeartPulse className="w-6 h-6 text-indigo-300" />
                </div>
                <span className="text-indigo-200 font-bold uppercase tracking-wider text-sm">Global Score</span>
              </div>
              <div className="flex items-end gap-4">
                <span className="text-7xl md:text-8xl font-black leading-none">88</span>
                <div className="pb-2">
                  <span className="bg-green-500/20 text-green-400 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm border border-green-500/30">
                    <TrendingUp className="w-4 h-4" /> +12%
                  </span>
                  <p className="text-slate-400 text-sm mt-2 font-medium">vs last month</p>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-5 rounded-3xl min-w-[200px]">
              <h4 className="text-slate-400 font-bold text-sm mb-4">Top Action Items</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" /> 
                  <span className="text-slate-200 truncate">Fix 3 dead links on homepage</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" /> 
                  <span className="text-slate-200 truncate">Optimize hero images (2.4MB)</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Target className="w-4 h-4 text-indigo-400 shrink-0" /> 
                  <span className="text-slate-200 truncate">Improve mobile tap targets</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" /> Monitored Sites
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">growth99.com</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">92</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">blog.growth99.com</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">85</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">docs.growth99.com</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">88</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold transition-colors border border-slate-200">
            View All Properties
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">30-Day Growth Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Category Averages</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CATEGORIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 'bold'}} width={100} />
                <RechartsTooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
