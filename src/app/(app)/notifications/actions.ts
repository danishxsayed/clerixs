'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getRecentNotifications() {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized', data: null };
  }

  // 2. We don't necessarily need to fetch the membership ID first because RLS takes care of returning
  // only the notifications belonging to the user's active organization(s). However, for explicit
  // fetching, it can be cleaner to grab the Org ID. Relying on RLS here is faster.

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Failed to fetch notifications:', error);
    return { error: 'Database error', data: null };
  }

  return { success: true, data: notifications || [] };
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Failed to mark notification read:', error);
    return { error: 'Database error' };
  }

  // Depending on layout, we might just want to revalidate the layout/topbar, but Next.js
  // doesn't have a targeted layout revalidate, so we rely on client-side router refreshes or global revalidatePath.
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  
  // To avoid updating every single tenant's notifications (though RLS prevents it),
  // we strictly query for unread notifications accessible to this user and update them.
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) {
    console.error('Failed to mark all as read:', error);
    return { error: 'Database error' };
  }

  return { success: true };
}

/**
 * Internal Utility Function - Not exposed to Client directly.
 * Used by other Server Actions (like Create Appointment) to rapidly queue an alert.
 */
export async function createSystemNotification({
  organization_id,
  profile_id = null,
  title,
  message,
  type = 'system',
  link_url = null
}: {
  organization_id: string;
  profile_id?: string | null;
  title: string;
  message: string;
  type?: 'appointment' | 'billing' | 'system';
  link_url?: string | null;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .insert({
      organization_id,
      profile_id,
      title,
      message,
      type,
      link_url
    });

  if (error) {
    console.error('Failed to dispatch internal notification:', error);
    // Silent fail so we don't break the main action (like invoice creation) just because the alert failed.
  }
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Failed to delete notification:', error);
    return { error: 'Database error' };
  }
  return { success: true };
}

export async function deleteAllNotifications() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Get active organization
  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) return { error: 'No active organization found' };
  
  // Explicitly delete all notifications for this organization
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('organization_id', membership.organization_id);

  if (error) {
    console.error('Failed to clear notifications:', error);
    return { error: 'Database error' };
  }
  return { success: true };
}
