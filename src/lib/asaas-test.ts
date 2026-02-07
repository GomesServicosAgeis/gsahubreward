import { createSupabaseServer } from '@/lib/supabase/server';

export async function testAsaasIntegration() {
  const apiKey = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjY0NDY1OGJlLTAyOWItNDg0Ni04MmY3LTRiYzVmNDFmNGI4Yjo6JGFhY2hfN2ZjM2E1OTAtMTM2Ny00NjFhLWE3MzUtNGVlY2RmOTM2ZmQ0";
  const apiUrl = "https://sandbox.asaas.com/api/v3";
  const supabase = await createSupabaseServer();

  try {
    // 1. Pega o seu usuário atual logado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Você precisa estar logado para vincular o cliente.");

    // 2. Cria o cliente na Asaas
    const customerRes = await fetch(`${apiUrl}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': apiKey },
      body: JSON.stringify({
        name: "Danilo Teste Automação",
        email: user.email,
        cpfCnpj: "06425486171"
      })
    });

    const customer = await customerRes.json();
    if (!customerRes.ok) throw new Error("Erro Asaas: " + JSON.stringify(customer));

    // 3. ATUALIZA O SUPABASE (Vínculo automático)
    const { error: updateError } = await supabase
      .from('users')
      .update({ asaas_customer_id: customer.id })
      .eq('id', user.id);

    if (updateError) throw new Error("Erro no Supabase: " + updateError.message);

    // 4. Gera a cobrança de R$ 10,00
    const paymentRes = await fetch(`${apiUrl}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': apiKey },
      body: JSON.stringify({
        customer: customer.id,
        billingType: "PIX",
        value: 10.0,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        description: "Teste GSA Hub - Automatizado"
      })
    });

    const payment = await paymentRes.json();

    return {
      success: true,
      invoiceUrl: payment.invoiceUrl,
      msg: "ID vinculado e cobrança gerada com sucesso!"
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}