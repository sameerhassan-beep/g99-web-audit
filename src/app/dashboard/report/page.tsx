'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Loader2, Plus, Globe, Download, ArrowUpRight, ShieldAlert, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

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
    const fetchAudit = async () => {
      const id = searchParams.get('id');
      if (id) {
        const supabase = createClient();
        const { data: audit, error } = await supabase.from('audits').select('*').eq('id', id).single();
        if (audit && !error) {
          setData(audit);
          return;
        }
        
        // Fallback to sessionStorage if Supabase fails (e.g. user hasn't ran migrations yet)
        const stored = sessionStorage.getItem('auditResult');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.id === id) {
              setData(parsed);
              return;
            }
          } catch (e) {}
        }
      }
      router.push('/dashboard');
    };
    fetchAudit();
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
              if (!newData.sub_pages) newData.sub_pages = [];
              newData.sub_pages.push(newSubPage);
              
              setData(newData);
              
              const supabase = createClient();
              await supabase.from('audits').update({ sub_pages: newData.sub_pages }).eq('id', data.id);
              
              // Also update fallback cache
              sessionStorage.setItem('auditResult', JSON.stringify(newData));
              
              
              setNewUrl('');
              setSelectedPageIndex(newData.sub_pages.length);
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

  const activeData = selectedPageIndex === 0 ? data : (data.sub_pages && data.sub_pages[selectedPageIndex - 1]);
  if (!activeData) return <div className="p-10 text-center text-red-500">Error loading page data.</div>;

  const { report, url } = activeData;
  const { overallScore, categoryScores, executiveSummary, rawResults } = report;

  const barData = Object.keys(categoryScores).map((key) => ({
    name: key.toUpperCase(),
    Score: categoryScores[key]
  }));

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#10B981]'; // Emerald
    if (score >= 70) return 'text-[#F59E0B]'; // Amber
    return 'text-[#EF4444]'; // Red
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-[#DCFCE7] border-[#BBF7D0]'; // Emerald light
    if (score >= 70) return 'bg-[#FEF3C7] border-[#FDE68A]'; // Amber light
    return 'bg-[#FEE2E2] border-[#FECACA]'; // Red light
  };

  const getPath = (fullUrl: string) => {
    try {
      return new URL(fullUrl).pathname || '/';
    } catch {
      return fullUrl;
    }
  };

  return (
    <div className="pb-10 animate-in fade-in duration-500">
      
      {/* Top Nav & PDF Button */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => router.push('/dashboard/reports')}
          className="flex items-center text-slate-500 hover:text-black transition-colors font-semibold bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <DownloadPDFButton data={activeData} />
      </div>

      <div className="flex flex-col gap-8">
      
        {/* Tabs for Subpages */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedPageIndex(0)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap text-sm font-bold transition-all shadow-sm border ${
              selectedPageIndex === 0 
              ? 'bg-black text-white border-black' 
              : 'bg-white text-slate-500 hover:text-black border-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" /> Main: {getPath(data.url)}
          </button>
          {data.sub_pages?.map((sub: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedPageIndex(idx + 1)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap text-sm font-bold transition-all shadow-sm border ${
                selectedPageIndex === idx + 1 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-slate-500 hover:text-black border-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" /> {getPath(sub.url)}
            </button>
          ))}
        </div>

        {report.isPartial && (
          <div className="bg-[#FEF3C7] border border-[#FDE68A] p-6 rounded-[2rem] flex items-center gap-4 text-[#B45309] shadow-sm">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-bold text-lg">Analysis Interrupted</h3>
              <p className="text-sm mt-1">The analysis was interrupted due to an API error. The data below is partial.</p>
            </div>
          </div>
        )}

        {/* Hero Section (Bento Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Title & URL Card (Spans 8) */}
          <div className="col-span-1 lg:col-span-8 bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-wide mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                REPORT READY
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                G99 WebAudit
              </h1>
              <p className="text-slate-500 text-lg break-all">
                {url}
              </p>
            </div>
          </div>
          
          {/* Huge Score Card (Spans 4) */}
          <div className={`col-span-1 lg:col-span-4 rounded-[2.5rem] p-8 md:p-10 shadow-sm border ${getScoreBg(overallScore)} flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]`}>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/40 rounded-full blur-3xl" />
            <span className="text-[5rem] md:text-[6rem] font-black leading-none tracking-tighter" style={{ color: overallScore >= 90 ? '#065F46' : overallScore >= 70 ? '#92400E' : '#7F1D1D' }}>
              {overallScore}
            </span>
            <span className="text-sm font-bold tracking-widest uppercase mt-2 opacity-80" style={{ color: overallScore >= 90 ? '#065F46' : overallScore >= 70 ? '#92400E' : '#7F1D1D' }}>
              Overall Score
            </span>
          </div>

        </div>

        {/* Executive Summary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths Bento Box */}
          <div className="bg-[#FDE6D2] rounded-[2rem] p-8 md:p-10 shadow-sm border border-[#FDBA74] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Top Strengths</h2>
            </div>
            <ul className="space-y-4 relative z-10">
              {executiveSummary.topStrengths.map((str: string, i: number) => (
                <li key={i} className="flex items-start text-sm md:text-base font-medium text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mr-3 mt-0.5" />
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fixes Bento Box */}
          <div className="bg-[#D5E5F9] rounded-[2rem] p-8 md:p-10 shadow-sm border border-[#93C5FD] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500">
                <ShieldAlert className="w-6 h-6 fill-current" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Priority Fixes</h2>
            </div>
            <ul className="space-y-4 relative z-10">
              {executiveSummary.priorityFixes.map((fix: string, i: number) => (
                <li key={i} className="flex items-start text-sm md:text-base font-medium text-slate-800">
                  <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mr-3 mt-0.5" />
                  <span className="leading-relaxed">{fix}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Scan Subpage (Full Width) */}
        <div className="bg-[#F3F4F6] rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="md:w-1/2">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Additional Page Scanning</h2>
            <p className="text-sm text-slate-500 leading-relaxed">Add another page from this site (e.g. pricing, about) to run a dedicated AI audit.</p>
          </div>
          
          <div className="md:w-1/2 flex flex-col sm:flex-row gap-4">
            <input
              type="url"
              placeholder="https://example.com/pricing"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              disabled={loadingNewPage}
              className="flex-1 px-5 py-4 rounded-2xl border-none shadow-inner bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
            />
            <button
              onClick={scanAdditionalPage}
              disabled={loadingNewPage || !newUrl}
              className="sm:w-48 h-14 bg-black hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-black shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.4)]"
            >
              {loadingNewPage ? <><Loader2 className="w-5 h-5 mr-3 animate-spin"/> {statusMessage}</> : <><Plus className="w-5 h-5 mr-2" /> Start Scan</>}
            </button>
          </div>
        </div>

        {/* Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Category Chart (Spans 12) */}
          <div className="col-span-1 lg:col-span-12 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold mb-8 text-slate-900">Category Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 'bold' }} />
                  <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} />
                  <Bar dataKey="Score" fill="#8B5CF6" radius={[8, 8, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Category Audits (Audit Arena Style) */}
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-3 mb-2 px-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Detailed Audits</h2>
          </div>
          
          {Object.keys(rawResults).filter(category => rawResults[category] != null).map((category) => {
            const result = rawResults[category];
            if (!result.checks || result.checks.length === 0) return null;

            return (
              <div key={`details-${category}`} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Category Header */}
                <div className="bg-slate-50 p-8 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${getScoreBg(result.score)}`}>
                      <span className={`text-2xl font-black ${getScoreColor(result.score)}`}>{result.score}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold capitalize text-slate-900">{category} Analysis</h3>
                      <div className="flex gap-3 mt-2">
                        <span className="text-sm font-semibold text-green-600 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> {result.checks.filter((c: any) => c.passed).length} Passed</span>
                        <span className="text-sm font-semibold text-red-500 flex items-center"><XCircle className="w-4 h-4 mr-1"/> {result.checks.filter((c: any) => !c.passed).length} Failed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Markers for Vision/UX Analysis */}
                {result.markers && result.markers.length > 0 && activeData.screenshots?.desktop && (
                  <div className="p-8 border-b border-slate-100 bg-slate-50 flex flex-col items-center">
                    <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs flex items-center gap-2 self-start">
                      Visual Feedback Map
                    </h4>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-[4px] border-slate-800 inline-block max-w-full">
                      <img src={activeData.screenshots.desktop} alt="Analyzed Screen" className="w-full h-auto object-contain max-h-[80vh]" />
                      {result.markers.map((marker: any, idx: number) => (
                        <div 
                          key={`marker-${idx}`}
                          className="absolute w-8 h-8 -ml-4 -mt-4 bg-indigo-600 border-[3px] border-white rounded-full shadow-[0_0_15px_rgba(79,70,229,0.6)] flex items-center justify-center cursor-pointer group hover:z-10 animate-in zoom-in duration-500"
                          style={{ left: `${Math.max(0, Math.min(100, marker.x))}%`, top: `${Math.max(0, Math.min(100, marker.y))}%`, animationDelay: `${idx * 150}ms` }}
                        >
                          <span className="text-xs font-black text-white">{idx + 1}</span>
                          
                          {/* Tooltip */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 p-4 bg-slate-900 text-white text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-slate-700">
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-t border-l border-slate-700 rotate-45"></div>
                            <strong className="block mb-1 text-indigo-300 text-[13px]">{marker.label}</strong>
                            <span className="text-slate-300 leading-relaxed text-[12px]">{marker.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-observations (Optional based on agent output) */}
                {(result.issues?.length > 0 || result.recommendations?.length > 0) && (
                  <div className="p-8 border-b border-slate-100 grid md:grid-cols-2 gap-8 bg-white">
                    {result.issues?.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Key Issues</h4>
                        <ul className="space-y-3">
                          {result.issues.map((iss: string, idx: number) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start"><span className="text-red-500 mr-2 mt-0.5">•</span> <span>{iss}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.recommendations?.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Recommendations</h4>
                        <ul className="space-y-3">
                          {result.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start"><span className="text-green-500 mr-2 mt-0.5">•</span> <span>{rec}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Checks Table */}
                <div className="p-8">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b-2 border-slate-100 text-slate-400">
                          <th className="pb-4 font-bold text-xs uppercase tracking-wider">Status</th>
                          <th className="pb-4 font-bold text-xs uppercase tracking-wider">Check</th>
                          <th className="pb-4 font-bold text-xs uppercase tracking-wider">Impact</th>
                          <th className="pb-4 font-bold text-xs uppercase tracking-wider">Remediation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {result.checks.map((check: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-5 pr-4 align-top w-12">
                              {check.passed ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><XCircle className="w-5 h-5" /></div>
                              )}
                            </td>
                            <td className="py-5 pr-6 align-top font-bold text-slate-900 w-1/3 text-sm leading-relaxed">
                              {check.checkName}
                            </td>
                            <td className="py-5 pr-4 align-top w-28">
                              {!check.passed && check.impact && (
                                <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider
                                  ${check.impact === 'critical' ? 'bg-red-100 text-red-700' :
                                    check.impact === 'high' ? 'bg-orange-100 text-orange-700' :
                                    check.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-600'}
                                `}>
                                  {check.impact}
                                </span>
                              )}
                            </td>
                            <td className="py-5 align-top text-slate-500 text-sm leading-relaxed">
                              {check.passed ? <span className="text-slate-300">—</span> : check.remediation || 'No remediation provided.'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
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
