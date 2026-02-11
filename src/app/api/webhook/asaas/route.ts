import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin'; // Importando o admin correto
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  console.log('Webhook Asaas chamado! Hora:', new Date().toISOString());

  try {
    const headersList = headers();
    const receivedToken = headersList.get('asaas-access-token');

    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

    if (!receivedToken || receivedToken !== expectedToken) {
      console.error('Token inválido ou ausente');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
      console.log('Body recebido:', JSON.stringify(body, null, 2));
    } catch (jsonErr) {
      console.error('Erro ao parsear JSON:', jsonErr);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const event = body.event;
    const payment = body.payment;

    if (!payment || !payment.id) {
      console.warn('Webhook sem payment ID');
      return NextResponse.json({ received: true });
    }

    // Usamos o supabaseAdmin para garantir que o RLS não bloqueie o processo
    const supabase = supabaseAdmin;

    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      console.log('Pagamento confirmado/recebido! Processando...');

      // 1. Buscar a fatura
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
        console.log('Já pago anteriormente');
        return NextResponse.json({ received: true });
      }

      const creditToAdd = payment.netValue || payment.value;

      // 2. Buscar créditos atuais do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', invoice.user_id)
        .single();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const currentCredits = userData?.credits || 0;
      const newCredits = currentCredits + creditToAdd;

      // 3. Atualizar créditos do usuário
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

      // 4. Marcar fatura como paga
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}