'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { createLabOrder } from '@/app/(app)/lab/actions';
import { toast } from 'sonner';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  ChevronsUpDown, 
  Lock, 
  FlaskConical, 
  ShoppingCart, 
  Receipt, 
  CreditCard 
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function LabOrderForm({ patientId, tests, packages }: { patientId: string, tests: any[], packages: any[] }) {
  const router = useRouter();
  const { hasFeature } = useSubscription();
  const canUsePackages = hasFeature('lab_packages');
  const [loading, setLoading] = React.useState(false);
  
  const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
  const [notes, setNotes] = React.useState('');
  const [sampleType, setSampleType] = React.useState('Blood');
  const [discountAmount, setDiscountAmount] = React.useState<number>(0);

  const availableTestsOptions = tests.filter(t => !selectedItems.some(item => item.id === t.id && item.type === 'test'));
  const availablePackagesOptions = packages.filter(p => !selectedItems.some(item => item.id === p.id && item.type === 'package'));

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const handleAddItem = (typeAndId: string) => {
    if (!typeAndId) return;
    const [type, id] = typeAndId.split('_', 2);
    
    if (type === 'test') {
      const test = tests.find(t => t.id === id);
      if (test) setSelectedItems([...selectedItems, { 
        type: 'test', 
        id: test.id, 
        name: test.name, 
        price: Number(test.price),
        parameters: test.lab_test_parameters || []
      }]);
    } else if (type === 'package') {
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        const pkgParameters: any[] = [];
        if (pkg.lab_package_tests) {
            pkg.lab_package_tests.forEach((pt: any) => {
               if (pt.lab_tests?.lab_test_parameters) {
                   pt.lab_tests.lab_test_parameters.forEach((param: any) => {
                       pkgParameters.push({ ...param, testName: pt.lab_tests.name });
                   });
               }
            });
        }
        setSelectedItems([...selectedItems, { 
          type: 'package', 
          id: pkg.id, 
          name: pkg.name, 
          price: Number(pkg.price),
          parameters: pkgParameters
        }]);
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (selectedItems.length === 0) {
      toast.error('Please add at least one test before confirming the order.');
      return;
    }

    setLoading(true);
    const orderItems = selectedItems.map(item => ({
      lab_test_id: item.type === 'test' ? item.id : null,
      lab_package_id: item.type === 'package' ? item.id : null,
      name: item.name,
      price: item.price
    }));

    const res = await createLabOrder({
      patient_id: patientId,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      notes,
      sample_type: sampleType,
      items: orderItems
    });

    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success('Lab order placed effectively and sample collection queued.');
      router.push(`/patients/${patientId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SETUP & SELECTION */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Requirement Setup */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Requirement Setup</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Sample Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={sampleType} 
                    onChange={e => setSampleType(e.target.value)}
                  >
                    <option value="Blood">Blood (Serum/Plasma)</option>
                    <option value="Urine">Urine</option>
                    <option value="Saliva">Saliva / Swab</option>
                    <option value="Stool">Stool</option>
                    <option value="Tissue">Tissue / Biopsy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Technician Notes</Label>
                  <Input 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    placeholder="e.g. Fasting sample requested..." 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Catalog Selection */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Selected Tests
              </CardTitle>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Browse Catalog
                  </Button>
                }/>
                <PopoverContent className="w-[400px] p-0" align="end">
                  <Command>
                    <CommandInput 
                      placeholder="Search tests or packages..." 
                      value={search}
                      onValueChange={setSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No matches found.</CommandEmpty>
                      
                      {availablePackagesOptions.length > 0 && (
                        <CommandGroup heading="Lab Packages">
                          {availablePackagesOptions.map((p) => (
                            <CommandItem
                              key={`package_${p.id}`}
                              value={p.name}
                              disabled={!canUsePackages}
                              onSelect={() => {
                                if (!canUsePackages) {
                                  toast.error('Lab packages require a Pro subscription.');
                                  return;
                                }
                                handleAddItem(`package_${p.id}`);
                                setOpen(false);
                                setSearch('');
                              }}
                            >
                              <div className="flex flex-col flex-1">
                                <span>{p.name}</span>
                                <span className="text-xs text-muted-foreground font-medium">₹{p.price.toLocaleString()}</span>
                              </div>
                              {!canUsePackages && <Lock className="h-4 w-4 ml-2 text-muted-foreground" />}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}

                      {availableTestsOptions.length > 0 && (
                        <CommandGroup heading="Individual Tests">
                          {availableTestsOptions.map((t) => (
                            <CommandItem
                              key={`test_${t.id}`}
                              value={t.name}
                              onSelect={() => {
                                handleAddItem(`test_${t.id}`);
                                setOpen(false);
                                setSearch('');
                              }}
                            >
                              <div className="flex flex-col">
                                <span>{t.name}</span>
                                <span className="text-xs text-muted-foreground font-medium">₹{t.price.toLocaleString()}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardHeader>

            <CardContent className="p-0">
               {selectedItems.length === 0 ? (
                 <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                    <Plus className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No tests selected yet</p>
                 </div>
               ) : (
                 <div className="divide-y">
                    <AnimatePresence initial={false}>
                      {selectedItems.map((item, index) => (
                        <motion.div 
                          key={`${item.type}-${item.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-muted/10 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base flex items-center gap-2">
                              {item.name}
                              {item.type === 'package' && <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0.5">Package</Badge>}
                            </div>
                            {item.parameters && item.parameters.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                {item.parameters.slice(0, 8).map((p: any, idx: number) => (
                                  <span key={idx} className="text-[11px] text-muted-foreground flex items-center gap-1.5 min-w-[120px]">
                                    <div className="h-1 w-1 bg-blue-400 rounded-full" />
                                    {p.name}
                                  </span>
                                ))}
                                {item.parameters.length > 8 && (
                                  <span className="text-[11px] text-blue-500 font-medium font-outfit">+{item.parameters.length - 8} more parameters</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                               <span className="font-bold text-blue-600">₹{item.price.toLocaleString()}</span>
                               <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveItem(index)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: PAYMENT SUMMARY */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-8 overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Order Summary
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                   <span className="font-medium text-muted-foreground">Subtotal</span>
                   <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                 </div>
                 
                 <div className="space-y-3 pt-3 border-t">
                    <Label className="text-xs font-semibold text-muted-foreground">Apply Discount (₹)</Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={discountAmount || ''} 
                        onChange={e => setDiscountAmount(Number(e.target.value))} 
                        placeholder="0.00"
                        className="font-semibold"
                      />
                    </div>
                 </div>
               </div>

               <div className="bg-muted/30 p-4 rounded-xl border border-dashed flex flex-col gap-1 items-center text-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Amount Payable</span>
                  <span className="text-3xl font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
               </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-2 pt-0 pb-6">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full gap-2 h-11"
              >
                {loading ? <div className="h-4 w-4 border-b-2 border-white rounded-full animate-spin" /> : <Check className="h-4 w-4" />}
                {loading ? 'Placing Order...' : 'Confirm Lab Order'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.back()} 
                className="w-full text-muted-foreground"
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </form>
  );
}
