// src/app/(protected)/referrals/ReferralsClient.tsx
'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2 } from 'lucide-react';
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
  userEmail,
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);

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
    <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-24">
      <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent">
        Programa de Indicações
      </h1>
      <p className="text-xl text-[#94A3B8] mb-10">
        Indique amigos e ganhe créditos em dinheiro real. Você pode chegar a <strong className="text-[#28A745]">80% de desconto permanente</strong>.
      </p>

      {/* Nível atual e progresso */}
      <div className="bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-xl border border-[#334155] mb-12 shadow-xl shadow-purple-900/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-[#94A3B8] uppercase tracking-wider">Seu nível atual</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-5xl">{currentLevel.icon}</span>
              <span className="text-4xl font-black bg-gradient-to-r from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">
                {currentLevel.name}
              </span>
            </div>
          </div>
          <div className="bg-[#0f172a]/50 p-6 rounded-2xl border border-[#334155] text-center md:text-right min-w-[200px]">
            <p className="text-5xl font-black text-[#28A745]">{activeIndications}</p>
            <p className="text-[#94A3B8] font-medium uppercase text-xs tracking-widest mt-1">indicações ativas</p>
          </div>
        </div>

        {nextLevel && (
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-[#94A3B8]">
                Faltam <strong className="text-white">{nextLevel.min - activeIndications}</strong> para <strong className="text-[#C084FC]">{nextLevel.name} {nextLevel.icon}</strong>
              </p>
              <p className="text-sm font-bold text-[#7C3AED]">{Math.round(progress)}%</p>
            </div>
            <div className="w-full bg-[#0f172a] rounded-full h-4 p-1 border border-[#334155]">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(124,58,237,0.5)]"
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
              const link = `https://gsa.app/register?ref=${code.code}`;
              const whatsappMsg = encodeURIComponent(
                `Ei! Estou usando os sistemas da GSA e ganhei um desconto especial pra você.\n\nUse meu link e ganhe *15% de desconto na primeira compra*:\n${link}\n\nDepois que você pagar a primeira fatura, eu ganho créditos pra usar nos meus sistemas também! 🚀`
              );
              const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;

              return (
                <div
                  key={code.product_id}
                  className="bg-[#1E293B]/70 backdrop-blur-md p-7 rounded-2xl border border-[#334155] hover:border-[#7C3AED]/60 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-[#E2E8F0] group-hover:text-[#C084FC] transition-colors">{code.product_name}</h3>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${code.is_unlocked ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'}`}>
                      {code.is_unlocked ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </div>

                  <div className="bg-[#0a0015] p-4 rounded-xl mb-6 font-mono text-sm break-all text-[#A78BFA] border border-[#334155]/50">
                    {link}
                  </div>

                  <div className="flex gap-3 mb-8">
                    <button
                      onClick={() => copyToClipboard(link)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-900/20"
                    >
                      <Copy className="w-4 h-4" />
                      {copied === link ? 'Copiado!' : 'Copiar'}
                    </button>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1ea952] text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-green-900/20"
                    >
                      <Share2 className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </div>

                  <div className="flex justify-center group-hover:scale-105 transition-transform duration-500">
                    <div className="bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                      <QRCodeSVG value={link} size={160} level="H" fgColor="#000000" bgColor="#FFFFFF" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 bg-[#1E293B]/40 rounded-2xl border border-dashed border-[#334155]">
              <p className="text-2xl font-bold text-[#94A3B8] mb-2">Ainda sem links disponíveis</p>
              <p className="text-[#64748B] mb-8">Efetue sua primeira assinatura para liberar seu código.</p>
              <Link href="/dashboard" className="px-8 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-xl transition-all">
                Ir para o Dashboard
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Tabela de Indicados */}
      <section className="pb-20">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">
          Seus Indicados ({referralsList.length})
        </h2>

        <div className="bg-[#1E293B]/70 backdrop-blur-md rounded-2xl border border-[#334155] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0f172a]/50 border-b border-[#334155]">
                <tr>
                  <th className="px-6 py-5 text-[#94A3B8] font-semibold uppercase text-xs tracking-wider">Usuário</th>
                  <th className="px-6 py-5 text-[#94A3B8] font-semibold uppercase text-xs tracking-wider">Produto</th>
                  <th className="px-6 py-5 text-[#94A3B8] font-semibold uppercase text-xs tracking-wider">Status</th>
                  <th className="px-6 py-5 text-[#94A3B8] font-semibold uppercase text-xs tracking-wider text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/50">
                {referralsList.length > 0 ? (
                  referralsList.map((ref: any) => (
                    <tr key={ref.id} className="hover:bg-[#7C3AED]/5 transition-colors">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold text-[#E2E8F0]">{ref.referred_tenant_name?.toLowerCase()}</p>
                          <p className="text-xs text-[#64748B]">{ref.referred_tenant_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-medium text-[#A78BFA]">{ref.product_name}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          ref.status === 'activated' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {(ref.status_label || ref.status).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[#94A3B8] text-right text-sm">
                        {new Date(ref.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-[#64748B]">
                      Nenhuma indicação ativa no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}