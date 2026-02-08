'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Gift } from 'lucide-react';

export default function ReferralTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (ref) {
      setShow(true);
      // Aqui você poderia disparar um log para o Supabase se quisesse
      console.log("Indicação detectada para usuário logado:", ref);
    }
  }, [ref]);

  if (!show) return null;

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-[#28A745]/20 to-[#7C3AED]/20 border border-[#28A745]/40 rounded-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-[#28A745] p-3 rounded-full shadow-lg shadow-[#28A745]/20">
          <Gift className="text-white" size={24} />
        </div>
        <div>
          <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Bônus de Indicação Ativo!</h4>
          <p className="text-[#94A3B8] text-sm font-medium">
            Identificamos o código <span className="text-[#A78BFA] font-bold">#{ref}</span>. 
            Seu desconto automático será aplicado na próxima ativação de sistema.
          </p>
        </div>
        <div className="ml-auto">
           <CheckCircle className="text-[#28A745]" size={32} />
        </div>
      </div>
    </div>
  );
}