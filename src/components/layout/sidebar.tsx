'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  LayoutDashboard, Users, Wallet, Package, 
  DollarSign, Settings, ChevronRight 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function getEmail() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    }
    getEmail();
  }, []);

  // Trava de segurança para o seu e-mail de Super Admin
  const isSuperAdmin = userEmail === 'gomesservicosageis@gmail.com';

  const clientMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Meus Sistemas', href: '/licenses', icon: Package }, // Link atualizado
    { name: 'Indique e Ganhe', href: '/referrals', icon: Users },
    { name: 'Minha Carteira', href: '/wallet', icon: Wallet },
  ];

  const adminMenu = [
    { name: 'Gestão de Produtos', href: '/admin/products', icon: Package },
    { name: 'Base de Clientes', href: '/admin/tenants', icon: Users },
    { name: 'Financeiro / MRR', href: '/admin/financial', icon: DollarSign },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0 z-40 font-sans">
      <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
        {/* Bloco Cliente */}
        <div className="space-y-2">
          <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
            ÁREA DO CLIENTE
          </h3>
          <div className="space-y-1">
            {clientMenu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon 
                      size={20} 
                      className={isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'} 
                    />
                    <span className="text-sm font-bold tracking-tight">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-blue-400" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bloco Admin - Visível apenas para gomesservicosageis@gmail.com */}
        {isSuperAdmin && (
          <div className="space-y-2 pt-4 border-t border-gray-800/50">
            <h3 className="px-4 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
              ADMINISTRAÇÃO (GSA)
            </h3>
            <div className="space-y-1">
              {adminMenu.map((item) => {
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
                      <item.icon 
                        size={20} 
                        className={isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'} 
                      />
                      <span className="text-sm font-bold tracking-tight">{item.name}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-blue-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}