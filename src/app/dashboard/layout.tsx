import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { DataMigrator } from '@/components/DataMigrator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-white overflow-hidden">
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 bg-white pl-72">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
      
      <DataMigrator />
    </div>
  );
}
