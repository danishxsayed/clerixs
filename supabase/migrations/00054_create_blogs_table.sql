-- 00054_create_blogs_table.sql
-- Description: Create the blogs table for marketing articles and the storage bucket for blog images

-- 1. Create the blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    cover_image_url TEXT,
    author_name TEXT NOT NULL DEFAULT 'Clerixs Admin',
    category TEXT NOT NULL DEFAULT 'General',
    tags TEXT[] DEFAULT '{}'::TEXT[],
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[] DEFAULT '{}'::TEXT[],
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Configure RLS Policies for blogs table
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Blogs are publicly readable" ON public.blogs;
CREATE POLICY "Blogs are publicly readable" ON public.blogs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert blogs" ON public.blogs;
CREATE POLICY "Admins can insert blogs" ON public.blogs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update blogs" ON public.blogs;
CREATE POLICY "Admins can update blogs" ON public.blogs
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete blogs" ON public.blogs;
CREATE POLICY "Admins can delete blogs" ON public.blogs
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Create the Storage Bucket for blog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies for blog-images bucket

-- Policy 1: Anyone can view blog images (Public select access)
DROP POLICY IF EXISTS "Blog images are publicly accessible" ON storage.objects;
CREATE POLICY "Blog images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-images' );

-- Policy 2: Authenticated users (admin) can upload blog images
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'blog-images' AND
    auth.role() = 'authenticated'
);

-- Policy 3: Authenticated users (admin) can update blog images
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'blog-images' AND
    auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'blog-images' AND
    auth.role() = 'authenticated'
);

-- Policy 4: Authenticated users (admin) can delete blog images
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'blog-images' AND
    auth.role() = 'authenticated'
);
