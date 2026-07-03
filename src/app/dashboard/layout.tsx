import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
