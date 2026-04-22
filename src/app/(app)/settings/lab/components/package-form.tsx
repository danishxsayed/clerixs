'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, Plus, Trash, X } from 'lucide-react';
import { createLabPackage, updateLabPackage } from '@/app/(app)/lab/actions';
import { toast } from 'sonner';

export function PackageForm({ tests, pkg, onCancel, onSuccess }: { tests: any[], pkg?: any, onCancel: () => void, onSuccess: (data: any) => void }) {
  const [name, setName] = React.useState(pkg?.name || '');
  const [description, setDescription] = React.useState(pkg?.description || '');
  const [price, setPrice] = React.useState(pkg?.price || 0);
  const [loading, setLoading] = React.useState(false);

  // Extract initial test IDs if editing
  const existingTestIds = pkg?.lab_package_tests ? pkg.lab_package_tests.map((pt: any) => pt.lab_tests?.id) : [];
  const [selectedTests, setSelectedTests] = React.useState<string[]>(existingTestIds);

  const toggleTest = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const calculateAutoPrice = () => {
    const total = selectedTests.reduce((sum, testId) => {
      const test = tests.find(t => t.id === testId);
      return sum + (test?.price || 0);
    }, 0);
    setPrice(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Package name is required');
    if (selectedTests.length === 0) return toast.error('At least one test must be included in the package');

    setLoading(true);
    let res;
    if (pkg?.id) {
      res = await updateLabPackage(pkg.id, { name, description, price }, selectedTests);
    } else {
      res = await createLabPackage({ name, description, price }, selectedTests);
    }

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(pkg?.id ? 'Package updated' : 'Package created');
      onSuccess(res);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">{pkg ? 'Edit Lab Package' : 'New Lab Package'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Package Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Package Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Master Health Checkup" required />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label>Package Price (₹)</Label>
                <button type="button" onClick={calculateAutoPrice} className="text-xs text-primary hover:underline">
                  Auto Calculate from Tests
                </button>
              </div>
              <Input type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description of the package" />
            </div>
          </div>
        </div>

        {/* Selected Tests */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-semibold text-lg">Included Tests</h3>
            <span className="text-sm text-muted-foreground">{selectedTests.length} selected</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
            {tests.map(test => {
              const isSelected = selectedTests.includes(test.id);
              return (
                <div 
                  key={test.id} 
                  onClick={() => toggleTest(test.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm leading-none">{test.name}</p>
                    <p className="text-xs text-muted-foreground">₹{test.price}</p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}
            
            {tests.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full py-4 text-center">
                No lab tests available. Please create individual tests first before building packages.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Package'}</Button>
        </div>
      </form>
    </div>
  );
}
