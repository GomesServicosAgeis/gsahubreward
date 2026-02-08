'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  ShieldCheck, 
  CreditCard, 
  Zap, 
  CheckCircle2, 
  ArrowLeft,
  Lock,
  Loader2,
  Tag
} from "lucide-react";
import Link from 'next/link';

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isBonusUsed, setIsBonusUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Busca os detalhes do produto
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('slug', params.slug)
        .single();

      // 2. Busca o perfil e o código de indicação
      const { data: profData } = await supabase
        .from('users')
        .select('id, name, email, referred_by_code')
        .eq('id', user.id)
        .single();

      if (!prodData) {
        router.push('/licenses');
        return;
      }

      // 3. VERIFICAÇÃO DE USO ÚNICO: 
      // Vê se já existe um registro de uso desse bônus para este produto
      if (profData?.referred_by_code) {
        const { data: usage } = await supabase
          .from('referral_usages')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', prodData.id)
          .single();
        
        if (usage) {
          setIsBonusUsed(true); // O bônus já foi gasto neste produto
        }
      }

      setProduct(prodData);
      setProfile(profData);
      setLoading(false);
    }

    loadData();
  }, [params.slug, router]);

  const handlePayment = async () => {
    setPaymentLoading(true);
    
    const price = parseFloat(product.price_monthly);
    // Só aplica o desconto se tiver código E não tiver sido usado ainda
    const canUseBonus = !!profile?.referred_by_code && !isBonusUsed;
    const finalPrice = canUseBonus ? price * 0.90 : price;

    try {
      const response = await fetch('/api/checkout/asaas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productPrice: finalPrice,
          referralCode: canUseBonus ? profile.referred_by_code : null
        })
      });
      
      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || 'Erro ao gerar link de pagamento.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao processar o checkout.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0015]">
        <Loader2 className="text-[#7C3AED] animate-spin" size={48} />
      </div>
    );
  }

  const price = parseFloat(product.price_monthly);
  // Lógica visual: Se tem código mas já usou, não mostra desconto
  const showDiscount = !!profile?.referred_by_code && !isBonusUsed;
  const discountAmount = showDiscount ? price * 0.10 : 0;
  const finalPrice = price - discountAmount;

  return (
    <div className="min-h-screen bg-transparent text-[#E2E8F0] font-sans">
      <main className="max-w-5xl mx-auto p-6 lg:p-10">
        
        <Link href="/licenses" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          <ArrowLeft size={16} /> Voltar para o Ecossistema
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#1E293B]/60 backdrop-blur-xl rounded-[2.5rem] border border-[#334155] p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-[#7C3AED] p-3 rounded-2xl shadow-lg shadow-[#7C3AED]/20">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Confirmar Assinatura</h2>
                  <p className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest mt-1">GSA Hub / {product.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-5 border-b border-white/5">
                  <span className="text-[#94A3B8] font-bold uppercase text-[10px] tracking-widest">Valor do Software</span>
                  <span className="text-white font-black text-lg">R$ {price.toFixed(2)}</span>
                </div>

                {showDiscount ? (
                  <div className="flex justify-between items-center py-5 border-b border-white/5 text-[#28A745]">
                    <span className="font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                      <Tag size={14} /> Cupom de Indicação Ativo
                    </span>
                    <span className="font-black text-lg">- R$ {discountAmount.toFixed(2)}</span>
                  </div>
                ) : profile?.referred_by_code && (
                  <div className="flex justify-between items-center py-5 border-b border-white/5 text-gray-500">
                    <span className="font-bold uppercase text-[9px] tracking-widest flex items-center gap-2">
                      <Lock size={12} /> Bônus já utilizado para este sistema
                    </span>
                    <span className="font-bold text-xs">Indisponível</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-8">
                  <div>
                    <span className="text-xl font-black text-white uppercase italic tracking-tighter block">Total Final</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Pagamento Único para Ativação</span>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-black text-[#28A745] italic tracking-tighter">
                      R$ {finalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[#1E293B]/30 p-6 rounded-2xl border border-[#334155] flex items-center gap-3">
                  <ShieldCheck className="text-[#28A745]" size={20} />
                  <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Pagamento via Asaas</span>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="bg-[#1E293B] border-2 border-[#7C3AED]/40 rounded-[2.5rem] p-8 shadow-2xl">
              <button 
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full py-6 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white font-black rounded-[1.5rem] uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {paymentLoading ? <Loader2 className="animate-spin" size={18} /> : 'FINALIZAR AGORA'}
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}