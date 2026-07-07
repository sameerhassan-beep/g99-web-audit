'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, CheckCircle2, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      const supabase = createClient();
      
      // For now, since we might not have RLS policies perfectly allowing joins across 
      // missing tables if the user hasn't run the SQL yet, we'll gracefully handle errors.
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          id,
          role,
          status,
          user_id,
          profiles!inner(full_name, avatar_url)
        `);
        
      if (!error && data) {
        setTeam(data.map((m: any) => ({
          id: m.id,
          name: m.profiles?.full_name || 'Unknown User',
          email: 'User ID: ' + m.user_id.substring(0, 8) + '...', // Fallback
          role: m.role,
          status: m.status
        })));
      } else {
        // Fallback for UI if DB table doesn't exist yet
        setTeam([
          { id: 1, name: 'You (Profile Loading)', email: '...', role: 'Owner', status: 'Active' }
        ]);
      }
      setLoading(false);
    };
    fetchTeam();
  }, []);

  const handleInvite = () => {
    alert(`Invite sent to ${inviteEmail}! (Mocked for now)`);
    setShowInviteModal(false);
    setInviteEmail('');
  };
  if (loading) {
    return <div className="p-10 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto"/> Loading Team...</div>;
  }

  return (
    <div className="pb-10 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-slate-500 mt-1">Manage who has access to your workspace and audit reports.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" /> Invite Member
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-900">Workspace Members ({team.length}/10)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 pl-8">User</th>
                <th className="py-4">Role</th>
                <th className="py-4">Status</th>
                <th className="py-4 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {team.map((member) => (
                <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{member.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2 text-slate-700">
                      {member.role === 'Owner' && <Shield className="w-4 h-4 text-indigo-500" />}
                      {member.role}
                    </div>
                  </td>
                  <td className="py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1.5 ${
                      member.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      member.status === 'Invited' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {member.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                      {member.status}
                    </span>
                  </td>
                  <td className="py-5 pr-8 text-right">
                    {member.role !== 'Owner' && (
                      <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowInviteModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Invite Team Member</h3>
            <p className="text-slate-500 mb-6">Send an invitation link to join your workspace.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Role</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none">
                  <option>Admin</option>
                  <option>Member</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleInvite}
              disabled={!inviteEmail}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3.5 rounded-xl font-bold transition-all shadow-md"
            >
              Send Invitation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
