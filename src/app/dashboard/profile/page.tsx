'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Save, Key, UserCog } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setUserId(user.id);
        
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setFullName(profile.full_name || '');
          setJobTitle(profile.job_title || '');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    
    await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        full_name: fullName, 
        job_title: jobTitle,
        updated_at: new Date().toISOString()
      });
      
    setSaving(false);
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Loading Profile...</div>;
  }

  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100 flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-1 flex-shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[20px] flex items-center justify-center text-white font-black text-3xl">
              {email ? email.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {fullName || (email ? email.split('@')[0] : 'User')}
            </h2>
            <p className="text-slate-500 font-medium mt-1">{jobTitle || 'No Title Set'}</p>
            <button className="mt-3 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
              Change Avatar
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-medium outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Job Title</label>
            <div className="relative">
              <UserCog className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Product Designer"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" /> Security
        </h3>
        
        <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl mb-4">
          <div>
            <h4 className="font-bold text-slate-900">Password</h4>
            <p className="text-sm text-slate-500 mt-1">Last changed 3 months ago</p>
          </div>
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm">
            Update Password
          </button>
        </div>

        <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl">
          <div>
            <h4 className="font-bold text-slate-900">Two-Factor Authentication</h4>
            <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account.</p>
          </div>
          <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm">
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  );
}
