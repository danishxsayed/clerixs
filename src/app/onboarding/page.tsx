import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from './wizard';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id, avatar_url, full_name, specialty')
    .eq('id', userData.user.id)
    .single();

  if (!profile?.default_organization_id) {
    // If they haven't been assigned an org yet, they should not be here.
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">Workspace not ready</h2>
        <p className="text-muted-foreground mt-2">Please wait until your workspace is assigned before onboarding.</p>
      </div>
    );
  }

  // Fetch the organization data
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.default_organization_id)
    .single();

  if (!org) {
    redirect('/auth/login');
  }

  // If already completed, do not allow access
  if (org.onboarding_completed) {
    redirect('/dashboard');
  }

  const initialData = {
    name: org.name || '',
    timezone: org.timezone || 'Asia/Kolkata',
    currency: org.currency || 'INR',
    avatar_url: profile.avatar_url || '',
    phone: org.phone || '',
    address: org.address || '',
    letterhead_url: org.letterhead_url || '',
    signature_url: org.signature_url || '',
    fullName: profile.full_name || '',
    specialty: profile.specialty || '',
    onboardingStep: org.onboarding_step || 1,
  };

  return (
    <OnboardingWizard 
      userId={userData.user.id} 
      initialData={initialData} 
    />
  );
}
