-- 00030_lab_reports_bucket.sql
-- Description: Add external report fields, laboratory role, and storage bucket

-- 1. Add new user role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'laboratory';

-- 2. Add external report columns to lab_orders
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS external_report_url TEXT;

-- 3. Create a Supabase Storage bucket for document attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Policies
DROP POLICY IF EXISTS "Documents are publicly accessible" ON storage.objects;
CREATE POLICY "Documents are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documents' );

DROP POLICY IF EXISTS "Users can delete documents" ON storage.objects;
CREATE POLICY "Users can delete documents"
ON storage.objects FOR DELETE
USING ( bucket_id = 'documents' );
