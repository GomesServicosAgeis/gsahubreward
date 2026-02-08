import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.event;
    const payment = body.payment;

    console.log(`[GSA DEBUG] Evento Recebido: ${event} | Pagamento: ${payment.id}`);

    // Incluímos 'PAYMENT_CREATED' para que o sistema libere assim que a fatura for gerada (Ideal para testes)
    const validEvents = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_CREATED'];

    if (validEvents.includes(event)) {
      const supabase = await createSupabaseServer();
      const productId = payment.externalReference; 

      // Busca o usuário pelo e-mail (conforme vimos no seu SQL, o e-mail 'danilolg22@outlook.com' existe)
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, tenant_id, referred_by_code, email')
        .or(`email.eq.${payment.email || 'vazio'},cpf_cnpj.eq.${payment.cpfCnpj || 'vazio'}`)
        .maybeSingle();

      if (!userProfile) {
        console.error('❌ [GSA WEBHOOK] Usuário não encontrado no banco para os dados do Asaas.');
        return NextResponse.json({ success: true, message: 'User not found' }, { status: 200 });
      }

      // 1. Registra bônus de indicação
      if (userProfile.referred_by_code) {
        await supabase.from('referral_usages').upsert({
          user_id: userProfile.id,
          product_id: productId,
          referral_code: userProfile.referred_by_code
        }, { onConflict: 'user_id, product_id' });
      }

      // 2. Libera a assinatura imediatamente
      const { error: subError } = await supabase.from('subscriptions').upsert({
        tenant_id: userProfile.tenant_id,
        user_id: userProfile.id,
        product_id: productId,
        status: 'active',
        asaas_customer_id: payment.customer,
        payment_method: payment.billingType,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, product_id' });

      if (subError) {
        console.error('❌ [GSA DB ERROR]:', subError.message);
        throw subError;
      }

      console.log(`🚀 [GSA SUCCESS] Assinatura ATIVA para: ${userProfile.email}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [GSA WEBHOOK CRITICAL]:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}