import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { UserRound, ShieldCheck, MailPlus, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StaffRowActions } from './staff-row-actions';
import { InviteRowActions } from './invite-row-actions';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export async function StaffList() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', userData.user.id)
    .single();

  if (!profile?.default_organization_id) return null;

  const { data: currentMembership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('organization_id', profile.default_organization_id)
    .eq('profile_id', userData.user.id)
    .single();

  const isOwner = currentMembership?.role === 'org_owner';

  const { data: memberships } = await supabase
    .from('organization_memberships')
    .select(`
      id,
      role,
      status,
      joined_at,
      profiles (
        id,
        full_name
      )
    `)
    .eq('organization_id', profile.default_organization_id)
    .order('joined_at', { ascending: true });

  let pendingInvites: any[] = [];
  if (isOwner) {
    const { data: invites } = await supabase
      .from('staff_invites')
      .select('*')
      .eq('organization_id', profile.default_organization_id)
      .is('accepted_at', null)
      .order('expires_at', { ascending: true });
    
    pendingInvites = invites || [];
  }

  return (
    <div className="flex flex-col gap-6">
      {pendingInvites.length > 0 && (
         <div className="rounded-xl border border-blue-200/50 bg-blue-50/10 p-4 dark:border-blue-900/50 dark:bg-blue-900/10">
             <h4 className="flex items-center text-sm font-medium text-blue-900 dark:text-blue-200 mb-3">
                 <Clock className="h-4 w-4 mr-2" /> Pending Invitations ({pendingInvites.length})
             </h4>
             <div className="space-y-2">
                 {pendingInvites.map(invite => (
                     <div key={invite.id} className="flex items-center justify-between bg-background px-4 py-2 rounded-lg border text-sm shadow-sm">
                         <div className="flex items-center gap-2">
                             <MailPlus className="h-4 w-4 text-muted-foreground" />
                             <span className="font-medium">{invite.email}</span>
                             <Badge variant="outline" className="ml-2 font-normal capitalize">
                                {invite.role === 'org_owner' ? 'Admin' : invite.role}
                             </Badge>
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="text-xs text-muted-foreground">
                                 Expires: {new Date(invite.expires_at).toLocaleDateString()}
                             </div>
                             <InviteRowActions inviteId={invite.id} />
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      )}

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search team members by name..."
              className="w-full bg-background pl-9 shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                {isOwner && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!memberships || memberships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No active team members found.
                  </TableCell>
                </TableRow>
               ) : (
                memberships.map((membership: any) => (
                  <TableRow key={membership.id} className="group hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 border">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-2">
                              {membership.profiles?.full_name || 'Unknown User'}
                              {membership.role === 'org_owner' && (
                                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                              )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                             {membership.profiles?.id === userData.user.id ? 'You' : 'Team Member'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="capitalize text-sm font-medium">
                          {membership.role === 'org_owner' ? 'Admin / Owner' : membership.role}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {new Date(membership.joined_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {membership.status === 'active' ? (
                         <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                      ) : (
                         <Badge variant="secondary" className="text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-200">Suspended</Badge>
                      )}
                    </TableCell>
                    {isOwner && (
                        <TableCell className="text-right">
                            {membership.profiles?.id !== userData.user.id && (
                                <StaffRowActions 
                                    membership={membership} 
                                    currentUserRole={currentMembership?.role} 
                                />
                            )}
                        </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
