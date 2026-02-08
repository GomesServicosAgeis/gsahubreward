import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 Evento Asaas Recebido:", body.event);

    const event = body.event;
    const payment = body.payment;

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const supabase = await createSupabaseServer();
      
      const productId = payment.externalReference; 
      const customerId = payment.customer;

      // BUSCA REFINADA: Tenta achar o usuário por CPF ou Email que o Asaas enviou
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, tenant_id, referred_by_code, email')
        .or(`cpf_cnpj.eq.${payment.cpfCnpj || 'vazio'},email.eq.${payment.email || 'vazio'}`)
        .maybeSingle();

      if (userError || !userProfile) {
        console.error('❌ Usuário não localizado para o pagamento:', payment.id);
        // Retornamos 200 para o Asaas não ficar repetindo o erro, mas logamos a falha
        return NextResponse.json({ error: 'User not found in GSA database' }, { status: 200 });
      }

      // 1. Registrar uso do bônus (Se houver)
      if (userProfile.referred_by_code) {
        await supabase.from('referral_usages').upsert({
          user_id: userProfile.id,
          product_id: productId,
          referral_code: userProfile.referred_by_code
        }, { onConflict: 'user_id, product_id' });
      }

      // 2. Liberar a assinatura (O coração do sistema)
      const { error: subError } = await supabase.from('subscriptions').upsert({
        tenant_id: userProfile.tenant_id,
        user_id: userProfile.id,
        product_id: productId,
        status: 'active',
        asaas_customer_id: customerId,
        payment_method: payment.billingType,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, product_id' });

      if (subError) {
        console.error('❌ Erro ao atualizar tabela subscriptions:', subError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      console.log(`✅ Sucesso! Produto ${productId} liberado para ${userProfile.email}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erro Crítico Webhook:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}