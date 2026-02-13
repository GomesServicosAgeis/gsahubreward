// src/app/api/webhook/mercadopago/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('[MP WEBHOOK] Chamado em:', new Date().toISOString());

  try {
    const body = await request.json();
    console.log('[MP WEBHOOK] Body recebido:', JSON.stringify(body, null, 2));

    const topic = body.topic || body.type;
    const paymentId = body.resource || body.data?.id;

    if (topic !== 'payment' || !paymentId) {
      console.warn('[MP WEBHOOK] Evento inválido ou sem payment ID');
      return NextResponse.json({ received: true });
    }

    // Consulta o pagamento no Mercado Pago para pegar status atual
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
    });

    const payment = await mpResponse.json();

    console.log('[MP WEBHOOK] Status do pagamento:', payment.status);

    if (payment.status === 'approved') {
      // Busca a cobrança salva no seu banco (tabela asaas_invoices ou mude para mp_invoices)
      const supabase = await createSupabaseServer();

      const { data: invoice, error: fetchError } = await supabase
        .from('asaas_invoices') // mude para 'mp_invoices' se criar tabela nova
        .select('user_id, amount, status')
        .eq('asaas_id', paymentId) // mude para 'mp_id' se criar tabela nova
        .single();

      if (fetchError || !invoice) {
        console.error('[MP WEBHOOK] Cobrança não encontrada:', paymentId, fetchError);
        return NextResponse.json({ received: true });
      }

      if (invoice.status === 'PAID') {
        console.log('[MP WEBHOOK] Já pago anteriormente');
        return NextResponse.json({ received: true });
      }

      const creditToAdd = payment.transaction_amount;

      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', invoice.user_id)
        .single();

      const currentCredits = userData?.credits || 0;
      const newCredits = currentCredits + creditToAdd;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          credits: newCredits,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoice.user_id);

      if (updateError) {
        console.error('[MP WEBHOOK] Erro ao atualizar créditos:', updateError);
      } else {
        console.log(`[MP WEBHOOK] Créditos atualizados! User ${invoice.user_id} - Novo saldo: R$ ${newCredits}`);
      }

      // Marca como pago
      await supabase
        .from('asaas_invoices') // mude para 'mp_invoices'
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString(),
          net_value: payment.transaction_details?.net_received_amount || payment.transaction_amount,
        })
        .eq('asaas_id', paymentId); // mude para 'mp_id'
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[MP WEBHOOK] Erro grave:', err);
    return NextResponse.json({ received: true });
  }
}