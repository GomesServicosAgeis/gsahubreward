// src/app/api/webhooks/asaas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const receivedToken = headersList.get('asaas-access-token');

    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

    if (!receivedToken || receivedToken !== expectedToken) {
      console.error('Token de webhook inválido:', receivedToken);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Webhook Asaas recebido:', JSON.stringify(body, null, 2));

    const event = body.event;
    const payment = body.payment;

    if (!payment || !payment.id) {
      console.warn('Webhook sem payment ID');
      return NextResponse.json({ received: true });
    }

    const supabase = await createSupabaseServer();

    // Eventos que indicam pagamento confirmado
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      // Busca a cobrança salva no seu banco
      const { data: invoice, error: fetchError } = await supabase
        .from('asaas_invoices')
        .select('user_id, amount, status')
        .eq('asaas_id', payment.id)
        .single();

      if (fetchError || !invoice) {
        console.error('Cobrança não encontrada:', payment.id, fetchError);
        return NextResponse.json({ received: true });
      }

      if (invoice.status === 'PAID') {
        console.log('Cobrança já marcada como paga:', payment.id);
        return NextResponse.json({ received: true });
      }

      // Valor a creditar (use netValue para valor líquido após taxas)
      const creditToAdd = payment.netValue || payment.value;

      // Busca o saldo atual do usuário (para calcular novo valor)
      const { data: userData } = await supabase
        .from('users')
        .select('credits') // ou 'saldo_disponivel' se for o nome da coluna
        .eq('id', invoice.user_id)
        .single();

      const currentCredits = userData?.credits || 0;
      const newCredits = currentCredits + creditToAdd;

      // Atualiza o saldo do usuário
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
        console.log(`Créditos adicionados para user ${invoice.user_id}: R$ ${creditToAdd} (novo total: R$ ${newCredits})`);
      }

      // Marca a cobrança como paga
      await supabase
        .from('asaas_invoices')
        .update({
          status: 'PAID',
          paid_at: new Date().toISOString(),
          net_value: payment.netValue,
        })
        .eq('asaas_id', payment.id);
    }

    // Eventos opcionais para log (não credenciar)
    else if (event === 'PAYMENT_AUTHORIZED') {
      console.log('Pagamento autorizado (aguardando confirmação):', payment.id);
    }

    // Sempre retorne 200 OK para o Asaas (exigência deles)
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Erro grave no webhook Asaas:', err);
    return NextResponse.json({ received: true }); // nunca retorne erro 5xx
  }
}