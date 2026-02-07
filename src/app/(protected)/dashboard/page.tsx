// src/app/(protected)/dashboard/page.tsx
import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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

  const handleLogout = async () => {
    'use server';
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] text-[#E2E8F0] pt-20"> {/* pt-20 para dar espaço ao header fixo */}
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        {dashError && (
          <div className="bg-[#D73A49]/20 border border-[#D73A49]/50 p-5 rounded-xl mb-8 text-center backdrop-blur-sm">
            Erro ao carregar dados: {dashError.message}
          </div>
        )}

        {/* Boas-vindas */}
        <h2 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent">
          Bem-vindo de volta, {profile.name?.toLowerCase() || 'Usuário'}!
        </h2>

        {/* Cards resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#1E293B]/70 backdrop-blur-md p-6 rounded-xl border border-[#334155] hover:border-[#7C3AED]/60 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-2 text-[#94A3B8]">Indicações Ativas</h3>
            <p className="text-5xl font-bold text-[#7C3AED]">{dashboardData?.total_indicacoes_ativas ?? 0}</p>
          </div>

          <div className="bg-[#1E293B]/70 backdrop-blur-md p-6 rounded-xl border border-[#334155] hover:border-[#7C3AED]/60 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-2 text-[#94A3B8]">Indicações Pendentes</h3>
            <p className="text-5xl font-bold text-[#7C3AED]">{dashboardData?.total_indicacoes_pendentes ?? 0}</p>
          </div>

          <div className="bg-[#1E293B]/70 backdrop-blur-md p-6 rounded-xl border border-[#334155] hover:border-[#28A745]/60 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-2 text-[#94A3B8]">Créditos Disponíveis</h3>
            <p className="text-5xl font-bold text-[#28A745]">
              R$ {dashboardData?.total_creditos_produtos?.toFixed(2) ?? '0.00'}
            </p>
          </div>

          <div className="bg-[#1E293B]/70 backdrop-blur-md p-6 rounded-xl border border-[#334155] hover:border-[#28A745]/60 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-2 text-[#94A3B8]">Saldo Carteira</h3>
            <p className="text-5xl font-bold text-[#28A745]">
              R$ {walletData?.saldo_disponivel?.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>

        {/* Créditos por produto */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">
            Créditos por Produto
          </h2>
          <div className="bg-[#1E293B]/70 backdrop-blur-md p-8 rounded-xl border border-[#334155]">
            {creditsData?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creditsData.map((credit: any) => (
                  <div key={credit.product_id} className="bg-[#161B22]/70 p-6 rounded-lg border border-[#30363D] hover:border-[#28A745]/50 transition-all">
                    <h3 className="text-xl font-semibold mb-3 text-[#E2E8F0]">{credit.product_name}</h3>
                    <p className="text-4xl font-bold text-[#28A745] mb-2">
                      R$ {credit.creditos_disponiveis?.toFixed(2) ?? '0.00'}
                    </p>
                    <p className="text-sm text-[#94A3B8]">
                      Desconto máx possível: R$ {credit.desconto_maximo_possivel?.toFixed(2) ?? '0.00'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-2xl text-[#94A3B8] mb-4">Nenhum crédito disponível ainda.</p>
                <p className="text-[#8B949E] mb-6">Indique amigos para começar a ganhar!</p>
                <Link
                  href="/referrals"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:from-[#8B5CF6] hover:to-[#C084FC] text-white font-bold rounded-xl text-lg transition shadow-xl shadow-[#7C3AED]/30"
                >
                  Ver Indicações & Gerar Seu Link
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}