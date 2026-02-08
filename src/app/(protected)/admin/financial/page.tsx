'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  BarChart3, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertCircle, 
  DollarSign, 
  Calendar,
  Filter,
  Download
} from "lucide-react";

export default function AdminFinancialPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({ paid: 0, pending: 0, trial: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  async function fetchFinancialData() {
    // Buscamos as faturas cruzando com o nome do cliente e o produto
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        tenants(name),
        products(name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInvoices(data);
      
      // Cálculo rápido de estatísticas
      const paid = data.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
      const pending = data.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0);
      const trial = data.filter(i => i.status === 'trial').length;
      
      setStats({ paid, pending, trial });
    }
    setLoading(false);
  }

  if (loading) return <div className="p-6 text-white text-center">Acedendo aos cofres da GSA...</div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/40 border border-green-500/20 p-6 rounded-2xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-bold uppercase">Recebido (Mês)</span>
            <ArrowUpCircle className="text-green-500" size={24} />
          </div>
          <div className="text-3xl font-black text-white mt-2">R$ {stats.paid.toFixed(2)}</div>
        </div>

        <div className="bg-gray-800/40 border border-yellow-500/20 p-6 rounded-2xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-bold uppercase">A Receber</span>
            <ArrowDownCircle className="text-yellow-500" size={24} />
          </div>
          <div className="text-3xl font-black text-white mt-2">R$ {stats.pending.toFixed(2)}</div>
        </div>

        <div className="bg-gray-800/40 border border-blue-500/20 p-6 rounded-2xl">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-bold uppercase">Contas em Trial</span>
            <AlertCircle className="text-blue-500" size={24} />
          </div>
          <div className="text-3xl font-black text-white mt-2">{stats.trial} Usuários</div>
        </div>
      </div>

      {/* Lista de Faturas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign size={20} className="text-green-500" /> Fluxo de Cobranças
          </h2>
          <button className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 transition-all">
            <Download size={14} /> Exportar CSV
          </button>
        </div>

        <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Valor Bruto</th>
                <th className="px-6 py-4">Desconto Rewards</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-5 text-sm text-gray-400 font-mono">
                    {new Date(inv.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-white uppercase">{inv.tenants?.name}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-medium text-blue-400">{inv.products?.name}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-white">
                    R$ {inv.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-sm text-green-400 font-bold">
                    - R$ {inv.discount_amount?.toFixed(2) || '0,00'}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                      inv.status === 'paid' ? 'bg-green-500/20 text-green-400' : 
                      inv.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {inv.status === 'paid' ? 'Pago' : inv.status === 'pending' ? 'Pendente' : inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}