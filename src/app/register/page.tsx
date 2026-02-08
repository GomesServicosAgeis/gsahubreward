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
      // 1. Criar no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, cpf_cnpj: cpfCnpj },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      // Se der erro de confirmação de e-mail (SMTP), o usuário pode ter sido criado no Auth.
      // Tentamos seguir com a RPC mesmo assim se o user ID existir.
      const userId = authData?.user?.id;

      if (signUpError && !userId) {
        throw new Error("Falha no Auth: " + signUpError.message);
      }

      if (!userId) throw new Error('ID do usuário não gerado.');

      // 2. Chamar a RPC para garantir que salve na tabela 'users'
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_tenant_with_user', {
        p_user_id: userId,
        p_tenant_name: name || email.split('@')[0],
        p_tenant_email: email,
        p_user_name: name,
        p_cpf_cnpj: cpfCnpj,
        p_referral_code: referralCode || null
      });

      if (rpcError) {
        console.error("Erro na RPC:", rpcError);
        throw new Error("Perfil não criado: " + rpcError.message);
      }

      if (rpcData?.success === false) {
        throw new Error(rpcData.error || "Erro interno no banco.");
      }

      setMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.');
      
    } catch (err: any) {
      setError(err.message);
      console.error("Erro completo no fluxo:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-[#1E293B]/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-[#334155] shadow-2xl font-sans">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent italic uppercase tracking-tighter">GSA Hub</h1>
        <p className="text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">Gomes Serviços Ágeis</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-2 text-left">Nome ou Razão</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-4 bg-[#0a0015]/60 border border-[#334155] rounded-2xl text-white focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-700" placeholder="Danilo Gomes" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-2 text-left">CPF ou CNPJ</label>
          <input type="text" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} required className="w-full p-4 bg-[#0a0015]/60 border border-[#334155] rounded-2xl text-white focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-700" placeholder="000.000.000-00" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-2 text-left">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-4 bg-[#0a0015]/60 border border-[#334155] rounded-2xl text-white focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-700" placeholder="contato@gsa.com" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-2 text-left">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full p-4 bg-[#0a0015]/60 border border-[#334155] rounded-2xl text-white focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-700" placeholder="Mínimo 6 dígitos" />
        </div>

        <button type="submit" disabled={loading} className="w-full py-5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black rounded-2xl transition-all shadow-xl shadow-[#7C3AED]/20 uppercase text-xs tracking-widest mt-4">
          {loading ? 'PROCESSANDO...' : 'CRIAR MINHA CONTA'}
        </button>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold text-center uppercase tracking-widest leading-relaxed mt-4">{error}</div>}
        {message && <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-[10px] font-bold text-center uppercase tracking-widest leading-relaxed mt-4">{message}</div>}
      </form>

      <div className="mt-8 pt-6 border-t border-[#334155]/50 text-center">
        <Link href="/login" className="text-[#94A3B8] hover:text-white font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all">
          Já sou cliente GSA <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0015] to-[#1a0033] px-4">
      <Suspense fallback={<div className="text-[#7C3AED] font-black animate-pulse uppercase tracking-widest">GSA HUB...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}