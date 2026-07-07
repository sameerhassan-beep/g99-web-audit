'use client';

import React from 'react';
import { Activity, Server, AlertCircle, Clock, Zap, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const MOCK_DATA = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  latency: Math.floor(Math.random() * 150) + 50,
  uptime: 100 - (Math.random() > 0.9 ? Math.random() * 2 : 0)
}));

const MOCK_MONITORS = [
  { id: 1, url: 'growth99.com', status: 'operational', latency: '45ms', uptime: '99.99%', lastCheck: '2m ago' },
  { id: 2, url: 'api.growth99.com', status: 'operational', latency: '120ms', uptime: '99.95%', lastCheck: '1m ago' },
  { id: 3, url: 'dashboard.growth99.com', status: 'degraded', latency: '850ms', uptime: '98.50%', lastCheck: 'Just now' },
];

export default function MonitoringPage() {
  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Monitoring</h1>
        <p className="text-slate-500 mt-1">Real-time performance and uptime tracking for your properties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-green-600 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" /> 100%
            </span>
          </div>
          <h4 className="text-3xl font-black text-slate-900">99.98%</h4>
          <p className="text-slate-500 text-sm font-medium mt-1">Global Uptime (30d)</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-400 flex items-center">Avg</span>
          </div>
          <h4 className="text-3xl font-black text-slate-900">142ms</h4>
          <p className="text-slate-500 text-sm font-medium mt-1">Global Latency</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-amber-600 flex items-center">Active</span>
          </div>
          <h4 className="text-3xl font-black text-slate-900">1 Issue</h4>
          <p className="text-slate-500 text-sm font-medium mt-1">Ongoing Incidents</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Global Latency (24h)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLatency)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-6">Monitored Endpoints</h3>
      <div className="space-y-4">
        {MOCK_MONITORS.map(monitor => (
          <div key={monitor.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${monitor.status === 'operational' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
              <div>
                <h4 className="font-bold text-slate-900">{monitor.url}</h4>
                <p className="text-xs text-slate-500 uppercase font-semibold mt-0.5">{monitor.status}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-sm">
              <div className="hidden md:block">
                <p className="text-slate-400 font-medium mb-0.5">Uptime</p>
                <p className="font-bold text-slate-700">{monitor.uptime}</p>
              </div>
              <div className="hidden md:block">
                <p className="text-slate-400 font-medium mb-0.5">Latency</p>
                <p className="font-bold text-slate-700">{monitor.latency}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">Last Check</p>
                <p className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {monitor.lastCheck}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
