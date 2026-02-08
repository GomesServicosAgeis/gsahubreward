'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Rocket, CheckCircle2, Clock, ExternalLink } from "lucide-react";

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLicenses() {
      // Usamos a View que você criou no SQL
      const { data, error } = await supabase
        .from('v_my_credits')
        .select('*');

      if (!error) setLicenses(data);
      setLoading(false);
    }
    fetchLicenses();
  }, []);

  if (loading) {
    return <div className="p-6 text-white text-center">Carregando sistemas...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Meus Sistemas</h1>
        <p className="text-gray-400 text-lg">Gerencie suas assinaturas e acesse seus softwares.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {licenses.map((lib) => (
          <div key={lib.product_id} className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm rounded-xl overflow-hidden border-t-4 border-t-blue-500 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white">{lib.product_name}</h3>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${lib.creditos_disponiveis > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                  {lib.creditos_disponiveis > 0 ? 'COM DESCONTO' : 'ATIVO'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Valor Mensal:</span>
                  <span className="text-white font-medium">R$ {lib.price_monthly.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400 font-medium">Créditos Rewards:</span>
                  <span className="text-green-400 font-bold">- R$ {lib.creditos_disponiveis.toFixed(2)}</span>
                </div>
                <hr className="border-gray-700" />
                <div className="flex justify-between text-base pt-1">
                  <span className="text-white font-semibold">Próxima Fatura:</span>
                  <span className="text-blue-400 font-bold">R$ {lib.valor_minimo_pagar_proxima_fatura.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <ExternalLink size={16} /> Acessar Sistema
            </button>
          </div>
        ))}

        {/* Card para Adicionar Novo (Vitrine) */}
        <div className="bg-gray-900/40 border-dashed border-2 border-gray-700 rounded-xl flex flex-col items-center justify-center p-8 hover:border-blue-500/50 transition-all cursor-pointer group">
          <div className="bg-gray-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
            <Rocket className="text-blue-500" size={32} />
          </div>
          <h3 className="text-white font-bold text-lg text-center">Contratar Novo Sistema</h3>
          <p className="text-gray-500 text-center text-sm mt-2 mb-4">Expanda sua gestão com 15% OFF na 1ª mensalidade.</p>
          <button className="py-2 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all">
            Ver Vitrine GSA
          </button>
        </div>
      </div>
    </div>
  );
}