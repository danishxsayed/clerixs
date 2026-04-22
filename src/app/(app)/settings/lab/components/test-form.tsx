'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { createLabTest, updateLabTest } from '@/app/(app)/lab/actions';
import { toast } from 'sonner';

export function TestForm({ categories, test, onCancel, onSuccess }: { categories: any[], test?: any, onCancel: () => void, onSuccess: (data: any) => void }) {
  const [name, setName] = React.useState(test?.name || '');
  const [description, setDescription] = React.useState(test?.description || '');
  const [price, setPrice] = React.useState(test?.price || 0);
  const [categoryId, setCategoryId] = React.useState(test?.category_id || (categories.length > 0 ? categories[0].id : ''));
  const [loading, setLoading] = React.useState(false);
  
  const [parameters, setParameters] = React.useState<any[]>(
    test?.lab_test_parameters?.length > 0 
      ? test.lab_test_parameters 
      : [{ name: '', unit: '', reference_range_min: '', reference_range_max: '', expected_string_value: '' }]
  );

  const handleAddParam = () => setParameters([...parameters, { name: '', unit: '', reference_range_min: '', reference_range_max: '', expected_string_value: '' }]);
  const handleRemoveParam = (index: number) => setParameters(parameters.filter((_, i) => i !== index));

  const handleChangeParam = (index: number, field: string, value: string) => {
    const newParams = [...parameters];
    newParams[index][field] = value;
    setParameters(newParams);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Test name is required');
    if (parameters.length === 0) return toast.error('At least one parameter is required');
    if (parameters.some(p => !p.name.trim())) return toast.error('All parameters must have a name');

    setLoading(true);
    let res;
    if (test?.id) {
      res = await updateLabTest(test.id, { name, description, price, category_id: categoryId || null }, parameters);
    } else {
      res = await createLabTest({ name, description, price, category_id: categoryId || null }, parameters);
    }

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(test?.id ? 'Test updated' : 'Test created');
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
        <h2 className="text-2xl font-bold">{test ? 'Edit Lab Test' : 'New Lab Test'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Test Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Complete Blood Count (CBC)" required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-semibold text-lg">Test Parameters</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddParam} className="gap-2">
              <Plus className="h-4 w-4" /> Add Parameter
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">Define what will be measured or reported for this test. Include expected ranges if applicable to highlight abnormal results automatically.</p>
          
          <div className="space-y-4 mt-4">
            {parameters.map((param, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-3 p-4 border rounded-lg bg-muted/20 relative">
                <div className="absolute -left-2 -top-2 bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label>Parameter Name *</Label>
                  <Input value={param.name} onChange={e => handleChangeParam(index, 'name', e.target.value)} placeholder="e.g. Hemoglobin" required />
                </div>
                <div className="w-24 space-y-2">
                  <Label>Unit</Label>
                  <Input value={param.unit || ''} onChange={e => handleChangeParam(index, 'unit', e.target.value)} placeholder="g/dL" />
                </div>
                <div className="w-24 space-y-2">
                  <Label>Min Range</Label>
                  <Input type="number" step="0.01" value={param.reference_range_min || ''} onChange={e => handleChangeParam(index, 'reference_range_min', e.target.value)} placeholder="13.5" />
                </div>
                <div className="w-24 space-y-2">
                  <Label>Max Range</Label>
                  <Input type="number" step="0.01" value={param.reference_range_max || ''} onChange={e => handleChangeParam(index, 'reference_range_max', e.target.value)} placeholder="17.5" />
                </div>
                <div className="flex-1 min-w-[120px] space-y-2">
                  <Label>Expected String</Label>
                  <Input value={param.expected_string_value || ''} onChange={e => handleChangeParam(index, 'expected_string_value', e.target.value)} placeholder="e.g. Negative" />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveParam(index)} className="text-red-500 hover:text-red-600 mb-[2px]">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Lab Test'}</Button>
        </div>
      </form>
    </div>
  );
}
