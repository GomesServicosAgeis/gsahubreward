'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Package, 
  ExternalLink, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Info 
} from "lucide-react";

export default function LicensesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      // Buscamos todos os produtos e cruzamos com as assinaturas ativas do tenant
      // Nota: v_my_dashboard ou uma rpc customizada ajudam aqui
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          subscriptions:subscriptions(status)
        `)
        .eq('is_active', true);

      if (!error) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) return <div className="p-10 text-center text-[#7C3AED] animate-pulse font-black uppercase">Sincronizando Licenças GSA...</div>;

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto text-[#E2E8F0]">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#C084FC] bg-clip-text text-transparent italic tracking-tighter uppercase">
          Ecossistema GSA
        </h1>
        <p className="text-[#94A3B8] text-lg">Gerencie seus softwares ativos e expanda sua gestão com novas soluções.</p>
      </div>

      {/* Grid de Sistemas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => {
          // Lógica para verificar se o sistema está ativo
          const isActive = product.subscriptions && product.subscriptions.length > 0 && product.subscriptions[0].status === 'active';

          return (
            <div 
              key={product.id} 
              className={`relative group rounded-[2rem] border transition-all duration-500 overflow-hidden flex flex-col ${
                isActive 
                ? 'bg-[#1E293B]/80 border-[#7C3AED]/40 shadow-[0_20px_40px_rgba(124,58,237,0.1)]' 
                : 'bg-[#1E293B]/40 border-[#334155] grayscale-[0.8] hover:grayscale-0'
              }`}
            >
              {/* Overlay de Status */}
              <div className="absolute top-4 right-4 z-20">
                {isActive ? (
                  <span className="bg-[#28A745]/20 text-[#28A745] text-[10px] font-black px-3 py-1 rounded-full border border-[#28A745]/30 flex items-center gap-1 uppercase">
                    <CheckCircle2 size={12} /> Ativo
                  </span>
                ) : (
                  <span className="bg-[#64748B]/20 text-[#94A3B8] text-[10px] font-black px-3 py-1 rounded-full border border-[#334155] flex items-center gap-1 uppercase">
                    <Lock size={12} /> Disponível
                  </span>
                )}
              </div>

              {/* Corpo do Card */}
              <div className="p-8 space-y-6 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  isActive ? 'bg-[#7C3AED] text-white' : 'bg-[#334155] text-gray-400'
                }`}>
                  <Package size={28} />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{product.name}</h3>
                  <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed line-clamp-2">
                    {product.description || "Solução inteligente para otimizar os resultados da sua empresa."}
                  </p>
                </div>

                {/* Benefícios Rápidos */}
                <ul className="space-y-3 pt-2">
                  <li className="flex items-center gap-2 text-xs text-gray-400">
                    <Zap size={14} className="text-[#C084FC]" /> Integração GSA Hub
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-400">
                    <ShieldCheck size={14} className="text-[#C084FC]" /> Suporte Prioritário
                  </li>
                </ul>
              </div>

              {/* Rodapé do Card / Ações */}
              <div className="p-6 bg-black/20 border-t border-white/5">
                {isActive ? (
                  <button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 group uppercase tracking-widest shadow-lg shadow-purple-900/40">
                    ACESSAR SISTEMA <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-gray-500 text-[10px] font-bold uppercase">Investimento Mensal</span>
                      <span className="text-white font-black">R$ {product.price_monthly?.toFixed(2)}</span>
                    </div>
                    <button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 group uppercase tracking-widest">
                      CONTRATAR AGORA <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Informativo de Expansão */}
      <div className="bg-[#1E293B]/70 border border-blue-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-3 bg-blue-500/10 rounded-full"><Info size={24} className="text-blue-400" /></div>
          <p className="text-sm text-gray-400 max-w-lg">
            Sua conta **GSA Hub** permite que você gerencie múltiplos CNPJs. Se contratar um novo sistema, ele será vinculado automaticamente ao seu faturamento atual.
          </p>
        </div>
        <button className="text-blue-400 font-bold text-xs uppercase hover:underline">Falar com Consultor</button>
      </div>
    </div>
  );
}