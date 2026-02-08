// src/app/api/webhooks/asaas/route.ts
import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.event;
    const payment = body.payment;

    console.log(`[ASAAS WEBHOOK] Evento recebido: ${event} para o pagamento: ${payment.id}`);

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const supabase = await createSupabaseServer();
      
      const productId = payment.externalReference; 
      const asaasCustomerId = payment.customer;

      // BUSCA MULTICRITÉRIO: Tenta localizar o usuário de todas as formas possíveis
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, tenant_id, referred_by_code, email')
        .or(`email.eq.${payment.email || 'null'},cpf_cnpj.eq.${payment.cpfCnpj || 'null'}`)
        .maybeSingle();

      if (userError || !userProfile) {
        console.error('❌ [WEBHOOK ERROR] Usuário não localizado para os dados fornecidos pelo Asaas.');
        // Retornamos 200 para evitar que o Asaas fique tentando reenviar um erro sem solução automática
        return NextResponse.json({ error: 'User not found' }, { status: 200 });
      }

      console.log(`✅ Usuário identificado: ${userProfile.email} (ID: ${userProfile.id})`);

      // 1. Registro de uso do bônus de indicação
      if (userProfile.referred_by_code) {
        await supabase.from('referral_usages').upsert({
          user_id: userProfile.id,
          product_id: productId,
          referral_code: userProfile.referred_by_code
        }, { onConflict: 'user_id, product_id' });
      }

      // 2. Ativação da assinatura/licença
      const { error: subError } = await supabase.from('subscriptions').upsert({
        tenant_id: userProfile.tenant_id,
        user_id: userProfile.id,
        product_id: productId,
        status: 'active',
        asaas_customer_id: asaasCustomerId,
        payment_method: payment.billingType,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, product_id' });

      if (subError) {
        console.error('❌ [DATABASE ERROR] Falha ao atualizar assinaturas:', subError.message);
        throw subError;
      }

      console.log(`🚀 [SUCCESS] Licença liberada com sucesso para o produto: ${productId}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [CRITICAL ERROR] Webhook falhou:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}