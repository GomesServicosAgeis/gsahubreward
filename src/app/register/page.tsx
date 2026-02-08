'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { ShieldCheck, User, Mail, Lock, FileText, CheckCircle } from 'lucide-react';

/**
 * Componente interno com a lógica de negócio e formulário.
 */
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState(''); // Campo Fiscal Obrigatório
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Lógica: Se o cara já estiver logado, manda pro Dashboard com o código de indicação
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
    setMessage(null);

    try {
      // 1. Cria o usuário no Supabase Auth com metadados fiscais
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name,
            cpf_cnpj: cpfCnpj // Salva no auth.users metadata
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Falha na criação do usuário.');

      // 2. Chama a RPC para criar o Tenant, Perfil e Processar Indicação
      // Certifique-se que sua RPC 'create_tenant_with_user' aceite p_cpf_cnpj
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_tenant_with_user', {
        p_user_id: authData.user.id,
        p_tenant_name: name || email.split('@')[0],
        p_tenant_email: email,
        p_user_name: name,
        p_referral_code: referralCode || null,
        p_cpf_cnpj: cpfCnpj // Passando o campo fiscal para a função do banco
      });

      if (rpcError) throw rpcError;
      if (!rpcData?.success) throw new Error(rpcData?.error || 'Erro ao configurar empresa.');

      setMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
    } catch (error: any) {
      setError(error.message || 'Erro ao processar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-[2rem] border border-[#334155] shadow-2xl relative overflow-hidden">
      {/* Brilho decorativo */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#7C3AED]/10 blur-[80px] rounded-full"></div>

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent italic tracking-tighter uppercase mb-2">
          GSA Hub
        </h1>
        <p className="text-[#94A3B8] text-sm font-medium">Junte-se ao ecossistema de gestão ágil</p>
        
        {referralCode && (
          <div className="mt-4 flex items-center justify-center gap-2 bg-[#28A745]/10 border border-[#28A745]/20 text-[#28A745] py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
            <CheckCircle size={14} /> Indicação Ativa: {referralCode}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-[#D73A49]/10 border border-[#D73A49]/30 text-[#D73A49] px-4 py-3 rounded-xl mb-6 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-[#28A745]/10 border border-[#28A745]/30 text-[#28A745] px-4 py-3 rounded-xl mb-6 text-xs font-bold text-center">
          {message}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4 relative z-10">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-700"
              placeholder="Ex: Danilo Gomes"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">CPF ou CNPJ (Obrigatório)</label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-700"
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">E-mail Corporativo</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-700"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Senha de Acesso</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-12 pr-4 py-3 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-700"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:from-[#8B5CF6] hover:to-[#C084FC] text-white font-black rounded-xl transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 uppercase text-xs tracking-widest active:scale-95"
        >
          {loading ? 'Processando...' : 'Finalizar Cadastro'}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-[#64748B] font-bold uppercase tracking-widest">
        Já possui conta? <Link href="/login" className="text-[#A78BFA] hover:text-white transition-colors">Fazer Login</Link>
      </div>
    </div>
  );
}

/**
 * Componente de Página Principal com Boundary de Suspense para SearchParams.
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] px-4">
      <Suspense fallback={<div className="text-[#7C3AED] font-black animate-pulse">CARREGANDO FORMULÁRIO GSA...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}