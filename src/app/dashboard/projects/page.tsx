'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Folder, Plus, Globe, ChevronRight, Loader2, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-slate-500 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Loading Projects...</div>;
  }

  return (
    <div className="pb-10 animate-in fade-in duration-500 px-4 max-w-7xl mx-auto mt-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200 shrink-0">
            <Folder className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Projects</h1>
            <p className="text-slate-500 mt-1">Manage your website domains and integrations.</p>
          </div>
        </div>
        
        <Link 
          href="/dashboard/projects/new"
          className="h-12 px-6 bg-black hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_5px_15px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.4)] whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#F3F4F6] border-2 border-slate-200 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-slate-300">
            <LayoutDashboard className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No projects yet</h2>
          <p className="text-slate-500 text-lg mb-8 max-w-sm">Create a project to manage audits and integrations for a specific domain.</p>
          <Link 
            href="/dashboard/projects/new"
            className="h-14 px-8 bg-black hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center transition-all shadow-md"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/dashboard/projects/${project.id}`}
              className="group block bg-white border-2 border-slate-200 rounded-[2rem] p-6 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  <Globe className="h-4 w-4" />
                  {project.domain}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 truncate mb-2">
                  {project.name}
                </h3>
                
                <div className="mt-1 flex gap-4 flex-1">
                  {project.clarity_api_token ? (
                    <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div> Clarity Connected
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      No Integrations
                    </span>
                  )}
                </div>
                
                <div className="flex items-end justify-between mt-6 pt-4 border-t-2 border-slate-100 w-full">
                  <div className="text-sm font-bold text-slate-500">
                    View Dashboard
                  </div>
                  
                  <div className="h-10 w-10 rounded-full bg-slate-50 text-slate-400 items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all flex shadow-sm border border-slate-200 group-hover:border-transparent">
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
