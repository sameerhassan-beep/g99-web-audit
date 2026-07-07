'use client';

import React, { useEffect, useState } from 'react';
import { Coins, Zap, CreditCard, ChevronRight, Activity, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CreditsPage() {
  const [sub, setSub] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: subData } = await supabase.from('billing_subscriptions').select('*').limit(1).single();
      const { data: usageData } = await supabase.from('credit_usage').select('*').order('created_at', { ascending: false }).limit(10);
      
      if (subData) {
        setSub(subData);
      } else {
        setSub({ tier: 'Pro Tier', credits_limit: 5000, renewal_date: new Date(Date.now() + 864000000).toISOString() }); // Fallback
      }
      
      if (usageData && usageData.length > 0) {
        setUsage(usageData);
      } else {
        setUsage([
          { id: '1', event_description: 'Full Deep Scan (growth99.com)', amount: -50, created_at: new Date().toISOString() },
          { id: '2', event_description: 'Monthly Plan Renewal', amount: 5000, created_at: new Date().toISOString() },
        ]); // Fallback
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto"/> Loading Billing...</div>;
  }

  // Calculate mock current credits (assuming a sum of usage or static mock for now)
  const currentCredits = 4250;
  const usagePercentage = Math.round(((sub.credits_limit - currentCredits) / sub.credits_limit) * 100);

  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Billing & Credits</h1>
          <p className="text-slate-500 mt-1">Manage your AI analysis credits and subscription tier.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md shadow-indigo-200 flex items-center gap-2">
          <Zap className="w-5 h-5" /> Upgrade Tier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/20 flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-pink-500 rounded-full blur-[100px] opacity-30 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Coins className="w-6 h-6 text-pink-300" />
              </div>
              <div>
                <span className="text-pink-200 font-bold uppercase tracking-wider text-sm block">Current Plan</span>
                <span className="text-xl font-bold text-white">{sub?.tier || 'Pro Tier'}</span>
              </div>
            </div>

            <h4 className="text-5xl md:text-6xl font-black mb-2">{currentCredits.toLocaleString()}</h4>
            <p className="text-slate-400 font-medium mb-8">credits remaining this month</p>
            
            <div className="w-full bg-white/10 rounded-full h-4 mb-3 overflow-hidden backdrop-blur-sm border border-white/5">
              <div className="bg-gradient-to-r from-pink-500 to-amber-500 h-4 rounded-full" style={{ width: `${usagePercentage}%` }} />
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-400">
              <span>{usagePercentage}% Used</span>
              <span>Reset on {new Date(sub.renewal_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <CreditCard className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Method</h3>
            <p className="text-slate-500 mb-6 font-medium">Visa ending in 4242</p>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 mt-8">Next Invoice</h3>
            <p className="text-slate-500 font-medium">$99.00 on {new Date(sub.renewal_date).toLocaleDateString()}</p>
          </div>
          
          <button className="w-full mt-8 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold transition-colors border border-slate-200">
            Manage Billing
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" /> Recent Usage
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 font-bold text-sm border-b border-slate-100">
                <th className="pb-4">Date</th>
                <th className="pb-4">Event</th>
                <th className="pb-4 text-right">Credits Used</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700">
              {usage.map((log: any) => (
                <tr key={log.id} className="border-b border-slate-50">
                  <td className="py-4">{new Date(log.created_at).toLocaleDateString()}</td>
                  <td className="py-4">{log.event_description}</td>
                  <td className={`py-4 text-right ${log.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {log.amount > 0 ? '+' : ''}{log.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
