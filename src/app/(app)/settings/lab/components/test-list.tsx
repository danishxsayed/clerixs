'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { TestForm } from './test-form';
import { deleteLabTest } from '@/app/(app)/lab/actions';
import { toast } from 'sonner';

export function TestList({ initialTests, categories }: { initialTests: any[], categories: any[] }) {
  const [tests, setTests] = React.useState(initialTests);
  const [isFormActive, setIsFormActive] = React.useState(false);
  const [editingTest, setEditingTest] = React.useState<any>(null);
  
  const handleAddNew = () => {
    setEditingTest(null);
    setIsFormActive(true);
  };
  
  const handleEdit = (test: any) => {
    setEditingTest(test);
    setIsFormActive(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    const res = await deleteLabTest(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Lab test deleted');
      setTests(tests.filter(t => t.id !== id));
    }
  };

  const handleSaveSuccess = (savedTest: any) => {
    setIsFormActive(false);
    // Usually we would refetch, but a simple state merge or a page reload works.
    // For now the server action revalidates the path, so just reload or assume parent updates.
    window.location.reload(); 
  };

  if (isFormActive) {
    return (
      <TestForm 
        categories={categories} 
        test={editingTest} 
        onCancel={() => setIsFormActive(false)} 
        onSuccess={handleSaveSuccess} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h3 className="font-semibold text-xl">Lab Tests Catalog</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage individual tests and their parameters.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" /> New Lab Test
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        {tests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No lab tests configured yet. Click "New Lab Test" to add one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b text-left text-muted-foreground">
                <th className="font-medium p-4">Test Name</th>
                <th className="font-medium p-4">Category</th>
                <th className="font-medium p-4">Price</th>
                <th className="font-medium p-4">Parameters</th>
                <th className="font-medium p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => {
                const category = categories.find(c => c.id === test.category_id);
                return (
                  <tr key={test.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium">{test.name}</td>
                    <td className="p-4">{category ? category.name : '-'}</td>
                    <td className="p-4">₹ {test.price}</td>
                    <td className="p-4">{test.lab_test_parameters?.length || 0}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(test)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(test.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
