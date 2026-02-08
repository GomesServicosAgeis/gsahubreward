'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Copy, Trophy, CheckCircle, Users } from "lucide-react";

export default function ReferralsPage() {
  const [referralCodes, setReferralCodes] = useState<any[]>([]);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: codes } = await supabase.from('v_my_referral_codes').select('*');
      const { data: list } = await supabase.from('v_my_referrals').select('*');
      if (codes) setReferralCodes(codes);
      if (list) setReferralsList(list);
      setLoading(false);
    }
    fetchData();
  }, []);

  const copyToClipboard = (code: string) => {
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-6 text-white text-center">Carregando recompensas...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] text-[#E2E8F0] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header no estilo do Título do Dashboard */}
        <div className="bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-xl border border-[#334155] shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent flex items-center gap-3">
                <Trophy className="text-[#C084FC]" size={36} /> GSA Connect Rewards
              </h1>
              <p className="text-[#94A3B8]">Indique amigos e chegue a até 80% de desconto permanente!</p>
            </div>
            <div className="text-center bg-[#0a0015]/50 p-6 rounded-xl border border-[#334155]">
              <span className="text-sm text-[#94A3B8] block mb-1 font-semibold uppercase tracking-wider">Seu Desconto Atual</span>
              <span className="text-5xl font-bold text-[#7C3AED]">
                {referralCodes.length > 0 ? (Math.min(referralCodes[0].total_indicacoes_ativas * 20, 80)) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lado Esquerdo: Links */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold text-[#A78BFA]">Seus Links</h2>
            {referralCodes.map((rc) => (
              <div key={rc.code} className="bg-[#1E293B]/70 backdrop-blur-md p-6 rounded-xl border border-[#334155] hover:border-[#7C3AED]/60 transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-widest">{rc.product_name}</span>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${rc.is_unlocked ? 'bg-[#28A745]/20 text-[#28A745]' : 'bg-[#D73A49]/20 text-[#D73A49]'}`}>
                    {rc.is_unlocked ? 'Liberado' : 'Pendente'}
                  </span>
                </div>
                <div className="relative">
                  <input readOnly value={`${window.location.origin}/register?ref=${rc.code}`} className="w-full bg-[#0a0015]/50 border border-[#334155] rounded-lg py-3 px-4 text-xs text-[#94A3B8] focus:outline-none font-mono" />
                  <button onClick={() => copyToClipboard(rc.code)} className="absolute right-2 top-1.5 p-2 bg-[#7C3AED] hover:bg-[#8B5CF6] rounded-md text-white transition-all">
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-[11px] text-[#64748B] mt-3 text-center italic">{rc.status_message}</p>
              </div>
            ))}
          </div>

          {/* Lado Direito: Tabela */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-[#A78BFA] flex items-center gap-2">
              <Users size={24} className="text-[#7C3AED]" /> Histórico
            </h2>
            <div className="bg-[#1E293B]/70 backdrop-blur-md rounded-xl border border-[#334155] overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0a0015]/40 text-[#94A3B8] text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-5">Cliente</th>
                    <th className="px-6 py-4">Sistema</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Crédito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {referralsList.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-[#94A3B8] italic">Compartilhe seu link para ver seus indicados aqui!</td></tr>
                  ) : (
                    referralsList.map((ref) => (
                      <tr key={ref.id} className="hover:bg-[#334155]/20 transition-colors duration-200">
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-[#E2E8F0]">{ref.referred_tenant_name}</div>
                          <div className="text-[11px] text-[#64748B]">{ref.referred_tenant_email}</div>
                        </td>
                        <td className="px-6 py-5 text-xs text-[#A78BFA] font-semibold uppercase">{ref.product_name}</td>
                        <td className="px-6 py-5">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${ref.status === 'activated' ? 'bg-[#28A745]/20 text-[#28A745]' : 'bg-[#D73A49]/20 text-[#D73A49]'}`}>
                            {ref.status_label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right text-sm font-bold text-[#28A745]">
                          {ref.status === 'activated' ? `+ R$ ${ref.discount_applied?.toFixed(2)}` : '--'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}