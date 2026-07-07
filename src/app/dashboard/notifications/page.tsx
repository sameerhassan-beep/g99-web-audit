'use client';

import React, { useEffect, useState } from 'react';
import { Bell, ShieldAlert, CheckCircle2, Zap, Settings, Inbox, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setNotifications(data);
      } else {
        // Fallback mock data if DB table isn't created yet
        setNotifications([
          { id: 1, type: 'alert', title: 'growth99.com is offline', message: 'The uptime monitor detected a 502 Bad Gateway response.', created_at: new Date().toISOString(), read: false },
          { id: 2, type: 'success', title: 'Scheduled Audit Complete', message: 'The weekly deep scan for apple.com has finished with a score of 98.', created_at: new Date().toISOString(), read: false },
          { id: 3, type: 'info', title: 'New Teammate Joined', message: 'Sarah Connor has accepted your invitation to join the workspace.', created_at: new Date(Date.now() - 86400000).toISOString(), read: true },
        ]);
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    const supabase = createClient();
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto"/> Loading Inbox...</div>;
  }
  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 mt-1">Stay updated on your audits, team, and billing alerts.</p>
        </div>
        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm flex items-center gap-2">
          <Settings className="w-5 h-5" /> Preferences
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Inbox className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900">Your Inbox</h3>
          </div>
          <button 
            onClick={markAllRead}
            className="text-indigo-600 font-bold text-sm hover:underline"
          >
            Mark all as read
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => !notif.read && markRead(notif.id)}
              className={`p-6 flex gap-4 transition-colors hover:bg-slate-50/50 ${notif.read ? 'opacity-60' : 'bg-indigo-50/10 cursor-pointer'}`}
            >
              <div className="mt-1 flex-shrink-0">
                {notif.type === 'alert' && <div className="w-10 h-10 bg-red-100 text-red-500 rounded-xl flex items-center justify-center"><ShieldAlert className="w-5 h-5" /></div>}
                {notif.type === 'success' && <div className="w-10 h-10 bg-green-100 text-green-500 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>}
                {notif.type === 'info' && <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center"><Bell className="w-5 h-5" /></div>}
                {notif.type === 'billing' && <div className="w-10 h-10 bg-amber-100 text-amber-500 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5" /></div>}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-base ${notif.read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-4">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm ${notif.read ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                  {notif.message}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shrink-0 mt-2 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
