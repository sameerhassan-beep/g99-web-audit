'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Globe, ExternalLink, ChevronRight, Activity, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem('pastAudits');
    if (existing) {
      setAudits(JSON.parse(existing));
    }
    setMounted(true);
  }, []);

  const deleteAudit = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    const newAudits = audits.filter(a => a.id !== id);
    setAudits(newAudits);
    localStorage.setItem('pastAudits', JSON.stringify(newAudits));
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Activity className="h-6 w-6 text-blue-600 dark:text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Past Audits</h1>
      </div>

      {audits.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Globe className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No audits yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Run your first AI Design Audit to see it here.</p>
          <Link 
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors"
          >
            Start New Scan
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {audits.map((audit) => (
            <Link 
              key={audit.id} 
              href={`/dashboard/report?id=${audit.id}`}
              className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(audit.date).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'long', day: 'numeric', 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                    {audit.url}
                    <ExternalLink className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center sm:text-right">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Score</div>
                    <div className={cn(
                      "text-3xl font-black",
                      audit.report.overallScore >= 80 ? "text-green-500" :
                      audit.report.overallScore >= 50 ? "text-amber-500" : "text-red-500"
                    )}>
                      {audit.report.overallScore}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => deleteAudit(e, audit.id)}
                      className="hidden sm:flex h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="hidden sm:flex h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
