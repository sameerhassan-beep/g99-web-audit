'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Search, Plus, LogOut } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(p => p !== '');
    if (paths.length === 0) return [{ name: 'Home', href: '/' }];
    
    return paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      return {
        name: path.charAt(0).toUpperCase() + path.slice(1),
        href
      };
    });
  };
  
  const breadcrumbs = generateBreadcrumbs();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-[#FAFAFC]/80 backdrop-blur-xl border-b border-slate-200/60 px-8 py-5 flex items-center justify-between">
      <div className="flex items-center text-sm font-semibold text-slate-500">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />}
            <Link 
              href={crumb.href}
              className={`hover:text-black transition-colors ${index === breadcrumbs.length - 1 ? 'text-slate-900 font-bold' : ''}`}
            >
              {crumb.name}
            </Link>
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search audits..." 
            className="w-64 pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm placeholder:text-slate-400"
          />
        </div>
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" /> New Audit
        </Link>
        <button onClick={handleSignOut} className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
