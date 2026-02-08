'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Settings2, 
  Plus, 
  TrendingUp, 
  Users, 
  Package, 
  Edit3, 
  Eye
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    // Puxa da View v_admin_products que traz as contagens de assinaturas
    const { data, error } = await supabase
      .from('v_admin_products')
      .select('*');

    if (!error) setProducts(data);
    setLoading(false);
  }

  if (loading) return <div className="p-6 text-white text-center">Acessando central de produtos...</div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Administrativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="text-blue-500" /> Gestão de Sistemas GSA
          </h1>
          <p className="text-gray-400 mt-1">Controle preços, trial e métricas de cada software da esteira.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all">
          <Plus size={20} /> Novo Sistema
        </button>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/40 border border-gray-700 p-5 rounded-xl">
          <span className="text-gray-400 text-xs uppercase font-bold">Total MRR</span>
          <div className="text-2xl font-black text-green-400 mt-1">
            R$ {products.reduce((acc, p) => acc + (p.price_monthly * p.assinaturas_ativas), 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-800/40 border border-gray-700 p-5 rounded-xl">
          <span className="text-gray-400 text-xs uppercase font-bold">Assinaturas Ativas</span>
          <div className="text-2xl font-black text-white mt-1">
            {products.reduce((acc, p) => acc + p.assinaturas_ativas, 0)}
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Sistema</th>
              <th className="px-6 py-4 text-center">Preço (R$)</th>
              <th className="px-6 py-4 text-center">Trial (Dias)</th>
              <th className="px-6 py-4 text-center">Ativos / Trial</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 font-bold">
                      {p.name.charAt(4)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white uppercase">{p.name}</div>
                      <div className="text-xs text-gray-500 italic">/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="text-sm font-bold text-blue-400">R$ {p.price_monthly.toFixed(2)}</div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
                    {p.trial_days} dias
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex justify-center gap-3">
                    <div className="flex items-center gap-1 text-green-400 text-sm font-bold" title="Ativos">
                      <CheckCircle2 size={14} /> {p.assinaturas_ativas}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold" title="Em Trial">
                      <TrendingUp size={14} /> {p.em_trial}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white" title="Editar Preço">
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white" title="Ver Detalhes">
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Seção de Configurações Gerais do Rewards */}
      <div className="bg-gray-900/50 border border-blue-500/20 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Settings2 className="text-blue-500" /> Parâmetros do Connect Rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase font-bold">Bônus Padrinho (%)</label>
            <input type="number" defaultValue="20" className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase font-bold">Desconto Máximo (%)</label>
            <input type="number" defaultValue="80" className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded-lg border border-gray-600 transition-all">
              Atualizar Regras
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pequeno helper para o ícone de check não dar erro
function CheckCircle2({ size, ...props }: any) {
  return <CheckCircle {...props} size={size} />;
}
import { CheckCircle } from 'lucide-react';