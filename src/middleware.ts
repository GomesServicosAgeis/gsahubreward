import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerFromRequest } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  // 1. Liberação imediata para o Webhook da Asaas
  // Isso evita que o Supabase tente verificar sessão em uma chamada externa
  if (request.nextUrl.pathname.startsWith('/api/webhooks/asaas')) {
    return NextResponse.next();
  }

  // Cria o cliente Supabase com suporte a cookies do request
  const { supabase, response } = await createSupabaseServerFromRequest(request);

  // Verifica se o usuário está autenticado
  const { data: { user } } = await supabase.auth.getUser();

  // Rotas públicas (não precisam de autenticação)
  const publicPaths = [
    '/login',
    '/register',
    '/auth/callback',
    '/api/auth',           // se tiver rotas API públicas
    '/api/webhooks/asaas', // redundância de segurança
    '/_next',              // arquivos estáticos do Next
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

  // Busca informações do perfil (tenant_id, role, super admin)
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('tenant_id, role, is_super_admin')
    .eq('id', user.id)
    .single();

  // Se não encontrar o perfil ou der erro → logout ou redireciona
  if (profileError || !profile?.tenant_id) {
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'no_tenant_profile');
    return NextResponse.redirect(errorUrl);
  }

  // Injeta informações úteis via headers customizados
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-tenant-id', profile.tenant_id);
  requestHeaders.set('x-user-role', profile.role || 'user');
  requestHeaders.set('x-is-super-admin', profile.is_super_admin ? 'true' : 'false');

  // Cria uma nova request com os headers adicionados
  const modifiedRequest = new NextRequest(request, {
    headers: requestHeaders,
  });

  // Retorna a resposta com a request modificada
  return NextResponse.next({
    request: modifiedRequest,
    ...(response ? { response } : {}),
  });
}

// Configuração: quais rotas o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/webhooks/asaas (Sua rota de webhook)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/webhooks/asaas|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
};