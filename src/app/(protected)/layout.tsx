// src/app/(protected)/layout.tsx
import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/Header';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex h-screen bg-[#0a0015] overflow-hidden">
      {/* 1. Sidebar fixa na esquerda */}
      <Sidebar />

      {/* 2. Área da direita (Header + Conteúdo) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={profile?.name || user.email} />
        
        {/* 3. Área de Scroll do conteúdo */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a]">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}