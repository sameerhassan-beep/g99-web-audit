'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function DataMigrator() {
  const [migrating, setMigrating] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const migrateData = async () => {
      const pastAuditsStr = localStorage.getItem('pastAudits');
      if (!pastAuditsStr) return;

      const pastAudits = JSON.parse(pastAuditsStr);
      if (!pastAudits || pastAudits.length === 0) return;

      setMigrating(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMigrating(false);
        return; // Wait until they are logged in
      }

      // Convert local array into Supabase insert format
      const inserts = pastAudits.map((a: any) => ({
        id: a.id,
        user_id: user.id,
        url: a.url,
        report: a.report,
        subPages: a.subPages || [],
        created_at: new Date(a.date).toISOString(),
      }));

      const { error } = await supabase.from('audits').insert(inserts);

      if (error) {
        console.error('Migration failed:', error);
      } else {
        localStorage.removeItem('pastAudits');
        setDone(true);
      }
      setMigrating(false);
    };

    migrateData();
  }, []);

  if (!migrating && !done) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
      {migrating ? (
        <>
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-700">Migrating local data to Cloud...</span>
        </>
      ) : (
        <>
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
          <span className="text-sm font-bold text-slate-700">Data successfully migrated!</span>
        </>
      )}
    </div>
  );
}
