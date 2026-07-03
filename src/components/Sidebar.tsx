'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, History, Settings, Menu, X, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: 'New Scan', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Past Audits', href: '/dashboard/audits', icon: History },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          <span className="font-bold text-lg text-slate-900 dark:text-white">G99 WebAudit</span>
        </div>
        <button onClick={toggleMobileMenu} className="p-2 -mr-2">
          <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* Logo area */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800">
          <Zap className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          <span className="font-bold text-lg text-slate-900 dark:text-white">G99 WebAudit</span>
          <button onClick={toggleMobileMenu} className="md:hidden ml-auto p-1">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600 dark:text-blue-500" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User profile area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <UserButton />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">My Account</span>
        </div>
      </div>
    </>
  );
}
