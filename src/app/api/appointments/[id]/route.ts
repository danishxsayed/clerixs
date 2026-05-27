import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await props.params;
  const appointmentId = resolvedParams.id;

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select('organization_id')
      .eq('profile_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'No active organization found.' }, { status: 400 });
    }

    const formData = await request.json();

    // Check for Time Slot Conflicts
    if (formData.appointment_date && formData.start_time) {
      let conflictQuery = supabase
        .from('appointments')
        .select('id')
        .eq('organization_id', membership.organization_id)
        .eq('appointment_date', formData.appointment_date)
        .eq('start_time', formData.start_time)
        .neq('status', 'cancelled')
        .neq('id', appointmentId);

      if (formData.provider_id) {
          conflictQuery = conflictQuery.eq('doctor_membership_id', formData.provider_id);
      }

      const { data: conflicts } = await conflictQuery.limit(1);

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json({ error: 'This time slot is already booked. Please select a different time.' }, { status: 400 });
      }
    }

    // Build update dataset safely (only updating fields that are sent)
    const updateData: any = {};
    if (formData.patient_id !== undefined) updateData.patient_id = formData.patient_id;
    if (formData.appointment_date !== undefined) updateData.appointment_date = formData.appointment_date;
    if (formData.start_time !== undefined) updateData.start_time = formData.start_time;
    if (formData.treatment !== undefined) updateData.chief_complaint = formData.treatment;
    if (formData.notes !== undefined) updateData.notes = formData.notes;
    if (formData.provider_id !== undefined) updateData.doctor_membership_id = formData.provider_id || null;
    if (formData.status !== undefined) updateData.status = formData.status;

    const { error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .eq('organization_id', membership.organization_id);

    if (updateError) {
      console.error('Failed to update appointment:', updateError);
      return NextResponse.json({ error: 'Database error: Could not update the appointment.' }, { status: 500 });
    }

    // QUEUE SYNC
    if (formData.status === 'completed' || formData.status === 'checked_in') {
      try {
        const { data: queueEntry } = await supabase
          .from('queue_entries')
          .select('id')
          .eq('appointment_id', appointmentId)
          .maybeSingle();

        if (queueEntry) {
          const queueStatus = formData.status === 'completed' ? 'completed' : 'waiting';
          await supabase
            .from('queue_entries')
            .update({ 
              status: queueStatus,
              completed_at: formData.status === 'completed' ? new Date().toISOString() : null
            })
            .eq('id', queueEntry.id);
        }
      } catch (err) {
        console.error('Queue Status Sync Error:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API Error in patch appointment:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await props.params;
  const appointmentId = resolvedParams.id;

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to perform this action.' }, { status: 401 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select('organization_id')
      .eq('profile_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'No active organization found for your account.' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)
      .eq('organization_id', membership.organization_id);

    if (deleteError) {
      console.error('Failed to delete appointment:', deleteError);
      return NextResponse.json({ error: 'Database error: Could not delete the appointment.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API Error in delete appointment:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
