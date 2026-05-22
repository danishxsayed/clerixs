import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const inquirySchema = z.object({
  clinicName: z.string().min(1, 'Clinic name is required'),
  yourName: z.string().min(1, 'Your name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  branches: z.string().optional(),
  city: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = inquirySchema.parse(body);

    const { error: emailError } = await resend.emails.send({
      from: 'Clerixs <noreply@clerixs.com>',
      to: ['clerixsofficial@gmail.com'],
      subject: `New Enterprise Inquiry — ${data.clinicName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏢 New Enterprise Inquiry</h1>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 8px; font-weight: 700; color: #475569; width: 40%;">Clinic Name</td>
              <td style="padding: 12px 8px;">${data.clinicName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 8px; font-weight: 700; color: #475569;">Contact Person</td>
              <td style="padding: 12px 8px;">${data.yourName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 8px; font-weight: 700; color: #475569;">Phone</td>
              <td style="padding: 12px 8px;">${data.phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 8px; font-weight: 700; color: #475569;">Number of Branches</td>
              <td style="padding: 12px 8px;">${data.branches || 'Not specified'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 8px; font-weight: 700; color: #475569;">City</td>
              <td style="padding: 12px 8px;">${data.city || 'Not specified'}</td>
            </tr>
            ${data.message ? `
            <tr>
              <td style="padding: 12px 8px; font-weight: 700; color: #475569; vertical-align: top;">Message</td>
              <td style="padding: 12px 8px;">${data.message}</td>
            </tr>
            ` : ''}
          </table>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            This inquiry was submitted via the Clerixs Enterprise pricing page.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Enterprise inquiry email error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send inquiry. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    console.error('Enterprise inquiry error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
