ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
