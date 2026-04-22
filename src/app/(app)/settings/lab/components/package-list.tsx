'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { PackageForm } from './package-form';
import { deleteLabPackage } from '@/app/(app)/lab/actions';
import { toast } from 'sonner';

export function PackageList({ initialPackages, tests }: { initialPackages: any[], tests: any[] }) {
  const [packages, setPackages] = React.useState(initialPackages);
  const [editingPackage, setEditingPackage] = React.useState<any>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  React.useEffect(() => {
    setPackages(initialPackages);
  }, [initialPackages]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lab package?')) return;
    const res = await deleteLabPackage(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Package deleted successfully');
      setPackages(packages.filter(p => p.id !== id));
    }
  };

  if (isCreating || editingPackage) {
    return (
      <PackageForm 
        tests={tests}
        pkg={editingPackage} 
        onCancel={() => {
          setIsCreating(false);
          setEditingPackage(null);
        }} 
        onSuccess={() => {
          setIsCreating(false);
          setEditingPackage(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h3 className="font-semibold text-xl">Lab Packages</h3>
          <p className="text-sm text-muted-foreground mt-1">Group multiple tests into a single package (e.g. Master Health Checkup).</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4" /> New Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full rounded-xl border bg-card text-card-foreground shadow-sm p-12 text-center flex flex-col items-center justify-center">
             <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
             <p className="text-muted-foreground">No lab packages found. Click "New Package" to create your first combined test package.</p>
          </div>
        ) : (
          packages.map(pkg => (
            <div key={pkg.id} className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
               <div className="p-5 border-b space-y-2 flex-grow">
                 <div className="flex justify-between items-start">
                   <h4 className="font-bold text-lg">{pkg.name}</h4>
                   <span className="font-semibold text-primary">₹{pkg.price}</span>
                 </div>
                 {pkg.description && <p className="text-sm text-muted-foreground">{pkg.description}</p>}
                 
                 <div className="pt-4 space-y-2">
                   <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Included Tests ({pkg.lab_package_tests?.length || 0})</p>
                   <div className="flex flex-wrap gap-2">
                     {pkg.lab_package_tests?.map((pt: any) => (
                       <span key={pt.lab_tests.id} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-muted-foreground/20">
                         {pt.lab_tests.name}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
               
               <div className="bg-muted/20 p-3 px-5 flex justify-end gap-2">
                 <Button variant="ghost" size="sm" onClick={() => setEditingPackage(pkg)} className="h-8">
                   <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
                 </Button>
                 <Button variant="ghost" size="sm" onClick={() => handleDelete(pkg.id)} className="text-red-500 hover:text-red-600 h-8">
                   <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                 </Button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
