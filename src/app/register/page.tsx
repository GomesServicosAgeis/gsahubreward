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
      // 1. SignUp no Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, cpf_cnpj: cpfCnpj },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error("Erro SMTP/Auth:", signUpError);
        throw new Error("Erro ao enviar e-mail de confirmação. Verifique as configurações SMTP ou desative a confirmação de e-mail no Supabase.");
      }

      if (!authData.user) throw new Error('Falha ao criar usuário.');

      // 2. RPC para salvar na tabela Users
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_tenant_with_user', {
        p_user_id: authData.user.id,
        p_tenant_name: name,
        p_tenant_email: email,
        p_user_name: name,
        p_cpf_cnpj: cpfCnpj,
        p_referral_code: referralCode || null
      });

      if (rpcError) {
        console.error("Erro RPC Banco:", rpcError);
        throw new Error("Usuário criado, mas erro ao salvar perfil: " + rpcError.message);
      }
      
      setMessage('Cadastro realizado! Verifique seu e-mail.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-[2rem] border border-[#334155] shadow-2xl font-sans">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent italic uppercase tracking-tighter">GSA Hub</h1>
        <p className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest mt-2 italic">Gomes Serviços Ágeis</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Nome Completo</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none" placeholder="Ex: Danilo Gomes" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">CPF ou CNPJ</label>
          <input type="text" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} required className="w-full p-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none" placeholder="000.000.000-00" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none" placeholder="seu@email.com" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none" placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black rounded-xl transition-all shadow-lg uppercase text-xs tracking-widest">
          {loading ? 'CADASTRANDO...' : 'FINALIZAR CADASTRO'}
        </button>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-bold text-center uppercase leading-tight">{error}</div>}
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0015] px-4">
      <Suspense fallback={<div className="text-[#7C3AED] font-black animate-pulse uppercase tracking-widest">GSA HUB...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}