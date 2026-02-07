import { createBrowserClient } from '@supabase/ssr';

// Exportamos como 'supabase' para ser simples e direto
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);