'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, ShieldCheck, Zap, Eye, Layout, CheckCircle2, Circle, AlertTriangle, Globe, Activity, BarChart3, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ALL_AGENTS = [
  { id: 'SEOAgent', name: 'SEO Engine' },
  { id: 'AccessibilityAgent', name: 'Accessibility Engine' },
  { id: 'PerformanceAgent', name: 'Performance Engine' },
  { id: 'SecurityAgent', name: 'Security Engine' },
  { id: 'VisionAgent', name: 'Visual Design Engine' },
  { id: 'UXAgent', name: 'UX & Usability Engine' },
  { id: 'MobileAgent', name: 'Mobile Responsiveness Engine' },
  { id: 'CROAgent', name: 'Conversion Rate Engine' },
  { id: 'BrandAgent', name: 'Brand Identity Engine' },
  { id: 'ContentAgent', name: 'Content & Copy Engine' },
  { id: 'CompetitorAgent', name: 'Market Competitor Engine' }
];

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [pastAudits, setPastAudits] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('pastAudits');
    if (stored) {
      setPastAudits(JSON.parse(stored));
    }

    const resumeId = sessionStorage.getItem('resumeAuditId');
    if (resumeId) {
      sessionStorage.removeItem('resumeAuditId');
      if (stored) {
        const audits = JSON.parse(stored);
        const audit = audits.find((a: any) => a.id === resumeId);
        if (audit && audit.report && audit.report.rawResults) {
          const agentMap: Record<string, string> = {
            seo: 'SEOAgent',
            accessibility: 'AccessibilityAgent',
            performance: 'PerformanceAgent',
            security: 'SecurityAgent',
            vision: 'VisionAgent',
            ux: 'UXAgent',
            mobile: 'MobileAgent',
            cro: 'CROAgent',
            brand: 'BrandAgent',
            content: 'ContentAgent',
            competitor: 'CompetitorAgent'
          };
          
          const mappedResumeState: Record<string, any> = {};
          for (const [key, value] of Object.entries(audit.report.rawResults)) {
            if (value != null && agentMap[key]) {
              mappedResumeState[agentMap[key]] = value;
            }
          }
          
          setUrl(audit.url);
          handleAudit(null, mappedResumeState, audit.url);
        }
      }
    }
  }, []);

  // Compute Metrics
  const totalScans = pastAudits.length;
  const avgScore = totalScans > 0 
    ? Math.round(pastAudits.reduce((acc, curr) => acc + (curr.report?.overallScore || 0), 0) / totalScans)
    : 0;
    
  let criticalIssues = 0;
  pastAudits.forEach(audit => {
    if (audit.report?.rawResults) {
      Object.values(audit.report.rawResults).forEach((cat: any) => {
        if (cat?.checks) {
          cat.checks.forEach((chk: any) => {
            if (!chk.passed && chk.impact === 'critical') criticalIssues++;
          });
        }
      });
    }
  });

  const MONTHLY_QUOTA = 500;
  const creditsRemaining = Math.max(0, MONTHLY_QUOTA - totalScans);
  const quotaPercentage = (creditsRemaining / MONTHLY_QUOTA) * 100;

  // Mock Graph Data
  const chartData = [
    { name: 'Mon', Scans: 12 },
    { name: 'Tue', Scans: 19 },
    { name: 'Wed', Scans: 15 },
    { name: 'Thu', Scans: 22 },
    { name: 'Fri', Scans: 30 },
    { name: 'Sat', Scans: 25 },
    { name: 'Sun', Scans: 18 + (totalScans % 10) },
  ];

  const handleAudit = async (e: React.FormEvent | null, resumeState?: any, targetUrl?: string) => {
    if (e) e.preventDefault();
    const finalUrl = targetUrl || url;
    if (!finalUrl) return;

    setLoading(true);
    if (resumeState) {
      setCompletedAgents(Object.keys(resumeState));
    } else {
      setCompletedAgents([]);
    }
    
    setStatusMessage(resumeState ? 'Resuming audit sequence...' : 'Initiating audit sequence...');
    
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl, resumeState })
      });
      
      if (!res.body) throw new Error('No response body');
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';
        
        for (const part of parts) {
          if (!part.trim()) continue;
          
          try {
            const data = JSON.parse(part);
            
            if (data.type === 'status') {
              setStatusMessage(data.message);
            } else if (data.type === 'agent_complete') {
              setCompletedAgents(prev => [...prev, data.agent]);
            } else if (data.type === 'agent_error') {
              setStatusMessage(`Rate limit hit on ${data.agent}. Saving partial report...`);
            } else if (data.type === 'error') {
              alert(data.message);
              setLoading(false);
              return;
            } else if (data.type === 'complete') {
              const auditId = Date.now().toString();
              const newAudit = {
                id: auditId,
                url: data.data.url,
                date: new Date().toISOString(),
                report: data.data.report,
                screenshots: data.data.screenshots,
                subPages: []
              };

              const existingAuditsStr = localStorage.getItem('pastAudits');
              const _pastAudits = existingAuditsStr ? JSON.parse(existingAuditsStr) : [];
              _pastAudits.unshift(newAudit);
              localStorage.setItem('pastAudits', JSON.stringify(_pastAudits));
              sessionStorage.setItem('auditResult', JSON.stringify(data.data));
              
              router.push(`/dashboard/report?id=${auditId}`);
              return;
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error(err);
      alert('Network error during audit.');
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Remaining', value: creditsRemaining },
    { name: 'Used', value: totalScans }
  ];
  const PIE_COLORS = ['#3b82f6', '#e2e8f0'];

  return (
    <div className="p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here is your audit activity.</p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Scans</p>
            <h3 className="text-3xl font-black mt-2">{totalScans}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Score</p>
            <h3 className="text-3xl font-black mt-2">{avgScore}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Critical Issues</p>
            <h3 className="text-3xl font-black mt-2">{criticalIssues}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">API Credits</p>
            <h3 className="text-3xl font-black mt-2">{creditsRemaining} <span className="text-lg text-slate-400 font-medium">/ 500</span></h3>
          </div>
          <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-30 pointer-events-none">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Primary Scanner Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!loading ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Run a New Audit</h2>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">Our elite 11 AI agents will analyze Design, UX, Conversion Rate, SEO, and Brand identity in real-time.</p>
                <form onSubmit={handleAudit} className="max-w-2xl mx-auto">
                  <div className="relative flex items-center">
                    <Search className="absolute left-5 h-6 w-6 text-slate-400" />
                    <input
                      type="url"
                      required
                      placeholder="https://your-website.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-14 pr-40 py-5 rounded-2xl border-0 bg-white shadow-2xl outline-none text-lg text-slate-900 transition-all focus:ring-4 focus:ring-blue-400/50"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 bottom-2 bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      Scan Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
                <div className="flex flex-wrap justify-center gap-6 mt-10 text-blue-100/80 font-medium text-sm">
                  <span className="flex items-center gap-2"><Eye className="w-4 h-4"/> Visual Design</span>
                  <span className="flex items-center gap-2"><Layout className="w-4 h-4"/> UX & Usability</span>
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4"/> Conversion Rate</span>
                  <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Technical SEO</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="progress" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl text-left">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/20">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Analyzing Website</h2>
                    <p className="text-blue-100">{statusMessage}</p>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_AGENTS.map((agent, i) => {
                    const isComplete = completedAgents.includes(agent.id);
                    return (
                      <motion.div 
                        key={agent.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors duration-500 ${isComplete ? 'border-green-400/50 bg-green-500/20' : 'border-white/10 bg-white/5'}`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-green-300" />
                        ) : (
                          <Circle className="w-5 h-5 text-white/30" />
                        )}
                        <span className={`text-sm font-semibold ${isComplete ? 'text-white' : 'text-blue-200'}`}>
                          {agent.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Layout: Chart & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">API Scans Over Time</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4"/> Last 7 Days
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="Scans" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Scans</h2>
            <button onClick={() => router.push('/dashboard/audits')} className="text-sm font-semibold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {pastAudits.slice(0, 5).map(audit => {
              let hostname = audit.url;
              try { hostname = new URL(audit.url).hostname; } catch {}

              return (
                <div key={audit.id} onClick={() => router.push(`/dashboard/report?id=${audit.id}`)} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                  <div className="truncate pr-4">
                    <p className="font-bold text-sm truncate">{hostname}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(audit.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-black text-lg ${audit.report.overallScore >= 90 ? 'text-green-500' : audit.report.overallScore >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                    {audit.report.overallScore}
                  </div>
                </div>
              );
            })}
            {pastAudits.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Search className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No recent scans.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
