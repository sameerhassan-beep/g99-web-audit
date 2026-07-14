'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Globe, 
  PlusCircle, 
  FileText, 
  CalendarClock, 
  Activity, 
  Swords, 
  ArrowLeftRight, 
  Copy,
  Clock,
  HeartPulse,
  Users,
  Bell,
  Coins,
  History,
  Zap,
  ChevronDown,
  ChevronRight,
  UserCog,
  MoreHorizontal,
  Settings,
  LogOut,
  User,
  Loader2,
  Folder
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  const pathname = usePathname();
  
  // State for collapsible "Website Audits" section
  const [auditsExpanded, setAuditsExpanded] = useState(true);

  // Auto-expand if we are on a child route
  useEffect(() => {
    if (pathname.includes('/dashboard/audits') || pathname.includes('/dashboard/reports') || pathname.includes('/dashboard/report')) {
      setAuditsExpanded(true);
    }
  }, [pathname]);

  const auditsNav = [
    { name: 'New Audit', href: '/dashboard/audits/new', icon: PlusCircle },
    { name: 'All Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Scheduled Audits', href: '/dashboard/audits/scheduled', icon: CalendarClock },
    { name: 'Monitoring', href: '/dashboard/audits/monitoring', icon: Activity },
    { name: 'Compare Reports', href: '/dashboard/audits/compare', icon: ArrowLeftRight },
    { name: 'Audit Templates', href: '/dashboard/audits/templates', icon: Copy },
  ];

  const mainNav = [
    { name: 'Projects', href: '/dashboard/projects', icon: Folder },
    { name: 'Recent audits', href: '/dashboard/recent-audits', icon: Clock },
    { name: 'Overall health score', href: '/dashboard/health', icon: HeartPulse },
    { name: 'Team activity', href: '/dashboard/team', icon: Users },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Credits used', href: '/dashboard/credits', icon: Coins },
    { name: 'Recent reports', href: '/dashboard/recent-reports', icon: History },
    { name: 'Quick actions', href: '/dashboard/actions', icon: Zap },
  ];

  return (
    <div className="hidden md:flex w-72 bg-white flex-col border-r border-slate-100 py-8 px-4 h-screen fixed left-0 top-0 overflow-y-auto scrollbar-hide z-50">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-10 px-4">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">AUDIT ARENA</span>
      </div>

      <div className="flex-1 space-y-6">
        
        {/* Dashboard Home */}
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
              pathname === '/dashboard' 
                ? "bg-slate-100 text-slate-900" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <LayoutDashboard className={cn("h-5 w-5", pathname === '/dashboard' ? "text-slate-900" : "text-slate-400")} />
            Dashboard
          </Link>
        </nav>

        {/* Website Audits (Expandable) */}
        <div>
          <button 
            onClick={() => setAuditsExpanded(!auditsExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-slate-900 font-bold text-sm rounded-2xl hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-indigo-500" />
              Website Audits
            </div>
            {auditsExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            )}
          </button>
          
          <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", auditsExpanded ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0")}>
            <nav className="space-y-1 pl-4 border-l-2 border-slate-100 ml-6 pb-2">
              {auditsNav.map((item) => {
                // Determine active state, consider /report as part of reports
                const isActive = pathname === item.href || (item.href === '/dashboard/reports' && pathname === '/dashboard/report');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-black text-white shadow-md shadow-black/10" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Menu / Other Links */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">Workspace</h3>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-black text-white shadow-md shadow-black/10" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

      </div>

      {/* User Profile Dropdown at bottom */}
      <div className="mt-auto pt-6 px-2 pb-4">
        <UserProfile />
      </div>

    </div>
  );
}

function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || '');
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center animate-pulse">
        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
      </div>
    );
  }

  // Derive initial and name from email
  const name = userEmail ? userEmail.split('@')[0] : 'User';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative">
      {/* Popover */}
      {isOpen && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute bottom-full left-0 right-0 mb-3 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-900 truncate">{name}</h4>
              <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
            </div>
            
            {/* Links */}
            <div className="py-2">
              <Link href="/dashboard/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                <User className="w-4 h-4 text-slate-400" /> Profile
              </Link>
              <Link href="/dashboard/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                <Settings className="w-4 h-4 text-slate-400" /> Settings
              </Link>
              <Link href="/dashboard/notifications" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                <Bell className="w-4 h-4 text-slate-400" /> Notifications
              </Link>
            </div>
            
            {/* Logout */}
            <div className="p-2 border-t border-slate-100">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200",
          isOpen ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5 flex-shrink-0">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white font-bold text-sm">
            {initial}
          </div>
        </div>
        
        <div className="flex-1 text-left overflow-hidden">
          <h4 className="text-sm font-bold text-slate-900 truncate">{name}</h4>
          <p className="text-xs text-slate-500 truncate">Product Designer</p>
        </div>
        
        <MoreHorizontal className="w-5 h-5 text-slate-400 flex-shrink-0" />
      </button>
    </div>
  );
}
