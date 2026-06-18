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
  userRole,
  initialBranches = [],
}: {
  children: ReactNode;
  organizationId: string;
  userRole: string;
  /** Pre-fetched branches from the server layout — skips the client-side fetch entirely */
  initialBranches?: Branch[];
}) => {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [currentBranch, setCurrentBranchState] = useState<Branch | null>(null);
  // If server gave us branches, start as not-loading; otherwise show loading until client fetches
  const [loading, setLoading] = useState(initialBranches.length === 0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // If branches were provided by the server, just resolve the initial selection from localStorage
    // and skip the expensive Supabase round-trip entirely.
    if (initialBranches.length > 0) {
      const branchList = initialBranches;
      const stored = typeof window !== 'undefined' ? localStorage.getItem('clerixs_selected_branch') : null;

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
      return;
    }

    // Fallback: fetch branches client-side (used only if initialBranches not provided)
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
                  const branchObj = (Array.isArray(bm.branches) ? bm.branches[0] : bm.branches) as any;
                  if (bm && branchObj) {
                    list.push({
                      id: bm.branch_id,
                      name: branchObj.name,
                      city: branchObj.city || undefined,
                      state: branchObj.state || undefined,
                      phone: branchObj.phone || undefined,
                      status: branchObj.is_active ? 'active' : 'inactive',
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, userRole]);

  const setCurrentBranch = (branchId: string) => {
    if (userRole === 'branch_manager') return; // Branch manager is isolated and cannot change branch
    const branch = branches.find((b) => b.id === branchId) || null;
    if (branch) {
      setCurrentBranchState(branch);
      localStorage.setItem('clerixs_selected_branch', branchId);
      document.cookie = `clerixs_selected_branch=${branchId}; path=/; max-age=31536000`;
      router.refresh();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  const setAllBranches = () => {
    if (userRole === 'org_owner') {
      setCurrentBranchState(null);
      localStorage.setItem('clerixs_selected_branch', 'all');
      document.cookie = `clerixs_selected_branch=all; path=/; max-age=31536000`;
      router.refresh();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
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
