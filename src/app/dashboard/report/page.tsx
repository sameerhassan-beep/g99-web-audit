'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2, Plus, Globe } from 'lucide-react';
import dynamic from 'next/dynamic';

const DownloadPDFButton = dynamic(() => import('@/components/DownloadPDFButton'), {
  ssr: false,
});

function ReportContent() {
  const [data, setData] = useState<any>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [newUrl, setNewUrl] = useState('');
  const [loadingNewPage, setLoadingNewPage] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const pastAuditsStr = localStorage.getItem('pastAudits');
      if (pastAuditsStr) {
        const pastAudits = JSON.parse(pastAuditsStr);
        const audit = pastAudits.find((a: any) => a.id === id);
        if (audit) {
          setData(audit);
          return;
        }
      }
    }
    
    // Fallback to latest in sessionStorage if no ID or ID not found
    const stored = sessionStorage.getItem('auditResult');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      router.push('/dashboard');
    }
  }, [router, searchParams]);

  const scanAdditionalPage = async () => {
    if (!newUrl) return;
    setLoadingNewPage(true);
    setStatusMessage('Initializing...');
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl })
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
            const parsed = JSON.parse(part);
            if (parsed.type === 'status') {
              setStatusMessage(parsed.message);
            } else if (parsed.type === 'complete') {
              const newSubPage = {
                url: parsed.data.url,
                report: parsed.data.report,
                screenshots: parsed.data.screenshots
              };
              
              const newData = JSON.parse(JSON.stringify(data));
              if (!newData.subPages) newData.subPages = [];
              newData.subPages.push(newSubPage);
              
              setData(newData);
              sessionStorage.setItem('auditResult', JSON.stringify(newData));
              
              const pastAuditsStr = localStorage.getItem('pastAudits');
              if (pastAuditsStr) {
                const pastAudits = JSON.parse(pastAuditsStr);
                const index = pastAudits.findIndex((a: any) => a.id === data.id);
                if (index !== -1) {
                  pastAudits[index] = newData;
                  localStorage.setItem('pastAudits', JSON.stringify(pastAudits));
                }
              }
              
              setNewUrl('');
              setSelectedPageIndex(newData.subPages.length);
            } else if (parsed.type === 'error') {
              alert(parsed.message);
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error(e);
      alert('Failed to scan page.');
    } finally {
      setLoadingNewPage(false);
    }
  };

  if (!data) return <div className="p-10 text-center text-slate-500 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Loading Report...</div>;

  const activeData = selectedPageIndex === 0 ? data : (data.subPages && data.subPages[selectedPageIndex - 1]);
  if (!activeData) return <div className="p-10 text-center text-red-500">Error loading page data.</div>;

  const { report, url, screenshots } = activeData;
  const { overallScore, categoryScores, executiveSummary, rawResults } = report;

  // Pie chart for overall score
  const pieData = [
    { name: 'Score', value: overallScore },
    { name: 'Remaining', value: 100 - overallScore }
  ];
  const COLORS = ['#2563eb', '#e2e8f0'];

  // Bar chart for category breakdown
  const barData = Object.keys(categoryScores).map((key) => ({
    name: key.toUpperCase(),
    Score: categoryScores[key]
  }));

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const getPath = (fullUrl: string) => {
    try {
      return new URL(fullUrl).pathname || '/';
    } catch {
      return fullUrl;
    }
  };

  return (
    <div className="p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100">
      <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-blue-600 hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>
        <DownloadPDFButton data={activeData} />
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
      
        {/* Scan New Page */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4">
          <input
            type="url"
            placeholder="Add another URL to scan (e.g. https://example.com/pricing)..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            disabled={loadingNewPage}
            className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 outline-none focus:border-blue-500"
          />
          <button
            onClick={scanAdditionalPage}
            disabled={loadingNewPage || !newUrl}
            className="whitespace-nowrap px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center transition-colors disabled:opacity-50"
          >
            {loadingNewPage ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> {statusMessage}</> : <><Plus className="w-4 h-4 mr-2" /> Scan Page</>}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedPageIndex(0)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${selectedPageIndex === 0 ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
          >
            <Globe className="w-4 h-4" /> Main: {getPath(data.url)}
          </button>
          {data.subPages?.map((sub: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedPageIndex(idx + 1)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${selectedPageIndex === idx + 1 ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
            >
              <Globe className="w-4 h-4" /> {getPath(sub.url)}
            </button>
          ))}
        </div>

        {report.isPartial && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-start gap-4 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Analysis Interrupted</h3>
                <p className="text-sm opacity-90 mt-1">The analysis was interrupted due to an API error. The data below is partial.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-bold mb-2">G99 WebAudit Report</h1>
            <p className="text-slate-500">{url}</p>
          </div>
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-4xl font-black ${getScoreColor(overallScore)}`}>{overallScore}</span>
              <span className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">Score</span>
            </div>
          </div>
        </motion.div>
        


        {/* Executive Summary */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 flex items-center"><CheckCircle2 className="text-green-500 mr-3" /> Top Strengths</h2>
            <ul className="space-y-4">
              {executiveSummary.topStrengths.map((str: string, i: number) => (
                <li key={i} className="flex items-start text-sm bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100 p-3 rounded-xl">
                  {str}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 flex items-center"><AlertTriangle className="text-amber-500 mr-3" /> Priority Fixes</h2>
            <ul className="space-y-4">
              {executiveSummary.priorityFixes.map((fix: string, i: number) => (
                <li key={i} className="flex items-start text-sm bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-100 p-3 rounded-xl">
                  {fix}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-8">Category Breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Score" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Deep Dive Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(rawResults).filter(category => rawResults[category] != null).map((category, idx) => (
            <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + (idx * 0.1) }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold capitalize text-lg">{category}</h3>
                <span className={`font-black text-xl ${getScoreColor(rawResults[category].score)}`}>{rawResults[category].score}</span>
              </div>
              <div className="text-sm text-slate-500 mb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Severity:</span> {rawResults[category].severity}
              </div>
              <div className="text-sm text-slate-500 line-clamp-3">
                {rawResults[category].observations[0] || 'No observations recorded.'}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Checks Accordion/List */}
        <div className="mt-16 space-y-8">
          <h2 className="text-3xl font-bold mb-8">Detailed Category Audits</h2>
          {Object.keys(rawResults).filter(category => rawResults[category] != null).map((category) => {
            const result = rawResults[category];
            if (!result.checks || result.checks.length === 0) return null;

            return (
              <motion.div key={`details-${category}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-2xl font-bold capitalize">{category} Analysis</h3>
                  <div className="flex gap-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-semibold">
                      {result.checks.filter((c: any) => c.passed).length} Passed
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-semibold">
                      {result.checks.filter((c: any) => !c.passed).length} Failed
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Check</th>
                          <th className="pb-3 font-semibold">Impact</th>
                          <th className="pb-3 font-semibold">Remediation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {result.checks.map((check: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-4 pr-4 align-top w-12">
                              {check.passed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </td>
                            <td className="py-4 pr-4 align-top font-medium w-1/3">
                              {check.checkName}
                            </td>
                            <td className="py-4 pr-4 align-top w-24">
                              {!check.passed && check.impact && (
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                                  ${check.impact === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                                    check.impact === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                                    check.impact === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}
                                `}>
                                  {check.impact}
                                </span>
                              )}
                            </td>
                            <td className="py-4 align-top text-slate-600 dark:text-slate-400">
                              {check.passed ? <span className="text-slate-300 dark:text-slate-600">—</span> : check.remediation || 'No remediation provided.'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Loading Report...</div>}>
      <ReportContent />
    </Suspense>
  );
}
