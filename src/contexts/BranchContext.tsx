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

      if (userRole === 'org_owner') {
        // Owners see all branches in the organization
        const { data: orgBranches, error } = await supabase
          .from('branches')
          .select('id, name, city, state, phone, status')
          .eq('organization_id', organizationId)
          .eq('status', 'active');
          
        if (error) {
          console.error('Failed to load branches', error);
        } else {
          branchList = orgBranches || [];
        }
      } else {
        // Staff see only branches they are assigned to
        const { data: memberships, error: memError } = await supabase
          .from('branch_memberships')
          .select('branch_id, branches(name, city, state, phone, status)')
          .eq('profile_id', user.user.id)
          .eq('status', 'active');

        if (memError) {
          console.error('Failed to load branch memberships', memError);
        } else {
          branchList = (memberships || []).map((m: any) => ({
            id: m.branch_id,
            name: m.branches.name,
            city: m.branches.city,
            state: m.branches.state,
            phone: m.branches.phone,
            status: m.branches.status,
          }));
        }
      }

      setBranches(branchList);

      // Determine current branch
      const stored = localStorage.getItem('clerixs_selected_branch');
      if (stored === 'all' && userRole === 'org_owner') {
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
