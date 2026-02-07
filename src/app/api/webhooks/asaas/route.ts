import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createSupabaseServer();

    // A Asaas envia o tipo de evento no campo 'event'
    const { event, payment } = body;

    console.log(`[Asaas Webhook] Evento recebido: ${event}`);

    // Focamos no evento de pagamento confirmado ou recebido
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const asaasCustomerId = payment.customer;
      const amount = payment.value;
      const paymentId = payment.id;

      // 1. Buscar o usuário/tenant no seu banco pelo ID do cliente Asaas
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, tenant_id, name')
        .eq('asaas_customer_id', asaasCustomerId) // Certifique-se de ter essa coluna
        .single();

      if (userError || !userProfile) {
        console.error(`❌ Usuário não encontrado para o ID Asaas: ${asaasCustomerId}`);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // 2. Registrar a entrada na história da carteira
      // Usando a lógica que você já tem para v_my_wallet
      const { error: walletError } = await supabase
        .from('referral_wallet_history')
        .insert({
          tenant_id: userProfile.tenant_id,
          amount: amount,
          type: 'received',
          description: `Pagamento recebido via Asaas - Ref: ${paymentId}`,
          metadata: { asaas_payment_id: paymentId }
        });

      if (walletError) {
        console.error('❌ Erro ao atualizar carteira:', walletError);
        throw walletError;
      }

      console.log(`✅ Saldo de R$ ${amount} liberado para ${userProfile.name}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erro no processamento do Webhook:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}