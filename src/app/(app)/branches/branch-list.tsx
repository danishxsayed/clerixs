import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { MapPin, Phone, Building2, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { BranchManagerActions } from './branch-manager-actions';

export async function BranchList({ 
  query: searchQuery, 
  isEnterprise 
}: { 
  query: string;
  isEnterprise: boolean;
}) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', userData.user.id)
    .single();

  if (!profile?.default_organization_id) return null;

  // Fetch Branches
  let dbQuery = supabase
    .from('branches')
    .select('*')
    .eq('organization_id', profile.default_organization_id)
    .order('created_at', { ascending: false });

  if (searchQuery) {
    dbQuery = dbQuery.ilike('name', `%${searchQuery}%`);
  }

  const { data: branches, error } = await dbQuery;

  if (error) {
    console.error("Error fetching branches:", error);
    return <div className="text-destructive p-4">Error loading branches.</div>;
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/50">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search branches..."
            className="w-full bg-background pl-9 shadow-sm"
            defaultValue={searchQuery}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[260px]">Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[300px] text-right">Login Access</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!branches || branches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No branches found. Add your first clinic location.
                </TableCell>
              </TableRow>
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{branch.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {branch.city ? `${branch.city}, ${branch.state || ''}` : 'No address set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {branch.phone && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {branch.phone}
                        </div>
                      )}
                      {branch.email && (
                        <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {branch.email}
                        </div>
                      )}
                      {!branch.phone && !branch.email && (
                         <span className="text-muted-foreground text-xs italic">No contact</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {branch.code ? (
                      <Badge variant="outline" className="font-mono">{branch.code}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {branch.is_active ? (
                       <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm capitalize">Active</Badge>
                    ) : (
                       <Badge variant="secondary" className="capitalize">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <BranchManagerActions branch={branch} isEnterprise={isEnterprise} />
                  </TableCell>
                  <TableCell className="text-right">
                     <Link href={`/branches/${branch.id}/edit`}>
                        <Button variant="ghost" size="sm" className="group-hover:opacity-100 transition-opacity">
                           Edit
                        </Button>
                     </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
