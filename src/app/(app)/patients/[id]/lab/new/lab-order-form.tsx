'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLabOrder } from '@/app/(app)/lab/actions';
import { toast } from 'sonner';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ArrowLeft, Plus, Trash2, Check, ChevronsUpDown, Lock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';

export function LabOrderForm({ patientId, tests, packages }: { patientId: string, tests: any[], packages: any[] }) {
  const router = useRouter();
  const { hasFeature } = useSubscription();
  const canUsePackages = hasFeature('lab_packages');
  const [loading, setLoading] = React.useState(false);
  
  // Array of { type: 'test' | 'package', id: string, name: string, price: number }
  const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
  const [notes, setNotes] = React.useState('');
  const [sampleType, setSampleType] = React.useState('Blood');

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
          name: pkg.name + ' (Package)', 
          price: Number(pkg.price),
          parameters: pkgParameters
        }]);
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error('Please select at least one lab test to order.');
      return;
    }

    setLoading(true);
    const orderItems = selectedItems.map(item => ({
      lab_test_id: item.type === 'test' ? item.id : null,
      lab_package_id: item.type === 'package' ? item.id : null,
      price: item.price
    }));

    const res = await createLabOrder({
      patient_id: patientId,
      total_amount: totalAmount,
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Sample Type</Label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
            <Label>Add Lab Test or Package to Order</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger render={
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between font-normal text-left"
                />
              }>
                Search catalog...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search tests or packages..." 
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No tests found.</CommandEmpty>
                    
                    {availablePackagesOptions.length > 0 && (
                      <CommandGroup heading="Lab Packages">
                        {availablePackagesOptions.map((p) => (
                          <CommandItem
                            key={`package_${p.id}`}
                            value={p.name}
                            disabled={!canUsePackages}
                            className={!canUsePackages ? 'opacity-50 cursor-not-allowed' : ''}
                            onSelect={() => {
                              if (!canUsePackages) {
                                toast.error('Lab packages are available on the Pro plan.');
                                return;
                              }
                              handleAddItem(`package_${p.id}`);
                              setOpen(false);
                              setSearch('');
                            }}
                          >
                            <div className="flex flex-col flex-1">
                              <span>{p.name}</span>
                              <span className="text-xs text-muted-foreground font-medium">₹{p.price} • Package</span>
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
                              <span className="text-xs text-muted-foreground font-medium">₹{t.price} • Test</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <Label>Selected Tests</Label>
          {selectedItems.length === 0 ? (
            <div className="p-4 border border-dashed rounded-lg bg-muted/20 text-center text-sm text-muted-foreground">
              No tests selected. Please add a test from the dropdown above.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="font-medium p-3">Item</th>
                    <th className="font-medium p-3 text-right">Price</th>
                    <th className="font-medium p-3 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item, index) => (
                    <tr key={`${item.type}-${item.id}`} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium text-base">{item.name}</div>
                        {item.parameters && item.parameters.length > 0 && (
                          <div className="mt-2 space-y-1.5 border-l-2 border-primary/20 pl-3 py-1 mb-2">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Test Parameters Auto-Filled</p>
                            {item.parameters.map((p: any, idx: number) => (
                              <div key={idx} className="text-xs text-muted-foreground flex items-start justify-between gap-4">
                                <span className="font-medium flex-1">{p.name} {p.testName ? <span className="text-[10px] font-normal opacity-70 ml-1">({p.testName})</span> : ''}</span>
                                <span className="text-right flex-1 font-mono text-[11px] opacity-80">
                                  {p.expected_string_value ? p.expected_string_value : 
                                   (p.reference_range_min !== null || p.reference_range_max !== null) ? 
                                   `${p.reference_range_min !== null ? p.reference_range_min : ''} - ${p.reference_range_max !== null ? p.reference_range_max : ''} ${p.unit || ''}` : 
                                   'No defined range'
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-medium align-top pt-4 text-emerald-600">₹{item.price.toFixed(2)}</td>
                      <td className="p-3 text-center align-top pt-2">
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/10 font-medium">
                    <td className="p-3 text-right">Total Amount</td>
                    <td className="p-3 text-right text-lg text-primary">₹{totalAmount.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Additional Notes or Instructions for Lab Technician (Optional)</Label>
          <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Fasting blood sugar required..." />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || selectedItems.length === 0}>
          {loading ? 'Processing...' : 'Place Lab Order'}
        </Button>
      </div>
    </form>
  );
}
