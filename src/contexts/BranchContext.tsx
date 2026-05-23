'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Branch {
  id: string;
  name: string;
  city?: string;
  state?: string;
  phone?: string;
  status: 'active' | 'inactive';
}

interface BranchContextProps {
  branches: Branch[];
  currentBranch: Branch | null; // null = "All Branches"
  setCurrentBranch: (branchId: string) => void;
  setAllBranches: () => void;
  loading: boolean;
  isAllBranches: boolean;
}

const BranchContext = createContext<BranchContextProps | undefined>(undefined);

export const BranchProvider = ({ 
  children,
  organizationId,
  userRole
}: { 
  children: ReactNode;
  organizationId: string;
  userRole: string;
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranchState] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        setLoading(false);
        return;
      }

      let branchList: Branch[] = [];

      try {
        if (userRole === 'org_owner') {
          // Owners see all active branches in the organization
          const { data: orgBranches, error } = await supabase
            .from('branches')
            .select('id, name, city, state, phone, is_active')
            .eq('organization_id', organizationId)
            .eq('is_active', true);
            
          if (error) {
            console.error('Failed to load branches', error);
          } else {
            branchList = (orgBranches || []).map((b) => ({
              id: b.id,
              name: b.name,
              city: b.city || undefined,
              state: b.state || undefined,
              phone: b.phone || undefined,
              status: b.is_active ? 'active' : 'inactive',
            }));
          }
        } else if (userRole === 'branch_manager') {
          // Branch managers are locked into their single assigned branch
          const { data: membershipData, error: memError } = await supabase
            .from('organization_memberships')
            .select(`
              id,
              branch_memberships!inner (
                branch_id,
                branches (
                  id,
                  name,
                  city,
                  state,
                  phone,
                  is_active
                )
              )
            `)
            .eq('profile_id', user.user.id)
            .eq('status', 'active')
            .maybeSingle();

          if (memError) {
            console.error('Failed to load branch manager memberships', memError);
          } else if (membershipData) {
            const bMems = membershipData.branch_memberships as any;
            const bMem = Array.isArray(bMems) ? bMems[0] : bMems;
            
            if (bMem && bMem.branches) {
              branchList = [{
                id: bMem.branch_id,
                name: bMem.branches.name,
                city: bMem.branches.city || undefined,
                state: bMem.branches.state || undefined,
                phone: bMem.branches.phone || undefined,
                status: bMem.branches.is_active ? 'active' : 'inactive',
              }];
            }
          }
        } else {
          // Staff see only branches they are assigned to
          const { data: memberships, error: memError } = await supabase
            .from('organization_memberships')
            .select(`
              branch_memberships!inner (
                branch_id,
                branches (
                  id,
                  name,
                  city,
                  state,
                  phone,
                  is_active
                )
              )
            `)
            .eq('profile_id', user.user.id)
            .eq('status', 'active');

          if (memError) {
            console.error('Failed to load branch memberships', memError);
          } else {
            const list: Branch[] = [];
            if (memberships) {
              for (const mem of memberships) {
                const bMems = Array.isArray(mem.branch_memberships) ? mem.branch_memberships : [mem.branch_memberships];
                for (const bm of bMems) {
                  if (bm && bm.branches) {
                    list.push({
                      id: bm.branch_id,
                      name: bm.branches.name,
                      city: bm.branches.city || undefined,
                      state: bm.branches.state || undefined,
                      phone: bm.branches.phone || undefined,
                      status: bm.branches.is_active ? 'active' : 'inactive',
                    });
                  }
                }
              }
            }
            branchList = list;
          }
        }
      } catch (err) {
        console.error('Error fetching branches in context:', err);
      }

      setBranches(branchList);

      // Determine current branch
      const stored = localStorage.getItem('clerixs_selected_branch');
      if (userRole === 'branch_manager') {
        const assigned = branchList[0] || null;
        setCurrentBranchState(assigned);
        if (assigned) {
          document.cookie = `clerixs_selected_branch=${assigned.id}; path=/; max-age=31536000`;
          localStorage.setItem('clerixs_selected_branch', assigned.id);
        }
      } else if (stored === 'all' && userRole === 'org_owner') {
        setCurrentBranchState(null);
        document.cookie = `clerixs_selected_branch=all; path=/; max-age=31536000`;
      } else {
        const initialId = stored || (branchList[0]?.id ?? null);
        if (initialId && initialId !== 'all') {
          const selected = branchList.find((b) => b.id === initialId) || null;
          setCurrentBranchState(selected);
          if (selected) {
            document.cookie = `clerixs_selected_branch=${selected.id}; path=/; max-age=31536000`;
          }
        } else {
          setCurrentBranchState(null);
        }
      }
      
      setLoading(false);
    };
    
    fetchBranches();
  }, [organizationId, userRole, supabase]);

  const setCurrentBranch = (branchId: string) => {
    if (userRole === 'branch_manager') return; // Branch manager is isolated and cannot change branch
    const branch = branches.find((b) => b.id === branchId) || null;
    if (branch) {
      setCurrentBranchState(branch);
      localStorage.setItem('clerixs_selected_branch', branchId);
      document.cookie = `clerixs_selected_branch=${branchId}; path=/; max-age=31536000`;
      router.refresh();
    }
  };

  const setAllBranches = () => {
    if (userRole === 'org_owner') {
      setCurrentBranchState(null);
      localStorage.setItem('clerixs_selected_branch', 'all');
      document.cookie = `clerixs_selected_branch=all; path=/; max-age=31536000`;
      router.refresh();
    }
  };

  return (
    <BranchContext.Provider value={{ 
      branches, 
      currentBranch, 
      setCurrentBranch, 
      setAllBranches,
      loading,
      isAllBranches: currentBranch === null
    }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};
