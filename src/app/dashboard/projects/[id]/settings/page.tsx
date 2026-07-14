'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Link2, Key, CheckCircle2, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [clarityApiToken, setClarityApiToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (error || !data) {
        router.push('/dashboard/projects');
        return;
      }
      
      setProject(data);
      if (data.clarity_api_token) {
        setClarityApiToken(data.clarity_api_token);
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectId, router]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('projects')
      .update({ clarity_api_token: clarityApiToken })
      .eq('id', projectId);

    setSaving(false);
    if (!error) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } else {
      alert('Failed to save settings.');
    }
  };

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="pb-10 animate-in fade-in duration-500 px-4 max-w-4xl mx-auto mt-8">
      <Link href={`/dashboard/projects/${projectId}`} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to {project.name}
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Settings</h1>
          <p className="text-slate-500 mt-1">Manage integrations for {project.domain}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <Link2 className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-900">Integrations</h2>
        </div>
        <p className="text-slate-500 mb-8 relative z-10">Connect third-party services to enhance your audits.</p>
        
        <div className="space-y-8 relative z-10">
          {/* Clarity Integration Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Microsoft Clarity
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wide">BETA</span>
                </h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
                  Connect Microsoft Clarity to inject actual behavioral data directly into the AI vision analysis for {project.domain}.
                </p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center p-2 shrink-0">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-full h-full object-contain opacity-80" />
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-400" /> Personal Access Token
                </label>
                <input
                  type="password"
                  value={clarityApiToken}
                  onChange={(e) => setClarityApiToken(e.target.value)}
                  placeholder="Paste your Clarity API Token here..."
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Leave this blank to disable Clarity analysis for this project.
                </p>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all w-full sm:w-auto shadow-sm ${
                    isSaved 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-black text-white hover:bg-indigo-600'
                  } disabled:opacity-70`}
                >
                  {isSaved ? (
                    <><CheckCircle2 className="w-5 h-5" /> Saved Successfully</>
                  ) : saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" /> Save Configuration</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
