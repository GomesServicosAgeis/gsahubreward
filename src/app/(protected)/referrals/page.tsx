'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Copy, Share2, Users, Trophy, CheckCircle, Clock } from "lucide-react";

export default function ReferralsPage() {
  const [referralCodes, setReferralCodes] = useState<any[]>([]);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // 1. Busca os códigos de indicação do usuário (View: v_my_referral_codes)
      const { data: codes } = await supabase.from('v_my_referral_codes').select('*');
      
      // 2. Busca a lista de pessoas que ele indicou (View: v_my_referrals)
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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header com Meta de Desconto */}
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Trophy className="text-yellow-500" /> GSA Connect Rewards
            </h1>
            <p className="text-blue-200">Indique amigos e chegue a até 80% de desconto permanente!</p>
          </div>
          <div className="text-center bg-black/30 p-4 rounded-xl border border-white/10">
            <span className="text-sm text-gray-400 block mb-1">Seu Desconto Atual</span>
            <span className="text-4xl font-black text-blue-400">
              {referralCodes.length > 0 ? (referralCodes[0].total_indicacoes_ativas * 20 > 80 ? 80 : referralCodes[0].total_indicacoes_ativas * 20) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Links e Códigos */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-semibold text-white">Seus Links de Indicação</h2>
          {referralCodes.map((rc) => (
            <div key={rc.code} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400 uppercase">{rc.product_name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${rc.is_unlocked ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {rc.is_unlocked ? 'LIBERADO' : 'BLOQUEADO'}
                </span>
              </div>
              
              <div className="relative group">
                <input 
                  readOnly 
                  value={`${window.location.origin}/register?ref=${rc.code}`}
                  className="w-full bg-black/40 border border-gray-600 rounded-lg py-3 px-4 text-sm text-gray-300 focus:outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(rc.code)}
                  className="absolute right-2 top-1.5 p-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white transition-all"
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">{rc.status_message}</p>
            </div>
          ))}
        </div>

        {/* Lado Direito: Lista de Indicados */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users size={20} className="text-blue-500" /> Histórico de Indicações
          </h2>
          
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Sistema</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Crédito Gerado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {referralsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">
                      Nenhuma indicação realizada ainda. Compartilhe seu link!
                    </td>
                  </tr>
                ) : (
                  referralsList.map((ref) => (
                    <tr key={ref.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{ref.referred_tenant_name}</div>
                        <div className="text-xs text-gray-500">{ref.referred_tenant_email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{ref.product_name}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                          ref.status === 'activated' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {ref.status_label.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-green-400">
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
  );
}