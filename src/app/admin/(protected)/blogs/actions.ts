'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const blogSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  excerpt: z.string().min(5, 'Excerpt must be at least 5 characters.'),
  cover_image_url: z.string().url('Invalid cover image URL.').optional().or(z.literal('')),
  author_name: z.string().default('Clerixs Admin'),
  category: z.string().default('General'),
  tags: z.array(z.string()).default([]),
  meta_title: z.string().optional().or(z.literal('')),
  meta_description: z.string().optional().or(z.literal('')),
  keywords: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
});

export type BlogInput = z.infer<typeof blogSchema>;

// Helper to check admin access
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL || 'clerixsofficial@gmail.com';
  
  if (error || !user || user.email !== adminEmail) {
    throw new Error('Unauthorized. Admin access required.');
  }
  return supabase;
}

export async function createBlogAction(data: BlogInput) {
  try {
    const supabase = await verifyAdmin();
    const validatedData = blogSchema.parse(data);

    // Enforce uniqueness of slug (though DB has unique constraint, handle gracefully)
    const { data: existing } = await supabase
      .from('blogs')
      .select('id')
      .eq('slug', validatedData.slug)
      .maybeSingle();

    if (existing) {
      return { error: 'A blog with this URL slug already exists.' };
    }

    const { error: insertError } = await supabase
      .from('blogs')
      .insert({
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt,
        cover_image_url: validatedData.cover_image_url || null,
        author_name: validatedData.author_name || 'Clerixs Admin',
        category: validatedData.category || 'General',
        tags: validatedData.tags,
        meta_title: validatedData.meta_title || validatedData.title,
        meta_description: validatedData.meta_description || validatedData.excerpt,
        keywords: validatedData.keywords,
        is_published: validatedData.is_published,
        published_at: validatedData.is_published ? new Date().toISOString() : null,
      });

    if (insertError) {
      console.error('Failed to insert blog:', insertError);
      return { error: insertError.message };
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (error: any) {
    console.error('Create blog action error:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function updateBlogAction(id: string, data: BlogInput) {
  try {
    const supabase = await verifyAdmin();
    const validatedData = blogSchema.parse(data);

    // Check slug uniqueness excluding current ID
    const { data: existing } = await supabase
      .from('blogs')
      .select('id')
      .eq('slug', validatedData.slug)
      .neq('id', id)
      .maybeSingle();

    if (existing) {
      return { error: 'A blog with this URL slug already exists.' };
    }

    // Get current publication status
    const { data: currentBlog } = await supabase
      .from('blogs')
      .select('is_published, published_at')
      .eq('id', id)
      .single();

    let publishedAt = currentBlog?.published_at || null;
    if (validatedData.is_published && !currentBlog?.is_published) {
      // Transitioning from draft to published
      publishedAt = new Date().toISOString();
    } else if (!validatedData.is_published) {
      // Unpublishing
      publishedAt = null;
    }

    const { error: updateError } = await supabase
      .from('blogs')
      .update({
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt,
        cover_image_url: validatedData.cover_image_url || null,
        author_name: validatedData.author_name || 'Clerixs Admin',
        category: validatedData.category || 'General',
        tags: validatedData.tags,
        meta_title: validatedData.meta_title || validatedData.title,
        meta_description: validatedData.meta_description || validatedData.excerpt,
        keywords: validatedData.keywords,
        is_published: validatedData.is_published,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update blog:', updateError);
      return { error: updateError.message };
    }

    revalidatePath('/blog');
    revalidatePath(`/blog/${validatedData.slug}`);
    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (error: any) {
    console.error('Update blog action error:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function deleteBlogAction(id: string) {
  try {
    const supabase = await verifyAdmin();

    const { data: blog } = await supabase
      .from('blogs')
      .select('slug')
      .eq('id', id)
      .single();

    const { error: deleteError } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete blog:', deleteError);
      return { error: deleteError.message };
    }

    revalidatePath('/blog');
    if (blog?.slug) {
      revalidatePath(`/blog/${blog.slug}`);
    }
    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (error: any) {
    console.error('Delete blog action error:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function getBlogsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Get blogs action error:', error);
    return { error: error.message || 'Failed to fetch blogs.' };
  }
}
