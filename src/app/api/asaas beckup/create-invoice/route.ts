// src/app/api/asaas/create-invoice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, description = 'Créditos GSA Hub', customerId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }

    // Configuração da API baseada no ambiente
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.asaas.com/api/v3'
      : 'https://sandbox.asaas.com/api/v3';

    const paymentData = {
      value: amount,
      description,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customer: customerId || 'cus_000005078789',
      billingType: 'PIX',
    };

    console.log('Criando cobrança Asaas:', paymentData);

    const response = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro Asaas:', response.status, errorData);
      throw new Error(`Erro na API Asaas: ${response.status} - ${errorData}`);
    }

    const invoice = await response.json();
    console.log('Invoice criada com sucesso:', invoice);

    // Salva no Supabase
    const { error: dbError } = await supabase
      .from('asaas_invoices')
      .insert({
        user_id: user.id,
        asaas_id: invoice.id,
        amount,
        status: invoice.status,
        description,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      // Continua mesmo com erro no banco, pois a cobrança foi criada
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        pixCopyPaste: invoice.pix?.copyPaste || null,
        qrCodeBase64: invoice.pix?.encodedImage || null,
        status: invoice.status,
        netValue: invoice.netValue,
      },
    });

  } catch (error: any) {
    console.error('Erro ao criar cobrança:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}