'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/layout/sidebar';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function ProtectedWrapper({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .single();
        setUserName(profile?.name || user.email?.split('@')[0]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="h-screen bg-[#0a0015] flex items-center justify-center text-[#7C3AED] font-black animate-pulse">GSA HUB...</div>;

  return (
    <div className="flex h-screen bg-[#0a0015] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={userName} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a]">
          {children}
        </main>
      </div>
    </div>
  );
}