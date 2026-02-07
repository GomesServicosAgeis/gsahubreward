// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Wallet, ShieldCheck, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Indicações', href: '/referrals', icon: Users },
  { name: 'Carteira', href: '/wallet', icon: Wallet },
  { name: 'Admin', href: '/admin', icon: ShieldCheck, adminOnly: true },
];

type HeaderProps = {
  userEmail?: string;
  isSuperAdmin?: boolean;
};

export default function Header({ userEmail, isSuperAdmin = false }: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-[#1E293B]/95 backdrop-blur-md border-b border-[#334155] sticky top-0 z-50 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">
              GSA Hub
            </span>
          </Link>

          {/* Navegação desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              if (item.adminOnly && !isSuperAdmin) return null;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#7C3AED]/20 text-[#A78BFA]'
                      : 'text-[#94A3B8] hover:bg-[#334155]/60 hover:text-[#E2E8F0]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info & logout */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white font-semibold shadow-md">
                {userEmail?.[0]?.toUpperCase() || 'D'}
              </div>
              <span className="hidden sm:block text-sm text-[#94A3B8]">
                {userEmail || 'Usuário'}
              </span>
            </div>

            {/* Logout */}
            <button className="flex items-center gap-2 px-4 py-2 bg-[#D73A49]/80 hover:bg-[#D73A49] text-white text-sm font-medium rounded-md transition">
              <LogOut className="w-4 h-4" />
              Sair
            </button>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-[#E2E8F0] hover:text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-[#334155]">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                if (item.adminOnly && !isSuperAdmin) return null;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md ${
                      isActive
                        ? 'bg-[#7C3AED]/20 text-[#A78BFA]'
                        : 'text-[#94A3B8] hover:bg-[#334155]/60'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}