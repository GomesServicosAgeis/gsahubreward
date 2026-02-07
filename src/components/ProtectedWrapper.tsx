// src/components/ProtectedWrapper.tsx
'use client';

import Header from '@/components/Header';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

export default function ProtectedWrapper({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await supabaseClient.auth.getUser();

        if (data.user) {
          setUserEmail(data.user.email || undefined);

          const { data: profile } = await supabaseClient
            .from('users')
            .select('is_super_admin')
            .eq('id', data.user.id)
            .single();

          setIsSuperAdmin(profile?.is_super_admin || false);
        }
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0015] to-[#1a0033]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#7C3AED]"></div>
      </div>
    );
  }

  return (
    <>
      <Header userEmail={userEmail} isSuperAdmin={isSuperAdmin} />
      {children}
    </>
  );
}