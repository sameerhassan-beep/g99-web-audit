'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

function ScreenshotsContent() {
  const [data, setData] = useState<any>(null);
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
        
        // Fallback to sessionStorage
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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Assuming activeData is the primary audit page for this iteration (sub_pages support could be added later)
  const activeData = data;
  const rawResults = activeData.report?.rawResults || {};

  // Find all categories that actually have markers
  const categoriesWithMarkers = Object.keys(rawResults).filter(
    (category) => rawResults[category]?.markers && rawResults[category].markers.length > 0
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/report?id=${data.id}`} className="w-12 h-12 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interactive Visual Map</h1>
              <p className="text-slate-500 font-medium mt-1 text-sm">{activeData.url}</p>
            </div>
          </div>
        </div>

        {categoriesWithMarkers.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-slate-100">
            <p className="text-slate-500 text-lg">No visual markers were generated for this audit.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {categoriesWithMarkers.map((category) => {
              const result = rawResults[category];
              return (
                <div key={category} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 capitalize">{category} Analysis</h2>
                      <p className="text-slate-500 text-sm mt-1">Hover over the numbered markers to see detailed AI observations.</p>
                    </div>
                    <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-200">
                      {result.markers.length} Markers
                    </div>
                  </div>
                  
                  <div className="p-8 bg-white flex flex-col items-center">
                    {/* Inner scrollable container for massive screenshots */}
                    <div className="w-full max-h-[75vh] overflow-y-auto overflow-x-auto rounded-xl border-[4px] border-slate-200 shadow-inner bg-slate-50 p-4 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-slate-100">
                      <div className="relative inline-block mx-auto min-w-min">
                        {/* Use fullPage if available, else fallback to desktop */}
                        <img 
                          src={activeData.screenshots?.fullPageNoModals || activeData.screenshots?.fullPage || activeData.screenshots?.desktop} 
                          alt={`${category} Analyzed Screen`} 
                          className="w-auto h-auto max-w-none rounded-md" 
                          style={{ width: '1200px' }}
                        />
                      
                      {result.markers.map((marker: any, idx: number) => (
                        <div 
                          key={`marker-${idx}`}
                          className="absolute w-8 h-8 -ml-4 -mt-4 bg-indigo-600 border-[3px] border-white rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)] flex items-center justify-center cursor-pointer group hover:z-10 animate-in zoom-in duration-500"
                          style={{ left: `${Math.max(0, Math.min(100, marker.x))}%`, top: `${Math.max(0, Math.min(100, marker.y))}%`, animationDelay: `${idx * 150}ms` }}
                        >
                          <span className="text-xs font-black text-white">{idx + 1}</span>
                          
                          {/* Tooltip */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 p-5 bg-white text-slate-900 text-xs rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-slate-100">
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45"></div>
                            <strong className="block mb-2 text-indigo-600 text-[14px] uppercase tracking-wider">{marker.label}</strong>
                            <span className="text-slate-600 leading-relaxed text-[13px]">{marker.description}</span>
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScreenshotsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    }>
      <ScreenshotsContent />
    </Suspense>
  );
}
