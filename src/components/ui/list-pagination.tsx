'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ListPagination({ totalItems, itemsPerPage = 50 }: { totalItems: number; itemsPerPage?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t gap-4">
      <p className="text-sm text-muted-foreground whitespace-nowrap">
        Showing <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-semibold text-foreground">{totalItems}</span> entries
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1 lg:mr-2" />
          <span className="hidden lg:inline">Previous</span>
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
            .map((page, index, array) => {
               return (
                 <React.Fragment key={page}>
                   {index > 0 && array[index - 1] !== page - 1 && (
                     <span className="text-muted-foreground px-2">...</span>
                   )}
                   <Button
                     variant={currentPage === page ? "default" : "outline"}
                     size="sm"
                     className="w-8 h-8 p-0"
                     onClick={() => handlePageChange(page)}
                   >
                     {page}
                   </Button>
                 </React.Fragment>
               )
             })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <span className="hidden lg:inline">Next</span>
          <ChevronRight className="h-4 w-4 ml-1 lg:ml-2" />
        </Button>
      </div>
    </div>
  );
}
