import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.event;
    const payment = body.payment;

    console.log(`[GSA DEBUG] Evento: ${event} | Ref: ${payment.externalReference}`);

    if (['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_CREATED'].includes(event)) {
      // USANDO SERVICE_ROLE PARA EVITAR ERRO 401/RLS
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const referenceParts = payment.externalReference ? payment.externalReference.split('|') : [];
      if (referenceParts.length < 2) return NextResponse.json({ success: true }, { status: 200 });

      const [productId, userId] = referenceParts;

      // Busca o usuário
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('id, tenant_id, referred_by_code, email')
        .eq('id', userId)
        .single();

      if (!userProfile) return NextResponse.json({ success: true }, { status: 200 });

      // 1. Registro de Bônus
      if (userProfile.referred_by_code) {
        await supabaseAdmin.from('referral_usages').upsert({
          user_id: userProfile.id,
          product_id: productId,
          referral_code: userProfile.referred_by_code
        }, { onConflict: 'user_id, product_id' });
      }

      // 2. Ativação da Assinatura
      const { error: subError } = await supabaseAdmin.from('subscriptions').upsert({
        tenant_id: userProfile.tenant_id,
        user_id: userProfile.id,
        product_id: productId,
        status: 'active',
        asaas_customer_id: payment.customer,
        payment_method: payment.billingType,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, product_id' });

      if (subError) throw subError;
      console.log(`🚀 [GSA SUCCESS] Licença ativada para ${userProfile.email}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ [GSA WEBHOOK ERROR]:', error.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}