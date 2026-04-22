import * as React from 'react';

export function StaffSkeleton() {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/50">
        <div className="h-10 w-full max-w-sm bg-muted animate-pulse rounded-md" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted bg-opacity-50 text-muted-foreground border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Member</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Joined</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-20 bg-muted rounded" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-muted rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-20 bg-muted rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 w-16 bg-muted rounded-full" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-8 bg-muted rounded ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
