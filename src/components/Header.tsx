'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Header({ userName }: { userName?: string }) {
  const router = useRouter();
  
  // Lógica: Se não houver nome, usa "Usuário". Se houver, pega o primeiro nome.
  const firstName = userName ? userName.trim().split(' ')[0] : 'Usuário';
  const initial = firstName[0]?.toUpperCase() || 'U';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="bg-[#1E293B]/95 backdrop-blur-md border-b border-[#334155] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">
            GSA Hub
          </Link>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white font-bold shadow-lg">
                {initial}
              </div>
              <span className="hidden sm:block text-sm text-[#94A3B8] font-bold uppercase tracking-tight">
                {firstName}
              </span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[#D73A49]/20 hover:bg-[#D73A49] text-[#D73A49] hover:text-white text-xs font-black rounded-lg transition-all border border-[#D73A49]/30"
            >
              <LogOut className="w-4 h-4" /> SAIR
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}