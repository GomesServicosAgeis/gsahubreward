// src/app/(protected)/dashboard/page.tsx
import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import ReferralTracker from '@/components/ReferralTracker';

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id, name')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) {
    redirect('/login');
  }

  const { data: dashboardData, error: dashError } = await supabase
    .from('v_my_dashboard')
    .select('*')
    .single();

  const { data: creditsData } = await supabase
    .from('v_my_credits')
    .select('*');

  const { data: walletData } = await supabase
    .from('v_my_wallet')
    .select('*')
    .single();

  return (
    <div className="min-h-full">
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        
        {/* Lógica de Indicação para quem já é usuário */}
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>

        {dashError && (
          <div className="bg-[#D73A49]/20 border border-[#D73A49]/50 p-5 rounded-xl mb-8 text-center backdrop-blur-sm">
            Erro ao carregar dados: {dashError.message}
          </div>
        )}

        {/* Boas-vindas */}
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent italic uppercase tracking-tighter">
            Bem-vindo de volta, {profile.name?.split(' ')[0].toLowerCase() || 'Usuário'}!
          </h2>
          <p className="text-[#94A3B8] font-medium mt-1 uppercase text-xs tracking-[0.2em]">Painel de Controle GSA Hub</p>
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#1E293B]/70 backdrop-blur-md p-6 rounded-2xl border border-[#334155] hover:border-[#7C3AED]/60 transition-all duration-300 group">
            <h3 className="text-[10px] font-black mb-2 text-[#94A3B8] uppercase tracking-widest">Indicações Ativas</h3>
            <p className="text-5xl font-black text-[#7C3AED] group-hover:scale-105 transition-transform">{dashboardData?.total_indicacoes_ativas ?? 0}</p>
          </div>

          <div className="bg-[#1E293B]/70 backdrop-blur-md p-6 rounded-2xl border border-[#334155] hover:border-[#7C3AED]/60 transition-all duration-300">
            <h3 className="text-[10px] font-black mb-2 text-[#94A3B8] uppercase tracking-widest">Indicações Pendentes</h3>
            <p className="text-5xl font-black text-[#7C3AED] opacity-50">{dashboardData?.total_indicacoes_pendentes ?? 0}</p>
          </div>

          <div className="bg-[#1E293B]/70 backdrop-blur-md p-6 rounded-2xl border border-[#334155] hover:border-[#28A745]/60 transition-all duration-300">
            <h3 className="text-[10px] font-black mb-2 text-[#94A3B8] uppercase tracking-widest">Créditos Disponíveis</h3>
            <p className="text-4xl font-black text-[#28A745]">
              R$ {dashboardData?.total_creditos_produtos?.toFixed(2) ?? '0.00'}
            </p>
          </div>

          <div className="bg-[#1E293B]/70 backdrop-blur-md p-6 rounded-2xl border border-[#334155] hover:border-[#28A745]/60 transition-all duration-300 border-l-4 border-l-[#28A745]">
            <h3 className="text-[10px] font-black mb-2 text-[#94A3B8] uppercase tracking-widest">Saldo Carteira</h3>
            <p className="text-4xl font-black text-white">
              R$ {walletData?.saldo_disponivel?.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>

        {/* Créditos por produto */}
        <section className="mb-12">
          <h2 className="text-2xl font-black mb-8 text-white uppercase italic tracking-tight flex items-center gap-3">
            <div className="w-8 h-[2px] bg-[#7C3AED]"></div>
            Créditos por Produto
          </h2>
          <div className="bg-[#1E293B]/40 backdrop-blur-md p-8 rounded-[2rem] border border-[#334155]">
            {creditsData?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creditsData.map((credit: any) => (
                  <div key={credit.product_id} className="bg-[#0f172a]/80 p-6 rounded-2xl border border-[#334155] hover:border-[#7C3AED]/40 transition-all group">
                    <h3 className="text-lg font-bold mb-3 text-white uppercase tracking-tighter">{credit.product_name}</h3>
                    <p className="text-3xl font-black text-[#28A745] mb-2 group-hover:scale-110 transition-transform origin-left">
                      R$ {credit.creditos_disponiveis?.toFixed(2) ?? '0.00'}
                    </p>
                    <div className="pt-4 border-t border-[#334155] mt-4">
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                        Desconto Máximo: <span className="text-white">R$ {credit.desconto_maximo_possivel?.toFixed(2) ?? '0.00'}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl font-bold text-[#94A3B8] mb-2 uppercase italic">Nenhum crédito disponível ainda.</p>
                <p className="text-[#64748B] mb-8 text-sm">Indique amigos e multiplique seus resultados!</p>
                <Link
                  href="/referrals"
                  className="inline-block px-10 py-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:scale-105 text-white font-black rounded-xl text-xs tracking-[0.2em] transition-all shadow-xl shadow-[#7C3AED]/20 uppercase"
                >
                  Gerar Meu Link de Parceiro
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}