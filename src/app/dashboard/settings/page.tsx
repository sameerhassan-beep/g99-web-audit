'use client';

import React, { useState, useEffect } from 'react';
import { Save, CreditCard, Activity, Settings as SettingsIcon, Link2, Key, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [clarityApiToken, setClarityApiToken] = useState('');
  const [useClarity, setUseClarity] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedApiToken = localStorage.getItem('clarityApiToken');
    const savedUseClarity = localStorage.getItem('useClarity');
    
    if (savedApiToken) setClarityApiToken(savedApiToken);
    if (savedUseClarity === 'true') setUseClarity(true);
  }, []);

  const handleSave = () => {
    localStorage.setItem('clarityApiToken', clarityApiToken);
    localStorage.setItem('useClarity', useClarity ? 'true' : 'false');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your integrations, billing, and account preferences.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Navigation/Summary) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" /> Subscription
            </h2>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <p className="font-bold text-lg mb-1">Free Tier</p>
              <p className="text-sm text-slate-300 mb-4 opacity-90">Basic access to audit agents.</p>
              
              <div className="pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-400">Stripe integration coming soon to upgrade to Pro.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Usage
            </h2>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-slate-900">0</span>
              <span className="text-slate-500 font-medium mb-1">/ 10 credits</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
              <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-xs text-slate-500">Credits reset at the end of the month.</p>
          </div>
        </div>

        {/* Right Column (Settings Forms) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-20 -mt-20" />
            
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <Link2 className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">Integrations</h2>
            </div>
            <p className="text-slate-500 mb-8 relative z-10">Connect third-party services to enhance your audits with real-world data.</p>
            
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
                      Connect Microsoft Clarity to inject actual behavioral data (heatmaps, rage clicks, scroll depth) directly into the AI vision analysis for data-backed CRO recommendations.
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center p-2 shrink-0">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-full h-full object-contain opacity-80" />
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Enable Clarity Analysis</p>
                      <p className="text-xs text-slate-500">Toggle off to use the default analysis flow.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={useClarity} onChange={(e) => setUseClarity(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {useClarity && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-400" /> Personal Access Token
                      </label>
                      <input
                        type="password"
                        value={clarityApiToken}
                        onChange={(e) => setClarityApiToken(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                        className="w-full px-5 py-3.5 rounded-2xl border-none ring-1 ring-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        We will use this token to automatically find the correct Project ID for any URL you scan.
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all w-full sm:w-auto shadow-md ${
                        isSaved 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-slate-900 text-white hover:bg-indigo-600'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" /> Saved Successfully
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" /> Save Configuration
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
