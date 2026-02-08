'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Importado para navegação interna

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] text-[#E2E8F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-2xl border border-[#334155] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent inline-block">
            GSA Hub
          </h1>
          <p className="text-[#94A3B8] mt-2">Acesse sua conta para gerenciar seus resultados</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#0f172a]/50 border border-[#334155] rounded-xl text-white focus:outline-none focus:border-[#7C3AED] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#0f172a]/50 border border-[#334155] rounded-xl text-white focus:outline-none focus:border-[#7C3AED] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:from-[#8B5CF6] hover:to-[#C084FC] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#7C3AED]/20 active:scale-[0.98]"
          >
            Entrar no Sistema
          </button>

          {message && (
            <div className="p-3 bg-[#D73A49]/20 border border-[#D73A49]/50 rounded-lg text-[#D73A49] text-sm text-center animate-pulse">
              {message}
            </div>
          )}

          {/* Ajuste: Links de Cadastro e Recuperação */}
          <div className="mt-8 pt-6 border-t border-[#334155]/50 text-center space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-[#94A3B8] text-sm">Ainda não faz parte do ecossistema?</p>
              <Link 
                href="/register" 
                className="text-[#A78BFA] hover:text-[#C084FC] font-bold text-sm transition-all hover:underline"
              >
                Criar minha conta GSA Hub
              </Link>
            </div>
            
            <Link 
              href="/forgot-password" 
              className="block text-[11px] text-[#64748B] hover:text-[#94A3B8] transition-colors uppercase tracking-widest font-bold"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}