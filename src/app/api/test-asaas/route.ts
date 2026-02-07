import { NextResponse } from 'next/server';
import { testAsaasIntegration } from '@/lib/asaas-test';

export async function GET() {
  try {
    const result = await testAsaasIntegration();
    
    if (result.success) {
      return NextResponse.json({
        message: "Teste concluído com sucesso!",
        data: result
      });
    } else {
      return NextResponse.json({
        message: "O teste falhou.",
        error: result.error
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      message: "Erro interno no servidor",
      error: error.message
    }, { status: 500 });
  }
}