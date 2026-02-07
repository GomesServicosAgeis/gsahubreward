import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function WalletPage() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) {
    redirect('/login');
  }

  const { data: wallet } = await supabase
    .from('v_my_wallet')
    .select('*')
    .single();

  const { data: creditHistory } = await supabase
    .from('referral_credit_history')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: walletHistory } = await supabase
    .from('referral_wallet_history')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Unir e formatar históricos
  const fullHistory = [...(creditHistory || []), ...(walletHistory || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] text-[#E2E8F0] pt-24">
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent">
            Carteira GSA
          </h1>
          <p className="text-xl text-[#94A3B8]">
            Gerencie seus ganhos e utilize seus créditos para abater faturas.
          </p>
        </header>

        {/* Grid de Saldos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-2xl border border-[#334155] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-[#28A745]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Saldo Disponível</h3>
            <p className="text-6xl font-black text-[#28A745] tracking-tighter">
              R$ {wallet?.saldo_disponivel?.toFixed(2) ?? '0.00'}
            </p>
            <div className="flex gap-4 mt-6 pt-6 border-t border-[#334155]/50">
              <div>
                <p className="text-[10px] text-[#64748B] uppercase font-bold">Total Recebido</p>
                <p className="text-lg font-semibold text-white">R$ {wallet?.total_recebido?.toFixed(2) ?? '0.00'}</p>
              </div>
              <div className="border-l border-[#334155]/50 pl-4">
                <p className="text-[10px] text-[#64748B] uppercase font-bold">Total Usado</p>
                <p className="text-lg font-semibold text-[#A78BFA]">R$ {wallet?.total_usado?.toFixed(2) ?? '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-2xl border border-[#334155] shadow-xl relative overflow-hidden group">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#94A3B8] mb-2">Créditos Pendentes</h3>
            <p className="text-6xl font-black text-[#7C3AED] tracking-tighter">
              R$ {wallet?.creditos_pendentes?.toFixed(2) ?? '0.00'}
            </p>
            <p className="mt-6 pt-6 border-t border-[#334155]/50 text-sm text-[#94A3B8]">
              Última atualização: <span className="text-white font-medium">{wallet?.last_activity_at ? new Date(wallet.last_activity_at).toLocaleDateString('pt-BR') : 'Nenhum registro'}</span>
            </p>
          </div>
        </div>

        {/* Histórico */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">
            Histórico de Transações
          </h2>

          <div className="bg-[#1E293B]/70 backdrop-blur-md rounded-2xl border border-[#334155] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a]/50 border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-5 text-[#94A3B8] font-semibold uppercase text-[10px] tracking-widest">Data</th>
                    <th className="px-6 py-5 text-[#94A3B8] font-semibold uppercase text-[10px] tracking-widest">Tipo</th>
                    <th className="px-6 py-5 text-[#94A3B8] font-semibold uppercase text-[10px] tracking-widest">Valor</th>
                    <th className="px-6 py-5 text-[#94A3B8] font-semibold uppercase text-[10px] tracking-widest">Saldo Após</th>
                    <th className="px-6 py-5 text-[#94A3B8] font-semibold uppercase text-[10px] tracking-widest">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]/50">
                  {fullHistory.length > 0 ? (
                    fullHistory.map((entry: any, index) => {
                      const isEntry = entry.amount > 0;
                      return (
                        <tr key={index} className="hover:bg-[#7C3AED]/5 transition-colors">
                          <td className="px-6 py-5 text-sm text-[#94A3B8]">
                            {new Date(entry.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${
                              isEntry 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/20'
                            }`}>
                              {entry.type === 'earned' || entry.type === 'received' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className={`px-6 py-5 font-bold ${isEntry ? 'text-[#28A745]' : 'text-[#E2E8F0]'}`}>
                            {isEntry ? '+' : '-'} R$ {Math.abs(entry.amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-5 text-sm font-mono text-white">
                            R$ {entry.balance_after?.toFixed(2) ?? '0.00'}
                          </td>
                          <td className="px-6 py-5 text-sm text-[#94A3B8]">
                            {entry.description}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-[#64748B]">
                        Nenhuma movimentação registrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Rodapé com Ação */}
        <div className="flex flex-col items-center gap-6 pb-20">
          <Link
            href="/wallet/transfer"
            className="px-12 py-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:from-[#8B5CF6] hover:to-[#C084FC] text-white font-black rounded-2xl text-lg transition-all shadow-xl shadow-purple-900/30 hover:-translate-y-1 active:scale-95"
          >
            Transferir Créditos entre Produtos
          </Link>
          <p className="text-sm text-[#64748B]">
            * Créditos transferidos podem levar até 5 minutos para refletir no sistema.
          </p>
        </div>
      </main>
    </div>
  );
}