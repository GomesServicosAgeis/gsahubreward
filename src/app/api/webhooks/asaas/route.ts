import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.event;
    const payment = body.payment;

    console.log(`[GSA DEBUG] Recebido: ${event} | Pagamento: ${payment.id}`);

    // Adicionei PAYMENT_CREATED apenas para você validar que o banco está gravando
    const eventsToProcess = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_CREATED'];

    if (eventsToProcess.includes(event)) {
      const supabase = await createSupabaseServer();
      const productId = payment.externalReference; 

      // Busca por Email ou CPF (Exatamente como estão no seu SQL da imagem 2)
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, tenant_id, referred_by_code, email')
        .or(`email.eq.${payment.email || 'null'},cpf_cnpj.eq.${payment.cpfCnpj || 'null'}`)
        .maybeSingle();

      if (!userProfile) {
        console.error('❌ [GSA WEBHOOK] Usuário não encontrado no banco para os dados do Asaas.');
        return NextResponse.json({ success: true, message: 'User not found' }, { status: 200 });
      }

      // Ativa a licença
      const { error: subError } = await supabase.from('subscriptions').upsert({
        tenant_id: userProfile.tenant_id,
        user_id: userProfile.id,
        product_id: productId,
        status: 'active',
        asaas_customer_id: payment.customer,
        payment_method: payment.billingType,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, product_id' });

      if (subError) {
        console.error('❌ [GSA DB ERROR]:', subError.message);
        return NextResponse.json({ error: 'DB Error' }, { status: 200 });
      }

      console.log(`🚀 [GSA SUCCESS] Tabela subscriptions atualizada para ${userProfile.email}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ [GSA CRITICAL]:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}