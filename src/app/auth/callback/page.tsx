// src/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          console.error('Erro no callback:', error);
          router.push('/login?error=callback_failed');
          return;
        }

        // Verifica se tem tenant_id
        const { data: profile } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', session.user.id)
          .single();

        if (!profile || !profile.tenant_id) {
          // Se ainda não tem tenant_id (raro, mas possível), pode mostrar erro ou redirecionar
          router.push('/login?error=no_tenant_profile');
          return;
        }

        // Tudo ok → vai para dashboard
        router.push('/dashboard');
      } catch (err) {
        console.error('Erro inesperado no callback:', err);
        router.push('/login?error=callback_error');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0015] to-[#1a0033]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#7C3AED] mx-auto mb-4"></div>
        <p className="text-[#E2E8F0] text-xl font-bold">Confirmando sua conta...</p>
        <p className="text-[#94A3B8] mt-2">Redirecionando para o dashboard...</p>
      </div>
    </div>
  );
}