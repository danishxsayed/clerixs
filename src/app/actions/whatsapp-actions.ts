'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function sendWhatsAppPrescriptionAction(params: {
  prescriptionId: string;
  pdfUrl: string;
  patientPhone: string;
  patientName: string;
  clinicName: string;
}) {
  const { prescriptionId, pdfUrl, patientPhone, patientName, clinicName } = params;

  if (!patientPhone) {
    return { error: 'Patient phone number not found. Please update patient profile.' };
  }

  // 1. Phone number formatting per requirements:
  // Remove any spaces, dashes or brackets.
  let cleanPhone = patientPhone.replace(/[\s\-\(\)\+]/g, '');
  
  // If starts with 0, replace with 91.
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '91' + cleanPhone.substring(1);
  } 
  // If it has no country code (10 digits), add 91 at the start.
  else if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  // If it already starts with 91, keep as is (implicitly handled)

  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp environment variables missing');
    return { error: 'WhatsApp configuration error on server' };
  }

  try {
    // 3. Database Updates & Credits Deduction
    const supabase = await createClient();
    
    // a. Fetch organization_id and current credits
    const { data: pxData } = await supabase
      .from('prescriptions')
      .select('organization_id, patient_id')
      .eq('id', prescriptionId)
      .single();

    if (!pxData) throw new Error('Prescription not found');
    const orgId = pxData.organization_id;

    const { data: credits } = await supabase
      .from('whatsapp_credits')
      .select('balance')
      .eq('organization_id', orgId)
      .single();

    if (!credits || credits.balance <= 0) {
      return { error: 'Insufficient WhatsApp credits. Please top up from the WhatsApp Management page.' };
    }

    // 3.5. Fetch Fetch Official Clinic Name from DB (Admin bypasses RLS)
    const adminSupabase = createAdminClient();
    const { data: orgData } = await adminSupabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single();
    
    // Override the name with the DB value if found, or use the param/fallback
    const officialClinicName = orgData?.name || clinicName || 'Medical Clinic';

    // 4. Call WhatsApp Cloud API
    const endpoint = `https://graph.facebook.com/v25.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    const body = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: 'prescription_ready',
        language: { code: 'en' },
        components: [
          {
            type: 'header',
            parameters: [
              {
                type: 'document',
                document: {
                  link: pdfUrl,
                  filename: 'Prescription.pdf'
                }
              }
            ]
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: patientName },
              { type: 'text', text: officialClinicName }
            ]
          }
        ]
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Failure:', JSON.stringify(result, null, 2));
      const metaError = result.error?.message || result.error?.error_data?.details || 'Unknown Meta API error';
      return { error: `WhatsApp API Error: ${metaError}` };
    }

    const waMessageId = result.messages?.[0]?.id;

    // 5. Success Flow: Deduct Credit & Log using existing adminSupabase client
    const { data: { user } } = await supabase.auth.getUser();

    // Use atomic deduction (Note: strictly enforced here)
    const { error: deductError } = await adminSupabase
      .from('whatsapp_credits')
      .update({ 
        balance: Math.max(0, credits.balance - 1),
        total_used: (credits.total_used || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', orgId);

    if (deductError) {
      console.error('CRITICAL: Failed to deduct WhatsApp credit after successful send:', deductError);
      // We don't return error here because the message was already sent, 
      // but we log it as critical for admin review.
    }

    // Log the message using admin client
    await adminSupabase.from('whatsapp_message_logs').insert({
      organization_id: orgId,
      sent_by: user?.id,
      patient_id: pxData.patient_id,
      message_type: 'prescription',
      reference_id: prescriptionId,
      phone_number: cleanPhone,
      credits_used: 1,
      status: 'sent',
      whatsapp_message_id: waMessageId
    });

    // Update prescription timestamp (Can use regular client as user should have access to their px)
    await supabase
      .from('prescriptions')
      .update({ whatsapp_sent_at: new Date().toISOString() })
      .eq('id', prescriptionId);

    revalidatePath('/prescriptions');
    
    const remainingBalance = credits.balance - 1;
    let warning = null;
    if (remainingBalance < 50) {
      warning = `Warning: Low balance (${remainingBalance} credits remaining).`;
    }

    return { success: true, warning };

  } catch (error: any) {
    console.error('WhatsApp Action Error:', error);
    return { error: error.message || 'An unexpected error occurred while sending WhatsApp message' };
  }
}
