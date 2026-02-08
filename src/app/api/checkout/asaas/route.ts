import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { productId, productName, productPrice } = await req.json();
    
    // Ajustado para ler EXATAMENTE como está no seu .env
    const API_KEY = process.env.ASAAS_API_KEY;
    const API_URL = process.env.NEXT_PUBLIC_ASAAS_API_URL; // Aqui estava o erro

    if (!API_KEY || !API_URL) {
      console.error("❌ Erro de Configuração: Verifique as chaves no painel da Vercel.");
      return NextResponse.json({ error: 'Erro interno de configuração.' }, { status: 500 });
    }

    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 });

    const { data: profile } = await supabase
      .from('users')
      .select('name, email, cpf_cnpj')
      .eq('id', user.id)
      .single();

    if (!profile?.cpf_cnpj) {
      return NextResponse.json({ error: 'Complete seu perfil com CPF/CNPJ antes de pagar.' }, { status: 400 });
    }

    // 1. Busca ou Cria Cliente no Asaas
    const customerListResponse = await fetch(`${API_URL}/customers?cpfCnpj=${profile.cpf_cnpj}`, {
      headers: { 'access_token': API_KEY }
    });
    
    const customerListData = await customerListResponse.json();
    let asaasCustomerId;

    if (customerListData.data && customerListData.data.length > 0) {
      asaasCustomerId = customerListData.data[0].id;
    } else {
      const newCustomerResponse = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': API_KEY
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          cpfCnpj: profile.cpf_cnpj,
          notificationDisabled: true,
        }),
      });
      const newCustomer = await newCustomerResponse.json();
      asaasCustomerId = newCustomer.id;
    }

    // 2. Gera Cobrança
    const paymentResponse = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': API_KEY
      },
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: 'UNDEFINED', 
        value: productPrice,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
        description: `GSA HUB - Ativação ${productName}`,
        externalReference: productId,
      }),
    });

    const paymentData = await paymentResponse.json();

    if (paymentData.invoiceUrl) {
      return NextResponse.json({ checkoutUrl: paymentData.invoiceUrl });
    } else {
      console.error("Erro Asaas:", paymentData);
      return NextResponse.json({ error: 'Não foi possível gerar a fatura.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Erro Geral Checkout:', error);
    return NextResponse.json({ error: 'Erro na conexão com o gateway de pagamento.' }, { status: 500 });
  }
}