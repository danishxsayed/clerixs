'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
    MessageSquare, 
    ShoppingCart, 
    History as HistoryIcon, 
    TrendingUp, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Zap,
    CreditCard,
    AlertCircle,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
// @ts-ignore
import { load } from '@cashfreepayments/cashfree-js';
import { PaymentVerifier } from '@/app/(app)/settings/subscription/PaymentVerifier';

interface WhatsAppClientProps {
  organizationId: string;
  userRole: string;
  userId: string;
}

export function WhatsAppClient({ organizationId, userRole, userId }: WhatsAppClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>({
    credits: null,
    logs: [],
    purchases: [],
    packs: [],
    monthlyCount: 0
  });

  const isAdmin = userRole === 'org_owner' || userRole === 'admin';

  const fetchData = React.useCallback(async () => {
    const supabase = createClient();
    setLoading(true);

    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [creditsRes, logsRes, purchasesRes, packsRes, monthlyCountRes] = await Promise.all([
        supabase.from('whatsapp_credits').select('*').eq('organization_id', organizationId).maybeSingle(),
        supabase.from('whatsapp_message_logs').select('*, patients(full_name)').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(20),
        supabase.from('whatsapp_credit_purchases').select('*, whatsapp_credit_packs(name)').eq('organization_id', organizationId).order('created_at', { ascending: false }),
        supabase.from('whatsapp_credit_packs').select('*').eq('is_active', true).order('price', { ascending: true }),
        supabase.from('whatsapp_message_logs').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).gte('created_at', startOfMonth.toISOString())
      ]);

      setData({
        credits: creditsRes.data || { balance: 0, total_used: 0, total_purchased: 0 },
        logs: logsRes.data || [],
        purchases: purchasesRes.data || [],
        packs: packsRes.data || [],
        monthlyCount: monthlyCountRes.count || 0
      });
    } catch (err) {
      console.error('[WhatsAppClient] Sync failed:', err);
      toast.error("Failed to load WhatsApp data.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBuyPack = async (packId: string) => {
    if (!isAdmin) {
      toast.error("Only owners or admins can purchase credits.");
      return;
    }

    try {
      toast.loading("Initializing payment...");
      const res = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappCreditPackId: packId })
      });

      const orderData = await res.json();
      toast.dismiss();

      if (!res.ok) throw new Error(orderData.error || "Failed to create order");

      const cashfree = await load({ mode: 'sandbox' }); 
      await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_top',
      });

    } catch (err: any) {
      console.error('[WhatsAppClient] Purchase error:', err);
      toast.error(err.message || "Failed to start checkout.");
    }
  };

  const handleTabChange = (value: string) => {
     const params = new URLSearchParams(searchParams.toString());
     params.set('tab', value);
     router.push(`/whatsapp?${params.toString()}`);
  };

  if (loading) {
     return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {orderId && (
        <PaymentVerifier 
          orderId={orderId} 
          redirectPath="/whatsapp?tab=history" 
          successMessage="WhatsApp credits added successfully!"
        />
      )}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="bg-muted/50 p-1 flex justify-between items-center w-full">
        <div className="flex items-center gap-1">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <HistoryIcon className="h-4 w-4" /> Transaction History
          </TabsTrigger>
        </div>
        <TabsTrigger 
          value="buy" 
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 rounded-md transition-all shadow-sm data-active:!bg-blue-800 data-active:!text-white hover:text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
        >
          <ShoppingCart className="h-4 w-4" /> Buy Credits
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-100 flex items-center justify-between">
                <span>Current Balance</span>
                <MessageSquare className="h-4 w-4 opacity-50" />
              </CardDescription>
              <CardTitle className="text-4xl font-bold">{data.credits.balance}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-100 mb-2">Credits never expire</p>
              <Progress value={Math.min(100, (data.credits.balance / 1000) * 100)} className="h-1 bg-white/20 [&>div]:bg-white" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardDescription>Messages Sent (Month)</CardDescription>
              <CardTitle className="text-3xl font-bold">{data.monthlyCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Deducted from balance
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardDescription>Total Purchased</CardDescription>
              <CardTitle className="text-3xl font-bold">{data.credits.total_purchased}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Lifetime across all staff</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Message Logs</CardTitle>
            <CardDescription>Recent prescriptions shared via WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.logs.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No recent messages found.</TableCell>
                    </TableRow>
                ) : data.logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.patients?.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-xs">{log.phone_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{log.message_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 capitalize text-xs">
                        {log.status === 'delivered' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : log.status === 'failed' ? (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        {log.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{log.credits_used} Cr</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM d, h:mm a')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="buy" className="animate-in fade-in slide-in-from-bottom-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.packs.map((pack: any) => (
            <Card key={pack.id} className={cn(
                "relative overflow-hidden flex flex-col transition-all hover:shadow-md",
                pack.is_popular ? "border-primary shadow-sm ring-1 ring-primary/20" : ""
            )}>
              {pack.is_popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Zap className="h-3 w-3 fill-white" /> Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{pack.name}</CardTitle>
                <CardDescription>{pack.credits} WhatsApp Credits</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center py-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">₹{pack.price}</span>
                  <span className="text-muted-foreground text-sm">/ one-time</span>
                </div>
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ₹{(pack.price / pack.credits).toFixed(2)} per message
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Instant activation
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                   onClick={() => handleBuyPack(pack.id)}
                   className="w-full" 
                   variant={pack.is_popular ? "default" : "outline"}
                >
                  Buy Pack
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-muted/30 border rounded-lg flex gap-4 items-start">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
                <p className="font-semibold">Important Information</p>
                <p className="text-muted-foreground">Credits are deducted only when a message is successfully delivered to Meta. Failed deliveres are not charged. Credits never expire and roam across all doctors in your clinic.</p>
            </div>
        </div>
      </TabsContent>

      <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Transactions</CardTitle>
            <CardDescription>History of all WhatsApp credit refills</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Pack</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.purchases.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No purchase transactions found.</TableCell>
                    </TableRow>
                ) : data.purchases.map((purchase: any) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="text-xs font-mono">{purchase.cashfree_order_id || 'Internal'}</TableCell>
                    <TableCell>{purchase.whatsapp_credit_packs?.name || 'Custom'}</TableCell>
                    <TableCell>₹{purchase.amount_paid}</TableCell>
                    <TableCell className="font-medium">+{purchase.credits_added}</TableCell>
                    <TableCell>
                      <Badge variant={purchase.payment_status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                        {purchase.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {format(new Date(purchase.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);
}
