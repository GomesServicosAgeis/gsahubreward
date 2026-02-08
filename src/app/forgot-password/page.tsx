'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] text-[#E2E8F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-2xl border border-[#334155] shadow-2xl text-center">
        
        {!sent ? (
          <>
            <h1 className="text-3xl font-black bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent mb-4">
              Recuperar Senha
            </h1>
            <p className="text-[#94A3B8] mb-8 text-sm italic">
              Insira seu e-mail para receber o link de redefinição.
            </p>

            <form onSubmit={handleReset} className="space-y-6 text-left">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Seu E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 bg-[#0a0015]/50 border border-[#334155] rounded-xl text-white focus:border-[#7C3AED] outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black rounded-xl transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 uppercase text-xs tracking-widest"
              >
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <CheckCircle className="text-green-500" size={64} />
            </div>
            <h2 className="text-2xl font-black text-white italic">E-mail Enviado!</h2>
            <p className="text-[#94A3B8] text-sm">
              Verifique sua caixa de entrada (e o spam). Enviamos as instruções para <strong>{email}</strong>.
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#334155]/50">
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors font-bold">
            <ArrowLeft size={16} /> Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}