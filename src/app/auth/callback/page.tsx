// src/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // Pega o código do OTP da URL (geralmente type=signup ou type=recovery, token_hash=...)
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erro no callback:', error);
        router.push('/login?error=callback_failed');
        return;
      }

      if (data.session) {
        // Sessão criada com sucesso → redireciona para dashboard
        // Ou para a URL de redirect se veio no searchParams
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
        router.refresh(); // força atualização do middleware e estado global
      } else {
        // Sem sessão → algo deu errado
        router.push('/login?error=no_session');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Processando autenticação...</h2>
        <p className="text-gray-400">Aguarde um momento, você será redirecionado.</p>
      </div>
    </div>
  );
}