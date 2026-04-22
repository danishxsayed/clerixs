import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Checks if the organization has exceeded its storage quota.
 * Throws an error if the quota is exceeded to block further data entry.
 * 
 * @param supabase The Supabase client (should have RLS access or be admin)
 * @param organizationId The organization to check
 */
export async function ensureStorageQuota(supabase: SupabaseClient, organizationId: string) {
  // 1. Get Plan and Subscription Info
  // We use maybeSingle because it's possible a trial has no record yet (handled by 5GB default)
  const { data: subscription } = await supabase
    .from('organization_subscriptions')
    .select('status, plan:subscription_plans(plan_code)')
    .eq('organization_id', organizationId)
    .maybeSingle();

  let planCode = 'basic';
  if (subscription?.plan) {
    // Handle both array and object response depending on Supabase version/config
    planCode = Array.isArray(subscription.plan) ? subscription.plan[0]?.plan_code : (subscription.plan as any)?.plan_code;
  }
  
  // Starter/Trial = 5GB, Pro = 10GB
  const limitGB = planCode === 'pro' ? 10 : 5;
  const limitBytes = limitGB * 1024 * 1024 * 1024;

  // 2. Fetch storage usage (Files + Database Text)
  // We mirror the logic from the Subscription page
  const [{ data: fileStorageData }, { data: dbStorageSize }] = await Promise.all([
    supabase
      .from('patient_files')
      .select('file_size_bytes')
      .eq('organization_id', organizationId),
    supabase.rpc('calculate_organization_data_size', { target_org_id: organizationId })
  ]);

  let fileBytes = fileStorageData?.reduce((acc, file) => acc + (Number(file.file_size_bytes) || 0), 0) || 0;
  let dbBytes = Number(dbStorageSize) || 0;

  // Robust fallback for DB size if RPC fails (consistent with Subscription Page UI)
  if (dbBytes === 0) {
    const { data: notesData } = await supabase
      .from('clinical_notes')
      .select('content')
      .eq('organization_id', organizationId);
    
    const { data: patientsData } = await supabase
      .from('patients')
      .select('id')
      .eq('organization_id', organizationId);

    const notesBytes = notesData?.reduce((acc, n) => acc + (n.content?.length || 0), 0) || 0;
    const patientsBytes = (patientsData?.length || 0) * 500; 
    dbBytes = notesBytes + patientsBytes;
  }

  const totalUsedBytes = fileBytes + dbBytes;

  if (totalUsedBytes >= limitBytes) {
    const usedGB = (totalUsedBytes / (1024 * 1024 * 1024)).toFixed(2);
    throw new Error(`STORAGE_QUOTA_EXCEEDED: Your clinic has reached its ${limitGB}GB limit (Used: ${usedGB}GB). Please upgrade your plan or delete old data to continue.`);
  }

  return { totalUsedBytes, limitBytes, limitGB };
}
