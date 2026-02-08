import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.event;
    const payment = body.payment;

    // Filtramos apenas os eventos de confirmação de dinheiro no bolso
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const supabase = await createSupabaseServer();
      
      // O 'externalReference' é a chave mestre: ele contém o ID do produto que enviamos no checkout
      const productId = payment.externalReference; 
      const customerId = payment.customer;

      // 1. Localizamos o usuário no nosso banco usando o customerId do Asaas ou Email
      // É importante que você tenha salvo o asaas_customer_id no perfil do usuário antes
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, referred_by_code, tenant_id')
        .eq('email', payment.additionalInfo || '') // Fallback caso não tenha o ID ainda
        .single();

      if (userError || !userProfile) {
        console.error('❌ Usuário não encontrado para este pagamento:', payment.id);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // 2. REGISTRO DE USO DO BÔNUS (Lógica de Uso Único)
      // Se o usuário tinha um código de indicação no perfil, marcamos como usado para este produto
      if (userProfile.referred_by_code) {
        await supabase.from('referral_usages').upsert({
          user_id: userProfile.id,
          product_id: productId,
          referral_code: userProfile.referred_by_code,
          used_at: new Date().toISOString()
        }, { onConflict: 'user_id, product_id' });
      }

      // 3. LIBERAÇÃO DE ACESSO (Assinatura)
      // Criamos ou atualizamos a licença do usuário para 'active'
      const { error: subError } = await supabase.from('subscriptions').upsert({
        tenant_id: userProfile.tenant_id,
        user_id: userProfile.id,
        product_id: productId,
        status: 'active',
        asaas_customer_id: customerId,
        payment_method: payment.billingType,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // +30 dias
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, product_id' });

      if (subError) throw subError;

      console.log(`✅ Sucesso: Produto ${productId} liberado para o usuário ${userProfile.id}`);
    }

    // O Asaas precisa receber um 200 OK rápido para não ficar tentando reenviar
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erro no Processamento do Webhook:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}