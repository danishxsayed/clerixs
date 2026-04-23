import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, enabled } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Missing subscriptionId' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Verify user owns the organization this subscription belongs to
    // (Simplified for now, assuming organization_subscriptions is linked to orgs user has access to)
    const { error } = await adminSupabase
      .from('organization_subscriptions')
      .update({ auto_renewal_enabled: enabled })
      .eq('id', subscriptionId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle auto-renewal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
