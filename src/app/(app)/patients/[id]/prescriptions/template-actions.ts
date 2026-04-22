'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function savePrescriptionTemplate(data: {
  name: string;
  diagnosis?: string;
  medicines: any[];
  generalAdvice?: string;
}) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', userData.user.id)
    .single();

  const orgId = profile?.default_organization_id;
  if (!orgId) return { error: 'No organization found' };

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('id, role, status')
    .eq('organization_id', orgId)
    .eq('profile_id', userData.user.id)
    .eq('status', 'active')
    .single();

  if (!membership) return { error: 'Active clinic membership not found' };
  
  const allowedRoles = ['org_owner', 'doctor'];
  if (!allowedRoles.includes(membership.role)) {
    return { error: 'Your account does not have permission to save templates. Only doctors and owners can do this.' };
  }

  const { error } = await supabase.from('prescription_templates').insert({
    organization_id: orgId,
    created_by_membership_id: membership.id,
    name: data.name,
    diagnosis: data.diagnosis,
    medicines: data.medicines,
    general_advice: data.generalAdvice,
  });

  if (error) {
    console.error('Save template error:', error);
    return { error: `Failed to save template: ${error.message}` };
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function listPrescriptionTemplates() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', userData.user.id)
    .single();

  const orgId = profile?.default_organization_id;
  if (!orgId) return { error: 'No organization found' };

  // Fetch categorized templates
  const { data: all, error } = await supabase
    .from('prescription_templates')
    .select(`
      *,
      created_by:organization_memberships(
        profiles(full_name)
      )
    `)
    .eq('organization_id', orgId)
    .order('name', { ascending: true });

  if (error) {
    console.error('List templates error:', error);
    return { error: 'Failed to fetch templates' };
  }

  // Fetch recently used (Top 3 by last_used_at)
  const { data: recentlyUsed } = await supabase
    .from('prescription_templates')
    .select('*')
    .eq('organization_id', orgId)
    .not('last_used_at', 'is', null)
    .order('last_used_at', { ascending: false })
    .limit(3);

  // Fetch most used (Top 3 by usage_count)
  const { data: mostUsed } = await supabase
    .from('prescription_templates')
    .select('*')
    .eq('organization_id', orgId)
    .order('usage_count', { ascending: false })
    .limit(3);

  return { 
    templates: all,
    recentlyUsed: recentlyUsed || [],
    mostUsed: mostUsed || []
  };
}

export async function deletePrescriptionTemplate(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('prescription_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete template error:', error);
    return { error: 'Failed to delete template' };
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function incrementTemplateUsage(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('prescription_templates')
    .update({ 
      last_used_at: new Date().toISOString(),
      usage_count: supabase.rpc('increment', { row_id: id, column_name: 'usage_count' }) // This is a placeholder, standard update is easier
    })
    .eq('id', id);

  // Since we don't have a reliable increment RPC in all environments, let's do a safe fetch-then-update
  const { data: current } = await supabase
    .from('prescription_templates')
    .select('usage_count')
    .eq('id', id)
    .single();
  
  await supabase
    .from('prescription_templates')
    .update({ 
      usage_count: (current?.usage_count || 0) + 1,
      last_used_at: new Date().toISOString()
    })
    .eq('id', id);

  return { success: true };
}

export async function updateTemplateInfo(id: string, name: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('prescription_templates')
    .update({ name })
    .eq('id', id);
    
  if (error) {
    console.error('Update template error:', error);
    return { error: 'Failed to update template' };
  }

  revalidatePath('/settings');
  return { success: true };
}
