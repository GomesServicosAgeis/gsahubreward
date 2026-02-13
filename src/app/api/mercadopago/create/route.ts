// src/app/api/mercadopago/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto'; // nativo do Node.js

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description = 'Créditos GSA Hub', userEmail } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }

    const idempotencyKey = randomUUID(); // gera ID único para cada requisição
    console.log('[MP] Idempotency Key gerada:', idempotencyKey);

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey, // obrigatório
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description,
        payment_method_id: 'pix',
        payer: {
          email: userEmail || 'danilolg22@outlook.com',
        },
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // expira em 30 min
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[MP] Erro na API:', data);
      throw new Error(data.message || 'Erro ao criar pagamento');
    }

    console.log('[MP] Pagamento criado com sucesso:', data.id);

    return NextResponse.json({
      success: true,
      paymentId: data.id,
      qrCode: data.point_of_interaction?.transaction_data?.qr_code,
      qrBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url,
      status: data.status,
    });
  } catch (err: any) {
    console.error('[MP] Erro ao criar pagamento:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}