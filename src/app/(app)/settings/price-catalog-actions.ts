'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Reusable user org fetcher for security checks
async function verifyUserAndOrg(supabase: any) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('Not authenticated');

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', userData.user.id)
    .eq('status', 'active')
    .single();

  if (!membership?.organization_id) {
     throw new Error('No active organization found.');
  }

  return { userId: userData.user.id, orgId: membership.organization_id };
}

export async function getCatalogItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('price_catalog')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching catalog items:', error);
    return { error: 'Failed to fetch catalog items', items: [] };
  }

  return { items: data || [] };
}

export async function addCatalogItem(data: {
  name: string;
  category: string;
  price: number;
  duration_minutes?: number | null;
  notes?: string;
}) {
  const supabase = await createClient();
  try {
    const { orgId } = await verifyUserAndOrg(supabase);

    const { data: newItem, error } = await supabase
      .from('price_catalog')
      .insert({
        organization_id: orgId,
        name: data.name,
        category: data.category,
        price: data.price,
        duration_minutes: data.duration_minutes || null,
        notes: data.notes || null,
        is_active: true,
      })
      .select()
      .single();

     if (error) throw error;
    
    return { success: true, item: newItem };
  } catch (error: any) {
    console.error('Error adding catalog item:', error);
    return { error: error.message || 'Failed to add item' };
  }
}

export async function updateCatalogItem(id: string, data: {
  name?: string;
  category?: string;
  price?: number;
  duration_minutes?: number | null;
  notes?: string;
  is_active?: boolean;
}) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('price_catalog')
      .update(data)
      .eq('id', id);

    if (error) throw error;

    const { data: updatedItem } = await supabase
      .from('price_catalog')
      .select('*')
      .eq('id', id)
      .single();

    return { success: true, item: updatedItem };
  } catch (error: any) {
    console.error('Error updating catalog item:', error);
    return { error: error.message || 'Failed to update item' };
  }
}

export async function deleteCatalogItem(id: string) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from('price_catalog')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting catalog item:', error);
    return { error: error.message || 'Failed to delete item' };
  }
}

export async function toggleCatalogItemStatus(id: string, is_active: boolean) {
  return updateCatalogItem(id, { is_active });
}
