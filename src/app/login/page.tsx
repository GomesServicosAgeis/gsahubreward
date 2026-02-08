'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] text-[#E2E8F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-[2rem] border border-[#334155] shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent inline-block italic uppercase tracking-tighter">
            GSA Hub
          </h1>
          <p className="text-[#94A3B8] mt-2 font-medium">Acesse sua conta para gerenciar seus resultados</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">E-mail</label>
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
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Senha</label>
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
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:from-[#8B5CF6] hover:to-[#C084FC] text-white font-black rounded-xl transition-all shadow-lg shadow-[#7C3AED]/20 active:scale-[0.98] uppercase text-xs tracking-widest disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>

          {message && (
            <div className="p-3 bg-[#D73A49]/20 border border-[#D73A49]/50 rounded-lg text-[#D73A49] text-[10px] font-bold text-center uppercase">
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link 
              href="/forgot-password" 
              className="inline-block text-[11px] text-[#64748B] hover:text-[#A78BFA] transition-all font-black uppercase tracking-[0.2em] cursor-pointer"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#334155]/50 text-center">
          <Link 
            href="/register" 
            className="text-white hover:text-[#A78BFA] font-black text-sm transition-all uppercase italic"
          >
            Criar minha conta GSA Hub
          </Link>
        </div>
      </div>
    </div>
  );
}