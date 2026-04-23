'use client';

import * as React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface DownloadInvoiceButtonProps {
  invoice: any;
  orgId: string;
}

export function DownloadInvoiceButton({ invoice, orgId }: DownloadInvoiceButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch clinic details for the invoice
      const { data: clinic } = await supabase
        .from('organizations')
        .select(`
          name,
          branches (
            address_line1,
            address_line2,
            city,
            state,
            pincode,
            phone,
            email,
            gstin
          )
        `)
        .eq('id', orgId)
        .single();

      const branch = clinic?.branches?.[0];

      // Dynamic import of html2pdf.js
      const html2pdf = (await import('html2pdf.js')).default;

      const amount = Number(invoice.amount);
      const subtotal = amount / 1.18;
      const totalGst = amount - subtotal;
      const cgst = totalGst / 2;
      const sgst = totalGst / 2;

      const htmlContent = `
        <div style="padding: 40px; font-family: 'Helvetica', 'Arial', sans-serif; color: #1e293b; background-color: #ffffff; width: 700px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center;">
              <img src="/assets/logo.jpg" style="height: 50px; width: auto; margin-right: 15px;" />
              <div>
                <p style="margin: 0; color: #2563eb; font-size: 24px; font-weight: 800;">CLERIXS</p>
                <p style="margin: 2px 0 0; color: #64748b; font-size: 11px;">Smart Clinic Platform</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 22px; color: #0f172a;">TAX INVOICE</h2>
              <p style="margin: 5px 0; font-size: 11px; color: #64748b;">#${invoice.order_id || invoice.id.split('-')[0].toUpperCase()}</p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px;">
            <div style="max-width: 60%;">
              <h3 style="font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; font-weight: 700;">Billed To</h3>
              <p style="margin: 0; font-weight: 800; font-size: 15px; color: #0f172a;">${clinic?.name || 'Clinic Name'}</p>
              <p style="margin: 4px 0; color: #475569;">${branch?.address_line1 || ''} ${branch?.address_line2 || ''}</p>
              <p style="margin: 0; color: #475569;">${branch?.city || ''}, ${branch?.state || ''} ${branch?.pincode || ''}</p>
              <p style="margin: 4px 0; color: #475569;">${branch?.email || ''} | ${branch?.phone || ''}</p>
              ${branch?.gstin ? `<p style="margin: 6px 0; color: #0f172a; font-weight: 700;">GSTIN: ${branch.gstin}</p>` : ''}
            </div>
            <div style="text-align: right;">
              <p style="margin: 0;"><span style="color: #94a3b8; font-weight: 600;">DATE:</span> ${new Date(invoice.date).toLocaleDateString('en-IN')}</p>
              <p style="margin: 8px 0;"><span style="color: #94a3b8; font-weight: 600; text-transform: uppercase;">STATUS:</span> <span style="color: #059669; font-weight: 800;">PAID</span></p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 10px; text-align: left; font-size: 10px; color: #94a3b8; border-bottom: 2px solid #e2e8f0; font-weight: 700;">DESCRIPTION</th>
                <th style="padding: 10px; text-align: right; font-size: 10px; color: #94a3b8; border-bottom: 2px solid #e2e8f0; font-weight: 700; width: 100px;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 15px 10px; border-bottom: 1px solid #f1f5f9;">
                  <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${invoice.name}</div>
                  <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${invoice.type}${invoice.billing_cycle ? ` — ${invoice.billing_cycle}ly Billing` : ''}</div>
                </td>
                <td style="padding: 15px 10px; text-align: right; font-size: 14px; font-weight: 700; color: #0f172a; vertical-align: top;">₹${subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end;">
            <div style="width: 250px; background-color: #f8fafc; padding: 15px; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #64748b;">
                <span>Subtotal</span>
                <span style="font-weight: 600; color: #475569;">₹${subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #64748b;">
                <span>CGST (9%)</span>
                <span style="font-weight: 600; color: #475569;">₹${cgst.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #64748b; margin-bottom: 8px;">
                <span>SGST (9%)</span>
                <span style="font-weight: 600; color: #475569;">₹${sgst.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 16px; font-weight: 800; color: #2563eb;">
                <span>TOTAL</span>
                <span>₹${amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 80px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 10px;">
            <p style="margin: 0; font-weight: 700; color: #64748b;">Clerixs · clerixs.com · support@clerixs.com</p>
            <p style="margin: 4px 0 0;">This is a computer-generated tax invoice and does not require a physical signature.</p>
          </div>
        </div>
      `;

      const options = {
        margin: [10, 10, 10, 10], 
        filename: `Clerixs-Invoice-${new Date(invoice.date).toISOString().split('T')[0]}-${invoice.order_id || 'manual'}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().from(htmlContent).set(options).save();
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate invoice PDF');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
