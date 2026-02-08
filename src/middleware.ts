import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerFromRequest } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  // 1. Liberação imediata para o Webhook da Asaas
  if (request.nextUrl.pathname.startsWith('/api/webhooks/asaas')) {
    return NextResponse.next();
  }

  // Cria o cliente Supabase
  const { supabase, response } = await createSupabaseServerFromRequest(request);

  // Verifica autenticação
  const { data: { user } } = await supabase.auth.getUser();

  // Rotas públicas (AJUSTADO: Adicionado /forgot-password e /auth/reset-password)
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',      // <-- ADICIONADO AQUI
    '/auth/reset-password',  // <-- ADICIONADO PARA O FLUXO DE TROCA DE SENHA
    '/auth/callback',
    '/api/auth',
    '/api/webhooks/asaas',
    '/_next',
  ];

  // Se a rota atual começa com alguma das públicas → libera
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/')
  );

  if (isPublicPath) {
    return response || NextResponse.next();
  }

  // Se NÃO estiver logado → redireciona para login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    loginUrl.searchParams.set('error', 'unauthenticated');
    return NextResponse.redirect(loginUrl);
  }

  // Busca informações do perfil
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('tenant_id, role, is_super_admin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.tenant_id) {
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'no_tenant_profile');
    return NextResponse.redirect(errorUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-tenant-id', profile.tenant_id);
  requestHeaders.set('x-user-role', profile.role || 'user');
  requestHeaders.set('x-is-super-admin', profile.is_super_admin ? 'true' : 'false');

  const modifiedRequest = new NextRequest(request, {
    headers: requestHeaders,
  });

  return NextResponse.next({
    request: modifiedRequest,
    ...(response ? { response } : {}),
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/webhooks/asaas
     * - _next/static, _next/image, favicon.ico
     * - imagens e assets estáticos
     */
    '/((?!api/webhooks/asaas|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
};