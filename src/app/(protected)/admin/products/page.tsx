'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Package, Plus, Edit2, Power, DollarSign, Tag } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (!error) setProducts(data);
    setLoading(false);
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header Admin */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Gestão de Produtos</h1>
          <p className="text-gray-500 text-sm">Controle os sistemas visíveis no ecossistema GSA.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20">
          <Plus size={18} /> NOVO SISTEMA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-[#1E293B]/70 border border-[#334155] rounded-3xl p-6 space-y-6 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="p-4 bg-gray-800 rounded-2xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Package size={24} />
              </div>
              <button className={`p-2 rounded-lg border transition-all ${
                product.is_active ? 'border-green-500/20 text-green-500 bg-green-500/10' : 'border-red-500/20 text-red-500 bg-red-500/10'
              }`}>
                <Power size={16} />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-black text-white uppercase italic">{product.name}</h3>
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-500 font-bold block">PREÇO MENSAL</span>
                <span className="text-white font-black">R$ {product.price_monthly?.toFixed(2)}</span>
              </div>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-500 font-bold block">TAG ASAAS</span>
                <span className="text-blue-400 font-mono text-[10px] truncate">{product.asaas_id || '---'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-bold border border-white/10 flex items-center justify-center gap-2">
                <Edit2 size={14} /> EDITAR
              </button>
              <button className="px-4 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/10 flex items-center justify-center">
                <Tag size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}