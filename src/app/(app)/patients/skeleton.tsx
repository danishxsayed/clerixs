import * as React from 'react';

export function PatientSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted bg-opacity-50 text-muted-foreground border-b">
          <tr>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Code</th>
            <th className="px-6 py-3 font-medium">Phone</th>
            <th className="px-6 py-3 font-medium">Email</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {[...Array(8)].map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="h-4 w-32 bg-muted rounded" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-16 bg-muted rounded" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-24 bg-muted rounded" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-40 bg-muted rounded" />
              </td>
              <td className="px-6 py-4">
                <div className="h-5 w-16 bg-muted rounded-full" />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="h-4 w-8 bg-muted rounded ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
