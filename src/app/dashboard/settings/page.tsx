'use client';

import React from 'react';
import { CreditCard, Activity, Settings as SettingsIcon, Link2 } from 'lucide-react';

export default function SettingsPage() {
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
            <p className="text-slate-500 mb-8 relative z-10">Manage global integrations here. Note: Microsoft Clarity integrations are now managed directly inside individual Projects.</p>
            
          </div>
        </div>
      </div>
    </div>
  );
}
