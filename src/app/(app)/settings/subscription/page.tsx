import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Rocket,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Building,
  Download,
  FileText,
  HardDrive,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { StartTrialButton } from './StartTrialButton';
import { CancelSubscriptionButton } from './CancelSubscriptionButton';
import { PaymentVerifier } from './PaymentVerifier';
import { createAdminClient } from '@/lib/supabase/admin';
import { AutoRenewalToggle } from './AutoRenewalToggle';
import { DownloadInvoiceButton } from './DownloadInvoiceButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Subscription & Billing | Settings' };

export default async function SubscriptionSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams?.order_id as string | undefined;

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // 1. Auth check
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id, full_name')
    .eq('id', userData.user.id)
    .single();

  if (!profile || !profile.default_organization_id) return notFound();
  const orgId = profile.default_organization_id;

  // 2. Fetch subscription and organization info
  const [{ data: subscription }, { data: org }, { data: subInvoices }, { data: waInvoices }] = await Promise.all([
    adminSupabase
      .from('organization_subscriptions')
      .select('*, plan:subscription_plans!organization_subscriptions_plan_id_fkey(id, name, plan_code, max_staff, features, monthly_price, yearly_price)')
      .eq('organization_id', orgId)
      .maybeSingle(),
    supabase.from('organizations').select('created_at').eq('id', orgId).single(),
    adminSupabase
      .from('subscription_invoices')
      .select('*')
      .eq('organization_id', orgId),
    adminSupabase
      .from('whatsapp_credit_purchases')
      .select('*')
      .eq('organization_id', orgId)
  ]);

  if (subscription && Array.isArray(subscription.plan)) {
    subscription.plan = subscription.plan[0];
  }

  // Combine invoices and purchases for Feature 4
  const combinedInvoices = [
    ...(subInvoices || []).map(inv => ({ 
      id: inv.id,
      date: inv.payment_date,
      name: inv.plan_name,
      amount: inv.amount_paid,
      status: inv.status,
      type: 'Subscription',
      order_id: inv.cashfree_order_id,
      billing_cycle: inv.billing_cycle
    })),
    ...(waInvoices || []).map(inv => ({
      id: inv.id,
      date: inv.created_at,
      name: `${inv.credits_added} WhatsApp Credits`,
      amount: inv.amount_paid,
      status: inv.payment_status,
      type: 'WhatsApp Credits',
      order_id: inv.cashfree_order_id
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 3. Status calculations (including virtual trial)
  const now = new Date();
  let status = subscription?.status;
  let isTrial = status === 'trialing';
  let trialDaysLeft = 0;

  // Handle Virtual Trial if no DB record
  if (!subscription && org?.created_at) {
    const created = new Date(org.created_at);
    const virtualTrialEnd = new Date(created);
    virtualTrialEnd.setDate(created.getDate() + 7);
    
    trialDaysLeft = Math.max(0, differenceInDays(virtualTrialEnd, now));
    if (trialDaysLeft > 0) {
      isTrial = true;
      status = 'trialing';
    }
  } 
  else if (isTrial && subscription?.trial_ends_at) {
    trialDaysLeft = Math.max(0, differenceInDays(new Date(subscription.trial_ends_at), now));
  }

  const isActive = status === 'active';
  const isCancelled = status === 'cancelled' || status === 'canceled';
  const isExpired = (!subscription && trialDaysLeft <= 0) || status === 'expired';

  // 4. Fetch storage usage (Files + Database Text)
  let fileBytes = 0;
  let dbBytes = 0;

  try {
    const [{ data: fileStorageData }, { data: dbStorageSize }] = await Promise.all([
      supabase
        .from('patient_files')
        .select('file_size_bytes')
        .eq('organization_id', orgId),
      supabase.rpc('calculate_organization_data_size', { target_org_id: orgId })
    ]);

    fileBytes = fileStorageData?.reduce((acc, file) => acc + (Number(file.file_size_bytes) || 0), 0) || 0;
    dbBytes = Number(dbStorageSize) || 0;

    // Fallback if records show 0 (likely the RPC didn't run or failed)
    if (dbBytes === 0) {
      const { data: notesData } = await supabase
        .from('clinical_notes')
        .select('content')
        .eq('organization_id', orgId);
      
      const { data: patientsData } = await supabase
        .from('patients')
        .select('*')
        .eq('organization_id', orgId);

      // Rough approximation of bytes
      const notesBytes = notesData?.reduce((acc, n) => acc + (n.content?.length || 0), 0) || 0;
      const patientsBytes = (patientsData?.length || 0) * 500; // ~500 bytes per patient row
      dbBytes = notesBytes + patientsBytes;
    }
  } catch (err) {
    console.error('Storage calculation error:', err);
  }
  
  const totalUsedBytes = fileBytes + dbBytes;
  const totalUsedGB = totalUsedBytes / (1024 * 1024 * 1024);

  const plan = subscription?.plan || (isTrial ? { name: 'Starter (Trial)', plan_code: 'basic' } : null);
  const storageLimitGB = (plan as any)?.plan_code === 'pro' ? 10 : 5;
  const storageUsagePercent = Math.min(100, (totalUsedGB / storageLimitGB) * 100);

  const isBasicPlan = plan?.plan_code === 'basic';
  const isProPlan = plan?.plan_code === 'pro';

  const pageHeader = (
    <div className="flex items-center gap-2 mb-4">
      <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground hover:text-foreground">
        <Link href="/settings">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Settings
        </Link>
      </Button>
    </div>
  );

  // ── NO SUBSCRIPTION / EXPIRED STATE ──────────────────────────────────────
  if (isExpired) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {pageHeader}
        {orderId && <PaymentVerifier orderId={orderId} />}
        <Card className="text-center p-12 border-2 border-dashed border-primary/20 bg-primary/5">
          <Rocket className="mx-auto h-12 w-12 text-primary mb-4 animate-bounce" />
          <h3 className="text-2xl font-bold mb-2">Start Your Journey with Clerixs</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Welcome! Start your 7-day free trial today to experience all the features of Clerixs.
            No credit card required to begin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <StartTrialButton />
            <Button variant="outline" asChild>
              <Link href="/pricing">View All Plans</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── LOADING / ERROR FALLBACK ──────────────────────────────────────────────
  if (!plan && !isExpired) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {pageHeader}
        <Card className="p-8 text-center italic text-muted-foreground">
          Loading plan details...
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
      {pageHeader}
      {orderId && <PaymentVerifier orderId={orderId} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>
          <p className="text-muted-foreground">Manage your plan, billing, and storage usage.</p>
        </div>
      </div>

      {/* ── ALERTS / BANNERS ────────────────────────────────────────────────── */}
      {isTrial && subscription?.trial_ends_at && (
        <Card className="border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-800 dark:text-amber-200">
                Free Trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-xs">
                Your trial expires on{' '}
                <strong>{format(new Date(subscription.trial_ends_at), 'MMMM dd, yyyy')}</strong>.
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="border-2 border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-destructive">Subscription Cancelled</p>
              <p className="text-muted-foreground text-xs">
                Access ends on <strong>{subscription?.current_period_end ? format(new Date(subscription.current_period_end), 'MMMM dd, yyyy') : 'N/A'}</strong>.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 border-destructive text-destructive hover:bg-destructive/10">
              <Link href="/pricing">Resubscribe</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isExpired && (
        <Card className="text-center p-12 border-2 border-dashed border-primary/20 bg-primary/5">
          <Rocket className="mx-auto h-12 w-12 text-primary mb-4 animate-bounce" />
          <h3 className="text-2xl font-bold mb-2">Start Your Journey with Clerixs</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Welcome! Start your 7-day free trial today to experience all the features of Clerixs.
            No credit card required to begin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <StartTrialButton />
            <Button variant="outline" asChild>
              <Link href="/pricing">View All Plans</Link>
            </Button>
          </div>
        </Card>
      )}

      {/* ── MAIN CONTENT (Visible when plan exists) ────────────────────────── */}
      {plan && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="relative overflow-hidden border-2 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      {plan.name} Plan
                      <Badge 
                        variant="default" 
                        className={`uppercase ${isTrial ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                      >
                        {isTrial ? 'Trial active' : 'Active'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {isTrial ? 'You are currently exploring all features.' : 'Thank you for being a premium subscriber.'}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ₹{subscription?.billing_cycle === 'yearly' ? plan.yearly_price : plan.monthly_price}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      per {subscription?.billing_cycle === 'yearly' ? 'year' : 'month'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {/* Renewal / Expiry Info */}
                  <div className="bg-muted/50 rounded-xl p-4 border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
                        {isTrial ? <Clock className="h-5 w-5 text-amber-500" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {isTrial ? 'Trial Ends' : 'Next Renewal'}
                        </p>
                        <p className="font-semibold text-sm">
                          {isTrial 
                            ? (subscription?.trial_ends_at ? format(new Date(subscription.trial_ends_at), 'MMMM dd, yyyy') : 'Virtual Trial (7 Days)')
                            : subscription?.current_period_end 
                              ? format(new Date(subscription.current_period_end), 'MMMM dd, yyyy')
                              : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                    {!isTrial && !isCancelled && subscription && (
                      <div className="flex flex-col items-end gap-2">
                        <AutoRenewalToggle 
                          subscriptionId={subscription.id} 
                          initialEnabled={subscription.auto_renewal_enabled !== false} 
                        />
                        {subscription.auto_renewal_enabled !== false ? (
                           <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                             Your plan will automatically renew on {subscription.current_period_end ? format(new Date(subscription.current_period_end), 'MMM dd, yyyy') : 'N/A'}
                           </Badge>
                        ) : (
                           <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                             Plan will not renew. You will lose access on {subscription.current_period_end ? format(new Date(subscription.current_period_end), 'MMM dd, yyyy') : 'N/A'}
                           </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-lg p-3 border">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Billing Cycle</p>
                      <p className="font-semibold capitalize">{subscription?.billing_cycle || 'Monthly'}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 border">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Amount Paid</p>
                      <p className="font-semibold">
                        ₹{subscription?.price_paid || 0}
                      </p>
                    </div>
                  </div>

                  {/* Storage Usage (Always Visible) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-semibold">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        Storage Usage
                      </div>
                      <span className="text-muted-foreground font-medium">
                        {totalUsedGB.toFixed(2)} GB / {storageLimitGB} GB
                      </span>
                    </div>
                    <Progress
                      value={storageUsagePercent}
                      className={`h-2.5 shadow-inner ${storageUsagePercent > 80 ? '[&>div]:bg-red-500' : storageUsagePercent > 60 ? '[&>div]:bg-amber-500' : ''}`}
                    />
                    
                    <div className="flex gap-4 text-[10px] text-muted-foreground font-semibold uppercase tracking-tight">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                        Files: {(fileBytes / (1024 * 1024 * 1024)).toFixed(3)} GB
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        Records (Text): {(dbBytes / (1024 * 1024 * 1024)).toFixed(3)} GB
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">
                      Includes all records, prescriptions, and cloud documents (X-rays, reports).
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {isBasicPlan || isTrial ? (
                    <Button size="sm" asChild>
                      <Link href="/pricing">
                        <Rocket className="mr-2 h-4 w-4" />
                        Upgrade to {isProPlan ? 'Active Pro' : 'Pro Plan'}
                      </Link>
                    </Button>
                  ) : null}
                  {!isTrial && !isCancelled && subscription && (
                    <CancelSubscriptionButton
                      currentPeriodEnd={subscription.current_period_end || new Date().toISOString()}
                    />
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Billing History (Invoices Only) */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Billing History</CardTitle>
                  <CardDescription>View and download your recent platform invoices.</CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {combinedInvoices.length > 0 ? (
                        combinedInvoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="px-4 py-4 font-medium">
                              {format(new Date(invoice.date), 'MMM dd, yyyy')}
                            </td>
                            <td className="px-4 py-4">{invoice.name}</td>
                            <td className="px-4 py-4">
                              <Badge variant="secondary" className="text-[10px] uppercase">{invoice.type}</Badge>
                            </td>
                            <td className="px-4 py-4 font-bold">₹{invoice.amount}</td>
                            <td className="px-4 py-4 uppercase text-[10px]">
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 border-emerald-100"
                              >
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <DownloadInvoiceButton invoice={invoice} orgId={orgId} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                            No billing history found (Trial periods generate no invoices).
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Workspace</p>
                  <p className="font-semibold text-base">{profile.full_name}&apos;s Clinic</p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                  <p className="font-medium text-emerald-600 flex items-center gap-1.5 capitalize">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {status}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Priority Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-blue-100 leading-relaxed font-medium">
                  Need help with your subscription or the Pro plan? Our support team is here to help.
                </p>
                <Button variant="secondary" className="w-full font-bold text-blue-700" size="sm">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared StorageCard component ──────────────────────────────────────────
function StorageCard({
  totalUsedGB,
  storageLimitGB,
  storageUsagePercent,
}: {
  totalUsedGB: number;
  storageLimitGB: number;
  storageUsagePercent: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-muted-foreground" />
          Storage Usage
        </CardTitle>
        <CardDescription>All records, text data, and files across your clinic.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>{totalUsedGB.toFixed(2)} GB used</span>
          <span className="text-muted-foreground">{storageLimitGB} GB limit</span>
        </div>
        <Progress
          value={storageUsagePercent}
          className={`h-3 ${storageUsagePercent > 80 ? '[&>div]:bg-red-500' : storageUsagePercent > 60 ? '[&>div]:bg-amber-500' : ''}`}
        />
        <p className="text-xs text-muted-foreground">
          {storageUsagePercent > 80
            ? '⚠️ Storage almost full. Upgrade to Pro for 10 GB.'
            : `${(storageLimitGB - totalUsedGB).toFixed(2)} GB remaining.`}
        </p>
      </CardContent>
    </Card>
  );
}
