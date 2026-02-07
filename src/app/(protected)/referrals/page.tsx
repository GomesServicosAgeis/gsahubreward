// src/app/(protected)/referrals/page.tsx
import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ReferralsClient from './ReferralsClient';

export default async function ReferralsPage() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id, name')
    .eq('id', user.id)
    .single();

  if (!profile?.tenant_id) {
    redirect('/login');
  }

  const { data: referralCodes } = await supabase
    .from('v_my_referral_codes')
    .select('*');

  const { data: referralsList } = await supabase
    .from('v_my_referrals')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: dashboardData } = await supabase
    .from('v_my_dashboard')
    .select('total_indicacoes_ativas')
    .single();

  const levels = [
    { name: 'Bronze', slug: 'bronze', min: 0, max: 4, icon: '🥉' },
    { name: 'Prata', slug: 'silver', min: 5, max: 9, icon: '🥈' },
    { name: 'Ouro', slug: 'gold', min: 10, max: 19, icon: '🥇' },
    { name: 'Diamante', slug: 'diamond', min: 20, max: 49, icon: '💎' },
    { name: 'Embaixador', slug: 'ambassador', min: 50, max: null, icon: '👑' },
  ];

  const activeIndications = dashboardData?.total_indicacoes_ativas || 0;
  const currentLevel = levels.find(l => activeIndications >= l.min && (l.max === null || activeIndications <= (l.max ?? Infinity))) || levels[0];
  const nextLevel = levels.find(l => l.min > activeIndications);
  const progress = nextLevel ? Math.min(100, ((activeIndications - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100) : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0033] to-[#0f0c1a] text-[#E2E8F0]">
      <ReferralsClient
        referralCodes={referralCodes || []}
        referralsList={referralsList || []}
        currentLevel={currentLevel}
        nextLevel={nextLevel}
        progress={progress}
        activeIndications={activeIndications}
        userEmail={user.email}
      />
    </div>
  );
}