'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Globe, ExternalLink, ChevronRight, Activity, Trash2, ShieldAlert, Loader2, Search, Filter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createClient } from '@/lib/supabase/client';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');

  useEffect(() => {
    const fetchAudits = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setAudits(data);
      }
      setLoading(false);
    };
    fetchAudits();
  }, []);

  const deleteAudit = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    const supabase = createClient();
    const { error } = await supabase.from('audits').delete().eq('id', id);
    
    if (!error) {
      setAudits(audits.filter(a => a.id !== id));
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Loading Audits...</div>;
  }
  
  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-[#DCFCE7] text-[#065F46] border-[#BBF7D0]';
    if (score >= 70) return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
    return 'bg-[#FEE2E2] text-[#7F1D1D] border-[#FECACA]';
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.url.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesScore = true;
    
    if (filterScore === 'high') {
      matchesScore = audit.report.overallScore >= 90;
    } else if (filterScore === 'medium') {
      matchesScore = audit.report.overallScore >= 70 && audit.report.overallScore < 90;
    } else if (filterScore === 'low') {
      matchesScore = audit.report.overallScore < 70;
    }
    
    return matchesSearch && matchesScore;
  });

  return (
    <div className="pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 px-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200 shrink-0">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Past Audits</h1>
          </div>
        </div>
        
        {/* Search & Filter Toolbar */}
        {audits.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search URLs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              />
            </div>
            
            <div className="relative w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select 
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-11 pr-10 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 cursor-pointer"
              >
                <option value="all">All Scores</option>
                <option value="high">Excellent (90+)</option>
                <option value="medium">Average (70-89)</option>
                <option value="low">Poor (&lt;70)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
        )}
      </div>

      {audits.length === 0 ? (
        <div className="bg-[#F3F4F6] border-2 border-slate-200 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-slate-300">
            <Globe className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No audits yet</h2>
          <p className="text-slate-500 text-lg mb-8 max-w-sm">Run your first AI Design Audit to start analyzing your web properties.</p>
          <Link 
            href="/dashboard"
            className="h-14 px-8 bg-black hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.4)]"
          >
            Start New Scan
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAudits.map((audit) => (
              <Link 
                key={audit.id} 
                href={`/dashboard/report?id=${audit.id}`}
                className="group block bg-white border-2 border-slate-200 rounded-[2rem] p-6 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]"
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    <Calendar className="h-4 w-4" />
                    {new Date(audit.date).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 truncate flex items-center gap-2 mb-2">
                    {audit.url}
                    <ExternalLink className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </h3>
                  
                  {/* Snapshot of issues */}
                  <div className="mt-1 flex gap-4 flex-1">
                    <span className="text-sm font-semibold text-slate-500 flex items-center">
                      <ShieldAlert className="w-4 h-4 mr-1.5 text-slate-400"/> 
                      {audit.report.executiveSummary.priorityFixes.length} Priority Fixes
                    </span>
                  </div>
                  
                  <div className="flex items-end justify-between mt-6 pt-4 border-t-2 border-slate-100 w-full">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</div>
                      <div className={cn(
                        "flex items-center justify-center w-14 h-14 rounded-2xl border-2 text-xl font-black shadow-sm",
                        getScoreBg(audit.report.overallScore)
                      )}>
                        {audit.report.overallScore}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => deleteAudit(e, audit.id)}
                        className="h-10 w-10 rounded-full bg-slate-50 items-center justify-center hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors flex shadow-sm border border-slate-200"
                        title="Delete Report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="h-10 w-10 rounded-full bg-black text-white items-center justify-center group-hover:bg-indigo-600 group-hover:scale-110 transition-all flex shadow-md border-2 border-transparent">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {filteredAudits.length === 0 && (
            <div className="py-20 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-500 font-medium">No reports match your current search and filter settings.</p>
              <button 
                onClick={() => { setSearchTerm(''); setFilterScore('all'); }}
                className="mt-6 text-indigo-600 font-bold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
