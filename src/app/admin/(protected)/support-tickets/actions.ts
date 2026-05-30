'use server';

import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Update the status of a support ticket
 */
export async function updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') {
  try {
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from('support_tickets')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', ticketId);

    if (error) {
      console.error('[Admin Tickets] Failed to update status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/support-tickets');
    return { success: true };

  } catch (err: any) {
    console.error('[Admin Tickets] Status update exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send an email reply to a support ticket and update status
 */
export async function sendTicketReply(ticketId: string, replyMessage: string) {
  try {
    if (!replyMessage || replyMessage.trim().length < 5) {
      return { success: false, error: 'Reply message is too short.' };
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch ticket details to address the email
    const { data: ticket, error: fetchError } = await supabaseAdmin
      .from('support_tickets')
      .select('name, email, subject, ticket_number, status')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) {
      console.error('[Admin Tickets] Failed to fetch ticket for reply:', fetchError);
      return { success: false, error: 'Ticket details not found.' };
    }

    // 2. Format the response HTML body
    const replyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: white; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
          <h2 style="color: #2563eb; margin: 0; font-size: 22px; font-weight: 800;">Clerixs Support</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Ticket Reference: #${ticket.ticket_number}</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Hi ${ticket.name},
        </p>
        
        <div style="font-size: 14px; line-height: 1.6; color: #1e293b; background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin: 20px 0; white-space: pre-wrap; font-weight: 500;">${replyMessage}</div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          If you have any further questions or require additional support, please respond directly to this email chain. We are always happy to help.
        </p>
        
        <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 500;">
            Best regards,<br />
            <strong>Support Team Clerixs</strong>
          </p>
          <p style="color: #94a3b8; font-size: 11px; margin: 6px 0 0 0;">
            support@clerixs.com • app.clerixs.com
          </p>
        </div>
      </div>
    `;

    // 3. Send email reply using Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Clerixs Support <support@clerixs.com>',
      to: [ticket.email],
      subject: `Re: We received your message — Clerixs Support #${ticket.ticket_number}`,
      html: replyHtml,
    });

    if (emailError) {
      console.error('[Admin Tickets] Resend reply delivery failed:', emailError);
      return { success: false, error: 'Failed to send reply email via Resend.' };
    }

    // 4. Automatically update the ticket status to 'in_progress' if it is currently 'open'
    const newStatus = ticket.status === 'open' ? 'in_progress' : ticket.status;

    const { error: updateError } = await supabaseAdmin
      .from('support_tickets')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (updateError) {
      console.error('[Admin Tickets] Failed to update status after reply:', updateError);
      // We don't fail the action if email sent but DB update failed
    }

    revalidatePath('/admin/support-tickets');
    return { success: true };

  } catch (err: any) {
    console.error('[Admin Tickets] Reply exception:', err);
    return { success: false, error: err.message };
  }
}
