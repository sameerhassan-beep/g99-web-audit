'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Loader2, Globe, Sparkles, CheckCircle2, Circle, Eye, Layout, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const ALL_AGENTS = [
  { id: 'design', name: 'Master Design Agent' },
  { id: 'ux', name: 'UX/UI Analysis' },
  { id: 'performance', name: 'Performance Metrics' },
  { id: 'accessibility', name: 'Accessibility Check' },
  { id: 'seo', name: 'Technical SEO' },
  { id: 'copy', name: 'Copywriting & Tone' },
  { id: 'conversion', name: 'Conversion Rate' },
  { id: 'brand', name: 'Brand Identity' },
  { id: 'security', name: 'Security Review' },
  { id: 'mobile', name: 'Mobile Responsiveness' },
];

export default function NewAuditPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    setIsScanning(true);
    setCompletedAgents([]);
    
    try {
      // Simulate agents loading
      for (let i = 0; i < ALL_AGENTS.length; i++) {
        setStatusMessage(`Agent ${ALL_AGENTS[i].name} is analyzing...`);
        await new Promise(r => setTimeout(r, 600)); // 600ms per agent
        setCompletedAgents(prev => [...prev, ALL_AGENTS[i].id]);
      }

      setStatusMessage('Finalizing report...');
      
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      
      if (!res.ok) {
        throw new Error('Server returned ' + res.status);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let buffer = '';
      let finalData = null;

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
              finalData = parsed.data;
            } else if (parsed.type === 'error') {
              throw new Error(parsed.message);
            }
          } catch (e: any) {
            // Ignore parse errors for incomplete chunks (shouldn't happen with split by \n)
          }
        }
      }

      if (finalData) {
        // Generate a new ID
        const auditId = Date.now().toString();
        
        const payloadToSave = {
          id: auditId,
          url: finalData.url,
          overall_score: finalData.report.overallScore,
          report: finalData.report,
          screenshots: finalData.screenshots,
          sub_pages: [],
        };
        
        // Always save to sessionStorage as a fallback (for when Supabase isn't configured yet)
        sessionStorage.setItem('auditResult', JSON.stringify(payloadToSave));

        // Try to save to Supabase
        const supabase = createClient();
        const { error } = await supabase.from('audits').insert(payloadToSave);

        if (error) {
          console.error('DB Insert Error:', error);
          // Don't alert here to avoid interrupting the flow, the fallback will work perfectly.
        }

        router.push(`/dashboard/report?id=${auditId}`);
      } else {
        throw new Error('Did not receive complete payload from server.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error occurred.');
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Audit</h1>
        <p className="text-slate-500 mt-1">Deploy 11 specialized AI agents to scan your property.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 md:p-16 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <AnimatePresence mode="wait">
          {!isScanning ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900">Enter a URL to begin</h2>
              <p className="text-slate-500 mb-10 w-full text-lg">Our elite team of agents will analyze Design, UX, Conversion Rate, SEO, and Brand identity in real-time.</p>
              
              <form onSubmit={handleAudit} className="w-full">
                <div className="relative flex items-center group">
                  <Globe className="absolute left-6 h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="url"
                    required
                    placeholder="https://your-website.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-16 pr-44 py-6 rounded-3xl border border-slate-200 bg-slate-50 outline-none text-lg text-slate-900 transition-all focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-inner"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-3 bottom-3 bg-slate-900 hover:bg-indigo-600 text-white px-8 rounded-2xl font-bold transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    Scan Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
              
              <div className="flex flex-wrap justify-center gap-8 mt-12 text-slate-500 font-medium text-sm">
                <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100"><Eye className="w-4 h-4 text-indigo-500"/> Visual Design</span>
                <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100"><Layout className="w-4 h-4 text-pink-500"/> UX & Usability</span>
                <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100"><Zap className="w-4 h-4 text-amber-500"/> Conversion Rate</span>
                <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100"><ShieldCheck className="w-4 h-4 text-green-500"/> Technical SEO</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="progress" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="relative z-10"
            >
              <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <Loader2 className="h-7 w-7 text-indigo-600 animate-spin" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Analyzing Website</h2>
                  <p className="text-indigo-600 font-medium mt-1">{statusMessage}</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALL_AGENTS.map((agent, i) => {
                  const isComplete = completedAgents.includes(agent.id);
                  return (
                    <motion.div 
                      key={agent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-500",
                        isComplete 
                          ? 'border-green-200 bg-green-50 shadow-sm' 
                          : 'border-slate-100 bg-slate-50'
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className={cn("text-sm font-bold", isComplete ? 'text-green-800' : 'text-slate-500')}>
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
  );
}
