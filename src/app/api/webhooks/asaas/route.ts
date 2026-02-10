// src/app/api/webhook/asaas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  console.log('Webhook Asaas chamado! Hora:', new Date().toISOString());

  try {
    const headersList = headers();
    const receivedToken = headersList.get('asaas-access-token');
    console.log('Token recebido:', receivedToken);

    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
    console.log('Token esperado (do env):', expectedToken);

    if (!receivedToken || receivedToken !== expectedToken) {
      console.error('Token inválido ou ausente');
      // Para teste, comente essa linha temporariamente
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      console.log('Token OK!');
    }

    let body;
    try {
      body = await request.json();
      console.log('Body recebido:', JSON.stringify(body, null, 2));
    } catch (jsonErr) {
      console.error('Erro ao parsear JSON:', jsonErr);
      body = {};
    }

    const event = body.event;
    const payment = body.payment;

    console.log('Evento:', event);
    console.log('Payment ID:', payment?.id);

    if (!payment || !payment.id) {
      console.warn('Webhook sem payment ID');
      return NextResponse.json({ received: true });
    }

    const supabase = await createSupabaseServer();

    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      console.log('Pagamento confirmado/recebido! Processando...');

      const { data: invoice, error: fetchError } = await supabase
        .from('asaas_invoices')
        .select('user_id, amount, status')
        .eq('asaas_id', payment.id)
        .single();

      if (fetchError || !invoice) {
        console.error('Cobrança não encontrada:', payment.id, fetchError);
        return NextResponse.json({ received: true });
      }

      console.log('Cobrança encontrada:', invoice);

      if (invoice.status === 'PAID') {
        console.log('Já pago anteriormente');
        return NextResponse.json({ received: true });
      }

      const creditToAdd = payment.netValue || payment.value;
      console.log('Valor a creditar:', creditToAdd);

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
        console.error('Erro ao atualizar créditos:', updateError);
      } else {
        console.log(`Créditos atualizados! Novo saldo: R$ ${newCredits}`);
      }

      await supabase
        .from('asaas_invoices')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString(),
          net_value: payment.netValue,
        })
        .eq('asaas_id', payment.id);
    } else {
      console.log('Evento não tratado:', event);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Erro grave no webhook:', err);
    return NextResponse.json({ received: true });
  }
}