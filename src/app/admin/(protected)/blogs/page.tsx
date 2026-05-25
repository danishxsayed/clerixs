import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { BlogsList } from './blogs-list';

export const revalidate = 0; // Disable cache to always render fresh data in admin

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load admin blogs:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
          Marketing Blog Management
        </h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">
          Compose premium articles, upload illustrations, and optimize metadata to maximize search engine authority.
        </p>
      </div>

      <BlogsList blogs={blogs || []} />
    </div>
  );
}
