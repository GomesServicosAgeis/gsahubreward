import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { productId, productName, productPrice } = await req.json();
    const supabase = await createSupabaseServer();
    
    // 1. Pega os dados do usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    // 2. Busca o CPF/CNPJ e Nome do nosso banco (tabela users)
    const { data: profile } = await supabase
      .from('users')
      .select('name, email, cpf_cnpj')
      .eq('id', user.id)
      .single();

    if (!profile?.cpf_cnpj) {
      return NextResponse.json({ error: 'CPF/CNPJ não encontrado no perfil.' }, { status: 400 });
    }

    // 3. Criar ou Buscar Cliente no Asaas
    // Primeiro, tentamos buscar pelo CPF/CNPJ para não duplicar
    const customerListResponse = await fetch(`${process.env.ASAAS_API_URL}/customers?cpfCnpj=${profile.cpf_cnpj}`, {
      headers: { 'access_token': process.env.ASAAS_API_KEY || '' }
    });
    const customerListData = await customerListResponse.json();
    
    let asaasCustomerId;

    if (customerListData.data.length > 0) {
      asaasCustomerId = customerListData.data[0].id;
    } else {
      // Se não existe, cria um novo
      const newCustomerResponse = await fetch(`${process.env.ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': process.env.ASAAS_API_KEY || ''
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          cpfCnpj: profile.cpf_cnpj,
          notificationDisabled: false,
        }),
      });
      const newCustomer = await newCustomerResponse.json();
      asaasCustomerId = newCustomer.id;
    }

    // 4. Criar a Cobrança (Assinatura ou Pagamento Único)
    // Aqui estamos criando uma cobrança via PIX/Cartão/Boleto
    const paymentResponse = await fetch(`${process.env.ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ASAAS_API_KEY || ''
      },
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: 'UNDEFINED', // Deixa o cliente escolher no checkout do Asaas
        value: productPrice,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0], // 3 dias para pagar
        description: `Assinatura ${productName} - GSA Hub`,
        externalReference: productId,
      }),
    });

    const paymentData = await paymentResponse.json();

    if (paymentData.invoiceUrl) {
      return NextResponse.json({ checkoutUrl: paymentData.invoiceUrl });
    } else {
      throw new Error('Erro ao gerar link de pagamento no Asaas');
    }

  } catch (error: any) {
    console.error('Erro Checkout Asaas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}