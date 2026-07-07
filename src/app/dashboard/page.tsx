'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Clock, ShieldAlert, TrendingUp, Zap, Loader2, Link as LinkIcon, BarChart3, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || '');

      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setAudits(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your dashboard metrics...</p>
      </div>
    );
  }

  // Calculate Metrics
  const totalAudits = audits.length;
  const totalPagesScanned = audits.reduce((acc, audit) => acc + 1 + (audit.subPages?.length || 0), 0);
  
  const totalScoreSum = audits.reduce((acc, audit) => acc + (audit.report?.overallScore || 0), 0);
  const averageScore = totalAudits > 0 ? Math.round(totalScoreSum / totalAudits) : 0;

  // Chart Data: Last 7 Audits (chronological order)
  const chartData = [...audits]
    .slice(0, 7)
    .reverse()
    .map((audit) => {
      let hostname = audit.url;
      try { hostname = new URL(audit.url).hostname; } catch {}
      return {
        name: new Date(audit.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        url: hostname,
        Score: audit.report?.overallScore || 0
      };
    });

  // Dynamic Insights
  const scores = audits.map(a => a.report?.overallScore || 0).filter(s => s > 0);
  const hasLowScores = scores.some(s => s < 60);
  const hasHighScores = scores.some(s => s >= 90);

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Hello {userEmail ? userEmail.split('@')[0] : 'there'}
        </h1>
        <p className="text-slate-500 mt-1">Monitor performance and AI insights in real time.</p>
      </div>

      {/* Grid Row 1: KPIs and Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KPI Cards (Spans 7 cols) */}
        <div className="col-span-1 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#FDE6D2] rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-56 transition-transform hover:-translate-y-1">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Total Audits</h3>
              <p className="text-slate-600 text-sm mt-1">Number of websites scanned</p>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-5xl font-black text-slate-900">{totalAudits}</span>
              <button onClick={() => router.push('/dashboard/audits/new')} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-black/20">
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-[#D5E5F9] rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-56 transition-transform hover:-translate-y-1">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Total Pages</h3>
              <p className="text-slate-600 text-sm mt-1">Includes all sub-pages</p>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-5xl font-black text-slate-900">{totalPagesScanned}</span>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <LinkIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#F3F4F6] rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-56 transition-transform hover:-translate-y-1">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Avg Health</h3>
              <p className="text-slate-600 text-sm mt-1">Overall average score</p>
            </div>
            <div className="flex justify-between items-end">
              <span className={cn(
                "text-5xl font-black",
                averageScore >= 90 ? "text-green-600" : averageScore >= 70 ? "text-amber-500" : "text-red-500"
              )}>
                {averageScore > 0 ? averageScore : '--'}
              </span>
              <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Widgets (Spans 5 cols) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          
          {/* The Tilted Saved Time Widget */}
          <div className="relative h-[120px] ml-4 mt-2">
            {/* Background Light Pill */}
            <div className="absolute top-6 right-0 left-4 h-20 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-between px-6 z-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 leading-none">Manual Analysis</h4>
                  <p className="text-xs text-slate-400 mt-1">Without AI Tooling</p>
                </div>
              </div>
            </div>

            {/* Foreground Dark Tilted Pill */}
            <div className="absolute top-0 -left-6 right-8 h-20 bg-[#111827] rounded-full shadow-2xl flex items-center justify-between px-6 z-10 -rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white leading-none">{totalAudits * 4} hours</h4>
                  <p className="text-xs text-slate-400 mt-1">Time Saved by Audit Arena</p>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-300 pr-4">Saved</span>
            </div>
          </div>

          {/* PRO Banner */}
          <div className="flex-1 rounded-[2rem] bg-gradient-to-br from-slate-700 to-slate-900 p-6 relative overflow-hidden shadow-xl shadow-slate-900/10 flex flex-col justify-center min-h-[140px]">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold tracking-wide mb-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                PRO
              </div>
              <h3 className="text-2xl font-bold text-white leading-tight w-3/4">Switch to AI Insights Professional today!</h3>
            </div>
            <button className="absolute right-6 bottom-6 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart & Table (Spans 8 cols) */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          
          {/* Average Score Trend Chart */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Score Trends</h3>
                <p className="text-slate-500 text-sm mt-1">Your recent audit scores</p>
              </div>
              <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4"/> Last {chartData.length} Scans
              </div>
            </div>

            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <RechartsTooltip 
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No data to display. Run some audits!
                </div>
              )}
            </div>
          </div>

          {/* Real Recent Scans Table */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 text-lg">Recent Audits</h3>
              <Link href="/dashboard/reports" className="text-sm font-semibold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-900 font-bold text-sm border-b border-slate-100">
                    <th className="pb-4">Target URL</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4 text-center">Score</th>
                    <th className="pb-4 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-600">
                  {audits.slice(0, 5).map(audit => {
                    let hostname = audit.url;
                    try { hostname = new URL(audit.url).hostname; } catch {}
                    const score = audit.report?.overallScore || 0;
                    
                    return (
                      <tr 
                        key={audit.id} 
                        onClick={() => router.push(`/dashboard/report?id=${audit.id}`)}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 truncate max-w-[200px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {hostname}
                        </td>
                        <td className="py-4">
                          {new Date(audit.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-black",
                            score >= 90 ? "bg-green-100 text-green-700" : score >= 70 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          )}>
                            {score}
                          </span>
                        </td>
                        <td className="py-4 pl-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-green-600">Complete</span>
                        </td>
                      </tr>
                    );
                  })}
                  {audits.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No audits found. <Link href="/dashboard/audits/new" className="text-indigo-500 hover:underline">Run your first scan!</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* AI Insights Right Column (Spans 4 cols) */}
        <div className="col-span-1 lg:col-span-4">
          <h3 className="font-bold text-slate-900 text-lg mb-4 pl-2">Dynamic AI Insights</h3>
          
          <div className="flex flex-col gap-4">
            
            {/* Dynamic Insight 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-2xl w-fit">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h4 className="font-bold text-slate-900">Consistency Analysis</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {totalAudits > 2 
                  ? "Your website scores are relatively stable. Keep monitoring for incremental optimizations." 
                  : "You need more data! Run at least 3 audits to unlock long-term trend forecasting."}
              </p>
              <Link href="/dashboard/reports" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 underline decoration-indigo-200 underline-offset-4">
                View Reports
              </Link>
            </div>

            {/* Dynamic Insight 2 (Risk Alert based on low scores) */}
            {hasLowScores && (
              <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-orange-400" />
                <div className="flex items-center gap-3 mb-4 p-3 bg-orange-50 rounded-2xl w-fit">
                  <ShieldAlert className="w-5 h-5 text-orange-500" />
                  <h4 className="font-bold text-slate-900">Critical Risks Detected</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  We noticed one or more of your recent audits scored below a 60. Immediate attention is recommended to fix severe UX or SEO issues.
                </p>
                <Link href="/dashboard/reports" className="text-sm font-semibold text-orange-600 hover:text-orange-700 underline decoration-orange-200 underline-offset-4">
                  Investigate Errors
                </Link>
              </div>
            )}

            {/* Dynamic Insight 3 (Success based on high scores) */}
            {hasHighScores && (
              <div className="bg-white rounded-3xl p-6 border border-green-100 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-green-400" />
                <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-2xl w-fit">
                  <Zap className="w-5 h-5 text-green-500" />
                  <h4 className="font-bold text-slate-900">Excellent Performance</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Great job! You have properties scoring above 90. These sites are fully optimized for conversions and search engines.
                </p>
                <Link href="/dashboard/reports" className="text-sm font-semibold text-green-600 hover:text-green-700 underline decoration-green-200 underline-offset-4">
                  View Best Performers
                </Link>
              </div>
            )}
            
            {/* Fallback Insight if they only have average scores */}
            {!hasLowScores && !hasHighScores && totalAudits > 0 && (
               <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                 <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-2xl w-fit">
                   <Activity className="w-5 h-5 text-blue-500" />
                   <h4 className="font-bold text-slate-900">Room for Improvement</h4>
                 </div>
                 <p className="text-sm text-slate-600 leading-relaxed mb-4">
                   Your sites are performing averagely. Use the Audit Arena AI suggestions in your report to push those scores above 90!
                 </p>
                 <Link href="/dashboard/reports" className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline decoration-blue-200 underline-offset-4">
                   Optimize Now
                 </Link>
               </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
