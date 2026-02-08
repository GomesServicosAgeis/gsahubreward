'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Usuário não encontrado.');
      }

      // Verifica tenant_id
      const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        setError('Perfil não encontrado. Tente confirmar seu e-mail.');
        return;
      }

      // Se tenant_id for NULL, avisa mas permite login (para teste)
      if (!profile.tenant_id) {
        alert('Perfil incompleto. Confirme seu e-mail para acesso completo.');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao logar');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0015] to-[#1a0033] px-4">
      <div className="max-w-md w-full bg-[#1E293B]/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-[#334155] shadow-2xl font-sans">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent italic uppercase tracking-tighter">GSA Hub</h1>
          <p className="text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">Gomes Serviços Ágeis</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-2 text-left">E-mail</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full p-4 bg-[#0a0015]/60 border border-[#334155] rounded-2xl text-white focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-700" 
              placeholder="contato@gsa.com" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-2 text-left">Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full p-4 bg-[#0a0015]/60 border border-[#334155] rounded-2xl text-white focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-700" 
              placeholder="Mínimo 6 dígitos" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black rounded-2xl transition-all shadow-xl shadow-[#7C3AED]/20 uppercase text-xs tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold text-center uppercase tracking-widest leading-relaxed mt-4">
              {error}
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-[#334155]/50 text-center">
          <Link href="/register" className="text-[#94A3B8] hover:text-white font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all">
            Ainda não tenho conta <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}