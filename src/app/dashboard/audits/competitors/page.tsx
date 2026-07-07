'use client';

import React from 'react';
import { Swords, Trophy, Activity, AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const METRICS = [
  { name: 'Overall Score', yours: 92, comp1: 85, comp2: 78, winner: 'yours' },
  { name: 'Performance', yours: 88, comp1: 90, comp2: 72, winner: 'comp1' },
  { name: 'Accessibility', yours: 100, comp1: 82, comp2: 95, winner: 'yours' },
  { name: 'SEO Health', yours: 95, comp1: 95, comp2: 80, winner: 'tie' },
  { name: 'UX Best Practices', yours: 85, comp1: 75, comp2: 70, winner: 'yours' },
];

export default function CompetitorsPage() {
  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Market Benchmark</h1>
          <p className="text-slate-500 mt-1">See how your site stacks up against industry rivals.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md flex items-center gap-2">
          <Swords className="w-5 h-5" /> Run Comparison
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-500 rounded-full blur-2xl opacity-50" />
          <h3 className="text-indigo-100 font-bold mb-1 relative z-10">Your Site</h3>
          <h4 className="text-2xl font-black relative z-10">growth99.com</h4>
          <div className="mt-8 flex items-end gap-3 relative z-10">
            <span className="text-5xl font-black">92</span>
            <span className="text-indigo-200 font-semibold mb-1">Avg Score</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative">
          <h3 className="text-slate-400 font-bold mb-1">Competitor 1</h3>
          <h4 className="text-2xl font-black text-slate-900">competitor-a.com</h4>
          <div className="mt-8 flex items-end gap-3">
            <span className="text-5xl font-black text-slate-700">85</span>
            <span className="text-slate-400 font-semibold mb-1">Avg Score</span>
          </div>
          <div className="absolute top-6 right-6 w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center font-bold text-xs">
            -7
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative">
          <h3 className="text-slate-400 font-bold mb-1">Competitor 2</h3>
          <h4 className="text-2xl font-black text-slate-900">competitor-b.com</h4>
          <div className="mt-8 flex items-end gap-3">
            <span className="text-5xl font-black text-slate-700">78</span>
            <span className="text-slate-400 font-semibold mb-1">Avg Score</span>
          </div>
          <div className="absolute top-6 right-6 w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center font-bold text-xs">
            -14
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Metric Breakdown
          </h3>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> You are winning
          </span>
        </div>
        
        <div className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 font-bold text-sm border-b border-slate-100">
                <th className="py-4 pl-8">Metric</th>
                <th className="py-4">Your Site</th>
                <th className="py-4">Competitor 1</th>
                <th className="py-4 pr-8">Competitor 2</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              {METRICS.map((metric, i) => (
                <tr key={metric.name} className={cn("border-b border-slate-50 hover:bg-slate-50/50 transition-colors", i === METRICS.length -1 && "border-0")}>
                  <td className="py-6 pl-8 text-slate-700">{metric.name}</td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg", metric.winner === 'yours' ? "text-indigo-600" : "text-slate-700")}>{metric.yours}</span>
                      {metric.winner === 'yours' && <Trophy className="w-4 h-4 text-amber-500" />}
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg", metric.winner === 'comp1' ? "text-indigo-600" : "text-slate-700")}>{metric.comp1}</span>
                      {metric.winner === 'comp1' && <Trophy className="w-4 h-4 text-amber-500" />}
                    </div>
                  </td>
                  <td className="py-6 pr-8">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg", metric.winner === 'comp2' ? "text-indigo-600" : "text-slate-700")}>{metric.comp2}</span>
                      {metric.winner === 'comp2' && <Trophy className="w-4 h-4 text-amber-500" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
