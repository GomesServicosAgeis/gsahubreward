// src/app/(protected)/licenses/page.tsx
import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  Package, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  Lock,
  Info,
  Check
} from "lucide-react";
import Link from 'next/link';

export default async function LicensesPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Busca produtos ativos e as assinaturas do usuário
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      subscriptions:subscriptions(status)
    `)
    .eq('is_active', true)
    .order('price_monthly', { ascending: true });

  return (
    <div className="min-h-full bg-transparent text-[#E2E8F0]">
      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
        
        {/* Header Profissional GSA */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent italic tracking-tighter uppercase">
            Ecossistema GSA
          </h1>
          <p className="text-[#94A3B8] text-sm font-medium uppercase tracking-[0.2em]">
            Gerencie seus softwares ativos e expanda sua gestão
          </p>
        </div>

        {/* Grid de Sistemas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products?.map((product) => {
            // Verifica se existe assinatura ativa para este produto
            const isActive = product.subscriptions && 
                             product.subscriptions.length > 0 && 
                             product.subscriptions[0].status === 'active';

            // Faz o parse das features caso venha como string ou array
            const features = Array.isArray(product.features) 
              ? product.features 
              : typeof product.features === 'string' 
                ? JSON.parse(product.features) 
                : [];

            return (
              <div 
                key={product.id} 
                className={`relative group rounded-[2.5rem] border transition-all duration-500 overflow-hidden flex flex-col ${
                  isActive 
                  ? 'bg-[#1E293B]/80 border-[#7C3AED]/40 shadow-[0_20px_40px_rgba(124,58,237,0.1)]' 
                  : 'bg-[#1E293B]/40 border-[#334155] hover:border-[#7C3AED]/30'
                }`}
              >
                {/* Badge de Status */}
                <div className="absolute top-6 right-6 z-20">
                  {isActive ? (
                    <span className="bg-[#28A745]/20 text-[#28A745] text-[10px] font-black px-4 py-1.5 rounded-full border border-[#28A745]/30 flex items-center gap-2 uppercase tracking-widest">
                      <CheckCircle2 size={12} /> Ativo
                    </span>
                  ) : (
                    <span className="bg-[#64748B]/20 text-[#94A3B8] text-[10px] font-black px-4 py-1.5 rounded-full border border-[#334155] flex items-center gap-2 uppercase tracking-widest">
                      <Lock size={12} /> Disponível
                    </span>
                  )}
                </div>

                {/* Conteúdo do Card */}
                <div className="p-8 space-y-6 flex-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-3 duration-300 ${
                    isActive ? 'bg-[#7C3AED] text-white' : 'bg-[#334155] text-gray-400'
                  }`}>
                    <Package size={32} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-2 font-medium">
                      {product.description}
                    </p>
                  </div>

                  {/* Features Dinâmicas do Banco */}
                  <ul className="space-y-3 pt-4 border-t border-white/5">
                    {features.slice(0, 4).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Check size={14} className="text-[#7C3AED]" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ações de Rodapé */}
                <div className="p-8 bg-black/20 border-t border-white/5">
                  {isActive ? (
                    <Link 
                      href={product.app_url || '#'} 
                      className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 group uppercase tracking-widest shadow-lg shadow-purple-900/40"
                    >
                      ABRIR PLATAFORMA <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex justify-between items-end px-1">
                        <div className="space-y-1">
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Mensalidade Ágil</p>
                          <p className="text-2xl font-black text-white italic">
                            R$ {parseFloat(product.price_monthly).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-[#28A745] uppercase tracking-widest bg-[#28A745]/10 px-2 py-1 rounded-md">
                            {product.trial_days} Dias Grátis
                          </p>
                        </div>
                      </div>
                      <Link 
                        href={`/checkout/${product.slug}`}
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 group uppercase tracking-widest"
                      >
                        EXPERIMENTAR AGORA <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Informativo de Segurança */}
        <div className="bg-[#1E293B]/60 border border-white/5 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-green-500/10 rounded-2xl">
              <ShieldCheck size={28} className="text-[#28A745]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-black uppercase italic tracking-tighter text-lg">Ambiente Seguro GSA</h4>
              <p className="text-xs text-gray-400 max-w-xl font-medium">
                Sua assinatura é processada de forma segura. O acesso ao sistema é liberado imediatamente após a confirmação do pagamento ou início do trial.
              </p>
            </div>
          </div>
          <button className="whitespace-nowrap px-8 py-4 bg-[#1E293B] text-white border border-[#334155] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#334155] transition-all">
            Dúvidas sobre licenciamento?
          </button>
        </div>
      </main>
    </div>
  );
}