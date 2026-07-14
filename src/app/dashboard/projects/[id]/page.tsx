'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Settings as SettingsIcon, LayoutDashboard, Plus, Loader2, FileText, ChevronRight, Activity, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function ProjectDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectAndAudits = async () => {
      const supabase = createClient();
      
      // Fetch Project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (projectError || !projectData) {
        console.error(projectError);
        router.push('/dashboard/projects');
        return;
      }
      
      setProject(projectData);

      // Fetch Audits for this project
      const { data: auditsData } = await supabase
        .from('audits')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (auditsData) {
        setAudits(auditsData);
      }
      
      setLoading(false);
    };

    fetchProjectAndAudits();
  }, [projectId, router]);

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-[#DCFCE7] text-[#065F46] border-[#BBF7D0]';
    if (score >= 70) return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
    return 'bg-[#FEE2E2] text-[#7F1D1D] border-[#FECACA]';
  };

  return (
    <div className="pb-10 animate-in fade-in duration-500 px-4 max-w-7xl mx-auto mt-8">
      <Link href="/dashboard/projects" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex items-start gap-5 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center text-white shadow-md border border-slate-700 shrink-0">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 font-medium mt-1">
              <Globe className="w-4 h-4" /> {project.domain}
            </div>
            
            <div className="flex items-center gap-3 mt-4">
              {project.clarity_api_token ? (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Microsoft Clarity Connected
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5">
                  No Integrations
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <Link 
            href={`/dashboard/projects/${project.id}/settings`}
            className="h-12 px-5 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all flex-1 md:flex-none"
          >
            <SettingsIcon className="w-4 h-4" /> Settings
          </Link>
          <Link 
            href={`/dashboard/audits/new?project_id=${project.id}`}
            className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md flex-1 md:flex-none whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Audit
          </Link>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Activity className="w-5 h-5 text-indigo-500" />
        <h2 className="text-xl font-bold text-slate-900">Project Audits</h2>
      </div>

      {audits.length === 0 ? (
        <div className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-slate-300">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No audits found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">Run your first AI Design Audit for this project to start analyzing the website.</p>
          <Link 
            href={`/dashboard/audits/new?project_id=${project.id}`}
            className="px-6 py-3 bg-black hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md"
          >
            Run Project Audit
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audits.map((audit) => (
             <Link 
               key={audit.id} 
               href={`/dashboard/report?id=${audit.id}`}
               className="group block bg-white border-2 border-slate-200 rounded-[2rem] p-6 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]"
             >
               <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                   <Calendar className="h-4 w-4" />
                   {new Date(audit.created_at || audit.date).toLocaleDateString(undefined, { 
                     year: 'numeric', month: 'short', day: 'numeric'
                   })}
                 </div>
                 
                 <h3 className="text-xl font-bold text-slate-900 truncate mb-2">
                   {audit.url}
                 </h3>
                 
                 <div className="flex items-end justify-between mt-6 pt-4 border-t-2 border-slate-100 w-full">
                   <div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</div>
                     <div className={cn(
                       "flex items-center justify-center w-14 h-14 rounded-2xl border-2 text-xl font-black shadow-sm",
                       getScoreBg(audit.report?.overallScore || 0)
                     )}>
                       {audit.report?.overallScore || 0}
                     </div>
                   </div>
                   
                   <div className="h-10 w-10 rounded-full bg-black text-white items-center justify-center group-hover:bg-indigo-600 group-hover:scale-110 transition-all flex shadow-md border-2 border-transparent">
                     <ChevronRight className="h-5 w-5" />
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
