'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLabTestCategory } from '@/app/(app)/lab/actions';
import { toast } from 'sonner';

export function CategoryList({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = React.useState(initialCategories);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    const res = await createLabTestCategory({ name, description });
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Category created');
      setCategories([...categories, { id: res.id, name, description }]);
      setName('');
      setDescription('');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-4">Add Category</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hematology" required />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="cat-desc">Description (Optional)</Label>
            <Input id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Blood analysis" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Category'}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-4">Existing Categories</h3>
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">No categories have been created yet.</p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b text-left text-muted-foreground">
                  <th className="font-medium p-4">Name</th>
                  <th className="font-medium p-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 font-medium">{cat.name}</td>
                    <td className="p-4">{cat.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
