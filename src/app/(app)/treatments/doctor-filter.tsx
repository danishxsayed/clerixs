'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function DoctorFilter({ doctors }: { doctors: { id: string; full_name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const selectedDoctor = searchParams.get("doctor") || "All";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "All") {
      params.set("doctor", val);
    } else {
      params.delete("doctor");
    }
    params.delete("page"); // Reset pagination on filter change
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <select
      value={selectedDoctor}
      onChange={handleChange}
      disabled={isPending}
      className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
    >
      <option value="All">All Doctors</option>
      {doctors.map((doc) => (
        <option key={doc.id} value={doc.id}>
          Dr. {doc.full_name}
        </option>
      ))}
    </select>
  );
}
