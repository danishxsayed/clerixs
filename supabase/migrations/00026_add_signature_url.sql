-- 00026_add_signature_url.sql
-- Add signature_url to profiles for rendering digital signatures on PDF medical documents

ALTER TABLE public.profiles 
ADD COLUMN signature_url TEXT;
