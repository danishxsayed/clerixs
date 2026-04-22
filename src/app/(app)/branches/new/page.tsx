import * as React from 'react';
import { BranchCreateForm } from './branch-create-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewBranchPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link 
          href="/branches" 
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border shadow-sm hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Branch</h2>
          <p className="text-muted-foreground mt-1">
            Register a new physical clinic location within your organization.
          </p>
        </div>
      </div>
      
      <div className="mt-4 w-full">
        <BranchCreateForm />
      </div>
    </div>
  );
}
