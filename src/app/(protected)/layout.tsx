// src/app/(protected)/layout.tsx
import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="flex h-screen bg-[#0a0015] overflow-hidden text-[#E2E8F0] font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a]">
        {/* Camada de brilho sutil */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#7C3AED]/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}