-- 20260530_create_support_tickets_table.sql
-- Description: Create the support_tickets table and storage bucket for ticket attachments

-- 1. Create the support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    clinic_name TEXT,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal',
    page_url TEXT,
    steps_to_reproduce TEXT,
    branches_count TEXT,
    patient_volume TEXT,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Configure RLS Policies for support_tickets table
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Admins (authenticated users) can read support tickets
DROP POLICY IF EXISTS "Admins can select support tickets" ON public.support_tickets;
CREATE POLICY "Admins can select support tickets" ON public.support_tickets
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can update support tickets
DROP POLICY IF EXISTS "Admins can update support tickets" ON public.support_tickets;
CREATE POLICY "Admins can update support tickets" ON public.support_tickets
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Admins can delete support tickets
DROP POLICY IF EXISTS "Admins can delete support tickets" ON public.support_tickets;
CREATE POLICY "Admins can delete support tickets" ON public.support_tickets
    FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Create the Storage Bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies for ticket-attachments bucket

-- Policy 1: Anyone can view ticket attachments (Public select access)
DROP POLICY IF EXISTS "Ticket attachments are publicly accessible" ON storage.objects;
CREATE POLICY "Ticket attachments are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'ticket-attachments' );

-- Policy 2: Authenticated users (admin) can manage ticket attachments
DROP POLICY IF EXISTS "Admins can insert ticket attachments" ON storage.objects;
CREATE POLICY "Admins can insert ticket attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'ticket-attachments' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admins can delete ticket attachments" ON storage.objects;
CREATE POLICY "Admins can delete ticket attachments"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'ticket-attachments' AND
    auth.role() = 'authenticated'
);
