import * as React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { InvoicePrintActions } from './invoice-print-actions';
import { RecordPaymentModal } from './record-payment-modal';

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      patients ( full_name, phone, address, email ),
      organizations ( name, slug, currency, letterhead_url ),
      branches ( name, address_line1, address_line2, city, state, pincode, phone, email, gstin ),
      invoice_items ( * ),
      payments ( * )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !invoice) {
    console.error('Failed to fetch invoice:', error);
    notFound();
  }

  const formatCurrency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
      
      {/* Action Controls */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link href="/billing" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Billing
        </Link>
        <div className="flex items-center gap-2">
          {invoice.status !== 'paid' && invoice.status !== 'void' && (
            <RecordPaymentModal invoiceId={invoice.id} balanceDue={invoice.balance_due} />
          )}
          <Link 
            href={`/billing/${invoice.id}/edit`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted h-10 px-4 py-2 border bg-background"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <InvoicePrintActions />
        </div>
      </div>

      <div id="invoice-document" className="rounded-xl border bg-white text-zinc-950 shadow-sm overflow-hidden print:shadow-none print:border-none relative">
        
        {invoice.organizations?.letterhead_url && (
          <div className="w-full h-[200px] overflow-hidden relative pointer-events-none select-none print-letterhead-container border-b">
            {invoice.organizations.letterhead_url.toLowerCase().includes('.pdf') ? (
              <iframe 
                src={`${invoice.organizations.letterhead_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                className="absolute top-0 left-0 w-full h-full border-none pointer-events-none select-none" 
                title="Clinic Letterhead" 
                scrolling="no"
              />
            ) : (
              <img 
                src={invoice.organizations.letterhead_url} 
                alt="Clinic Letterhead" 
                className="w-full object-contain max-h-48 print:max-h-64 object-top print-letterhead pointer-events-none select-none" 
                draggable="false" 
              />
            )}
          </div>
        )}
        
        {/* Invoice Header */}
        <div className="p-8 md:p-12 border-b flex flex-col md:flex-row justify-between items-start gap-8 bg-zinc-50/50">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 uppercase">INVOICE</h1>
            <p className="text-sm font-medium text-zinc-500 mt-2 tracking-wider">{invoice.invoice_number}</p>
            
            <div className="mt-6 flex flex-col gap-1 text-sm text-zinc-600">
              <p><span className="font-semibold text-zinc-900">Issued:</span> {new Date(invoice.issue_date).toLocaleDateString()}</p>
              {invoice.due_date && <p><span className="font-semibold text-zinc-900">Due:</span> {new Date(invoice.due_date).toLocaleDateString()}</p>}
            </div>
            
            <div className="mt-4">
               <span 
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider
                    ${invoice.status === 'draft' ? 'bg-zinc-200 text-zinc-800' : ''}
                    ${invoice.status === 'issued' ? 'bg-blue-100 text-blue-800' : ''}
                    ${invoice.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                    ${invoice.status === 'void' ? 'bg-red-100 text-red-800' : ''}
                  `}
                >
                  {invoice.status.replace('_', ' ')}
                </span>
            </div>
          </div>

          {!invoice.organizations?.letterhead_url && (
            <div className="text-left md:text-right flex flex-col gap-1 text-sm">
              <h2 className="text-xl font-bold text-zinc-900">{invoice.organizations?.name}</h2>
              {invoice.branches?.name && <p className="font-medium text-zinc-700">{invoice.branches.name}</p>}
              {invoice.branches?.address_line1 && <p className="text-zinc-500">{invoice.branches.address_line1}</p>}
              {(invoice.branches?.city || invoice.branches?.state) && (
                <p className="text-zinc-500">
                  {invoice.branches.city}{invoice.branches.city && invoice.branches.state ? ', ' : ''}{invoice.branches.state} {invoice.branches.pincode}
                </p>
              )}
              {invoice.branches?.phone && <p className="text-zinc-500">{invoice.branches.phone}</p>}
              {invoice.branches?.email && <p className="text-zinc-500">{invoice.branches.email}</p>}
              {invoice.branches?.gstin && <p className="text-zinc-500 mt-2 font-medium">GSTIN: {invoice.branches.gstin}</p>}
            </div>
          )}
        </div>

        {/* Bill To */}
        <div className="p-8 md:p-12 border-b">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Billed To</h3>
          <div className="flex flex-col gap-1 text-sm">
            <p className="text-lg font-bold text-zinc-900">{invoice.patients?.full_name}</p>
            {invoice.patients?.phone && <p className="text-zinc-600">{invoice.patients.phone}</p>}
            {invoice.patients?.email && <p className="text-zinc-600">{invoice.patients.email}</p>}
            {invoice.patients?.address && <p className="text-zinc-600 mt-2 max-w-sm">{invoice.patients.address}</p>}
          </div>
        </div>

        {/* Line Items */}
        <div className="p-8 md:p-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b-2 border-zinc-200 text-zinc-900">
                <tr>
                  <th className="py-3 font-bold uppercase tracking-wider text-xs">Description</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-xs text-right hidden sm:table-cell">Qty</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-xs text-right hidden sm:table-cell">Price</th>
                  <th className="py-3 font-bold uppercase tracking-wider text-xs text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoice.invoice_items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-4 pr-4">
                      <p className="font-medium text-zinc-900">{item.description}</p>
                      <div className="sm:hidden mt-1 text-xs text-zinc-500 flex gap-3">
                         <span>{item.quantity} x {formatCurrency(item.unit_price)}</span>
                         {item.tax_percent > 0 && <span>+ {item.tax_percent}% Tax</span>}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right text-zinc-600 hidden sm:table-cell">{item.quantity}</td>
                    <td className="py-4 pr-4 text-right text-zinc-600 hidden sm:table-cell">{formatCurrency(item.unit_price)}</td>
                    <td className="py-4 text-right font-medium text-zinc-900">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Box */}
          <div className="mt-8 flex flex-col items-end">
             <div className="w-full sm:w-80 space-y-3 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                {invoice.tax_amount > 0 && (
                  <>
                    <div className="flex justify-between text-zinc-600">
                      <span>SGST (2.5%)</span>
                      <span>{formatCurrency(invoice.tax_amount / 2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600 border-b border-zinc-200 pb-3">
                      <span>CGST (2.5%)</span>
                      <span>{formatCurrency(invoice.tax_amount / 2)}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between items-end pt-2">
                  <span className="text-base font-bold text-zinc-900">Total</span>
                  <span className="text-2xl font-black text-zinc-900 tracking-tight">{formatCurrency(invoice.total_amount)}</span>
                </div>

                {invoice.status !== 'draft' && invoice.status !== 'void' && (
                  <>
                    <div className="flex justify-between text-zinc-600 pt-4">
                      <span>Amount Paid</span>
                      <span>{formatCurrency((invoice.total_amount || 0) - (invoice.balance_due || 0))}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg mt-2 border">
                      <span className="font-bold text-zinc-900">Balance Due</span>
                      <span className="font-bold text-zinc-900">{formatCurrency(invoice.balance_due)}</span>
                    </div>
                  </>
                )}
             </div>
          </div>

          {invoice.notes && (
            <div className="mt-16 pt-8 border-t border-zinc-100">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Notes / Terms</h4>
              <p className="text-sm text-zinc-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

        </div>
      </div>

      {/* Payment History Log */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="print:hidden rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden p-6 mt-6">
          <h3 className="font-semibold text-lg mb-4">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Reference ID</th>
                  <th className="px-4 py-3 font-medium text-right shadow-[inset_1px_0_0_0_rgba(255,255,255,0.1)]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.payments.sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()).map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 capitalize">{payment.payment_method.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-muted-foreground">{payment.reference_number || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">+{formatCurrency(payment.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
