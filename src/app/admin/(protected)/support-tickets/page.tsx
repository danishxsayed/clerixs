import * as React from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { SupportTicketsClient } from './support-tickets-client';

export const dynamic = 'force-dynamic';

export default async function AdminSupportTicketsPage() {
  const supabaseAdmin = createAdminClient();

  // Fetch all tickets chronologically
  const { data: ticketsData, error } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Admin Tickets] Failed to fetch tickets from DB:', error);
  }

  const tickets = ticketsData || [];

  return (
    <SupportTicketsClient initialTickets={tickets} />
  );
}
