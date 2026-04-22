ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS address text;
