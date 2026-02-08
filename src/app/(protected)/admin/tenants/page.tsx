'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserPlus, 
  CreditCard,
  MoreVertical,
  Mail,
  ShieldCheck
} from "lucide-react";

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    // Aqui buscamos os dados da tabela principal de tenants 
    // com um join simples para ver quem é o padrinho (referrer)
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        referrer:referrer_id(name, email)
      `)
      .order('created_at', { ascending: false });

    if (!error) setTenants(data);
    setLoading(false);
  }

  // Filtro de busca simples
  const filteredTenants = tenants.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6 text-white text-center">Carregando base de clientes GSA...</div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header com Busca */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-blue-500" /> Base de Clientes
          </h1>
          <p className="text-gray-400 mt-1">Gerencie todos os CNPJs e CPFs vinculados ao GSA Hub.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome, e-mail ou CNPJ..."
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Cliente / Empresa</th>
              <th className="px-6 py-4">Documento (CPF/CNPJ)</th>
              <th className="px-6 py-4">Padrinho (Referrer)</th>
              <th className="px-6 py-4 text-center">Status Asaas</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                  Nenhum cliente encontrado com os termos buscados.
                </td>
              </tr>
            ) : (
              filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center text-white font-bold uppercase">
                        {tenant.name?.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white uppercase">{tenant.name || 'Sem Nome'}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={12} /> {tenant.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-gray-300 font-mono">
                      {tenant.document || '---.---.---'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {tenant.referrer ? (
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-blue-400 uppercase">{tenant.referrer.name}</span>
                        <span className="text-[10px] text-gray-500 italic">Indicado por</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600 italic">Orgânico (Direto)</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      tenant.asaas_customer_id ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {tenant.asaas_customer_id ? 'Integrado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Card de Suporte Admin */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex gap-4 items-center">
        <ShieldCheck className="text-yellow-600" size={24} />
        <p className="text-sm text-yellow-200/80">
          <strong>Atenção Danilo:</strong> Como Administrador, tu podes ver o <code>asaas_customer_id</code>. Se um cliente estiver "Pendente", ele ainda não gerou nenhuma cobrança no sistema.
        </p>
      </div>
    </div>
  );
}
