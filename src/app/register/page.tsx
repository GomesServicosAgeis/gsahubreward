'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { User, Mail, Lock, FileText, CheckCircle, ArrowRight } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push(`/dashboard?ref=${referralCode}`);
    }
    checkUser();
  }, [referralCode, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // 1. Criar no Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, cpf_cnpj: cpfCnpj },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Erro ao criar credenciais.');

      // 2. Criar no Banco (RPC) - NOMES DOS PARÂMETROS DEVEM SER IDÊNTICOS AO SQL
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_tenant_with_user', {
        p_user_id: authData.user.id,
        p_tenant_name: name,
        p_tenant_email: email,
        p_user_name: name,
        p_cpf_cnpj: cpfCnpj,
        p_referral_code: referralCode || null
      });

      if (rpcError) throw rpcError;
      
      if (rpcData && rpcData.success === false) {
        throw new Error(rpcData.error || 'Erro na criação do perfil.');
      }

      setMessage('Conta criada! Verifique seu e-mail (via Resend) para confirmar.');
      
      setName(''); setEmail(''); setPassword(''); setCpfCnpj('');

    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
      console.error("Erro completo:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-[2rem] border border-[#334155] shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent italic uppercase tracking-tighter mb-2">GSA Hub</h1>
        <p className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest italic">Otimizando sua Gestão</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none transition-all" placeholder="Nome ou Razão Social" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">CPF ou CNPJ</label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="text" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none transition-all" placeholder="000.000.000-00" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none transition-all" placeholder="seu@email.com" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Senha</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full pl-12 pr-4 py-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none transition-all" placeholder="••••••••" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black rounded-xl transition-all shadow-lg uppercase text-xs tracking-widest">
          {loading ? 'PROCESSANDO...' : 'CRIAR CONTA GSA'}
        </button>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-bold text-center uppercase">{error}</div>}
        {message && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-[10px] font-bold text-center uppercase">{message}</div>}
      </form>

      <div className="mt-8 pt-6 border-t border-[#334155]/50 text-center font-bold uppercase text-[10px] tracking-widest">
        <Link href="/login" className="text-[#94A3B8] hover:text-white flex items-center justify-center gap-2 transition-all">
          Já sou cliente <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0015] px-4 font-sans text-[#E2E8F0]">
      <Suspense fallback={<div className="text-[#7C3AED] font-black animate-pulse">CARREGANDO...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}