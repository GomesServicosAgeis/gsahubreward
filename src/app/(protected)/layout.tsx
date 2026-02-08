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

  // Se não estiver logado, manda pro login (Proteção de Rota)
  if (!user) {
    redirect('/login');
  }

  // Busca os dados do perfil para o Header
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single();

  const userName = profile?.name || user.email;

  return (
    <div className="flex h-screen bg-[#0a0015] overflow-hidden text-[#E2E8F0]">
      {/* Sidebar aparece SÓ aqui dentro */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header com botão sair aparece SÓ aqui dentro */}
        <Header userName={userName} />
        
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] relative">
          {/* Brilho decorativo de fundo */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C3AED]/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}