import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingClient } from '@/components/onboarding/OnboardingClient';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, onboarding_completed_at, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.onboarding_completed_at) redirect('/home');

  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_primary', true)
    .maybeSingle();

  return (
    <OnboardingClient userId={user.id} existingBusiness={existingBusiness} />
  );
}
