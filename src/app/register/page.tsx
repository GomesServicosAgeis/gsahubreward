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

  // Lógica: Se já estiver logado, redireciona para o dash com o ref
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push(`/dashboard?ref=${referralCode}`);
      }
    }
    checkUser();
  }, [referralCode, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. SignUp no Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, cpf_cnpj: cpfCnpj },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Falha ao criar usuário.');

      // 2. Chama sua RPC para criar Tenant e Perfil
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_tenant_with_user', {
        p_user_id: authData.user.id,
        p_tenant_name: name || email.split('@')[0],
        p_tenant_email: email,
        p_user_name: name,
        p_referral_code: referralCode || null,
        p_cpf_cnpj: cpfCnpj
      });

      if (rpcError) throw rpcError;
      
      setMessage('Conta criada! Verifique seu e-mail para confirmar.');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-[2rem] border border-[#334155] shadow-2xl relative">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent italic uppercase tracking-tighter mb-2">GSA Hub</h1>
        <p className="text-[#94A3B8] text-sm font-medium italic">Otimizando sua Gestão, Multiplicando Resultados</p>
        
        {referralCode && (
          <div className="mt-4 flex items-center justify-center gap-2 bg-[#28A745]/10 border border-[#28A745]/20 text-[#28A745] py-2 rounded-xl text-[10px] font-black uppercase">
            <CheckCircle size={14} /> Indicação de parceiro ativa
          </div>
        )}
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none transition-all" placeholder="Danilo Gomes" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">CPF ou CNPJ (Fiscal)</label>
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

        <button type="submit" disabled={loading} className="w-full py-4 bg-[#7C3AED] hover:bg-[#8B5CF6] text-white font-black rounded-xl transition-all shadow-lg uppercase text-xs tracking-widest">
          {loading ? 'PROCESSANDO...' : 'CRIAR MINHA CONTA'}
        </button>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-bold text-center uppercase">{error}</div>}
        {message && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-[10px] font-bold text-center uppercase">{message}</div>}
      </form>

      <div className="mt-8 pt-6 border-t border-[#334155]/50 text-center">
        <Link href="/login" className="text-xs text-[#94A3B8] hover:text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
          Já tenho conta <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] px-4">
      <Suspense fallback={<div className="text-[#7C3AED] font-black animate-pulse uppercase">Carregando GSA...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}