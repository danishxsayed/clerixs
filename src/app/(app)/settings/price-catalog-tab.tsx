'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2, Tag, Search, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PriceCatalogForm } from './price-catalog-form';
import { deleteCatalogItem, toggleCatalogItemStatus } from './price-catalog-actions';

export function PriceCatalogTab({ initialItems, isOwner }: { initialItems: any[], isOwner: boolean }) {
  const [items, setItems] = React.useState(initialItems || []);
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  
  const [openForm, setOpenForm] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any | null>(null);

  // Sync state if props change (revalidated from server)
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setOpenForm(true);
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setOpenForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete '${name}'?`)) return;
    const result = await deleteCatalogItem(id);
    if (!result?.error) {
      toast.success('Item deleted successfully.');
      setItems(items.filter(i => i.id !== id));
    } else {
      toast.error(result.error);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = !item.is_active;
    const result = await toggleCatalogItemStatus(item.id, newStatus);
    if (!result?.error) {
      toast.success(`Item marked as ${newStatus ? 'Active' : 'Inactive'}.`);
      setItems(items.map(i => i.id === item.id ? { ...i, is_active: newStatus } : i));
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20 p-4 rounded-lg border border-dashed">
        <div className="flex w-full sm:w-auto items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search treatments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-background"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || 'All')}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isOwner && (
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        )}
      </div>

      {/* Datatable */}
      <div className="rounded-md border bg-background overflow-hidden relative">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Treatment / Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Duration</TableHead>
              <TableHead className="text-center">Status</TableHead>
              {isOwner && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isOwner ? 6 : 5} className="h-32 text-center text-muted-foreground">
                  No catalog items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className={!item.is_active ? "opacity-50 grayscale" : ""}>
                  <TableCell className="font-medium flex flex-col gap-1">
                    <span>{item.name}</span>
                    {item.notes && <span className="text-xs text-muted-foreground font-normal line-clamp-1">{item.notes}</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {item.duration_minutes ? `${item.duration_minutes} min` : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={item.is_active ? 'default' : 'outline'} className={item.is_active ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  {isOwner && (
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)} title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleToggleStatus(item)}
                        title={item.is_active ? 'Deactivate' : 'Activate'}
                        className={item.is_active ? 'text-amber-500 hover:text-amber-600' : 'text-green-500 hover:text-green-600'}
                      >
                        {item.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id, item.name)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Catalog Item' : 'Add New Catalog Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the details for this treatment/service.' : 'Add a new treatment or service to your billing catalog.'}
            </DialogDescription>
          </DialogHeader>
          <PriceCatalogForm 
            initialData={editingItem} 
            onCancel={() => setOpenForm(false)} 
            onSuccess={() => setOpenForm(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
