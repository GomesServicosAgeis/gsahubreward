'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Info,
  ArrowRightLeft,
  ChevronRight
} from "lucide-react";

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWallet() {
      // Puxamos os dados da View v_my_wallet que você criou no Supabase
      const { data, error } = await supabase
        .from('v_my_wallet')
        .select('*')
        .single();

      if (!error) setWallet(data);
      setLoading(false);
    }
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Título e Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wallet className="text-blue-500" size={32} /> Minha Carteira Rewards
          </h1>
          <p className="text-gray-400 mt-2">Gerencie seus créditos acumulados e histórico de recompensas nominais.</p>
        </div>
      </div>

      {/* Cards de Saldo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl shadow-xl shadow-blue-500/10 border border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-white/10 group-hover:scale-110 transition-transform">
            <Wallet size={120} />
          </div>
          <span className="text-blue-100 text-sm font-bold uppercase tracking-wider">Saldo Disponível</span>
          <div className="text-5xl font-black text-white mt-2">
            R$ {wallet?.saldo_disponivel?.toFixed(2) || '0,00'}
          </div>
          <div className="mt-6 flex items-center gap-2 text-blue-200 text-xs bg-black/20 w-fit px-3 py-1.5 rounded-full">
            <Info size={14} /> Abatimento automático em faturas
          </div>
        </div>

        <div className="bg-gray-800/40 border border-gray-700 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-sm font-bold">Total Recebido</span>
            <div className="p-2 bg-green-500/10 rounded-lg"><ArrowUpRight className="text-green-500" size={20} /></div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            R$ {wallet?.total_recebido?.toFixed(2) || '0,00'}
          </div>
          <p className="text-[10px] text-gray-500 mt-4 uppercase">Soma de todas as indicações pagas</p>
        </div>

        <div className="bg-gray-800/40 border border-gray-700 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-sm font-bold">Total Utilizado</span>
            <div className="p-2 bg-red-500/10 rounded-lg"><ArrowDownRight className="text-red-500" size={20} /></div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            R$ {wallet?.total_usado?.toFixed(2) || '0,00'}
          </div>
          <p className="text-[10px] text-gray-500 mt-4 uppercase">Descontos já aplicados em sistemas</p>
        </div>
      </div>

      {/* Seção de Transferência (Sua Regra de Negócio) */}
      <div className="bg-gray-800/80 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <ArrowRightLeft size={22} className="text-blue-400" /> Transferência Cross-Product
            </h3>
            <p className="text-gray-400 text-sm max-w-xl">
              O bônus de 20% é automático no sistema indicado. Caso possua excedente, você pode transferir o 
              valor nominal (R$) para abater até 80% de outros sistemas GSA em sua conta.
            </p>
          </div>

          <button className="whitespace-nowrap bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-2 group shadow-lg shadow-blue-600/20">
            TRANSFERIR SALDO <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Histórico de Transações */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History size={20} className="text-blue-500" /> Extrato Rewards
        </h2>
        
        <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-800/60 text-gray-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Evento / Origem</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-right">Saldo Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {!wallet?.historico_recente || wallet.historico_recente.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic bg-black/10">
                    Nenhuma movimentação registrada na carteira ainda.
                  </td>
                </tr>
              ) : (
                wallet.historico_recente.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 text-sm text-gray-500 font-mono">
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {item.descricao}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter border border-blue-500/20">
                            {item.produto || 'GERAL'}
                         </span>
                         <span className="text-[9px] text-gray-600 uppercase font-bold">{item.tipo}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-5 text-right text-sm font-black ${
                      item.tipo.includes('earned') || item.tipo.includes('overflow') || item.tipo.includes('received') 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {item.tipo.includes('earned') || item.tipo.includes('overflow') || item.tipo.includes('received') ? '+' : '-'} R$ {item.valor.toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-right text-sm text-gray-300 font-mono font-medium">
                      R$ {item.saldo_apos.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}