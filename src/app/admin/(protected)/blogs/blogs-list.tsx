'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Edit3, Trash2, Calendar, 
  User, CheckCircle, AlertCircle, ExternalLink, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteBlogAction } from './actions';
import Image from 'next/image';

interface BlogsListProps {
  blogs: any[];
}

export function BlogsList({ blogs: initialBlogs }: BlogsListProps) {
  const router = useRouter();
  const [blogs, setBlogs] = React.useState(initialBlogs);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Filter blogs based on search query
  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the blog post "${title}"?`)) return;

    try {
      setDeletingId(id);
      const result = await deleteBlogAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Blog post deleted successfully!');
        setBlogs(prev => prev.filter(b => b.id !== id));
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete blog post.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview stats or action row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:w-96 relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search blogs by title, category, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none pl-3 text-sm text-slate-800 placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Create button */}
        <Link
          href="/admin/blogs/new"
          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-bold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <Plus size={16} className="transition-transform group-hover:scale-110" />
          <span>Write Blog Post</span>
        </Link>
      </div>

      {/* Grid or Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {filteredBlogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4.5">Blog Details</th>
                  <th className="px-6 py-4.5">Category</th>
                  <th className="px-6 py-4.5">Author</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5">Published At</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/40 transition-colors group">
                    {/* Details / Cover image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-20 bg-slate-100 rounded-xl border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                          {blog.cover_image_url ? (
                            <Image src={blog.cover_image_url} alt={blog.title} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                              <span className="text-[10px] font-bold">No Cover</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-[320px]">
                          <span className="font-bold text-slate-900 leading-snug block truncate group-hover:text-red-600 transition-colors">
                            {blog.title}
                          </span>
                          <span className="text-xs text-slate-400 font-mono block truncate mt-0.5">
                            /{blog.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {blog.category}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <User size={14} className="text-slate-400" />
                        <span>{blog.author_name}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {blog.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle size={12} />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          <AlertCircle size={12} />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Calendar size={14} />
                        <span>
                          {blog.published_at 
                            ? new Date(blog.published_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {blog.is_published && (
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="View Live Article"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <Link
                          href={`/admin/blogs/${blog.id}/edit`}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === blog.id}
                          onClick={() => handleDelete(blog.id, blog.title)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Post"
                        >
                          {deletingId === blog.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="h-16 w-16 bg-slate-50 border rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No blog posts found</h3>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery ? 'Adjust your search queries to discover matching posts.' : 'Get started by creating your very first SEO-friendly blog post.'}
            </p>
            {!searchQuery && (
              <Link
                href="/admin/blogs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-bold mt-4 shadow-md shadow-red-500/10 hover:from-red-700 hover:to-rose-700 transition-colors"
              >
                <Plus size={14} />
                <span>Write First Post</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
