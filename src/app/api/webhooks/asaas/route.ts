import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.event;
    const payment = body.payment;

    console.log(`[GSA DEBUG] Evento: ${event} | Pagamento: ${payment.id} | Cliente: ${payment.customer}`);

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const supabase = await createSupabaseServer();
      
      const productId = payment.externalReference; 
      const asaasCustomerId = payment.customer;

      // BUSCA REFORÇADA: Tentamos achar o usuário de 3 formas
      // 1. Pelo E-mail enviado na cobrança
      // 2. Pelo CPF enviado na cobrança
      // 3. Pelo ID de cliente do Asaas (caso já tenhamos salvo antes)
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, tenant_id, referred_by_code, email')
        .or(`email.eq.${payment.email || 'null'},cpf_cnpj.eq.${payment.cpfCnpj || 'null'}`)
        .maybeSingle();

      if (!userProfile) {
        console.error('❌ [GSA ERROR] Usuário não identificado. Dados recebidos:', {
          email: payment.email,
          cpfCnpj: payment.cpfCnpj,
          customer: asaasCustomerId
        });
        return NextResponse.json({ success: true, message: 'User not found' }, { status: 200 });
      }

      // 1. Registrar uso do bônus
      if (userProfile.referred_by_code) {
        await supabase.from('referral_usages').upsert({
          user_id: userProfile.id,
          product_id: productId,
          referral_code: userProfile.referred_by_code
        }, { onConflict: 'user_id, product_id' });
      }

      // 2. Ativar Assinatura
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
        console.error('❌ [GSA DB ERROR]:', subError.message);
        return NextResponse.json({ error: 'DB Error' }, { status: 200 });
      }

      console.log(`🚀 [GSA SUCCESS] Licença ATIVA para ${userProfile.email}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [GSA CRITICAL]:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}