'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Wallet, ArrowUpRight, ArrowDownRight, History, Info, ArrowRightLeft, ChevronRight } from "lucide-react";

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [pixError, setPixError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWallet() {
      const { data, error } = await supabase.from('v_my_wallet').select('*').single();
      if (!error) setWallet(data);
      setLoading(false);
    }
    fetchWallet();
  }, []);

  const generatePix = async () => {
    const amountStr = prompt('Quanto você quer adicionar (R$)?', '10.00');
    const amount = Number(amountStr?.replace(',', '.'));

    if (!amount || amount <= 0 || isNaN(amount)) {
      alert('Valor inválido');
      return;
    }

    setPixLoading(true);
    setPixData(null);
    setPixError(null);

    try {
      const res = await fetch('/api/mercadopago/create', {
        method: 'POST',
        credentials: 'include', // ESSENCIAL: envia cookies da sessão (autenticação Supabase)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: 'Créditos GSA Hub',
          userEmail: 'danilolg22@outlook.com' // depois pegue do usuário logado
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(`Erro HTTP ${res.status}: ${data.error || 'Falha na API'}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Resposta inválida da API');
      }

      setPixData(data.payment);
      alert('Cobrança Pix criada!\n\nCopia e Cola:\n' + data.qrCode);
      console.log('QR Base64 (para exibir imagem):', data.qrBase64);
    } catch (err: any) {
      setPixError(err.message || 'Falha ao gerar Pix');
      console.error('Erro ao gerar Pix Mercado Pago:', err);
    } finally {
      setPixLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0015] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#7C3AED]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] text-[#E2E8F0] p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent flex items-center gap-4">
              <Wallet className="text-[#C084FC]" size={40} /> Minha Carteira
            </h1>
            <p className="text-[#94A3B8] mt-2 font-medium">Gestão de créditos nominais e bônus acumulados GSA.</p>
          </div>
        </div>

        {/* Botão Gerar Pix Mercado Pago */}
        <div className="text-center my-8">
          <button
            onClick={generatePix}
            disabled={pixLoading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#00BFFF] hover:from-[#00BFFF] hover:to-[#0099CC] text-white font-bold rounded-xl text-lg transition shadow-2xl shadow-[#00D4FF]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pixLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
                Gerando Pix...
              </>
            ) : (
              'Gerar Cobrança Pix (Mercado Pago)'
            )}
          </button>

          {pixError && (
            <p className="mt-3 text-red-400 font-medium">{pixError}</p>
          )}

          {/* Exibe QR Code e Copia e Cola quando gerado */}
          {pixData && pixData.qrBase64 && (
            <div className="mt-8 bg-[#1E293B]/80 p-8 rounded-xl border border-[#334155] inline-block max-w-md mx-auto">
              <img 
                src={`data:image/png;base64,${pixData.qrBase64}`} 
                alt="QR Code Pix" 
                className="mx-auto mb-4 w-48 h-48"
              />
              <p className="text-[#94A3B8] text-sm mb-2">Código Pix Copia e Cola:</p>
              <div className="bg-[#0a0015] p-4 rounded-lg text-white font-mono text-sm break-all">
                {pixData.qrCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pixData.qrCode);
                  alert('Código copiado!');
                }}
                className="mt-4 w-full py-3 bg-[#00D4FF] hover:bg-[#00BFFF] text-white font-bold rounded-lg transition"
              >
                Copiar Código Pix
              </button>
            </div>
          )}
        </div>

        {/* Cards de Saldo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] p-8 rounded-xl shadow-xl shadow-[#7C3AED]/20 border border-white/10 relative overflow-hidden group">
            <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Saldo Disponível</span>
            <div className="text-5xl font-black text-white mt-3 italic tracking-tight">
              R$ {wallet?.saldo_disponivel?.toFixed(2) || '0,00'}
            </div>
            <div className="mt-6 flex items-center gap-2 text-white/80 text-[10px] font-bold bg-white/10 w-fit px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <Info size={14} /> ABATIMENTO AUTOMÁTICO EM FATURAS
            </div>
          </div>

          <div className="bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-xl border border-[#334155] shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest">Total Recebido</span>
              <ArrowUpRight className="text-[#28A745]" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">R$ {wallet?.total_recebido?.toFixed(2) || '0,00'}</div>
          </div>

          <div className="bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-xl border border-[#334155] shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest">Total Utilizado</span>
              <ArrowDownRight className="text-[#D73A49]" size={24} />
            </div>
            <div className="text-3xl font-bold text-white">R$ {wallet?.total_usado?.toFixed(2) || '0,00'}</div>
          </div>
        </div>

        {/* Transferência */}
        <div className="bg-[#1E293B]/70 backdrop-blur-md border border-[#7C3AED]/30 rounded-xl p-8 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <ArrowRightLeft size={28} className="text-[#A78BFA]" /> Transferência entre Sistemas
              </h3>
              <p className="text-[#94A3B8] text-sm max-w-xl leading-relaxed italic">
                O bônus de 20% é nominal. Use seu saldo para abater até 80% de qualquer outro sistema GSA.
              </p>
            </div>
            <button className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:from-[#8B5CF6] hover:to-[#C084FC] text-white px-10 py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#7C3AED]/30 flex items-center gap-2 group">
              TRANSFERIR SALDO <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Extrato */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#A78BFA] flex items-center gap-4">
            <History size={24} className="text-[#7C3AED]" /> Extrato Rewards
          </h2>
          <div className="bg-[#1E293B]/70 backdrop-blur-md rounded-xl border border-[#334155] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-[#0a0015]/40 text-[#94A3B8] text-[10px] uppercase font-black tracking-widest border-b border-[#334155]">
                <tr>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Origem / Descrição</th>
                  <th className="px-8 py-5 text-right">Valor</th>
                  <th className="px-8 py-5 text-right">Saldo Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {!wallet?.historico_recente ? (
                  <tr><td colSpan={4} className="px-8 py-16 text-center text-[#94A3B8] italic">Ainda não há movimentações na sua carteira.</td></tr>
                ) : (
                  wallet.historico_recente.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#334155]/20 transition-colors">
                      <td className="px-8 py-5 text-xs text-[#64748B] font-mono">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-[#E2E8F0]">{item.descricao}</div>
                        <span className="text-[9px] bg-[#7C3AED]/20 text-[#A78BFA] px-2 py-0.5 rounded border border-[#7C3AED]/30 uppercase mt-1 inline-block font-bold">
                          {item.produto || 'GERAL'}
                        </span>
                      </td>
                      <td className={`px-8 py-5 text-right text-sm font-bold ${item.tipo.includes('earned') || item.tipo.includes('received') ? 'text-[#28A745]' : 'text-[#D73A49]'}`}>
                        R$ {item.valor.toFixed(2)}
                      </td>
                      <td className="px-8 py-5 text-right text-sm text-[#E2E8F0] font-mono">R$ {item.saldo_apos.toFixed(2)}</td>
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