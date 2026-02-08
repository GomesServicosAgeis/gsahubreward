import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin'; // Importante: use o service_role para tabelas protegidas

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, payment } = body;

    console.log(`[GSA Webhook] Evento: ${event} | Cliente: ${payment.customer}`);

    // Só processamos pagamentos confirmados ou recebidos
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const asaasCustomerId = payment.customer;
      const amountPaid = payment.value;
      const paymentId = payment.id;
      
      // O productId deve vir no externalReference para sabermos qual sistema creditar
      const productId = payment.externalReference; 

      // 1. Localizar o Tenant pelo ID da Asaas
      const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .select('id, name, referrer_id')
        .eq('asaas_customer_id', asaasCustomerId)
        .single();

      if (tenantError || !tenant) {
        console.error(`❌ Tenant não encontrado para o ID Asaas: ${asaasCustomerId}`);
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }

      // 2. Chamar a Função SQL de Processamento de Pagamento (RPC)
      // Esta função faz 3 coisas: 
      // - Ativa a assinatura do cliente
      // - Gera o código de indicação dele
      // - Credita 20% ao padrinho (se houver)
      const { data: result, error: rpcError } = await supabaseAdmin.rpc('process_first_payment', {
        p_tenant_id: tenant.id,
        p_product_id: productId,
        p_invoice_id: null, // Opcional se estiver usando a tabela de faturas
        p_amount_paid: amountPaid
      });

      if (rpcError) {
        console.error('❌ Erro ao processar bônus no RPC:', rpcError);
        // Não travamos o 200 para a Asaas não ficar reenviando, mas logamos o erro
      }

      console.log(`✅ Pagamento Processado: ${tenant.name} | Produto: ${productId}`);
      if (result?.was_referred) {
        console.log(`💰 Padrinho creditado com R$ ${result.referrer_credited_value}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erro Crítico Webhook:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}