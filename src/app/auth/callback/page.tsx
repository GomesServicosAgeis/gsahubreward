'use client';

import { useEffect, Suspense } from 'react'; // Importamos Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

// Criamos um componente interno para o conteúdo
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erro no callback:', error);
        router.push('/login?error=callback_failed');
        return;
      }

      if (data.session) {
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
        router.refresh();
      } else {
        router.push('/login?error=no_session');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="text-center text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-6"></div>
      <h2 className="text-2xl font-bold mb-2">Processando autenticação...</h2>
      <p className="text-gray-400">Aguarde um momento, você será redirecionado.</p>
    </div>
  );
}

// O export principal envolve o conteúdo em Suspense
export default function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <Suspense fallback={<div className="text-white">Carregando...</div>}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}