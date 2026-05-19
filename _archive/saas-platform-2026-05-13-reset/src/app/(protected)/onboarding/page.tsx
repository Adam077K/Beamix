import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingClient } from '@/components/onboarding/OnboardingClient';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profileRes = await supabase
    .from('user_profiles')
    .select('id, onboarding_completed_at, full_name')
    .eq('id', user.id)
    .maybeSingle();
  const profile = profileRes.data as { id: string; onboarding_completed_at: string | null; full_name: string | null } | null;

  if (profile?.onboarding_completed_at) redirect('/home');

  const businessRes = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .maybeSingle();
  const existingBusiness = businessRes.data as Parameters<typeof OnboardingClient>[0]['existingBusiness'];

  return (
    <OnboardingClient userId={user.id} existingBusiness={existingBusiness} />
  );
}
