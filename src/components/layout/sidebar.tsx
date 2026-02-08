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

  const isSuperAdmin = userEmail === 'gomesservicosageis@gmail.com';

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Meus Sistemas', href: '/licenses', icon: Package },
    { name: 'Indique e Ganhe', href: '/referrals', icon: Users },
    { name: 'Minha Carteira', href: '/wallet', icon: Wallet },
  ];

  const adminItems = [
    { name: 'Produtos', href: '/admin/products', icon: Package },
    { name: 'Financeiro', href: '/admin/financial', icon: DollarSign },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-[#1e293b] flex flex-col h-full font-sans">
      <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
        <div>
          <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Área do Cliente</h3>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${pathname === item.href ? 'bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/20' : 'text-gray-400 hover:bg-gray-800'}`}>
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="text-sm font-bold uppercase tracking-tighter">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {isSuperAdmin && (
          <div>
            <h3 className="px-4 text-[10px] font-black text-[#A78BFA] uppercase tracking-widest mb-4">Administração GSA</h3>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${pathname === item.href ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-gray-400 hover:bg-gray-800'}`}>
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span className="text-sm font-bold uppercase tracking-tighter">{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}