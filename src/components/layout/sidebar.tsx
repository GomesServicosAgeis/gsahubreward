'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Monitor, 
  Users, 
  Wallet, 
  Settings, 
  ShieldCheck,
  Package,
  DollarSign,
  ChevronRight,
  LogOut
} from "lucide-react";

const menuItems = [
  {
    group: "Área do Cliente",
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Meus Sistemas', href: '/dashboard/licenses', icon: Monitor },
      { name: 'Indique e Ganhe', href: '/dashboard/referrals', icon: Users },
      { name: 'Minha Carteira', href: '/dashboard/wallet', icon: Wallet },
    ]
  },
  {
    group: "Administração (GSA)",
    items: [
      { name: 'Gestão de Produtos', href: '/admin/products', icon: Package },
      { name: 'Base de Clientes', href: '/admin/tenants', icon: Users },
      { name: 'Financeiro / MRR', href: '/admin/financial', icon: DollarSign },
      { name: 'Configurações', href: '/admin/settings', icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo GSA */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
            G
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase">
            GSA<span className="text-blue-500">Hub</span>
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
        {menuItems.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                      isActive 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'} />
                      <span className="text-sm font-bold">{item.name}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-blue-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Rodapé / Perfil */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-300">
              DG
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Danilo Gomes</span>
              <span className="text-[10px] text-gray-500">Admin</span>
            </div>
          </div>
          <button className="text-gray-500 hover:text-red-400 p-1 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}