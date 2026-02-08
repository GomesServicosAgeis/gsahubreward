'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Trophy, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type Props = {
  referralCodes: any[];
  referralsList: any[];
  currentLevel: any;
  nextLevel: any | null;
  progress: number;
  activeIndications: number;
  userEmail: string | undefined;
};

export default function ReferralsClient({
  referralCodes,
  referralsList,
  currentLevel,
  nextLevel,
  progress,
  activeIndications,
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  // Soma o valor total em Real de todos os créditos disponíveis nos sistemas do usuário
  const totalCreditosReais = referralCodes.reduce((acc, curr) => 
    acc + (Number(curr.creditos_disponiveis_reais) || 0), 0
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-10 min-h-screen text-[#E2E8F0]">
      {/* Título Principal */}
      <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent italic tracking-tighter">
        Programa de Indicações
      </h1>
      
      {/* Card GSA Connect Rewards - Ajustado conforme solicitado */}
      <div className="bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-2xl border border-[#334155] mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} /> GSA Connect Rewards
            </h2>
            <p className="text-xl text-[#94A3B8]">
              Indique amigos e ganhe créditos. Você pode chegar a <strong className="text-[#28A745]">80% de desconto na fatura de cada sistema</strong>.
            </p>
          </div>

          <div className="bg-[#0a0015]/60 p-6 rounded-2xl border border-[#334155] text-center min-w-[240px] shadow-inner">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-2">Seu Desconto Acumulado</span>
            <p className="text-5xl font-black text-[#28A745] italic tracking-tighter">
              R$ {totalCreditosReais.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Nível atual e progresso */}
      <div className="bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-xl border border-[#334155] mb-12 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-sm font-black text-[#94A3B8] uppercase tracking-widest">Seu nível atual</h2>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-5xl drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]">{currentLevel.icon}</span>
              <span className="text-4xl font-black bg-gradient-to-r from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent uppercase italic">
                {currentLevel.name}
              </span>
            </div>
          </div>
          <div className="bg-[#0a0015]/40 p-6 rounded-2xl border border-[#334155] text-center md:text-right min-w-[200px]">
            <p className="text-5xl font-black text-[#7C3AED] italic leading-none">{activeIndications}</p>
            <p className="text-[#94A3B8] font-bold uppercase text-[10px] tracking-widest mt-2">indicações ativas</p>
          </div>
        </div>

        {nextLevel && (
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <p className="text-[#94A3B8] text-sm font-medium">
                Faltam <strong className="text-white font-black">{nextLevel.min - activeIndications}</strong> para o nível <strong className="text-[#C084FC] uppercase">{nextLevel.name} {nextLevel.icon}</strong>
              </p>
              <p className="text-sm font-black text-[#7C3AED] italic">{Math.round(progress)}%</p>
            </div>
            <div className="w-full bg-[#0a0015] rounded-full h-4 p-1 border border-[#334155]">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Seus Links de Indicação */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">
          Seus Links de Indicação
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {referralCodes.length > 0 ? (
            referralCodes.map((code: any) => {
              const link = `https://gsahubreward.vercel.app/register?ref=${code.code}`;
              const whatsappMsg = encodeURIComponent(
                `Ei! Estou usando os sistemas da GSA e ganhei um desconto especial pra você.\n\nUse meu link e ganhe *15% de desconto na primeira compra*:\n${link}\n\nDepois que você pagar a primeira fatura, eu ganho créditos pra usar nos meus sistemas também! 🚀`
              );
              const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;

              return (
                <div
                  key={code.product_id}
                  className="bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-[2rem] border border-[#334155] hover:border-[#7C3AED]/60 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black text-[#E2E8F0] uppercase tracking-tighter italic">{code.product_name}</h3>
                    <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-md border ${code.is_unlocked ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                      {code.is_unlocked ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </div>

                  <div className="bg-[#0a0015]/80 p-4 rounded-xl mb-6 font-mono text-xs break-all text-[#A78BFA] border border-[#334155]/50 shadow-inner">
                    {link}
                  </div>

                  <div className="flex gap-3 mb-8">
                    <button
                      onClick={() => copyToClipboard(link)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-purple-900/30"
                    >
                      <Copy className="w-4 h-4" />
                      {copied === link ? 'COPIADO!' : 'COPIAR LINK'}
                    </button>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-green-900/30"
                    >
                      <Share2 className="w-4 h-4" />
                      WHATSAPP
                    </a>
                  </div>

                  <div className="flex justify-center group-hover:scale-105 transition-transform duration-500">
                    <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                      <QRCodeSVG value={link} size={150} level="H" fgColor="#000000" bgColor="#FFFFFF" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 bg-[#1E293B]/40 rounded-3xl border border-dashed border-[#334155]">
              <p className="text-2xl font-bold text-[#94A3B8] mb-2 font-black italic uppercase">Nenhum Link Disponível</p>
              <p className="text-[#64748B] mb-8">Efetue sua primeira assinatura para liberar seu código de padrinho.</p>
              <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20">
                Ver Sistemas Disponíveis
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Tabela de Indicados */}
      <section className="pb-20">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent flex items-center gap-4">
          <Users size={28} className="text-[#C084FC]" /> Meus Indicados ({referralsList.length})
        </h2>

        <div className="bg-[#1E293B]/70 backdrop-blur-md rounded-2xl border border-[#334155] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-[#0a0015]/50 border-b border-[#334155] text-[#94A3B8] uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5 tracking-widest">Usuário</th>
                <th className="px-8 py-5 tracking-widest">Produto</th>
                <th className="px-8 py-5 tracking-widest">Status</th>
                <th className="px-8 py-5 tracking-widest text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/50">
              {referralsList.length > 0 ? (
                referralsList.map((ref: any) => (
                  <tr key={ref.id} className="hover:bg-[#7C3AED]/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-black text-[#E2E8F0] uppercase tracking-tighter italic">{ref.referred_tenant_name?.toLowerCase()}</p>
                        <p className="text-[11px] text-[#64748B] font-medium">{ref.referred_tenant_email}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-[#A78BFA] text-xs uppercase italic">{ref.product_name}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase border ${
                        ref.status === 'activated' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {(ref.status_label || ref.status).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[#94A3B8] text-right text-xs font-mono">
                      {new Date(ref.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-[#64748B] italic bg-black/10">
                    Nenhuma indicação ativa no momento. Compartilhe seu link!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}