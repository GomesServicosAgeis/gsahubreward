'use client';

import { Shield, Key, Percent, Globe, Save } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Configurações GSA</h1>
        <p className="text-gray-500 text-sm">Parâmetros globais do sistema e integrações de API.</p>
      </div>

      <div className="space-y-6">
        {/* Parâmetros do Rewards */}
        <div className="bg-[#1E293B]/70 border border-[#334155] rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Percent className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">Regras do Rewards</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">PORCENTAGEM POR INDICAÇÃO</label>
              <input type="text" defaultValue="20%" className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">TETO MÁXIMO DE DESCONTO</label>
              <input type="text" defaultValue="80%" className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Integração Asaas */}
        <div className="bg-[#1E293B]/70 border border-[#334155] rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Key className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold text-white">API Asaas (Produção)</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">WEBHOOK TOKEN</label>
              <input type="password" value="************************" className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
            </div>
            <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl text-xs text-yellow-200/60">
              Atenção: O Webhook deve apontar para <strong>https://gsahubreward.vercel.app/api/webhooks/asaas</strong>
            </div>
          </div>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2">
          <Save size={18} /> SALVAR ALTERAÇÕES GLOBAIS
        </button>
      </div>
    </div>
  );
}