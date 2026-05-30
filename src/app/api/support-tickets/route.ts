import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Parse standard fields
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string || null;
    const clinicName = formData.get('clinicName') as string || null;
    const category = formData.get('category') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const priority = formData.get('priority') as string || 'Normal';

    // Parse category-dependent fields
    const pageUrl = formData.get('pageUrl') as string || null;
    const stepsToReproduce = formData.get('stepsToReproduce') as string || null;
    const branchesCount = formData.get('branchesCount') as string || null;
    const patientVolume = formData.get('patientVolume') as string || null;

    // Parse attachment file if present
    const attachment = formData.get('attachment') as File | null;

    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: 'Required fields are missing.' },
        { status: 400 }
      );
    }

    // Generate random 6-digit ticket number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const ticketNumber = `${randomNum}`;

    // Initialize Supabase Admin Client
    const supabaseAdmin = createAdminClient();

    let attachmentUrl = null;
    let fileBuffer: Buffer | null = null;

    // Upload attachment to Supabase Storage if present
    if (attachment) {
      const arrayBuffer = await attachment.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      // Generate unique name
      const fileExtension = attachment.name.split('.').pop() || 'png';
      const fileName = `${ticketNumber}-${crypto.randomUUID()}.${fileExtension}`;

      // Upload to ticket-attachments bucket
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('ticket-attachments')
        .upload(fileName, fileBuffer, {
          contentType: attachment.type,
          duplex: 'half',
        });

      if (uploadError) {
        console.error('[Support Tickets] Storage upload failed:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload attachment. Please try again.' },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('ticket-attachments')
        .getPublicUrl(fileName);

      attachmentUrl = urlData.publicUrl;
    }

    // Insert ticket details into support_tickets table
    const { error: dbError } = await supabaseAdmin.from('support_tickets').insert({
      ticket_number: ticketNumber,
      name,
      email,
      phone,
      clinic_name: clinicName,
      category,
      subject,
      message,
      priority,
      page_url: pageUrl,
      steps_to_reproduce: stepsToReproduce,
      branches_count: branchesCount,
      patient_volume: patientVolume,
      attachment_url: attachmentUrl,
      status: 'open',
    });

    if (dbError) {
      console.error('[Support Tickets] Database insertion failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to save ticket in database. Please try again.' },
        { status: 500 }
      );
    }

    // Determine email subjects and flows
    const isSalesFlow = category === 'Sales Inquiry' || category === 'Enterprise / Branches';
    const emailPrefix = isSalesFlow ? '[SALES]' : '[SUPPORT]';
    const identifier = clinicName ? clinicName : name;
    
    let emailSubject = `${emailPrefix} ${category} — ${identifier}`;
    if (priority === 'Critical' && !isSalesFlow) {
      emailSubject = `🚨 CRITICAL: ${emailSubject}`;
    }

    // Prepare attachment for Resend
    const resendAttachments = [];
    if (attachment && fileBuffer) {
      resendAttachments.push({
        filename: attachment.name,
        content: fileBuffer,
      });
    }

    // Email notification content to clerixsofficial@gmail.com
    const adminEmailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 800; tracking-tight">🎫 New Ticket #${ticketNumber}</h1>
          <p style="color: #bfdbfe; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Category: ${category}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 700; color: #64748b; width: 40%;">Name</td>
            <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Email</td>
            <td style="padding: 10px 0; font-weight: 600; color: #0f172a;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
          </tr>
          ${phone ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Phone</td>
            <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${phone}</td>
          </tr>
          ` : ''}
          ${clinicName ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Clinic Name</td>
            <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${clinicName}</td>
          </tr>
          ` : ''}
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Priority</td>
            <td style="padding: 10px 0;">
              <span style="font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 9999px; ${
                priority === 'Critical'
                  ? 'background-color: #fef2f2; color: #dc2626; border: 1px solid #fca5a5;'
                  : priority === 'Urgent'
                  ? 'background-color: #fffbeb; color: #d97706; border: 1px solid #fde68a;'
                  : 'background-color: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd;'
              }">${priority}</span>
            </td>
          </tr>
          
          ${category === 'Bug Report' && pageUrl ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Bug Location (Page)</td>
            <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${pageUrl}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 700; color: #64748b; vertical-align: top;">Steps to Reproduce</td>
            <td style="padding: 10px 0; font-weight: 500; color: #334155; line-height: 1.5;">${stepsToReproduce || 'None'}</td>
          </tr>
          ` : ''}

          ${isSalesFlow && branchesCount ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Clinic Branches</td>
            <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${branchesCount}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Monthly Patient Volume</td>
            <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${patientVolume}</td>
          </tr>
          ` : ''}
          
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Subject</td>
            <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${subject}</td>
          </tr>
        </table>
        
        <div style="background-color: white; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; tracking-wider">Message Description</h4>
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${message}</p>
        </div>

        ${attachmentUrl ? `
        <div style="margin-bottom: 24px; padding: 12px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
          <a href="${attachmentUrl}" target="_blank" style="font-size: 12px; font-weight: 700; color: #2563eb; text-decoration: none;">📎 View Attached Document / Screenshot</a>
        </div>
        ` : ''}
        
        <p style="color: #94a3b8; font-size: 11px; margin: 0; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; font-weight: 500;">
          This ticket was logged via the Clerixs Portal. You can manage and reply to this ticket directly from the Admin Panel.
        </p>
      </div>
    `;

    // 1. Send email to clerixsofficial@gmail.com
    const { error: adminEmailError } = await resend.emails.send({
      from: 'Clerixs Support <noreply@clerixs.com>',
      to: ['clerixsofficial@gmail.com'],
      subject: emailSubject,
      html: adminEmailHtml,
      attachments: resendAttachments,
    });

    if (adminEmailError) {
      console.error('[Support Tickets] Resend notification failed:', adminEmailError);
      return NextResponse.json(
        { error: 'Failed to send notification email. Please try again.' },
        { status: 500 }
      );
    }

    // Auto-reply HTML body to the person who submitted
    const autoReplyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: white; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2563eb; margin: 0; font-size: 22px; font-weight: 800;">Clerixs Support</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Ticket Reference: #${ticketNumber}</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Hi ${name},
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Thank you for contacting Clerixs. We have successfully received your <strong>${category}</strong> request regarding <em>"${subject}"</em>.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Our dedicated clinical and operations team is currently reviewing your ticket. We typically respond within <strong>2-4 hours</strong> during standard business hours (9:00 AM – 6:00 PM IST, Monday to Saturday).
        </p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9; margin: 24px 0; font-size: 13px;">
          <h4 style="margin: 0 0 8px 0; color: #475569; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Submitted Summary</h4>
          <ul style="margin: 0; padding-left: 18px; color: #475569; line-height: 1.6;">
            <li><strong>Ticket #</strong>: ${ticketNumber}</li>
            <li><strong>Category</strong>: ${category}</li>
            <li><strong>Subject</strong>: ${subject}</li>
          </ul>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          If you have any extra details or screenshots to add, please reply directly to this email or contact us at <a href="mailto:support@clerixs.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">support@clerixs.com</a>.
        </p>
        
        <p style="color: #64748b; font-size: 13px; margin: 32px 0 0 0; border-top: 1px solid #e2e8f0; padding-top: 16px; font-weight: 500;">
          Best regards,<br />
          <strong>Team Clerixs</strong>
        </p>
      </div>
    `;

    // 2. Send auto-reply to user
    const { error: autoReplyError } = await resend.emails.send({
      from: 'Clerixs Support <noreply@clerixs.com>',
      to: [email],
      subject: `We received your message — Clerixs Support #${ticketNumber}`,
      html: autoReplyHtml,
    });

    if (autoReplyError) {
      console.warn('[Support Tickets] Auto-reply email failed to send:', autoReplyError);
      // We don't fail the request if the auto-reply failed but the ticket is logged & admin notified
    }

    return NextResponse.json({ success: true, ticketNumber });

  } catch (error) {
    console.error('[Support Tickets] Submission failed:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
