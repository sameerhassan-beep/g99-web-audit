const fs = require('fs');
const path = require('path');

const routes = [
  { path: 'audits/new', title: 'New Audit', desc: 'Scan a new website.' },
  { path: 'audits/scheduled', title: 'Scheduled Audits', desc: 'Manage your automated recurrent audits.' },
  { path: 'audits/monitoring', title: 'Monitoring', desc: 'Real-time performance and uptime tracking.' },
  { path: 'audits/competitors', title: 'Competitors', desc: 'Compare your site against industry rivals.' },
  { path: 'audits/compare', title: 'Compare Reports', desc: 'See improvements over time between audits.' },
  { path: 'audits/templates', title: 'Audit Templates', desc: 'Manage custom rulesets and scoring logic.' },
  { path: 'recent-audits', title: 'Recent Audits', desc: 'Quick overview of your latest scans.' },
  { path: 'health', title: 'Overall Health Score', desc: 'Aggregated health metrics across all properties.' },
  { path: 'team', title: 'Team Activity', desc: 'See what your team is working on.' },
  { path: 'notifications', title: 'Notifications', desc: 'Alerts and system updates.' },
  { path: 'credits', title: 'Credits Used', desc: 'Billing and API usage statistics.' },
  { path: 'recent-reports', title: 'Recent Reports', desc: 'Downloadable PDFs and historical records.' },
  { path: 'actions', title: 'Quick Actions', desc: 'Macros and shortcuts for power users.' },
];

const basePath = path.join(__dirname, '..', 'src', 'app', 'dashboard');

routes.forEach(route => {
  const dirPath = path.join(basePath, route.path);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const filePath = path.join(dirPath, 'page.tsx');
  
  const content = `'use client';

import React from 'react';
import { Hammer } from 'lucide-react';

export default function PlaceholderPage() {
  return (
    <div className="pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
          <Hammer className="h-7 w-7" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">${route.title}</h1>
      </div>

      <div className="bg-[#F3F4F6] border border-slate-200 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center shadow-sm">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-slate-300">
          <Hammer className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Work in Progress</h2>
        <p className="text-slate-500 text-lg mb-8 max-w-md">
          The <strong>${route.title}</strong> page is currently under development. ${route.desc}
        </p>
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync(filePath, content);
  console.log('Created: ' + filePath);
});
