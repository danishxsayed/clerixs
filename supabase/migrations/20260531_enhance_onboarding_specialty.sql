-- Add columns to profiles and organizations for specialty and onboarding steps
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS primary_specialty TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;
