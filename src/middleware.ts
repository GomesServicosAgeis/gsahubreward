import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerFromRequest } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  // 1. Liberação imediata para o Webhook da Asaas (Caminho corrigido sem o "s")
  if (request.nextUrl.pathname.startsWith('/api/webhook/asaas')) {
    return NextResponse.next();
  }

  const { supabase, response } = await createSupabaseServerFromRequest(request);
  const { data: { user } } = await supabase.auth.getUser();

  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/api/auth',
    '/api/webhook/asaas',
    '/api/mercadopago/create', // Ajustado aqui 
    '/_next',
  ];

  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/')
  );

  if (isPublicPath) {
    return response || NextResponse.next();
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    loginUrl.searchParams.set('error', 'unauthenticated');
    return NextResponse.redirect(loginUrl);
  }

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

  return NextResponse.next({
    request: new NextRequest(request, { headers: requestHeaders }),
    ...(response ? { response } : {}),
  });
}

export const config = {
  matcher: [
    // O matcher deve ignorar o caminho do webhook para não disparar o middleware nele
    '/((?!api/webhook/asaas|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
};