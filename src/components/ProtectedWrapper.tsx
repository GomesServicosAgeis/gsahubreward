'use client';

import Header from '@/components/Header';
import { useEffect, useState } from 'react';
// Corrigido: de supabaseClient para supabase
import { supabase } from '@/lib/supabase/client';

export default function ProtectedWrapper({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userEmail={userEmail} />
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
}